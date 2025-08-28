import express from "express";
import { ExpertService } from "../services/expertService.js";
import { authenticateAdmin } from "../middleware/auth.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { getStoreRequestStatusEmail } from "../utils/emailTemplates.js";
import multer from "multer";
import { mkdirSync, existsSync } from "fs";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// Ensure upload directory exists
const uploadDir = "uploads/experts";
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-]/g, "_");
    cb(null, `${unique}-${safeName}`);
  },
});

const upload = multer({ storage });

const router = express.Router();

router.post("/", upload.single("logo"), async (req, res) => {
  try {
    const body = { ...req.body };
    // helpWith may be stringified JSON from the client
    if (body.helpWith && typeof body.helpWith === "string") {
      try {
        body.helpWith = JSON.parse(body.helpWith);
      } catch (e) {
        body.helpWith = [body.helpWith];
      }
    }
    if (req.file) body.logo = req.file.filename;

    const result = await ExpertService.createExpertRequest(body);
    if (result.success)
      return res.status(201).json({ success: true, data: result.data });
    return res.status(400).json({ success: false, error: result.error });
  } catch (err) {
    console.error("Error creating expert request:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

router.get("/", authenticateAdmin, async (req, res) => {
  try {
    const result = await ExpertService.getAllExpertRequests();
    if (result.success) return res.json({ success: true, data: result.data });
    return res.status(500).json({ success: false, error: result.error });
  } catch (err) {
    console.error("Error fetching expert requests:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

router.patch("/:id/status", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes } = req.body;
    const reviewedBy = req.user?.id || "admin";
    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }
    const result = await ExpertService.updateExpertRequestStatus(
      id,
      status,
      reviewedBy,
      reviewNotes || ""
    );
    if (result.success) {
      // send notification email
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
            await transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: result.data.email,
              subject,
              text,
              html,
            });
            console.log(
              `Expert notification email sent to ${result.data.email} for request ${id}`
            );
          }
        } catch (err) {
          console.error("Failed to send expert notification email:", err);
        }
      })();

      return res.json({ success: true, data: result.data });
    }
    return res.status(404).json({ success: false, error: result.error });
  } catch (err) {
    console.error("Error updating expert request status:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
