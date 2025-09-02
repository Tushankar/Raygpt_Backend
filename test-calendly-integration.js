#!/usr/bin/env node

// Test script for Calendly webhook integration
// Run with: node test-calendly-integration.js

import fetch from "node-fetch";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";

// Test data
const testData = {
  existingLeadId: "Wx28SQy2HQlfej8XN6Fj",
  existingEmail: "tushankarsaha0@gmail.com",
};

async function testEndpoint(name, url, options = {}) {
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`📡 URL: ${url}`);

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

async function main() {
  console.log("🚀 Starting Calendly Integration Tests");
  console.log(`🔗 Server URL: ${SERVER_URL}`);

  // Test 1: Health check
  await testEndpoint("Health Check", `${SERVER_URL}/api/calendly/test`);

  // Test 2: Manual booking endpoint
  await testEndpoint(
    "Manual Booking (by leadId)",
    `${SERVER_URL}/api/calendly/mark-booked`,
    {
      method: "POST",
      body: JSON.stringify({ leadId: testData.existingLeadId }),
    }
  );

  // Test 3: Check if appointment was marked as booked
  await testEndpoint(
    "Check Appointment Status",
    `${SERVER_URL}/api/prequal/${testData.existingLeadId}`
  );

  // Test 4: Test webhook simulation
  const webhookPayload = {
    event: "invitee.created",
    payload: {
      invitee: {
        email: testData.existingEmail,
        uri: `https://calendly.com/test?leadId=${testData.existingLeadId}`,
      },
    },
  };

  await testEndpoint(
    "Webhook Test Endpoint",
    `${SERVER_URL}/api/calendly/webhook-test`,
    {
      method: "POST",
      body: JSON.stringify(webhookPayload),
    }
  );

  // Test 5: Final status check
  await testEndpoint(
    "Final Appointment Status Check",
    `${SERVER_URL}/api/prequal/${testData.existingLeadId}`
  );

  console.log("\n✨ Test complete! Check the results above.");
  console.log("\n📋 Next Steps:");
  console.log("1. If tests pass, deploy your server publicly");
  console.log("2. Configure Calendly webhook with your public URL");
  console.log("3. Test with real Calendly bookings");
}

main().catch(console.error);
