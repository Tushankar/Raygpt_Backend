#!/usr/bin/env node

// Quick script to update ngrok URL in .env file
// Usage: node update-ngrok.js https://new-ngrok-url.ngrok-free.app

import fs from "fs";
import path from "path";

const envPath = path.join(process.cwd(), ".env");

function updateNgrokUrl(newUrl) {
  try {
    // Read current .env file
    let envContent = fs.readFileSync(envPath, "utf8");

    // Update or add NGROK_URL
    const ngrokUrlRegex = /^NGROK_URL=.*$/m;
    const newLine = `NGROK_URL=${newUrl}`;

    if (ngrokUrlRegex.test(envContent)) {
      // Replace existing line
      envContent = envContent.replace(ngrokUrlRegex, newLine);
    } else {
      // Add new line after Calendly configuration
      const insertPoint = envContent.indexOf("# Ngrok Configuration");
      if (insertPoint !== -1) {
        const lines = envContent.split("\n");
        const insertIndex =
          lines.findIndex((line) => line.includes("# Ngrok Configuration")) + 1;
        lines.splice(insertIndex, 0, newLine);
        envContent = lines.join("\n");
      } else {
        // Append at the end
        envContent += `\n${newLine}\n`;
      }
    }

    // Write back to file
    fs.writeFileSync(envPath, envContent);

    console.log("✅ Updated .env file");
    console.log(`🔗 New ngrok URL: ${newUrl}`);
    console.log(`📋 Webhook URLs:`);
    console.log(`   Production: ${newUrl}/api/calendly/webhook`);
    console.log(`   Test: ${newUrl}/api/calendly/webhook-test`);
    console.log(`   Debug: ${newUrl}/api/debug/prequal`);
    console.log("\n🚀 Restart your server to apply changes");
  } catch (error) {
    console.error("❌ Error updating .env file:", error.message);
    process.exit(1);
  }
}

// Get URL from command line argument
const newUrl = process.argv[2];

if (!newUrl) {
  console.log("Usage: node update-ngrok.js <ngrok-url>");
  console.log("Example: node update-ngrok.js https://abc123.ngrok-free.app");
  process.exit(1);
}

// Validate URL format
if (!newUrl.startsWith("https://") || !newUrl.includes("ngrok")) {
  console.error(
    "❌ Invalid ngrok URL. Should start with https:// and contain ngrok"
  );
  process.exit(1);
}

updateNgrokUrl(newUrl);
