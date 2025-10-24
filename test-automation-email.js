#!/usr/bin/env node
/**
 * Test automation email sending
 * Tests the 3-email automation sequence for not-booked leads
 */

import dotenv from "dotenv";
import automationEmailService from "./services/automationEmailService.js";

dotenv.config();

async function testAutomationEmail() {
  console.log("\n🧪 Testing Automation Email Sequence\n");
  console.log("=".repeat(60));

  // Check environment
  console.log("\n📋 Environment Check:");
  console.log(
    `   - SENDGRID_API_KEY: ${
      process.env.SENDGRID_API_KEY ? "✅ Set" : "❌ Missing"
    }`
  );
  console.log(
    `   - SENDGRID_FROM_EMAIL: ${
      process.env.SENDGRID_FROM_EMAIL || "❌ Missing"
    }`
  );
  console.log(`   - FRONTEND_URL: ${process.env.FRONTEND_URL || "❌ Missing"}`);
  console.log(`   - BOOKING_LINK: ${process.env.BOOKING_LINK || "❌ Missing"}`);

  if (!process.env.SENDGRID_API_KEY) {
    console.error("\n❌ SENDGRID_API_KEY is not set. Cannot send emails.");
    process.exit(1);
  }

  // Test data
  const testEmail = "test-automation@example.com";
  const testName = "Test User";
  const testBookingLink =
    process.env.BOOKING_LINK || "https://calendly.com/test";
  const testLeadId = "lead-test-12345";

  console.log("\n📧 Test Parameters:");
  console.log(`   - Email: ${testEmail}`);
  console.log(`   - Name: ${testName}`);
  console.log(`   - Booking Link: ${testBookingLink}`);
  console.log(`   - Lead ID: ${testLeadId}`);
  console.log(`   - Language: en`);

  try {
    console.log(
      "\n⏳ Scheduling automation emails (TEST MODE - 30s, 1m, 90s delays)...\n"
    );

    const result = await automationEmailService.scheduleThreeEmailSequence(
      {
        email: testEmail,
        name: testName,
        bookingLink: testBookingLink,
        leadId: testLeadId,
        language: "en",
      },
      { testMode: true } // Use fast timing for testing
    );

    console.log("\n✅ Automation Sequence Scheduled Successfully!");
    console.log("\nScheduling Details:");
    console.log(`   - Total Emails: ${result.emailCount}`);
    console.log(`   - Schedule: ${result.schedule}`);
    console.log(
      `   - Estimated Duration: ${(result.estimatedDurationMs / 1000).toFixed(
        1
      )}s`
    );
    console.log(`   - Details: ${result.details}`);

    console.log("\n📝 Expected Timeline (TEST MODE):");
    console.log("   - Email 1: Sent after 30 seconds");
    console.log("   - Email 2: Sent after 1 minute");
    console.log("   - Email 3: Sent after 90 seconds");

    console.log(
      "\n💡 Check server logs above for confirmation of each email send."
    );
    console.log("   Look for ✅ messages indicating successful sends.\n");

    // Wait for all emails to be sent (test mode = 90 seconds)
    console.log(
      "⏳ Waiting for emails to be sent (90 seconds for test mode)..."
    );
    console.log("   (Keep the server running for this test to complete)\n");

    // Keep the process alive long enough for all emails to be sent
    await new Promise((resolve) => setTimeout(resolve, 100000)); // 100 seconds
  } catch (err) {
    console.error("\n❌ Error scheduling automation emails:");
    console.error(err?.message || err);
    process.exit(1);
  }
}

testAutomationEmail().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
