import express from "express";
import emailService from "../services/emailService.js";

const router = express.Router();

// POST /api/contact
// Expected body: { name, email, phone, subject, message }
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body || {};

    // Basic validation
    if (!email || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: email and message are required.",
      });
    }

    // Compose email to site owner
    const ownerEmail = process.env.EMAIL_USER;
    if (!ownerEmail) {
      return res.status(500).json({
        success: false,
        error: "Server email not configured. Set EMAIL_USER in environment.",
      });
    }

    const ownerSubject = `Contact form: ${
      subject || "New message from website"
    }`;
    const ownerHtml = `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.4;color:#222">
        <h3>New contact form submission</h3>
        <p><strong>Name:</strong> ${name || "(not provided)"}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "(not provided)"}</p>
        <p><strong>Subject:</strong> ${subject || "(not provided)"}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${(message || "").replace(/\n/g, "<br />")}</p>
        <hr />
        <p>Received at: ${new Date().toISOString()}</p>
      </div>
    `;

    // Send to site owner
    await emailService.sendMail({
      to: ownerEmail,
      subject: ownerSubject,
      html: ownerHtml,
      text: `Name: ${name || "(not provided)"}\nEmail: ${email}\nPhone: ${
        phone || "(not provided)"
      }\nSubject: ${subject || "(not provided)"}\n\nMessage:\n${message}`,
    });

    // Send confirmation to user (simple receipt)
    const userSubject = `We received your message${
      subject ? ` — ${subject}` : ""
    }`;
    const userHtml = `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.4;color:#222">
        <h3>Thanks for contacting us</h3>
        <p>Hi ${name || "there"},</p>
        <p>Thanks for getting in touch. We received your message and will respond as soon as possible.</p>
        <p><strong>Your message:</strong></p>
        <div style="padding:12px;border:1px solid #eee;background:#fafafa">${(
          message || ""
        ).replace(/\n/g, "<br />")}</div>
        <p style="color:#666;font-size:13px;margin-top:12px">If you need immediate help, reply to this email.</p>
      </div>
    `;

    // Only attempt to send confirmation if the user provided a valid-looking email
    try {
      if (email && email.includes("@")) {
        await emailService.sendMail({
          to: email,
          subject: userSubject,
          html: userHtml,
          text: `Thanks for contacting us. We received your message:\n\n${message}`,
        });
      }
    } catch (userErr) {
      // log and continue - we don't want confirmation failure to break the main flow
      console.warn(
        "Failed to send confirmation to user:",
        userErr?.message || userErr
      );
    }

    return res.json({ success: true, message: "Message sent" });
  } catch (err) {
    console.error("/api/contact error:", err?.message || err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to send message" });
  }
});

export default router;
