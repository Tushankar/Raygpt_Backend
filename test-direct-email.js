// Direct test to see if emails are actually being sent from the server
import dotenv from "dotenv";
import emailService from "./services/emailService.js";

dotenv.config();

const TEST_EMAIL = "sahatushankar234@gmail.com";

console.log("====================================");
console.log("DIRECT EMAIL SEND TEST");
console.log("====================================\n");

// Check if transporter is configured
console.log("Checking email service configuration...");
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Set" : "NOT SET");
console.log();

// Test 1: Direct sendMail call
console.log("Test 1: Direct sendMail (basic test)...");
try {
  const result = await emailService.sendMail({
    to: TEST_EMAIL,
    subject: "Direct Test Email",
    text: "This is a direct test email",
    html: "<h1>Direct Test Email</h1><p>This is a direct test email sent from the email service.</p>",
  });
  console.log("✅ Direct sendMail successful!");
  console.log("Result:", result);
  console.log();
} catch (error) {
  console.error("❌ Direct sendMail failed:");
  console.error("Error:", error.message);
  console.error("Stack:", error.stack);
  console.log();
}

// Test 2: scheduleEmailSequence (what the subscribe route calls)
console.log("Test 2: scheduleEmailSequence (what subscribe route calls)...");
try {
  const result = await emailService.scheduleEmailSequence({
    email: TEST_EMAIL,
    name: "Tushankar Saha",
    language: "en",
  });
  console.log("✅ scheduleEmailSequence successful!");
  console.log("Result:", result);
  console.log();
} catch (error) {
  console.error("❌ scheduleEmailSequence failed:");
  console.error("Error:", error.message);
  console.error("Stack:", error.stack);
  console.log();
}

// Test 3: sendFirstEmail (the actual function that sends the manual)
console.log("Test 3: sendFirstEmail (sends the manual email)...");
try {
  const result = await emailService.sendFirstEmail({
    email: TEST_EMAIL,
    name: "Tushankar Saha",
    language: "en",
  });
  console.log("✅ sendFirstEmail successful!");
  console.log("Result:", result);
  console.log();
} catch (error) {
  console.error("❌ sendFirstEmail failed:");
  console.error("Error:", error.message);
  console.error("Stack:", error.stack);
  console.log();
}

console.log("====================================");
console.log("TEST COMPLETE");
console.log("====================================");
console.log("\nIf all tests passed, check your email at:", TEST_EMAIL);
console.log("You should receive 3 emails:");
console.log("1. Direct test email");
console.log("2. Welcome email from scheduleEmailSequence");
console.log("3. Welcome email from sendFirstEmail");
