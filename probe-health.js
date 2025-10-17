import fetch from "node-fetch";

const URL = "https://raygpt-backend-2.onrender.com/api/subscribe/test";

(async () => {
  console.log("GET", URL);
  try {
    const res = await fetch(URL, { timeout: 10000 });
    console.log("Status", res.status);
    const data = await res.text();
    console.log("Body:", data);
  } catch (err) {
    console.error("Request failed:", err.message);
  }
})();
