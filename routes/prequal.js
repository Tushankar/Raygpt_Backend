import express from "express";
import { db } from "../config/firebase.js";

const router = express.Router();

// Health check
router.get("/test", async (req, res) => {
  res.json({ success: true, route: "/api/prequal" });
});

// POST /api/prequal - store pre-qualification questionnaire responses
router.post("/", async (req, res) => {
  try {
    console.log(
      "/api/prequal POST received",
      JSON.stringify(req.body || {}).slice(0, 1000)
    );
    const body = req.body || {};
    const {
      name,
      email,
      phone,
      interestType,
      businessExperience,
      financialReadiness,
      timeline,
      commitment,
      seriousness,
      source,
      language,
    } = body;

    // Basic validation
    if (!email || typeof email !== "string") {
      return res
        .status(400)
        .json({ success: false, error: "Valid email required" });
    }

    if (!phone || typeof phone !== "string") {
      return res
        .status(400)
        .json({ success: false, error: "Valid phone required" });
    }

    // Prepare doc; we'll assign a deterministic doc id so we can set leadId
    const collection = db.collection("prequalifications");
    const ref = collection.doc();

    const now = new Date().toISOString();
    const doc = {
      leadId: ref.id,
      name: name || null,
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      interestType: interestType || null, // Owner / Customer / Partner
      businessExperience:
        businessExperience === true ||
        businessExperience === "Yes" ||
        businessExperience === "yes",
      financialReadiness: financialReadiness || null, // full, partial, financing, not ready
      timeline: timeline || null,
      commitment:
        commitment === true || commitment === "Yes" || commitment === "yes",
      seriousness:
        typeof seriousness === "number"
          ? seriousness
          : parseInt(seriousness) || null,
      language: language && ['en', 'es'].includes(language) ? language : 'en',
      crmTags: ["Pre-Qualified"],
      source: source || "landing-page",
      appointmentBooked: false,
      createdAt: now,
      updatedAt: now,
    };

    // Persist document with known id so we can easily match from Calendly
    await ref.set(doc);

    // Optional: if a users collection has this email, add tag there too (non-blocking)
    try {
      const usersSnap = await db
        .collection("users")
        .where("email", "==", doc.email)
        .get();
      usersSnap.forEach(async (u) => {
        const existing = u.data() || {};
        const tags = Array.isArray(existing.crmTags) ? existing.crmTags : [];
        if (!tags.includes("Pre-Qualified")) {
          tags.push("Pre-Qualified");
        }
        await db.collection("users").doc(u.id).update({ crmTags: tags });
      });
    } catch (e) {
      console.warn("Could not update user crmTags:", e?.message || e);
    }

    res.status(201).json({ success: true, id: ref.id });
  } catch (err) {
    console.error("Prequal route error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/prequal - return recent pre-qualification submissions
router.get("/", async (req, res) => {
  try {
    // Optional query params: limit
    const limit = Math.min(parseInt(req.query.limit) || 200, 1000);
    const snap = await db
      .collection("prequalifications")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const items = [];
    snap.forEach((d) => {
      items.push({ id: d.id, ...d.data() });
    });

    res.json(items);
  } catch (err) {
    console.error("Prequal GET error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/prequal/:id - return single prequal by id
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await db.collection("prequalifications").doc(id).get();
    if (!doc.exists)
      return res.status(404).json({ success: false, error: "not-found" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error("Prequal GET by id error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/prequal/stale - return leads older than `hours` (default 24) with appointmentBooked = false
router.get("/stale", async (req, res) => {
  try {
    const hours = Math.max(parseInt(req.query.hours) || 24, 1);
    const cutoff = new Date(Date.now() - hours * 3600 * 1000).toISOString();

    const snap = await db
      .collection("prequalifications")
      .where("appointmentBooked", "==", false)
      .where("createdAt", "<=", cutoff)
      .orderBy("createdAt", "asc")
      .limit(1000)
      .get();

    const items = [];
    snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
    res.json(items);
  } catch (err) {
    console.error("Prequal stale GET error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PATCH /api/prequal/:id - update a prequal record (partial)
router.patch("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body || {};
    updates.updatedAt = new Date().toISOString();
    await db.collection("prequalifications").doc(id).update(updates);
    res.json({ success: true });
  } catch (err) {
    console.error("Prequal PATCH error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
