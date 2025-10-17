import express from "express";
import { db, collections } from "../config/firebase.js";
import {
  scheduleEmailSequence,
  scheduleRemainingEmails,
} from "../services/emailService.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = express.Router();

// GET /api/subscribe/test - quick health check for the subscribe route
router.get("/test", async (req, res) => {
  res.json({ success: true, route: "/api/subscribe" });
});

// GET /api/subscribe - admin only: list subscribers
router.get("/", authenticateAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 500;
    let query = db.collection("subscriptions");

    // If createdAt exists as ISO strings this ordering still works lexicographically
    try {
      query = query.orderBy("createdAt", "desc").limit(limit);
    } catch (e) {
      // If ordering fails (no index / field), fall back to simple get()
      console.warn(
        "Could not order subscriptions by createdAt:",
        e?.message || e
      );
    }

    const snapshot = await query.get();
    const items = [];
    snapshot.forEach((doc) => {
      items.push({ id: doc.id, ...(doc.data() || {}) });
    });

    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    console.error("List subscribers error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/subscribe - save email opt-ins for the free manual
router.post("/", async (req, res) => {
  try {
    const { email, name, language, optInPromotionalEmails } = req.body || {};

    if (!email || typeof email !== "string") {
      return res
        .status(400)
        .json({ success: false, error: "Valid email is required" });
    }

    // Validate language (default to 'en' if not provided or invalid)
    const userLanguage =
      language && ["en", "es"].includes(language) ? language : "en";

    const subscription = {
      email: email.toLowerCase().trim(),
      name: name || null,
      language: userLanguage,
      optInPromotionalEmails: !!optInPromotionalEmails,
      unsubscribed: false,
      createdAt: new Date().toISOString(),
      source: "landing-page",
    };

    const docRef = await db.collection("subscriptions").add(subscription);

    // mark and schedule emails if not already scheduled
    try {
      await db
        .collection("subscriptions")
        .doc(docRef.id)
        .update({ scheduled: true });
    } catch (e) {
      // ignore if update fails
      console.warn("Could not mark subscription scheduled:", e?.message || e);
    }

    // ALWAYS send the first email (manual download) to everyone who subscribes
    // This ensures they get the manual they requested
    try {
      await scheduleEmailSequence({
        email: subscription.email,
        name: subscription.name,
        language: subscription.language,
      });
      console.log(
        `✅ Welcome email sent to ${subscription.email} (opt-in: ${subscription.optInPromotionalEmails})`
      );
    } catch (err) {
      console.error(
        `❌ Failed to send welcome email to ${subscription.email}:`,
        err?.message || err
      );
      // Don't fail the subscription if email fails
    }

    res.status(201).json({ success: true, id: docRef.id });
  } catch (error) {
    console.error("Subscribe route error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/subscribe/unsubscribe?email=... - public link to unsubscribe (returns HTML confirmation)
router.get("/unsubscribe", async (req, res) => {
  try {
    const email = (req.query.email || "").toString().toLowerCase().trim();
    if (!email) {
      return res.status(400).send("<h3>Invalid unsubscribe request</h3>");
    }

    const snapshot = await db
      .collection("subscriptions")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).send("<h3>Email not found</h3>");
    }

    const doc = snapshot.docs[0];
    await doc.ref.update({
      unsubscribed: true,
      unsubscribedAt: new Date().toISOString(),
    });

    // Simple HTML confirmation page
    return res.send(`
      <html><head><title>Unsubscribed</title></head><body style="font-family:Arial,Helvetica,sans-serif;padding:30px;">
        <h2>You've been unsubscribed</h2>
        <p>The email <strong>${email}</strong> has been unsubscribed from further communications.</p>
        <p>If this was a mistake, please contact support.</p>
      </body></html>
    `);
  } catch (err) {
    console.error("Unsubscribe GET error:", err);
    return res.status(500).send("<h3>Server error</h3>");
  }
});

// POST /api/subscribe/unsubscribe - public API to unsubscribe programmatically (JSON)
router.post("/unsubscribe", async (req, res) => {
  try {
    const { email } = req.body || {};
    const addr =
      email && typeof email === "string" ? email.toLowerCase().trim() : null;
    if (!addr)
      return res
        .status(400)
        .json({ success: false, error: "Valid email required" });

    const snapshot = await db
      .collection("subscriptions")
      .where("email", "==", addr)
      .limit(1)
      .get();
    if (snapshot.empty)
      return res.status(404).json({ success: false, error: "Email not found" });

    const doc = snapshot.docs[0];
    await doc.ref.update({
      unsubscribed: true,
      unsubscribedAt: new Date().toISOString(),
    });

    return res.json({ success: true, message: "Unsubscribed" });
  } catch (err) {
    console.error("Unsubscribe POST error:", err);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
});

// POST /api/subscribe/resubscribe - public API to re-subscribe a previously unsubscribed email
router.post("/resubscribe", async (req, res) => {
  try {
    const { email } = req.body || {};
    const addr =
      email && typeof email === "string" ? email.toLowerCase().trim() : null;
    if (!addr)
      return res
        .status(400)
        .json({ success: false, error: "Valid email required" });

    const snapshot = await db
      .collection("subscriptions")
      .where("email", "==", addr)
      .limit(1)
      .get();
    if (snapshot.empty)
      return res.status(404).json({ success: false, error: "Email not found" });

    const doc = snapshot.docs[0];
    await doc.ref.update({
      unsubscribed: false,
      optInPromotionalEmails: true,
      resubscribedAt: new Date().toISOString(),
    });

    return res.json({ success: true, message: "Resubscribed" });
  } catch (err) {
    console.error("Resubscribe POST error:", err);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
});

// POST /api/subscribe/start-automation - start the remaining email sequence for engagement
router.post("/start-automation", async (req, res) => {
  try {
    const { email, name, language, setOptIn } = req.body || {};

    if (!email || typeof email !== "string") {
      return res
        .status(400)
        .json({ success: false, error: "Valid email is required" });
    }

    // Check if subscriber exists
    const subscribersQuery = await db
      .collection("subscriptions")
      .where("email", "==", email.toLowerCase().trim())
      .get();

    if (subscribersQuery.empty) {
      return res
        .status(404)
        .json({ success: false, error: "Email not found in subscribers" });
    }

    // Get subscriber data to retrieve language preference
    const subscriberDoc = subscribersQuery.docs[0];
    const subscriberData = subscriberDoc.data();

    // Respect unsubscribe flag
    if (subscriberData.unsubscribed) {
      return res
        .status(400)
        .json({ success: false, error: "Subscriber has unsubscribed" });
    }

    // If caller requested to set opt-in consent now (pre-consent), update the subscriber
    if (setOptIn) {
      try {
        await subscriberDoc.ref.update({ optInPromotionalEmails: true });
        subscriberData.optInPromotionalEmails = true;
      } catch (e) {
        console.warn(
          "Could not set optInPromotionalEmails on subscriber:",
          e?.message || e
        );
      }
    }

    // If still not opted in, don't proceed
    if (!subscriberData.optInPromotionalEmails) {
      return res.status(400).json({
        success: false,
        error: "Subscriber did not opt into promotional emails",
      });
    }
    const userLanguage = language || subscriberData.language || "en";

    // Update subscriber to mark automation started
    await subscriberDoc.ref.update({
      automationStarted: true,
      automationStartedAt: new Date().toISOString(),
    });

    // Schedule the remaining email sequence (emails 2-7)
    const result = await scheduleRemainingEmails({
      email: email.toLowerCase().trim(),
      name: name || subscriberData.name || null,
      language: userLanguage,
    });

    res.json({
      success: true,
      message: "Email automation started",
      ...result,
    });
  } catch (error) {
    console.error("Start automation route error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/subscribe/broadcast - admin only: schedule emails for all unscheduled subscribers
router.post("/broadcast", authenticateAdmin, async (req, res) => {
  try {
    const snapshot = await db.collection("subscriptions").get();
    const tasks = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (!data || data.scheduled) return; // skip already scheduled
      if (data.unsubscribed) return; // skip unsubscribed
      if (!data.optInPromotionalEmails) return; // skip those who didn't opt in
      const id = doc.id;
      const email = data.email;
      const name = data.name || null;

      // update to mark scheduled
      const p = db
        .collection("subscriptions")
        .doc(id)
        .update({ scheduled: true, lastScheduledAt: new Date().toISOString() })
        .then(() =>
          scheduleEmailSequence({
            email,
            name,
            language: data.language || "en",
          })
        )
        .catch((err) => {
          console.error(
            `Failed to schedule for ${email}:`,
            err?.message || err
          );
        });

      tasks.push(p);
    });

    await Promise.all(tasks);
    res.json({ success: true, count: tasks.length });
  } catch (error) {
    console.error("Broadcast route error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
