/**
 * Script to find the correct Place ID for Ray's Healthy Living
 */

async function findPlaceId() {
  try {
    const API_KEY = "AIzaSyDnwBHYVZjvlrU2FHW5ZxTs1VFPzNxXDWE";
    
    // Search for Ray's Healthy Living
    const searchQuery = "Ray's Healthy Living";
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(searchQuery)}&inputtype=textquery&fields=place_id,name,rating,formatted_address&key=${API_KEY}`;
    
    console.log("🔍 Searching for Ray's Healthy Living...");
    console.log("Search URL:", searchUrl);
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    console.log("\n📋 Search Results:");
    console.log(JSON.stringify(data, null, 2));
    
    if (data.status === "OK" && data.candidates && data.candidates.length > 0) {
      console.log("\n✅ Found candidates:");
      data.candidates.forEach((candidate, index) => {
        console.log(`\n${index + 1}. ${candidate.name}`);
        console.log(`   📍 Address: ${candidate.formatted_address}`);
        console.log(`   🆔 Place ID: ${candidate.place_id}`);
        console.log(`   ⭐ Rating: ${candidate.rating || 'N/A'}`);
      });
      
      // Test the first candidate
      if (data.candidates[0]) {
        const testPlaceId = data.candidates[0].place_id;
        console.log(`\n🧪 Testing Place ID: ${testPlaceId}`);
        
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${testPlaceId}&fields=name,rating,reviews,formatted_address&key=${API_KEY}`;
        
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();
        
        if (detailsData.status === "OK") {
          console.log("✅ Place ID is valid!");
          console.log(`📍 Name: ${detailsData.result.name}`);
          console.log(`📍 Address: ${detailsData.result.formatted_address}`);
          console.log(`⭐ Rating: ${detailsData.result.rating}`);
          console.log(`📝 Reviews available: ${detailsData.result.reviews?.length || 0}`);
          
          if (detailsData.result.reviews && detailsData.result.reviews.length > 0) {
            console.log("\n🌟 First Review Sample:");
            const firstReview = detailsData.result.reviews[0];
            console.log(`   Author: ${firstReview.author_name}`);
            console.log(`   Rating: ${firstReview.rating}/5`);
            console.log(`   Time: ${firstReview.relative_time_description}`);
            console.log(`   Text: ${firstReview.text?.substring(0, 150)}...`);
          }
          
        } else {
          console.log("❌ Place ID test failed:", detailsData.status, detailsData.error_message);
        }
      }
      
    } else {
      console.log("❌ No candidates found or search failed");
      console.log("Status:", data.status);
      console.log("Error:", data.error_message);
    }
    
  } catch (error) {
    console.error("💥 Search failed:", error.message);
  }
}

// Run the search
findPlaceId();
