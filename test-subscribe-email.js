import dotenv from "dotenv";
import emailService from "./services/emailService.js";

dotenv.config();

console.log("====================================");
console.log("TESTING SUBSCRIBE EMAIL FLOW");
console.log("====================================\n");

// Test 1: Check environment
console.log("1. Environment Check:");
console.log(
  "   EMAIL_USER:",
  process.env.EMAIL_USER ? `✅ ${process.env.EMAIL_USER}` : "❌ NOT SET"
);
console.log(
  "   EMAIL_PASS:",
  process.env.EMAIL_PASS
    ? `✅ Set (${process.env.EMAIL_PASS.length} chars)`
    : "❌ NOT SET"
);
console.log("   BACKEND_URL:", process.env.BACKEND_URL || "(using default)");
console.log("   FRONTEND_URL:", process.env.FRONTEND_URL || "(using default)");
console.log();

// Test 2: Test sendFirstEmail function (English)
console.log("2. Testing sendFirstEmail (English)...");
try {
  const result = await emailService.sendFirstEmail({
    email: process.env.EMAIL_USER, // Send to yourself
    name: "Test User",
    language: "en",
  });
  console.log("   ✅ First email sent successfully!");
  console.log("   Result:", result);
} catch (error) {
  console.error("   ❌ Failed to send first email:");
  console.error("   Error:", error.message);
  console.error("   Stack:", error.stack);
}
console.log();

// Test 3: Test sendFirstEmail function (Spanish)
console.log("3. Testing sendFirstEmail (Spanish)...");
try {
  const result = await emailService.sendFirstEmail({
    email: process.env.EMAIL_USER, // Send to yourself
    name: "Usuario de Prueba",
    language: "es",
  });
  console.log("   ✅ Spanish email sent successfully!");
  console.log("   Result:", result);
} catch (error) {
  console.error("   ❌ Failed to send Spanish email:");
  console.error("   Error:", error.message);
}
console.log();

// Test 4: Test scheduleEmailSequence (wrapper function)
console.log("4. Testing scheduleEmailSequence...");
try {
  const result = await emailService.scheduleEmailSequence({
    email: process.env.EMAIL_USER,
    name: "Test User 2",
    language: "en",
  });
  console.log("   ✅ scheduleEmailSequence completed!");
  console.log("   Result:", result);
} catch (error) {
  console.error("   ❌ Failed to schedule email sequence:");
  console.error("   Error:", error.message);
}
console.log();

console.log("====================================");
console.log("✅ TEST COMPLETE");
console.log("====================================");
console.log("\nCheck your inbox at:", process.env.EMAIL_USER);
console.log("You should receive 3 test emails (2 English + 1 Spanish)");
