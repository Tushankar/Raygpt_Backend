import fetch from "node-fetch";

console.log("====================================");
console.log("WAKE UP RENDER BACKEND");
console.log("====================================\n");

const BACKEND_URL = "https://raygpt-backend-2.onrender.com";

console.log(
  "Render free tier backends go to sleep after 15 minutes of inactivity."
);
console.log("This script will wake up your backend...\n");

async function wakeUpBackend() {
  console.log("Pinging backend:", BACKEND_URL);
  console.log("This may take 30-60 seconds if the backend is sleeping...\n");

  const startTime = Date.now();

  try {
    // Try the health check endpoint
    const response = await fetch(`${BACKEND_URL}/api/subscribe/test`, {
      method: "GET",
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ BACKEND IS AWAKE!");
      console.log("Response:", data);
      console.log(`Response time: ${duration} seconds`);
      console.log("\nBackend is now ready to receive requests.");
      console.log("Try subscribing on your Netlify site now!");
    } else {
      console.log("⚠️ Backend responded but with error:");
      console.log("Status:", response.status);
      console.log(`Response time: ${duration} seconds`);
    }
  } catch (error) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.error("❌ Failed to wake backend:");
    console.error("Error:", error.message);
    console.error(`Time elapsed: ${duration} seconds`);
    console.error("\nPossible issues:");
    console.error("1. Backend is still starting up (wait 60 seconds)");
    console.error("2. Backend deployment failed");
    console.error("3. Network connection issue");
  }
}

wakeUpBackend();
