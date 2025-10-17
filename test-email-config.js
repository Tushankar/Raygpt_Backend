import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

console.log("====================================");
console.log("EMAIL CONFIGURATION TEST");
console.log("====================================\n");

// Check environment variables
console.log("1. Environment Variables Check:");
console.log(
  "   EMAIL_USER:",
  process.env.EMAIL_USER ? `✅ Set (${process.env.EMAIL_USER})` : "❌ NOT SET"
);
console.log(
  "   EMAIL_PASS:",
  process.env.EMAIL_PASS
    ? `✅ Set (${process.env.EMAIL_PASS.length} characters)`
    : "❌ NOT SET"
);
console.log(
  "   EMAIL_FROM:",
  process.env.EMAIL_FROM || "(Not set, will use EMAIL_USER)"
);
console.log();

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("❌ EMAIL_USER or EMAIL_PASS not set in .env file!");
  process.exit(1);
}

// Create transporter
console.log("2. Creating Gmail Transporter...");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
console.log("   ✅ Transporter created\n");

// Verify connection
console.log("3. Verifying SMTP Connection...");
try {
  await transporter.verify();
  console.log("   ✅ SMTP connection verified successfully!\n");
} catch (error) {
  console.error("   ❌ SMTP connection failed:");
  console.error("   Error:", error.message);
  console.error("\n   Common issues:");
  console.error("   - Wrong email/password");
  console.error("   - 2-factor authentication enabled without app password");
  console.error("   - Less secure app access disabled");
  console.error("   - Gmail blocking sign-in attempts");
  console.error("\n   Solution:");
  console.error("   1. Go to https://myaccount.google.com/apppasswords");
  console.error("   2. Generate a new app password");
  console.error("   3. Use that password in EMAIL_PASS");
  process.exit(1);
}

// Send test email
console.log("4. Sending Test Email...");
const testEmail = {
  from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
  to: process.env.EMAIL_USER, // Send to yourself
  subject: "Test Email - Nodemailer Configuration Check",
  text: "This is a test email to verify your Nodemailer configuration is working correctly.",
  html: `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #4CAF50;">✅ Email Configuration Test Successful!</h2>
      <p>Your Nodemailer configuration is working correctly.</p>
      <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
      <hr>
      <p style="font-size: 12px; color: #666;">
        This is an automated test email from your Ray's Healthy Living backend.
      </p>
    </div>
  `,
};

try {
  const info = await transporter.sendMail(testEmail);
  console.log("   ✅ Test email sent successfully!");
  console.log("   Message ID:", info.messageId);
  console.log("   To:", testEmail.to);
  console.log("\n====================================");
  console.log("✅ ALL TESTS PASSED!");
  console.log("====================================");
  console.log("\nCheck your inbox at:", process.env.EMAIL_USER);
} catch (error) {
  console.error("   ❌ Failed to send test email:");
  console.error("   Error:", error.message);
  console.error("\n   Response:", error.response);
  process.exit(1);
}
