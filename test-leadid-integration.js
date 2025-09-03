import dotenv from "dotenv";
import { scheduleThreeEmailSequence } from "./services/automationEmailService.js";

dotenv.config();

console.log("🧪 Testing LeadId Integration in Booking Links");
console.log("===============================================");

// Test the email service with leadId
console.log("\n1️⃣ Testing email templates with leadId...");
try {
  const testData = {
    email: "test@example.com",
    name: "Test User",
    bookingLink: "https://calendly.com/sahatushankar234/30min",
    leadId: "TEST123456",
  };

  console.log("Input data:", testData);

  // This should generate templates with leadId in the URLs
  const result = await scheduleThreeEmailSequence(testData, {
    minSec: 1, // Quick test
    maxSec: 2,
  });

  console.log("✅ Email sequence scheduled:", result);
  console.log(
    "Expected booking link format: https://calendly.com/sahatushankar234/30min?leadId=TEST123456"
  );
} catch (error) {
  console.error("❌ Error testing email service:", error.message);
}

console.log("\n2️⃣ Testing without leadId (fallback)...");
try {
  const testData = {
    email: "test2@example.com",
    name: "Test User 2",
    bookingLink: "https://calendly.com/sahatushankar234/30min",
    // No leadId
  };

  console.log("Input data:", testData);

  const result = await scheduleThreeEmailSequence(testData, {
    minSec: 1,
    maxSec: 2,
  });

  console.log("✅ Email sequence scheduled:", result);
  console.log(
    "Expected booking link format: https://calendly.com/sahatushankar234/30min (no leadId)"
  );
} catch (error) {
  console.error("❌ Error testing email service:", error.message);
}

console.log(
  "\n🎯 Test complete! Check the console output above for any scheduled emails."
);
console.log(
  "If everything works, your booking links should now include leadId parameters."
);

// Exit after a few seconds to let scheduled emails process
setTimeout(() => {
  console.log("\nExiting test script...");
  process.exit(0);
}, 5000);
