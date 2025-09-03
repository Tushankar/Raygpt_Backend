import express from "express";
import crypto from "crypto";
import { db } from "../config/firebase.js";

const router = express.Router();

// Calendly webhook credentials
const CALENDLY_WEBHOOK_SIGNING_KEY =
  process.env.CALENDLY_WEBHOOK_SIGNING_KEY ||
  "jS9Aqh5e6WPeWe_25ChI0xcPli4T1fuRljIVBvXHJnk";

// Middleware to verify Calendly webhook signature
const verifyCalendlySignature = (req, res, next) => {
  try {
    const signature = req.headers["calendly-webhook-signature"];
    if (!signature) {
      console.warn("[calendly] Missing webhook signature");
      return res
        .status(401)
        .json({ success: false, error: "Missing signature" });
    }

    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac("sha256", CALENDLY_WEBHOOK_SIGNING_KEY)
      .update(body, "utf8")
      .digest("base64");

    if (signature !== expectedSignature) {
      console.warn("[calendly] Invalid webhook signature");
      return res
        .status(401)
        .json({ success: false, error: "Invalid signature" });
    }

    next();
  } catch (error) {
    console.error("[calendly] Signature verification error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Signature verification failed" });
  }
};

// Simple health check
router.get("/test", (req, res) =>
  res.json({ success: true, route: "/api/calendly" })
);

// Get webhook configuration info
router.get("/webhook-info", (req, res) => {
  const ngrokUrl = process.env.NGROK_URL || "Not configured";
  const serverUrl =
    process.env.SERVER_URL || "https://raygpt-backend-2.onrender.com";

  // Use Render URL as primary since we're deployed
  const primaryUrl = serverUrl;

  const webhookUrls = {
    render: {
      production: `${primaryUrl}/api/calendly/webhook`,
      test: `${primaryUrl}/api/calendly/webhook-test`,
      debug: `${primaryUrl}/api/debug/prequal`,
    },
    ngrok: {
      production: `${ngrokUrl}/api/calendly/webhook`,
      test: `${ngrokUrl}/api/calendly/webhook-test`,
      debug: `${ngrokUrl}/api/debug/prequal`,
    },
  };

  res.json({
    success: true,
    currentServerUrl: serverUrl,
    webhookUrl: `${primaryUrl}/api/calendly/webhook`,
    testUrl: `${primaryUrl}/api/calendly/webhook-test`,
    renderUrl: primaryUrl,
    webhookUrls,
    instructions: {
      calendlySetup: `Configure Calendly webhook to: ${primaryUrl}/api/calendly/webhook`,
      updateServer: "Using Render deployment URL as primary webhook endpoint",
      testEndpoint: `Test with: ${primaryUrl}/api/calendly/webhook-test`,
    },
  });
});

// Manual endpoint to mark appointment as booked (for testing/manual updates)
router.post("/mark-booked", async (req, res) => {
  try {
    const { leadId, email } = req.body;

    if (!leadId && !email) {
      return res.status(400).json({
        success: false,
        error: "Either leadId or email is required",
      });
    }

    let updated = false;
    let docId = null;

    // Try to match by leadId first
    if (leadId) {
      const docRef = db.collection("prequalifications").doc(leadId);
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        await docRef.update({
          appointmentBooked: true,
          updatedAt: new Date().toISOString(),
        });
        updated = true;
        docId = leadId;
        console.log(`[calendly] Manually marked leadId ${leadId} as booked`);
      }
    }

    // If not found by leadId, try email
    if (!updated && email) {
      const q = await db
        .collection("prequalifications")
        .where("email", "==", String(email).toLowerCase().trim())
        .limit(1)
        .get();
      if (!q.empty) {
        const d = q.docs[0];
        await db.collection("prequalifications").doc(d.id).update({
          appointmentBooked: true,
          updatedAt: new Date().toISOString(),
        });
        updated = true;
        docId = d.id;
        console.log(
          `[calendly] Manually marked email ${email} as booked for ${d.id}`
        );
      }
    }

    if (updated) {
      return res.json({ success: true, updated: true, id: docId });
    } else {
      return res.status(404).json({
        success: false,
        error: "No matching prequalification found",
      });
    }
  } catch (err) {
    console.error("[calendly] mark-booked error:", err);
    res.status(500).json({ success: false, error: "internal" });
  }
});

// Helper function to extract leadId from various payload structures
const findLeadIdInObject = (obj) => {
  try {
    if (!obj) return null;
    if (typeof obj === "string") {
      // Look for leadId in query params
      const m = obj.match(/[?&]leadId=([^&\s]+)/);
      if (m) return decodeURIComponent(m[1]);

      // Also check for leadId in hash fragments
      const hashMatch = obj.match(/#.*leadId=([^&\s]+)/);
      if (hashMatch) return decodeURIComponent(hashMatch[1]);
    }
    if (typeof obj === "object") {
      for (const k of Object.keys(obj)) {
        const v = obj[k];
        if (k.toLowerCase().includes("leadid") && typeof v === "string") {
          return v; // Direct leadId field
        }
        if (typeof v === "string") {
          const m = v.match(/[?&#]leadId=([^&\s]+)/);
          if (m) return decodeURIComponent(m[1]);
        } else if (typeof v === "object") {
          const found = findLeadIdInObject(v);
          if (found) return found;
        }
      }
    }
    return null;
  } catch (e) {
    console.error("[calendly] Error extracting leadId:", e);
    return null;
  }
};

// Main webhook processing logic
const processWebhookEvent = async (event, isTest = false) => {
  const prefix = isTest ? "TEST -" : "";

  const eventType =
    event.event || event?.type || event?.event_type?.name || event?.trigger;
  const payload = event.payload || event.data || {};

  // Try multiple paths for invitee data
  const invitee =
    payload.invitee || payload?.invitee_created || payload?.resource || payload;

  // Extract email from common locations
  const email = (
    invitee?.email ||
    invitee?.email_address ||
    invitee?.resource?.email ||
    payload?.email ||
    payload?.email_address
  )?.toString();

  const leadIdFromUrl =
    findLeadIdInObject(event) ||
    findLeadIdInObject(payload) ||
    findLeadIdInObject(invitee);

  console.log(`[calendly] ${prefix} Extracted data:`, {
    eventType,
    email,
    leadIdFromUrl,
  });

  // Only process invitee.created events
  if (
    (eventType && String(eventType).includes("invitee.created")) ||
    String(eventType).toLowerCase().includes("invitee")
  ) {
    // Try to match by leadId first, then by email
    if (leadIdFromUrl) {
      const docRef = db.collection("prequalifications").doc(leadIdFromUrl);
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        await docRef.update({
          appointmentBooked: true,
          updatedAt: new Date().toISOString(),
        });
        console.log(
          `[calendly] ${prefix} Matched leadId ${leadIdFromUrl} and marked appointmentBooked`
        );
        return { success: true, matched: "leadId", id: leadIdFromUrl };
      }
    }

    if (email) {
      const q = await db
        .collection("prequalifications")
        .where("email", "==", String(email).toLowerCase().trim())
        .limit(1)
        .get();
      if (!q.empty) {
        const d = q.docs[0];
        await db.collection("prequalifications").doc(d.id).update({
          appointmentBooked: true,
          updatedAt: new Date().toISOString(),
        });
        console.log(
          `[calendly] ${prefix} Matched email ${email} and marked appointmentBooked for ${d.id}`
        );
        return { success: true, matched: "email", id: d.id };
      }
    }

    console.warn(
      `[calendly] ${prefix} Could not match lead for invitee.created`,
      {
        eventType,
        leadIdFromUrl,
        email,
        fullPayload: JSON.stringify(event, null, 2),
      }
    );
    return { success: true, message: "no-match" };
  }

  // For non-invitee events just acknowledge
  return { success: true, ignored: true };
};

// POST /api/calendly/webhook - Calendly will POST event payloads here
router.post("/webhook", async (req, res) => {
  try {
    const event = req.body || {};
    console.log("[calendly] 🎯 REAL WEBHOOK RECEIVED");
    console.log("[calendly] Full payload:", JSON.stringify(event, null, 2));
    console.log("[calendly] Headers:", JSON.stringify(req.headers, null, 2));
    console.log("[calendly] Timestamp:", new Date().toISOString());

    // Check signature for debugging
    const signature = req.headers["calendly-webhook-signature"];
    console.log("[calendly] Signature received:", signature);

    if (signature) {
      // Try to verify signature
      const body = JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac("sha256", CALENDLY_WEBHOOK_SIGNING_KEY)
        .update(body, "utf8")
        .digest("base64");

      console.log("[calendly] Expected signature:", expectedSignature);
      console.log(
        "[calendly] Signatures match:",
        signature === expectedSignature
      );
    } else {
      console.log(
        "[calendly] ⚠️ No signature provided - processing anyway for debugging"
      );
    }

    const result = await processWebhookEvent(event, false);

    // Log the result for debugging
    console.log("[calendly] Processing result:", result);

    res.status(200).json(result);
  } catch (err) {
    console.error("[calendly] webhook error:", err);
    res.status(500).json({ success: false, error: "internal" });
  }
});

// POST /api/calendly/webhook-test - Test endpoint without signature verification
router.post("/webhook-test", async (req, res) => {
  try {
    const event = req.body || {};
    console.log(
      "[calendly] TEST webhook received:",
      JSON.stringify(event, null, 2)
    );

    const result = await processWebhookEvent(event, true);
    res.status(200).json(result);
  } catch (err) {
    console.error("[calendly] TEST webhook error:", err);
    res.status(500).json({ success: false, error: "internal" });
  }
});

// OAuth callback for Calendly authorization
router.get("/oauth/callback", (req, res) => {
  const { code, error } = req.query;

  if (error) {
    console.error("[calendly] OAuth error:", error);
    return res.status(400).html(`
      <html>
        <body>
          <h1>❌ Authorization Error</h1>
          <p>Error: ${error}</p>
          <a href="/api/calendly/oauth/start">Try again</a>
        </body>
      </html>
    `);
  }

  if (code) {
    console.log("[calendly] ✅ Authorization code received:", code);
    res.send(`
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .code { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; font-family: monospace; }
            .success { color: #28a745; }
            .command { background: #333; color: #fff; padding: 10px; border-radius: 5px; font-family: monospace; }
          </style>
        </head>
        <body>
          <h1 class="success">✅ Authorization Successful!</h1>
          <p>Your authorization code is:</p>
          <div class="code">${code}</div>
          
          <h3>Next Steps:</h3>
          <ol>
            <li>Open PowerShell in your server directory</li>
            <li>Run this command:</li>
          </ol>
          <div class="command">
            node setup-calendly-webhook.js --code ${code}
          </div>
          
          <p>This will exchange the code for an access token and set up your webhook automatically.</p>
        </body>
      </html>
    `);
  } else {
    res.status(400).send("No authorization code received");
  }
});

// Start OAuth flow
router.get("/oauth/start", (req, res) => {
  const serverUrl =
    process.env.SERVER_URL || "https://raygpt-backend-2.onrender.com";
  const clientId = process.env.CALENDLY_CLIENT_ID;

  const authURL =
    `https://auth.calendly.com/oauth/authorize?` +
    `client_id=${clientId}&` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(
      serverUrl + "/api/calendly/oauth/callback"
    )}&` +
    `scope=webhook_subscription_write`;

  console.log("[calendly] 🔗 Redirecting to OAuth URL:", authURL);
  res.redirect(authURL);
});

export default router;
