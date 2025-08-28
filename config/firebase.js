import admin from "firebase-admin";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the service account key
const serviceAccountPath = join(
  __dirname,
  "..",
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY
);
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
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
