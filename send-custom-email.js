import readline from "readline";
import dotenv from "dotenv";
import emailService from "./services/emailService.js";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("====================================");
console.log("CUSTOM EMAIL TEST");
console.log("====================================\n");

console.log("This will send a test email to ANY email address you specify.");
console.log("Use this to verify the email system is working.\n");

rl.question("Enter the email address to send to: ", async (email) => {
  if (!email || !email.includes("@")) {
    console.log("❌ Invalid email address");
    rl.close();
    return;
  }

  console.log("\nSending test email to:", email);
  console.log("Please wait...\n");

  try {
    const result = await emailService.sendFirstEmail({
      email: email.trim(),
      name: "Test User",
      language: "en",
    });

    console.log("✅ EMAIL SENT SUCCESSFULLY!");
    console.log("Result:", result);
    console.log("\n📧 Check the inbox at:", email);
    console.log(
      "Subject: 'Your Vitamin Store Opportunity Manual — Here it is'"
    );
    console.log("\nIf you don't see it:");
    console.log("1. Check spam/junk folder");
    console.log("2. Check promotions tab (Gmail)");
    console.log("3. Search for: from:tirtho.kyptronix@gmail.com");
  } catch (error) {
    console.error("❌ FAILED TO SEND EMAIL");
    console.error("Error:", error.message);
  }

  rl.close();
});
