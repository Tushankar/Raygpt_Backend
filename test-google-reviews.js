import { GoogleReviewsService } from "./services/googleReviewsService.js";

/**
 * Test script to fetch Google reviews for Ray's Healthy Living
 * Run this script to test the Google Places API integration
 */

async function testFetchGoogleReviews() {
  console.log("🚀 Starting Google Reviews fetch test...");
  console.log("=".repeat(50));

  try {
    const result = await GoogleReviewsService.fetchAndStoreGoogleReviews();

    if (result.success) {
      console.log("✅ SUCCESS:", result.message);
      console.log(`📍 Place: ${result.placeName}`);
      console.log(`📝 Reviews fetched: ${result.reviews.length}`);
      console.log("\n📋 Review Summary:");

      result.reviews.forEach((review, index) => {
        console.log(`\n${index + 1}. ${review.author_name}`);
        console.log(`   ⭐ Rating: ${review.rating}/5`);
        console.log(`   📅 Time: ${review.relative_time_description}`);
        console.log(
          `   💬 Text: ${review.text.substring(0, 100)}${
            review.text.length > 100 ? "..." : ""
          }`
        );
      });
    } else {
      console.log("❌ ERROR:", result.error);
    }
  } catch (error) {
    console.error("💥 Script failed:", error.message);
  }

  console.log("\n" + "=".repeat(50));
  console.log("🏁 Test completed");
}

// Run the test
testFetchGoogleReviews();
