import express from "express";
import https from "https";

const router = express.Router();

/**
 * Translation Service Route
 * Handles Google Translate API requests from the frontend
 */

/**
 * Helper function to make HTTP requests to Google Translate API
 */
function makeGoogleTranslateRequest(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (error) {
            reject(
              new Error(`Failed to parse JSON response: ${error.message}`)
            );
          }
        });

        res.on("error", (error) => {
          reject(error);
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

/**
 * POST /api/translate/text
 * Translate a single text string
 */
router.post("/text", async (req, res) => {
  try {
    const { text, targetLang, sourceLang = "en" } = req.body;

    // Validate input
    if (!text || !targetLang) {
      return res.status(400).json({
        success: false,
        error: "Text and target language are required",
      });
    }

    // Return original text if same language
    if (targetLang === sourceLang) {
      return res.json({
        success: true,
        originalText: text,
        translatedText: text,
        sourceLang,
        targetLang,
      });
    }

    // Build Google Translate API URL
    const params = new URLSearchParams({
      client: "gtx",
      sl: sourceLang,
      tl: targetLang,
      dt: "t",
      q: text,
    });

    const apiUrl = `https://translate.googleapis.com/translate_a/single?${params}`;

    // Make request to Google Translate API
    const data = await makeGoogleTranslateRequest(apiUrl);

    // Extract translated text
    const translatedText = data[0]
      ? data[0].map((item) => item[0]).join("")
      : text;

    res.json({
      success: true,
      originalText: text,
      translatedText,
      sourceLang,
      targetLang,
    });
  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({
      success: false,
      error: "Translation failed",
      message: error.message,
    });
  }
});

/**
 * POST /api/translate/batch
 * Translate multiple text strings at once
 */
router.post("/batch", async (req, res) => {
  try {
    const { texts, targetLang, sourceLang = "en" } = req.body;

    // Validate input
    if (!texts || !Array.isArray(texts) || !targetLang) {
      return res.status(400).json({
        success: false,
        error: "Texts array and target language are required",
      });
    }

    // Return original texts if same language
    if (targetLang === sourceLang) {
      return res.json({
        success: true,
        originalTexts: texts,
        translatedTexts: texts,
        sourceLang,
        targetLang,
      });
    }

    // Translate each text
    const translationPromises = texts.map(async (text) => {
      try {
        if (!text || !text.trim()) return text;

        const params = new URLSearchParams({
          client: "gtx",
          sl: sourceLang,
          tl: targetLang,
          dt: "t",
          q: text,
        });

        const apiUrl = `https://translate.googleapis.com/translate_a/single?${params}`;
        const data = await makeGoogleTranslateRequest(apiUrl);

        return data[0] ? data[0].map((item) => item[0]).join("") : text;
      } catch (error) {
        console.warn(`Failed to translate "${text}":`, error.message);
        return text; // Return original text on failure
      }
    });

    const translatedTexts = await Promise.all(translationPromises);

    res.json({
      success: true,
      originalTexts: texts,
      translatedTexts,
      sourceLang,
      targetLang,
      count: texts.length,
    });
  } catch (error) {
    console.error("Batch translation error:", error);
    res.status(500).json({
      success: false,
      error: "Batch translation failed",
      message: error.message,
    });
  }
});

/**
 * GET /api/translate/languages
 * Get supported languages
 */
router.get("/languages", (req, res) => {
  const supportedLanguages = {
    en: "English",
    es: "Español",
  };

  res.json({
    success: true,
    languages: supportedLanguages,
    count: Object.keys(supportedLanguages).length,
  });
});

/**
 * GET /api/translate/health
 * Health check for translation service
 */
router.get("/health", async (req, res) => {
  try {
    // Test translation with a simple word
    const params = new URLSearchParams({
      client: "gtx",
      sl: "en",
      tl: "es",
      dt: "t",
      q: "hello",
    });

    const apiUrl = `https://translate.googleapis.com/translate_a/single?${params}`;
    const data = await makeGoogleTranslateRequest(apiUrl);

    const translatedText = data[0]
      ? data[0].map((item) => item[0]).join("")
      : "hello";

    res.json({
      success: true,
      message: "Translation service is healthy",
      test: {
        original: "hello",
        translated: translatedText,
        language: "es",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Translation service is unhealthy",
      error: error.message,
    });
  }
});

export default router;
