import express from "express";
import { db } from "../config/firebase.js";
import {
  scheduleEmailSequence,
  scheduleRemainingEmails,
} from "../services/emailService.js";

const router = express.Router();

// POST /api/system-manual - save email opt-ins for the systems free module
router.post("/", async (req, res) => {
  try {
    const { email, name, language } = req.body || {};

    if (!email || typeof email !== "string") {
      return res
        .status(400)
        .json({ success: false, error: "Valid email is required" });
    }

    const userLanguage =
      language && ["en", "es"].includes(language) ? language : "en";

    const subscription = {
      email: email.toLowerCase().trim(),
      name: name || null,
      language: userLanguage,
      createdAt: new Date().toISOString(),
      source: "systems-module",
    };

    const docRef = await db.collection("subscriptions").add(subscription);

    try {
      await db
        .collection("subscriptions")
        .doc(docRef.id)
        .update({ scheduled: true });
    } catch (e) {
      console.warn(
        "Could not mark systems subscription scheduled:",
        e?.message || e
      );
    }

    // Schedule the full email sequence: first email immediately (or via service)
    scheduleEmailSequence({
      email: subscription.email,
      name: subscription.name,
      language: subscription.language,
    }).catch((err) => {
      console.error(
        "Failed to send first email for systems module:",
        err?.message || err
      );
    });

    // Also schedule the remaining emails (2-7) for full 7-email automation
    scheduleRemainingEmails({
      email: subscription.email,
      name: subscription.name,
      language: subscription.language,
    }).catch((err) => {
      console.error(
        "Failed to schedule remaining emails for systems module:",
        err?.message || err
      );
    });

    res.status(201).json({ success: true, id: docRef.id });
  } catch (error) {
    console.error("System manual subscribe route error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
