import express from "express";
import { db } from "../config/firebase.js";
import emailService from "../services/emailService.js";
import smsService from "../services/smsService.js";
import automationEmailService from "../services/automationEmailService.js";

const router = express.Router();

// DEBUG: dump some documents from prequalifications for troubleshooting
router.get("/debug-list", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const snap = await db.collection("prequalifications").limit(limit).get();
    const items = [];
    snap.forEach((doc) => items.push({ id: doc.id, data: doc.data() }));
    res.json({ success: true, items });
  } catch (err) {
    console.error("debug-list error:", err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/automation/not-booked - list leads who have not booked
router.get("/not-booked", async (req, res) => {
  try {
    // Firestore composite queries sometimes require an index (where + orderBy).
    // To avoid needing an index here, fetch recent documents and filter server-side.
    const snap = await db
      .collection("prequalifications")
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();

    const items = [];
    snap.forEach((doc) => {
      const d = doc.data();
      // Return all leads that have not booked an appointment. Include automationSent
      // field in the response so the UI can decide whether to auto-trigger.
      if (!d.appointmentBooked) {
        items.push({ id: doc.id, ...d });
      }
    });

    res.json({ success: true, items });
  } catch (err) {
    console.error("Not-booked list error:", err.stack || err);
    const payload = { success: false, error: "Internal server error" };
    // Include server error message for debugging (temporary)
    payload.detail = err.message || String(err);
    res.status(500).json(payload);
  }
});

// POST /api/automation/trigger - trigger automation for a single lead (email + sms)
router.post("/trigger", async (req, res) => {
  try {
    const { id, bookingLink } = req.body;
    if (!id)
      return res.status(400).json({ success: false, error: "Missing id" });

    const doc = await db.collection("prequalifications").doc(id).get();
    if (!doc.exists)
      return res.status(404).json({ success: false, error: "Lead not found" });

    const data = doc.data();
    // Idempotency: if we've already sent automation for this lead, skip scheduling again
    if (data.automationSent) {
      return res.json({
        success: true,
        triggered: false,
        message: "Automation already sent",
      });
    }
    const email = data.email;
    const name = data.name;
    const phone = data.phone;

    let link =
      bookingLink ||
      process.env.BOOKING_LINK ||
      `${process.env.FRONTEND_URL}/book-call`;

    // Add leadId parameter to the booking link for webhook matching
    if (id) {
      const separator = link.includes("?") ? "&" : "?";
      link = `${link}${separator}leadId=${encodeURIComponent(id)}`;
    }

    // Send confirmation email immediately with optional calendar invite attachment
    const rendered = {
      subject: "Confirm your call",
      html: `<div style="font-family:Arial;color:#111"><p>Hi ${
        name || "there"
      },</p><p>Please confirm your interest and book a quick call: <a href="${link}">Book a Call</a></p></div>`,
      text: `Hi ${name || "there"},\nPlease book a quick call: ${link}`,
    };

    // Create a simple 30-minute calendar invite starting 24 hours from now
    const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    const uid = `raygpt-${id}@raygpt.local`;
    const dtstamp =
      new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const dtstart =
      start.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const dtend = end.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//raygpt//EN\nMETHOD:REQUEST\nBEGIN:VEVENT\nUID:${uid}\nDTSTAMP:${dtstamp}\nDTSTART:${dtstart}\nDTEND:${dtend}\nSUMMARY:RayGPT Intro Call\nDESCRIPTION:Auto-scheduled optional intro call. If you'd like to keep it, please open the booking link: ${link}\nLOCATION:Zoom or Phone\nEND:VEVENT\nEND:VCALENDAR`;

    // Fire-and-forget sending + scheduling
    emailService
      .sendMail({
        to: email,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        attachments: [
          {
            filename: "raygpt-invite.ics",
            content: ics,
            contentType: "text/calendar; charset=UTF-8; method=REQUEST",
          },
        ],
      })
      .catch((e) => console.error(e));

    // schedule the tailored 3-email automation sequence
    automationEmailService
      .scheduleThreeEmailSequence({
        email,
        name,
        bookingLink: link,
        leadId: id,
      })
      .catch((e) => console.error(e));

    // SMS sequence if phone present and Twilio configured
    if (phone) {
      smsService
        .scheduleSmsSequence({ to: phone, bookingLink: link, leadId: id })
        .catch((e) => console.error(e));
    }

    // Persist that we've triggered automation for this lead so it won't be
    // included in future "not-booked" lists.
    try {
      await db.collection("prequalifications").doc(id).update({
        automationSent: true,
        automationSentAt: new Date().toISOString(),
      });
    } catch (uErr) {
      // Log update error but still return success since emails/sms were scheduled
      console.error("Failed to persist automationSent flag for", id, uErr);
    }

    res.json({ success: true, triggered: true });
  } catch (err) {
    console.error("Automation trigger error:", err.stack || err);
    const payload = { success: false, error: "Internal server error" };
    // Include server error message for debugging (temporary)
    payload.detail = err.message || String(err);
    res.status(500).json(payload);
  }
});

// POST /api/automation/mark-sent - mark multiple leads as automationSent without sending emails
router.post("/mark-sent", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Missing ids array" });
    }

    const batch = db.batch();
    ids.forEach((id) => {
      const ref = db.collection("prequalifications").doc(id);
      batch.update(ref, {
        automationSent: true,
        automationSentAt: new Date().toISOString(),
      });
    });

    await batch.commit();
    res.json({ success: true, marked: ids.length });
  } catch (err) {
    console.error("mark-sent error:", err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
