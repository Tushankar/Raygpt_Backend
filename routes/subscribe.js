import express from "express";
import { db, collections } from "../config/firebase.js";
import { scheduleEmailSequence, scheduleRemainingEmails } from "../services/emailService.js";
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
    const { email, name } = req.body || {};

    if (!email || typeof email !== "string") {
      return res
        .status(400)
        .json({ success: false, error: "Valid email is required" });
    }

    const subscription = {
      email: email.toLowerCase().trim(),
      name: name || null,
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

    // Schedule the email sequence (10-20s gaps by default)
    scheduleEmailSequence({
      email: subscription.email,
      name: subscription.name,
    }).catch((err) => {
      console.error("Failed to schedule email sequence:", err?.message || err);
    });

    res.status(201).json({ success: true, id: docRef.id });
  } catch (error) {
    console.error("Subscribe route error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/subscribe/start-automation - start the remaining email sequence for engagement
router.post("/start-automation", async (req, res) => {
  try {
    const { email, name } = req.body || {};

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

    // Update subscriber to mark automation started
    const subscriberDoc = subscribersQuery.docs[0];
    await subscriberDoc.ref.update({
      automationStarted: true,
      automationStartedAt: new Date().toISOString(),
    });

    // Schedule the remaining email sequence (emails 2-7)
    const result = await scheduleRemainingEmails({
      email: email.toLowerCase().trim(),
      name: name || null,
    });

    res.json({ 
      success: true, 
      message: "Email automation started",
      ...result
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
      const id = doc.id;
      const email = data.email;
      const name = data.name || null;

      // update to mark scheduled
      const p = db
        .collection("subscriptions")
        .doc(id)
        .update({ scheduled: true, lastScheduledAt: new Date().toISOString() })
        .then(() => scheduleEmailSequence({ email, name }))
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
