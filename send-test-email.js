import dotenv from "dotenv";
import emailService from "./services/emailService.js";

dotenv.config();

const TARGET_EMAIL = "sahatushankar234@gmail.com";

console.log("====================================");
console.log("SENDING TEST EMAIL");
console.log("====================================\n");

console.log("Sending email to:", TARGET_EMAIL);
console.log("From:", process.env.EMAIL_USER);
console.log();

// Send welcome email with manual
console.log("Sending welcome email with business manual...");
try {
  const result = await emailService.sendFirstEmail({
    email: TARGET_EMAIL,
    name: "Tushankar",
    language: "en",
  });

  console.log("✅ Email sent successfully!");
  console.log("Subject:", result.emailSent);
  console.log();
  console.log("====================================");
  console.log("CHECK YOUR INBOX!");
  console.log("====================================");
  console.log(`\nAn email has been sent to: ${TARGET_EMAIL}`);
  console.log("Subject: 'Your Vitamin Store Opportunity Manual — Here it is'");
  console.log("\nThe email includes a download link for the business manual.");
} catch (error) {
  console.error("❌ Failed to send email:");
  console.error("Error:", error.message);
  console.error("Stack:", error.stack);
  process.exit(1);
}
