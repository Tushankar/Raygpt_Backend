import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function testGeminiModel() {
  console.log("🧪 Testing Gemini 2.0 Flash Model...\n");

  try {
    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_CLOUD_API_KEY);

    // Get the model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1000,
        responseMimeType: "text/plain",
      },
    });

    console.log("🤖 Testing with Gemini 2.0 Flash model...\n");

    // Generate content
    const result = await model.generateContent(
      "Confirm you are Gemini 2.0 Flash model and provide a brief business tip."
    );
    const response = await result.response;
    const text = response.text();

    console.log("✅ SUCCESS: Gemini 2.0 Flash is working!");
    console.log("📄 Response:", text);
    console.log("\n🎯 Model: gemini-2.0-flash");
  } catch (error) {
    console.log("❌ ERROR:", error.message);
    console.log("\n💡 If this fails, the model name might need adjustment.");
  }
}

// Check API key
if (!process.env.GOOGLE_CLOUD_API_KEY) {
  console.log("⚠️  GOOGLE_CLOUD_API_KEY not found in environment");
  process.exit(1);
}

testGeminiModel();
