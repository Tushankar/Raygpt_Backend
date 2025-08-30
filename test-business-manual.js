import { BusinessManualService } from "./services/businessManualService.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function testGeminiAPI() {
  console.log(
    "🧪 Testing Gemini API Integration for Business Manual Generation...\n"
  );

  // Test data for business manual generation
  const testSubmissionData = {
    businessNiche: "Coffee Shop",
    location: "Downtown Seattle",
    storeType: "Retail Cafe",
    businessStage: "Planning",
    budgetRange: [25000, 75000],
    annualRevenueGoal: 150000,
    brandTone: "Modern and Friendly",
    targetAgeGroup: [25, 45],
    weeklyTimeAllocation: 50,
    experienceLevel: "Beginner",
  };

  try {
    console.log("📝 Test Data:");
    console.log(JSON.stringify(testSubmissionData, null, 2));
    console.log("\n🤖 Generating business manual with Gemini API...\n");

    const result = await BusinessManualService.generateBusinessManual(
      testSubmissionData
    );

    if (result.success) {
      console.log("✅ SUCCESS: Business manual generated successfully!");
      console.log("\n📄 Generated Content Preview (first 500 characters):");
      console.log(result.data.substring(0, 500) + "...\n");

      console.log("📊 Content Statistics:");
      console.log(`- Total characters: ${result.data.length}`);
      console.log(`- Total words: ${result.data.split(" ").length}`);
      console.log(
        `- Contains business sections: ${result.data.includes(
          "# BUSINESS MANUAL"
        )}`
      );
      console.log(
        `- Contains executive summary: ${result.data.includes(
          "EXECUTIVE SUMMARY"
        )}`
      );
    } else {
      console.log("❌ FAILED: Business manual generation failed");
      console.log("Error:", result.error);
    }
  } catch (error) {
    console.log("💥 ERROR: Unexpected error during testing");
    console.log("Error details:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Make sure GOOGLE_CLOUD_API_KEY is set in your .env file");
    console.log("2. Verify the API key is valid and has proper permissions");
    console.log("3. Check your internet connection");
    console.log("4. Ensure the Gemini API is accessible from your location");
  }
}

// Check if API key is configured
if (
  !process.env.GOOGLE_CLOUD_API_KEY ||
  process.env.GOOGLE_CLOUD_API_KEY === "your-google-cloud-api-key-here"
) {
  console.log("⚠️  WARNING: GOOGLE_CLOUD_API_KEY is not properly configured!");
  console.log(
    "Please update your .env file with a valid Google Cloud API key."
  );
  console.log("\nTo get a Google Cloud API key:");
  console.log("1. Go to https://console.cloud.google.com/");
  console.log("2. Create a new project or select existing one");
  console.log("3. Enable the Generative AI API");
  console.log("4. Create credentials (API key)");
  console.log(
    "5. Copy the key and update GOOGLE_CLOUD_API_KEY in your .env file"
  );
  process.exit(1);
}

// Run the test
testGeminiAPI()
  .then(() => {
    console.log("\n🏁 Test completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Test failed with error:", error);
    process.exit(1);
  });
