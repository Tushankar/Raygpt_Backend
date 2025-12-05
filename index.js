import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

// Import routes
import userRoutes from "./routes/users.js";
import businessManualRoutes from "./routes/businessManual.js";
import kycRoutes from "./routes/kyc.js";
import packagesRoutes from "./routes/packages.js";
import stripeRoutes from "./routes/stripe.js";
import storeRequestRoutes from "./routes/storeRequests.js";
import expertRequestRoutes from "./routes/expertRequests.js";
import subscribeRoutes from "./routes/subscribe.js";
import prequalRoutes from "./routes/prequal.js";
import calendlyRoutes from "./routes/calendly.js";
import debugRoutes from "./routes/debug.js";
import automationRoutes from "./routes/automation.js";
import downloadRoutes from "./routes/download.js";
import reviewRoutes from "./routes/reviews.js";
import translationRoutes from "./routes/translation.js";
import systemManualRoutes from "./routes/systemManual.js";
import contactRoutes from "./routes/contact.js";

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_PRIVATE_KEY",
  "FIREBASE_CLIENT_EMAIL",
  "JWT_SECRET",
  "FRONTEND_URL",
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(
    "❌ Missing required environment variables:",
    missingVars.join(", ")
  );
  console.error(
    "Please check your .env file and ensure all required variables are set."
  );
  process.exit(1);
}

// Warn if DIDIT_API_KEY is not configured - avoids silent failures during KYC flows
if (!process.env.DIDIT_API_KEY) {
  console.warn(
    "⚠️  DIDIT_API_KEY is not set. KYC verification requests to the DIDit API will fail. See KYC_SETUP.md for setup instructio."
  );
} else {
  console.log("✅ DIDIT_API_KEY is configured");
}

// Warn if OPENROUTER_API_KEY is not configured
if (!process.env.OPENROUTER_API_KEY) {
  console.warn(
    "⚠️  OPENROUTER_API_KEY is not set. Business manual generation will fail. Please set your OpenRouter API key in the .env file."
  );
} else {
  console.log("✅ OPENROUTER_API_KEY is configured");
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "https://raygpt-backend-2.onrender.com",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "https://rayonesystem.netlify.app",
        "https://rayone.kyptronix.us",
        process.env.FRONTEND_URL,
        process.env.CLIENT_URL,
      ].filter(Boolean);

      console.log(`[CORS] Request from origin: ${origin}`);
      console.log(`[CORS] Allowed origins:`, allowedOrigins);

      if (allowedOrigins.includes(origin)) {
        console.log(`[CORS] ✅ Origin allowed: ${origin}`);
        callback(null, true);
      } else {
        console.log(`[CORS] ❌ Origin rejected: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Requested-With",
    ],
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS =
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS =
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later.",
    retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for business manual generation (resource-intensive)
const businessManualLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: 10, // Allow only 10 business manual generations per window
  message: {
    success: false,
    error:
      "Business manual generation limit exceeded. Please try again in 15 minutes.",
    retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiting to all API routes
// app.use("/api/", generalLimiter);

// Apply strict rate limiting to business manual generation (resource-intensive)
// app.use("/api/business-manual/generate", businessManualLimiter);

// Serve static files for testing
app.use("/test", express.static("public"));

// API routes
app.use("/api/users", userRoutes);
app.use("/api/business-manual", businessManualRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/packages", packagesRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/store-requests", storeRequestRoutes);
app.use("/api/expert-requests", expertRequestRoutes);
app.use("/api/subscribe", subscribeRoutes);
app.use("/api/prequal", prequalRoutes);
app.use("/api/calendly", calendlyRoutes);
app.use("/api/debug", debugRoutes);
app.use("/api/automation", automationRoutes);
app.use("/api/download", downloadRoutes);
app.use("/api/system-manual", systemManualRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/translate", translationRoutes);
app.use("/api/contact", contactRoutes);

// CSRF token endpoint
app.get("/api/csrf-token", (req, res) => {
  res.json({
    csrfToken: "dummy-csrf-token", // Replace with actual CSRF token generation if needed
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// CORS test endpoint
app.get("/api/test-cors", (req, res) => {
  res.json({
    success: true,
    message: "CORS is working!",
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "rayOne API Server",
    version: "1.0.0",
    endpoints: ["/api/users", "/api/business-manual", "/api/kyc", "/health"],
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 rayOne Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `🔗 Frontend URL: ${
      process.env.FRONTEND_URL || "https://raygpt-backend-2.onrender.com"
    }`
  );
  console.log(`🔥 Firebase Project: ${process.env.FIREBASE_PROJECT_ID}`);
});

export default app;
