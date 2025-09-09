#!/usr/bin/env node

// Test the final email template to ensure booking link is correct
// Run with: node test-final-email.js

import { scheduleRemainingEmails } from "./services/emailService.js";

console.log("📧 Testing Final Email Booking Link");
console.log("===================================");

// Import the EMAIL_SEQUENCE from emailService to test the final email
import fs from "fs";
import path from "path";

// Read the email service file to extract the final email template
const emailServicePath = path.join(
  process.cwd(),
  "services",
  "emailService.js"
);
const emailServiceContent = fs.readFileSync(emailServicePath, "utf8");

// Test the final email render function
console.log("\n🔍 Final Email Template Test:");

// Mock data for testing
const testName = "John Doe";
const testEmail = "test@example.com";

// Extract and test the final email
const finalEmailPattern =
  /subject: "🎁 Here's Your Final Business Manual \+ Next Steps",\s*render: \(name\) => \{([\s\S]*?)\}/;
const match = emailServiceContent.match(finalEmailPattern);

if (match) {
  console.log("✅ Found final email template");

  // Check if it contains the correct Calendly URL
  const templateContent = match[1];
  const calendlyUrl = "https://calendly.com/sahatushankar234/30min";

  if (templateContent.includes(calendlyUrl)) {
    console.log("✅ Final email contains correct Calendly URL");
    console.log(`   URL: ${calendlyUrl}`);
  } else if (templateContent.includes("scheduleUrl")) {
    console.log("✅ Final email uses scheduleUrl variable");

    // Check what scheduleUrl is set to
    const scheduleUrlPattern = /const scheduleUrl = ([^;]+);/;
    const urlMatch = templateContent.match(scheduleUrlPattern);

    if (urlMatch) {
      const urlExpression = urlMatch[1].trim();
      console.log(`   scheduleUrl = ${urlExpression}`);

      if (urlExpression.includes("calendly.com/sahatushankar234/30min")) {
        console.log("✅ scheduleUrl is set to correct Calendly link");
      } else {
        console.log("❌ scheduleUrl is NOT set to correct Calendly link");
      }
    }
  } else {
    console.log("❌ Final email does NOT contain Calendly URL");
  }
} else {
  console.log("❌ Could not find final email template");
}

console.log("\n🎯 Expected Behavior:");
console.log(
  "- Final email should have booking button linking to: https://calendly.com/sahatushankar234/30min"
);
console.log("- Other emails/SMS should use BOOKING_LINK environment variable");
console.log("- Frontend book-consultation section should work independently");

console.log("\n🔧 If booking link still not working:");
console.log("1. Verify Render environment variables are set");
console.log("2. Redeploy your Render service after setting BOOKING_LINK");
console.log("3. Test by sending actual email and checking the link");
console.log("4. Check browser console for any JavaScript errors");

// Test the current environment configuration
console.log(`\n📋 Current Environment:`);
console.log(`BOOKING_LINK: ${process.env.BOOKING_LINK || "NOT SET"}`);
console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL || "NOT SET"}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || "NOT SET"}`);

if (
  process.env.BOOKING_LINK === "https://calendly.com/sahatushankar234/30min"
) {
  console.log("✅ Environment is correctly configured for production");
} else {
  console.log("⚠️  Set BOOKING_LINK in your Render environment variables");
}
