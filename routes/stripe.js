import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import { db, collections } from "../config/firebase.js";

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

// Create a checkout session
router.post("/create-session", async (req, res) => {
  try {
    const { price, packageId, userId, successUrl, cancelUrl } = req.body;
    if (!price || !packageId || !userId) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    // Create a purchase document in Firestore
    const purchaseRef = db.collection(collections.PURCHASES).doc();
    const purchase = {
      id: purchaseRef.id,
      packageId,
      userId,
      amount: Number(price) || 0,
      currency: "usd",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await purchaseRef.set(purchase);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Purchase - ${packageId}` },
            unit_amount: Math.round((Number(price) || 0) * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url:
        (successUrl || process.env.FRONTEND_URL || "http://localhost:5173") +
        `/dashboard/business-manual?purchase_success=1&purchase_id=${purchase.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        (cancelUrl || process.env.FRONTEND_URL || "http://localhost:5173") +
        "/dashboard/kyc",
      metadata: {
        purchaseId: purchase.id,
        packageId,
        userId,
      },
    });

    return res.json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Error creating stripe session:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Webhook endpoint to update purchase on successful payment
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    console.log("[stripe] Webhook received", {
      type: req.body?.type,
      id: req.body?.id,
      headers: req.headers["stripe-signature"]
        ? "signature present"
        : "no signature",
      bodySize: req.body ? req.body.length : 0,
    });

    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        console.log("[stripe] Webhook signature verified successfully");
      } else {
        console.warn(
          "[stripe] No webhook secret configured, accepting unsigned webhook"
        );
        // If no webhook secret provided, attempt to parse body directly (less secure)
        event = req.body;
      }
    } catch (err) {
      console.error("Webhook signature verification failed.", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("[stripe] Processing webhook event:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const purchaseId = session.metadata?.purchaseId;
      console.log("[stripe] Webhook received checkout.session.completed", {
        sessionId: session.id,
        purchaseId,
        metadata: session.metadata,
        paymentStatus: session.payment_status,
      });
      if (purchaseId) {
        try {
          const ref = db.collection(collections.PURCHASES).doc(purchaseId);
          await ref.update({
            status: "paid",
            updatedAt: new Date(),
            stripeSessionId: session.id,
          });
          console.log(`Purchase ${purchaseId} marked as paid`);
        } catch (err) {
          console.error("Error updating purchase status:", err);
        }
      } else {
        console.error("No purchaseId in session metadata", session.metadata);
      }
    } else {
      console.log("[stripe] Ignoring webhook event type:", event.type);
    }

    res.json({ received: true });
  }
);

// GET /api/stripe/purchase/:userId - get latest purchase for user
router.get("/purchase/:userId", async (req, res) => {
  console.log("[stripe] GET /purchase/:userId called", {
    url: req.originalUrl,
    params: req.params,
  });
  try {
    const { userId } = req.params;

    // Query all purchases for the user and sort in memory to avoid index requirements
    const snapshot = await db
      .collection(collections.PURCHASES)
      .where("userId", "==", userId)
      .get();

    if (snapshot.empty) {
      console.log("[stripe] no purchases found for user", userId);
      return res.json({ success: true, purchase: null });
    }

    // Convert to array and sort by createdAt desc
    const purchases = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    purchases.forEach((purchase) => {
      if (
        purchase.createdAt &&
        typeof purchase.createdAt.toDate === "function"
      ) {
        purchase.createdAt = purchase.createdAt.toDate();
      } else if (!(purchase.createdAt instanceof Date)) {
        purchase.createdAt = new Date(0);
      }
    });

    purchases.sort((a, b) => b.createdAt - a.createdAt);
    const latest = purchases[0];

    console.log("[stripe] returning latest purchase", {
      userId,
      purchaseId: latest.id,
      status: latest.status || null,
    });

    // Serialize timestamp-like fields to ISO strings
    if (latest.createdAt instanceof Date) {
      latest.createdAt = latest.createdAt.toISOString();
    }
    if (latest.updatedAt && typeof latest.updatedAt.toDate === "function") {
      latest.updatedAt = latest.updatedAt.toDate().toISOString();
    } else if (latest.updatedAt instanceof Date) {
      latest.updatedAt = latest.updatedAt.toISOString();
    }

    return res.json({ success: true, purchase: latest });
  } catch (err) {
    console.error(
      "Error fetching purchase:",
      err && err.stack ? err.stack : err
    );
    // Return a helpful message for debugging; avoid leaking secrets in production.
    return res
      .status(500)
      .json({ success: false, error: err.message || "unknown" });
  }
});

// GET /api/stripe/session/:sessionId - get session details
router.get("/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log("[stripe] Session retrieved", {
      sessionId,
      paymentStatus: session.payment_status,
      metadata: session.metadata,
    });

    res.json({
      success: true,
      session: {
        id: session.id,
        payment_status: session.payment_status,
        metadata: session.metadata,
      },
    });
  } catch (err) {
    console.error("Error retrieving session:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/stripe/update-purchase/:purchaseId - manually update purchase status (for testing)
router.post("/update-purchase/:purchaseId", async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const { status } = req.body;

    console.log("[stripe] Manual purchase update", { purchaseId, status });

    const ref = db.collection(collections.PURCHASES).doc(purchaseId);
    await ref.update({
      status: status || "paid",
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      message: `Purchase ${purchaseId} updated to ${status || "paid"}`,
    });
  } catch (err) {
    console.error("Error updating purchase:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
