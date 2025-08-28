import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // Check if we're using environment variables or a service account file
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    // Use environment variables
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
      token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN || "googleapis.com"
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    // Fallback to file-based approach for local development
    const { readFileSync } = await import("fs");
    const { fileURLToPath } = await import("url");
    const { dirname, join } = await import("path");

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const serviceAccountPath = join(__dirname, "..", process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  } else {
    throw new Error("Firebase credentials not found. Please set either FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL environment variables, or FIREBASE_SERVICE_ACCOUNT_KEY.");
  }
}

// Get Firestore database instance
export const db = admin.firestore();
export const auth = admin.auth();

// Collection references
export const collections = {
  USERS: "users",
  BUSINESS_MANUAL_SUBMISSION: "business_manual_submission",
  BUSINESS_MANUAL_RESPONSE: "business_manual_response",
  KYC_SUBMISSION: "kyc_submission",
  PACKAGES: "packages",
  PURCHASES: "purchases",
  STORE_REQUESTS: "store_requests",
  EXPERT_REQUESTS: "expert_requests",
};

export default admin;
