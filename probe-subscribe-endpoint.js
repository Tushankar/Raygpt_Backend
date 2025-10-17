import fetch from "node-fetch";

const URL = "https://raygpt-backend-2.onrender.com/api/subscribe";
const payload = {
  email: "probe-test@example.com",
  name: "Probe Test",
  language: "en",
  optInPromotionalEmails: true,
};

(async () => {
  console.log("POST", URL);
  try {
    const res = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      timeout: 20000,
    });
    console.log("Status", res.status);
    const text = await res.text();
    console.log("Response body (raw):");
    console.log(text.slice(0, 4000));
  } catch (err) {
    console.error("Request failed:", err.message);
    console.error(err);
  }
})();
