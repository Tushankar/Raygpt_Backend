import express from "express";
import { StoreService } from "../services/storeService.js";
import { authenticateAdmin } from "../middleware/auth.js";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import { getStoreRequestStatusEmail } from "../utils/emailTemplates.js";

dotenv.config();

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

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
            // Use SendGrid for sending
            (async () => {
              try {
                const msg = {
                  to: result.data.email,
                  from:
                    process.env.SENDGRID_FROM_EMAIL ||
                    "noreply@rayshealthyliving.com",
                  subject,
                  text,
                  html,
                  replyTo:
                    process.env.SENDGRID_FROM_EMAIL ||
                    "noreply@rayshealthyliving.com",
                };

                await sgMail.send(msg);
                console.log(
                  `✅ Store request notification email sent to ${result.data.email} (status: ${status})`
                );
              } catch (err) {
                console.error(
                  `❌ Failed to send store request notification to ${result.data.email}:`,
                  err?.message || err
                );
              }
            })();
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
