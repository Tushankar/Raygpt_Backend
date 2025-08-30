import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function testGeminiSDK() {
  console.log("🧪 Testing Google Generative AI SDK...\n");

  try {
    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_CLOUD_API_KEY);

    // Get the model
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

    console.log("🤖 Generating simple test content...\n");

    // Generate content
    const result = await model.generateContent(
      "Say 'Hello, Gemini SDK is working!' in a friendly way."
    );
    const response = await result.response;
    const text = response.text();

    console.log("✅ SUCCESS: Gemini SDK is working!");
    console.log("📄 Response:", text);
  } catch (error) {
    console.log("❌ ERROR:", error.message);
  }
}

// Check API key
if (!process.env.GOOGLE_CLOUD_API_KEY) {
  console.log("⚠️  GOOGLE_CLOUD_API_KEY not found in environment");
  process.exit(1);
}

testGeminiSDK();
