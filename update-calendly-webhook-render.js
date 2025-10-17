import dotenv from "dotenv";

dotenv.config();

const CALENDLY_ACCESS_TOKEN = process.env.CALENDLY_ACCESS_TOKEN;
const SERVER_URL =
  process.env.SERVER_URL || "https://raygpt-backend-2.onrender.com";
const WEBHOOK_URL = `${SERVER_URL}/api/calendly/webhook`;

console.log("🚀 Updating Calendly Webhook to Render URL");
console.log("==========================================");
console.log(`Server URL: ${SERVER_URL}`);
console.log(`Webhook URL: ${WEBHOOK_URL}`);

async function getUserInfo() {
  try {
    const response = await fetch("https://api.calendly.com/users/me", {
      headers: {
        Authorization: `Bearer ${CALENDLY_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const userData = await response.json();
    console.log(`✅ User: ${userData.resource.name}`);
    return userData.resource;
  } catch (error) {
    console.error("❌ Error getting user info:", error.message);
    throw error;
  }
}

async function listWebhooks(organizationUri) {
  try {
    const response = await fetch(
      `https://api.calendly.com/webhook_subscriptions?organization=${encodeURIComponent(
        organizationUri
      )}&scope=organization`,
      {
        headers: {
          Authorization: `Bearer ${CALENDLY_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    console.log(`📋 Found ${data.collection.length} existing webhooks:`);

    data.collection.forEach((webhook, index) => {
      console.log(`  ${index + 1}. ${webhook.url} (${webhook.state})`);
      console.log(`     Events: ${webhook.events.join(", ")}`);
      console.log(`     Created: ${webhook.created_at}`);
    });

    return data.collection;
  } catch (error) {
    console.error("❌ Error listing webhooks:", error.message);
    throw error;
  }
}

async function deleteWebhook(webhookUri) {
  try {
    const response = await fetch(webhookUri, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${CALENDLY_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      console.log(`🗑️  Deleted webhook: ${webhookUri}`);
      return true;
    } else {
      console.error(`❌ Failed to delete webhook: ${await response.text()}`);
      return false;
    }
  } catch (error) {
    console.error("❌ Error deleting webhook:", error.message);
    return false;
  }
}

async function createWebhook(organizationUri) {
  const webhookData = {
    url: WEBHOOK_URL,
    events: ["invitee.created", "invitee.canceled"],
    organization: organizationUri,
    scope: "organization",
  };

  try {
    const response = await fetch(
      "https://api.calendly.com/webhook_subscriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CALENDLY_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ Webhook created successfully:");
    console.log(`   URL: ${result.resource.url}`);
    console.log(`   State: ${result.resource.state}`);
    console.log(`   Events: ${result.resource.events.join(", ")}`);
    return result.resource;
  } catch (error) {
    console.error("❌ Error creating webhook:", error.message);
    throw error;
  }
}

async function main() {
  try {
    // Step 1: Get user info
    console.log("\n1️⃣ Getting user information...");
    const user = await getUserInfo();
    const organizationUri = user.current_organization;
    console.log(`Organization: ${organizationUri}`);

    // Step 2: List existing webhooks
    console.log("\n2️⃣ Listing existing webhooks...");
    const existingWebhooks = await listWebhooks(organizationUri);

    // Step 3: Delete existing webhooks that don't match our Render URL
    console.log("\n3️⃣ Cleaning up old webhooks...");
    for (const webhook of existingWebhooks) {
      if (webhook.url !== WEBHOOK_URL) {
        console.log(`🧹 Deleting old webhook: ${webhook.url}`);
        await deleteWebhook(webhook.uri);
      } else {
        console.log(
          `✅ Webhook already exists with correct URL: ${webhook.url}`
        );
        console.log("No action needed!");
        return;
      }
    }

    // Step 4: Create new webhook with Render URL
    console.log("\n4️⃣ Creating new webhook...");
    await createWebhook(organizationUri);

    console.log("\n🎉 Webhook setup complete!");
    console.log(
      "Your Calendly webhook is now configured to use your Render deployment."
    );
    console.log(`Webhook URL: ${WEBHOOK_URL}`);

    // Test the webhook
    console.log("\n5️⃣ Testing webhook endpoint...");
    try {
      const testResponse = await fetch(`${SERVER_URL}/api/calendly/test`);
      if (testResponse.ok) {
        console.log("✅ Webhook endpoint is accessible!");
      } else {
        console.log("⚠️  Webhook endpoint returned an error");
      }
    } catch (error) {
      console.log("⚠️  Could not reach webhook endpoint");
    }
  } catch (error) {
    console.error("\n💥 Script failed:", error.message);
    process.exit(1);
  }
}

main();
