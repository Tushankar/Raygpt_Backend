import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function testGemini20Flash() {
  console.log(
    "🧪 Testing Gemini 2.0 Flash Experimental Model Configuration...\n"
  );

  try {
    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_CLOUD_API_KEY);

    // Get the model - Gemini 2.0 Flash Experimental
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1000,
        responseMimeType: "text/plain",
      },
    });

    console.log("🤖 Testing with Gemini 2.0 Flash Experimental model...\n");

    // Generate content
    const result = await model.generateContent(
      "You are Gemini 2.0 Flash Experimental. Confirm your model version and give one business tip."
    );
    const response = await result.response;
    const text = response.text();

    console.log("✅ SUCCESS: Gemini 2.0 Flash Experimental is working!");
    console.log("📄 Response:", text);
    console.log("\n🎯 Model Configuration:");
    console.log("- Model: gemini-2.0-flash-exp");
    console.log("- Temperature: 0.2");
    console.log("- Max Tokens: 8,192");
    console.log("- Response Type: Plain text");
  } catch (error) {
    console.log("❌ ERROR:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Check GOOGLE_CLOUD_API_KEY in .env file");
    console.log("2. Verify API key has Generative AI permissions");
    console.log("3. Ensure model 'gemini-2.0-flash' is available");
  }
}

// Check API key
if (!process.env.GOOGLE_CLOUD_API_KEY) {
  console.log("⚠️  GOOGLE_CLOUD_API_KEY not found in environment");
  console.log("Please set your Google Cloud API key in the .env file");
  process.exit(1);
}

testGemini20Flash();
