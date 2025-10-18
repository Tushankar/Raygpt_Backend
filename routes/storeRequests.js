import express from "express";
import { StoreService } from "../services/storeService.js";
import { authenticateAdmin } from "../middleware/auth.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { getStoreRequestStatusEmail } from "../utils/emailTemplates.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // Use TLS port, NOT 465
  secure: false, // false for TLS, true for SSL/465
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // CRITICAL: Timeout settings for Render environment
  connectionTimeout: 30000, // 30 seconds
  socketTimeout: 30000, // 30 seconds
  greetingTimeout: 10000,
  // Connection pool settings
  pool: {
    maxConnections: 1, // Keep low
    maxMessages: 10,
    rateDelta: 24 * 60 * 60 * 1000,
    rateLimit: 300,
  },
  // TLS security options
  tls: {
    rejectUnauthorized: false, // Required for Render
    minVersion: "TLSv1.2",
  },
});

const router = express.Router();

// Create a new store request
router.post("/", async (req, res) => {
  try {
    const {
      userId,
      userName,
      storeName,
      storeUrl,
      email,
      phone,
      country,
      city,
      postalCode,
    } = req.body;

    // Validate required fields
    if (!storeName || !storeUrl || !email || !userId) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: storeName, storeUrl, email, userId",
      });
    }

    const storeData = {
      userId,
      userName,
      storeName,
      storeUrl,
      email,
      phone,
      country,
      city,
      postalCode,
    };

    const result = await StoreService.createStoreRequest(storeData);

    if (result.success) {
      res.status(201).json({
        success: true,
        message: "Store request submitted successfully",
        data: result.data,
      });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error("Error creating store request:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// Get all store requests (admin only)
router.get("/", authenticateAdmin, async (req, res) => {
  try {
    const result = await StoreService.getAllStoreRequests();

    if (result.success) {
      res.json({ success: true, data: result.data });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error("Error fetching store requests:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// Get store request by ID (admin only)
router.get("/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await StoreService.getStoreRequestById(id);

    if (result.success) {
      res.json({ success: true, data: result.data });
    } else {
      res.status(404).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error("Error fetching store request:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// Update store request status (admin only)
router.patch("/:id/status", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes } = req.body;
    const reviewedBy = req.user?.id || "admin"; // Assuming user info is in req.user

    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be pending, approved, or rejected",
      });
    }

    const result = await StoreService.updateStoreRequestStatus(
      id,
      status,
      reviewedBy,
      reviewNotes || ""
    );

    if (result.success) {
      // send notification email (fire and forget)
      (async () => {
        try {
          const clientBaseUrl = process.env.CLIENT_URL || "";
          const { subject, text, html } = getStoreRequestStatusEmail(
            result.data,
            status,
            reviewNotes || "",
            clientBaseUrl
          );
          if (result.data && result.data.email) {
            // Wrap sendMail with proper timeout handling
            await new Promise((resolve, reject) => {
              const timeoutId = setTimeout(() => {
                const timeoutErr = new Error(
                  `Email send timeout (60s) for ${result.data.email}. Gmail SMTP may be unreachable.`
                );
                console.error(`⏱️ TIMEOUT: ${timeoutErr.message}`);
                reject(timeoutErr);
              }, 60000); // 60 second timeout

              transporter.sendMail(
                {
                  from: `${process.env.EMAIL_USER}`,
                  to: result.data.email,
                  subject,
                  text,
                  html,
                },
                (err, info) => {
                  clearTimeout(timeoutId);
                  if (err) {
                    console.error(
                      `❌ Failed to send store request notification to ${result.data.email}:`,
                      err?.message || err
                    );
                    reject(err);
                  } else {
                    console.log(
                      `✅ Store request notification email sent to ${result.data.email} (status: ${status})`
                    );
                    resolve(info);
                  }
                }
              );
            });
          }
        } catch (err) {
          console.error(
            "Failed to send notification email:",
            err?.message || err
          );
        }
      })();

      res.json({
        success: true,
        message: `Store request ${status} successfully`,
        data: result.data,
      });
    } else {
      res.status(404).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error("Error updating store request status:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// Get store requests by status (admin only)
router.get("/status/:status", authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.params;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be pending, approved, or rejected",
      });
    }

    const result = await StoreService.getStoreRequestsByStatus(status);

    if (result.success) {
      res.json({ success: true, data: result.data });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error("Error fetching store requests by status:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// Get store requests by user ID
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await StoreService.getStoreRequestsByUserId(userId);

    if (result.success) {
      res.json({ success: true, data: result.data });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error("Error fetching store requests by user ID:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// Delete store request (admin only)
router.delete("/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await StoreService.deleteStoreRequest(id);

    if (result.success) {
      res.json({
        success: true,
        message: "Store request deleted successfully",
      });
    } else {
      res.status(404).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error("Error deleting store request:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
