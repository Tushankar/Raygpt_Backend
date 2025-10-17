// Test the actual /api/subscribe endpoint to see if it's working
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
const TEST_EMAIL = "test@example.com";
const TEST_NAME = "Test User";

console.log("====================================");
console.log("TESTING /api/subscribe ENDPOINT");
console.log("====================================\n");

console.log("Backend URL:", BACKEND_URL);
console.log();

// Test 1: Subscribe with opt-in
console.log("1. Testing subscription WITH promotional opt-in...");
try {
  const response = await fetch(`${BACKEND_URL}/api/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: TEST_EMAIL,
      name: TEST_NAME,
      language: "en",
      optInPromotionalEmails: true,
    }),
  });

  const data = await response.json();
  console.log("   Response status:", response.status);
  console.log("   Response data:", data);

  if (response.ok) {
    console.log("   ✅ Subscription successful with opt-in!");
  } else {
    console.log("   ❌ Subscription failed");
  }
} catch (error) {
  console.error("   ❌ Error:", error.message);
}
console.log();

// Test 2: Subscribe without opt-in
console.log("2. Testing subscription WITHOUT promotional opt-in...");
try {
  const response = await fetch(`${BACKEND_URL}/api/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "test2@example.com",
      name: "Test User 2",
      language: "en",
      optInPromotionalEmails: false,
    }),
  });

  const data = await response.json();
  console.log("   Response status:", response.status);
  console.log("   Response data:", data);

  if (response.ok) {
    console.log("   ✅ Subscription successful without opt-in!");
  } else {
    console.log("   ❌ Subscription failed");
  }
} catch (error) {
  console.error("   ❌ Error:", error.message);
}
console.log();

// Test 3: Test with real email (your email)
console.log("3. Testing with REAL email (will send actual email)...");
const realEmail = process.env.EMAIL_USER;
try {
  const response = await fetch(`${BACKEND_URL}/api/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: realEmail,
      name: "Real Test User",
      language: "en",
      optInPromotionalEmails: true,
    }),
  });

  const data = await response.json();
  console.log("   Response status:", response.status);
  console.log("   Response data:", data);

  if (response.ok) {
    console.log("   ✅ Real subscription successful!");
    console.log("   📧 Check your inbox at:", realEmail);
  } else {
    console.log("   ❌ Subscription failed");
  }
} catch (error) {
  console.error("   ❌ Error:", error.message);
}
console.log();

console.log("====================================");
console.log("✅ ENDPOINT TESTS COMPLETE");
console.log("====================================");
