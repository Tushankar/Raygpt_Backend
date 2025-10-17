import dotenv from "dotenv";
import express from "express";
import subscribeRoute from "./routes/subscribe.js";

dotenv.config();

console.log("====================================");
console.log("TESTING SUBSCRIBE ROUTE WITH EMAIL");
console.log("====================================\n");

// Test the subscribe route directly with a mock request
async function testSubscribe() {
  const testEmail = "sahatushankar234@gmail.com";
  const testName = "Tushankar Saha";

  console.log("Test 1: Subscribe WITH opt-in (optInPromotionalEmails: true)");
  console.log("Expected: Email should be sent\n");

  // Create a minimal Express app for testing
  const app = express();
  app.use(express.json());
  app.use("/api/subscribe", subscribeRoute);

  // Start server on a test port
  const PORT = 5555;
  const server = app.listen(PORT, () => {
    console.log(`Test server started on port ${PORT}`);
  });

  // Wait a moment for server to start
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    // Test 1: With opt-in
    console.log("Sending test request with opt-in...");
    const response1 = await fetch(`http://localhost:${PORT}/api/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        name: testName,
        language: "en",
        optInPromotionalEmails: true,
      }),
    });

    const data1 = await response1.json();
    console.log("Response:", data1);
    console.log("Status:", response1.status);

    if (response1.ok) {
      console.log("✅ Subscription successful with opt-in");
      console.log("   Subscription ID:", data1.id);
      console.log("   📧 Email should have been sent!\n");
    } else {
      console.log("❌ Subscription failed:", data1.error);
    }

    // Wait for email to be sent
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Test 2: Without opt-in
    console.log(
      "\nTest 2: Subscribe WITHOUT opt-in (optInPromotionalEmails: false)"
    );
    console.log("Expected: Email should STILL be sent (manual download)\n");

    console.log("Sending test request without opt-in...");
    const response2 = await fetch(`http://localhost:${PORT}/api/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test-no-optin@example.com",
        name: "Test User No Opt-in",
        language: "en",
        optInPromotionalEmails: false,
      }),
    });

    const data2 = await response2.json();
    console.log("Response:", data2);
    console.log("Status:", response2.status);

    if (response2.ok) {
      console.log("✅ Subscription successful without opt-in");
      console.log("   Subscription ID:", data2.id);
      console.log("   📧 Email should have been sent!\n");
    } else {
      console.log("❌ Subscription failed:", data2.error);
    }

    // Wait for email to be sent
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("\n====================================");
    console.log("✅ TESTS COMPLETE");
    console.log("====================================\n");

    console.log("Check your email at:", testEmail);
    console.log(
      "You should have received a welcome email with the manual download link."
    );
    console.log("\nIf you don't see it:");
    console.log("1. Check spam/junk folder");
    console.log("2. Search for: from:tirtho.kyptronix@gmail.com");
    console.log("3. Check the server logs above for any errors");
  } catch (error) {
    console.error("\n❌ Test failed:");
    console.error("Error:", error.message);
    console.error("\nStack trace:", error.stack);
  } finally {
    // Close server
    server.close(() => {
      console.log("\nTest server stopped");
      process.exit(0);
    });
  }
}

// Run the test
testSubscribe();
