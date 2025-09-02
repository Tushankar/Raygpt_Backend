import express from "express";
import { db } from "../config/firebase.js";
import emailService from "../services/emailService.js";
import smsService from "../services/smsService.js";
import automationEmailService from "../services/automationEmailService.js";

const router = express.Router();

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
    const email = data.email;
    const name = data.name;
    const phone = data.phone;

    const link =
      bookingLink ||
      process.env.BOOKING_LINK ||
      `${process.env.FRONTEND_URL}/book-call`;

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
      .scheduleThreeEmailSequence({ email, name, bookingLink: link })
      .catch((e) => console.error(e));

    // SMS sequence if phone present and Twilio configured
    if (phone) {
      smsService
        .scheduleSmsSequence({ to: phone, bookingLink: link })
        .catch((e) => console.error(e));
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

export default router;
