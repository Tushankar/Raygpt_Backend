import dotenv from "dotenv";
import emailService from "./services/emailService.js";

dotenv.config();

console.log("====================================");
console.log("SIMPLE EMAIL SEND TEST");
console.log("====================================\n");

const TEST_EMAIL = "sahatushankar234@gmail.com";
const TEST_NAME = "Tushankar Saha";

console.log(
  "This test simulates what happens when someone subscribes on the landing page."
);
console.log("It will send the welcome email with the manual download link.\n");

console.log("Sending email to:", TEST_EMAIL);
console.log("Name:", TEST_NAME);
console.log("Language: en");
console.log("\nSending...\n");

try {
  const result = await emailService.scheduleEmailSequence({
    email: TEST_EMAIL,
    name: TEST_NAME,
    language: "en",
  });

  console.log("✅ EMAIL SENT SUCCESSFULLY!");
  console.log("Result:", result);
  console.log("\n====================================");
  console.log("SUCCESS - EMAIL SENT");
  console.log("====================================\n");

  console.log("📧 Check your inbox at:", TEST_EMAIL);
  console.log("Subject: 'Your Vitamin Store Opportunity Manual — Here it is'");
  console.log("\nThe email contains:");
  console.log("• Welcome message");
  console.log("• Download button for the business manual");
  console.log(
    "• Link to: https://raygpt-backend-2.onrender.com/api/download/manual"
  );
  console.log("\nIf you don't see it:");
  console.log("1. ✅ Check SPAM/JUNK folder (most likely location)");
  console.log("2. Check Promotions tab (if Gmail)");
  console.log("3. Search for: from:tirtho.kyptronix@gmail.com");
} catch (error) {
  console.error("❌ FAILED TO SEND EMAIL");
  console.error("Error:", error.message);
  console.error("Stack:", error.stack);
}
