#!/usr/bin/env node

// Comprehensive test script for Calendly integration
// Run with: node test-integration.js

const baseUrl = "https://raygpt-backend-2.onrender.com";
const ngrokUrl = process.env.NGROK_URL || "https://ce387d550d47.ngrok-free.app";

async function test(name, url, options = {}) {
  console.log(`\n🧪 Testing: ${name}`);
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    const data = await response.json();
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(data, null, 2));
    return { success: response.ok, data };
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log("🚀 Starting Calendly Integration Tests");
  console.log(`🔗 Local URL: ${baseUrl}`);
  console.log(`🌐 Ngrok URL: ${ngrokUrl}`);

  // Test 1: Basic health check
  await test("Health Check", `${baseUrl}/api/calendly/test`);

  // Test 2: Webhook info
  await test("Webhook Info", `${baseUrl}/api/calendly/webhook-info`);

  // Test 3: Check current status
  await test(
    "Check Lead Status",
    `${baseUrl}/api/prequal/Wx28SQy2HQlfej8XN6Fj`
  );

  // Test 4: Manual booking
  await test("Manual Booking", `${baseUrl}/api/calendly/mark-booked`, {
    method: "POST",
    body: JSON.stringify({ leadId: "Wx28SQy2HQlfej8XN6Fj" }),
  });

  // Test 5: Check updated status
  await test(
    "Check Updated Status",
    `${baseUrl}/api/prequal/Wx28SQy2HQlfej8XN6Fj`
  );

  // Test 6: Webhook simulation
  const webhookPayload = {
    event: "invitee.created",
    payload: {
      invitee: {
        email: "tushankarsaha0@gmail.com",
        uri: `https://calendly.com/test?leadId=Wx28SQy2HQlfej8XN6Fj`,
      },
    },
  };

  await test("Webhook Simulation", `${baseUrl}/api/calendly/webhook-test`, {
    method: "POST",
    body: JSON.stringify(webhookPayload),
  });

  console.log("\n✨ Test complete!");
  console.log("\n📋 Next Steps:");
  console.log("1. Configure Calendly webhook with:");
  console.log(`   ${ngrokUrl}/api/calendly/webhook`);
  console.log("2. Test real appointment booking");
  console.log("3. Check admin panel for booking status");
}

// Import fetch for Node.js
import fetch from "node-fetch";
runTests().catch(console.error);
