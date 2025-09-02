import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

/**
 * Calendly API Webhook Management Script
 * This script creates, lists, and manages Calendly webhooks programmatically
 */

const CALENDLY_CLIENT_ID = process.env.CALENDLY_CLIENT_ID;
const CALENDLY_CLIENT_SECRET = process.env.CALENDLY_CLIENT_SECRET;
const NGROK_URL =
  process.env.NGROK_URL || "https://ce387d550d47.ngrok-free.app";

// Note: You need to get an access token first
// This would typically be done through OAuth flow
const CALENDLY_ACCESS_TOKEN = process.env.CALENDLY_ACCESS_TOKEN;

/**
 * Step 1: Get OAuth Access Token
 * You need to go through Calendly OAuth flow to get this token
 */
async function getOAuthURL() {
  const authURL =
    `https://auth.calendly.com/oauth/authorize?` +
    `client_id=${CALENDLY_CLIENT_ID}&` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(
      NGROK_URL + "/api/calendly/oauth/callback"
    )}&` +
    `scope=webhook_subscription_write`;

  console.log("🔗 Visit this URL to authorize:");
  console.log(authURL);
  return authURL;
}

/**
 * Step 2: Exchange code for access token
 */
async function exchangeCodeForToken(authorizationCode) {
  try {
    const response = await fetch("https://auth.calendly.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: CALENDLY_CLIENT_ID,
        client_secret: CALENDLY_CLIENT_SECRET,
        redirect_uri: `${NGROK_URL}/api/calendly/oauth/callback`,
        code: authorizationCode,
      }),
    });

    const tokenData = await response.json();
    console.log("🎯 Access Token Response:", tokenData);
    return tokenData;
  } catch (error) {
    console.error("❌ Error exchanging code for token:", error);
    throw error;
  }
}

/**
 * Step 3: Get user information to find organization URI
 */
async function getUserInfo(accessToken) {
  try {
    const response = await fetch("https://api.calendly.com/users/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const userData = await response.json();
    console.log("👤 User Info:", userData);
    return userData;
  } catch (error) {
    console.error("❌ Error getting user info:", error);
    throw error;
  }
}

/**
 * Step 4: List existing webhook subscriptions
 */
async function listWebhookSubscriptions(accessToken, organizationUri) {
  try {
    const response = await fetch(
      `https://api.calendly.com/webhook_subscriptions?organization=${encodeURIComponent(
        organizationUri
      )}&scope=organization`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const webhooks = await response.json();
    console.log("📋 Existing Webhooks:", JSON.stringify(webhooks, null, 2));
    return webhooks;
  } catch (error) {
    console.error("❌ Error listing webhooks:", error);
    throw error;
  }
}

/**
 * Step 5: Create webhook subscription
 */
async function createWebhookSubscription(accessToken, organizationUri) {
  try {
    const webhookData = {
      url: `${NGROK_URL}/api/calendly/webhook`,
      events: ["invitee.created", "invitee.canceled"],
      organization: organizationUri,
      scope: "organization",
    };

    console.log("🔗 Creating webhook with data:", webhookData);

    const response = await fetch(
      "https://api.calendly.com/webhook_subscriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookData),
      }
    );

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Webhook created successfully:", result);
    } else {
      console.error("❌ Error creating webhook:", result);
    }

    return result;
  } catch (error) {
    console.error("❌ Error creating webhook:", error);
    throw error;
  }
}

/**
 * Main function to set up webhook
 */
async function setupCalendlyWebhook() {
  console.log("🚀 Starting Calendly Webhook Setup...\n");

  if (!CALENDLY_ACCESS_TOKEN) {
    console.log("❌ No access token found in environment variables.");
    console.log("📝 Follow these steps:\n");

    console.log("1. Get authorization URL:");
    await getOAuthURL();

    console.log("\n2. After authorization, you'll get a code. Use it with:");
    console.log("   node setup-calendly-webhook.js --code YOUR_AUTH_CODE\n");

    return;
  }

  try {
    // Get user info to find organization
    const userInfo = await getUserInfo(CALENDLY_ACCESS_TOKEN);
    const organizationUri = userInfo.resource.current_organization;

    // List existing webhooks
    await listWebhookSubscriptions(CALENDLY_ACCESS_TOKEN, organizationUri);

    // Create new webhook
    await createWebhookSubscription(CALENDLY_ACCESS_TOKEN, organizationUri);
  } catch (error) {
    console.error("❌ Setup failed:", error);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const codeFlag = args.findIndex((arg) => arg === "--code");

if (codeFlag !== -1 && args[codeFlag + 1]) {
  const authCode = args[codeFlag + 1];
  console.log("🔄 Exchanging authorization code for access token...");

  exchangeCodeForToken(authCode)
    .then((tokenData) => {
      console.log("\n✅ Add this to your .env file:");
      console.log(`CALENDLY_ACCESS_TOKEN=${tokenData.access_token}`);
      console.log("\nThen run: node setup-calendly-webhook.js");
    })
    .catch(console.error);
} else {
  setupCalendlyWebhook();
}

export { getUserInfo, createWebhookSubscription, listWebhookSubscriptions };
