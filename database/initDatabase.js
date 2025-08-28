import { db, collections } from "../config/firebase.js";
import bcrypt from "bcryptjs";

/**
 * Initialize database with sample data and collection structure
 */
export async function initializeDatabase() {
  try {
    console.log("Initializing Firebase Firestore database...");

    // Initialize Users collection
    await initializeUsersCollection();

    // Initialize Business Manual Submission collection
    await initializeBusinessManualSubmissionCollection();

    // Initialize Business Manual Response collection
    await initializeBusinessManualResponseCollection();

    // Initialize KYC Submission collection
    await initializeKYCSubmissionCollection();

    // Initialize Store Requests collection
    await initializeStoreRequestsCollection();

    console.log("Database initialization completed successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

/**
 * Initialize Users collection with sample data
 */
async function initializeUsersCollection() {
  const usersRef = db.collection(collections.USERS);

  const sampleUser = {
    id: "sample_user_001",
    email: "john.doe@example.com",
    name: "John Doe",
    role: "user", // user, admin, expert
    status: "verified", // Add status field
    phone: "+1234567890", // Add phone field
    businessName: "Sample Tech Company", // Add businessName field
    industry: "Technology", // Add industry field
    joinDate: new Date().toISOString().split("T")[0], // Add joinDate field
    kycSubmitted: new Date().toISOString().split("T")[0], // Add kycSubmitted field
    lastActive: new Date().toISOString().split("T")[0], // Add lastActive field
    createdAt: new Date(),
    updatedAt: new Date(),
    profile: {
      phone: "+1234567890",
      company: "Sample Company Inc.",
      businessType: "Technology",
      isEmailVerified: true,
      kycStatus: "approved", // pending, approved, rejected
    },
    preferences: {
      notifications: true,
      newsletter: true,
    },
  };

  await usersRef.doc(sampleUser.id).set(sampleUser);
  console.log("✓ Users collection initialized");
}

/**
 * Initialize Business Manual Submission collection
 */
async function initializeBusinessManualSubmissionCollection() {
  const submissionsRef = db.collection(collections.BUSINESS_MANUAL_SUBMISSION);

  const sampleSubmission = {
    id: "sub_001",
    userId: "sample_user_001",
    businessName: "Sample Tech Startup",
    businessType: "Technology",
    industry: "Software Development",
    description: "A cutting-edge AI software company",
    targetAudience: "Small to medium businesses",
    businessGoals: "Automate business processes through AI",
    currentChallenges: "Scaling operations and customer acquisition",
    additionalInfo: "Looking for comprehensive business strategy",
    status: "submitted", // submitted, processing, completed, failed
    submittedAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      source: "web_form",
      version: "1.0",
      priority: "medium",
    },
  };

  await submissionsRef.doc(sampleSubmission.id).set(sampleSubmission);
  console.log("✓ Business Manual Submission collection initialized");
}

/**
 * Initialize Business Manual Response collection
 */
async function initializeBusinessManualResponseCollection() {
  const responsesRef = db.collection(collections.BUSINESS_MANUAL_RESPONSE);

  const sampleResponse = {
    id: "resp_001",
    submissionId: "sub_001",
    userId: "sample_user_001",
    generatedManual: {
      executiveSummary: "Comprehensive business strategy for AI-driven startup",
      marketAnalysis: "Detailed analysis of the AI software market",
      businessModel: "SaaS-based recurring revenue model",
      operationalPlan: "Step-by-step operational guidelines",
      financialProjections: "5-year financial forecast and projections",
      riskAnalysis: "Identified risks and mitigation strategies",
    },
    status: "completed", // processing, completed, failed
    generatedAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      aiModel: "GPT-4",
      processingTime: 120, // seconds
      quality: "high",
      version: "1.0",
    },
  };

  await responsesRef.doc(sampleResponse.id).set(sampleResponse);
  console.log("✓ Business Manual Response collection initialized");
}

/**
 * Initialize KYC Submission collection
 */
async function initializeKYCSubmissionCollection() {
  const kycRef = db.collection(collections.KYC_SUBMISSION);

  const sampleKYC = {
    id: "kyc_001",
    userId: "sample_user_001",
    personalInfo: {
      fullName: "John Doe",
      dateOfBirth: "1990-01-15",
      nationality: "American",
      address: {
        street: "123 Main Street",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
      },
    },
    businessInfo: {
      companyName: "Sample Company Inc.",
      registrationNumber: "REG123456",
      businessType: "LLC",
      industry: "Technology",
      establishedDate: "2020-01-01",
    },
    documents: {
      identityDocument: {
        type: "passport",
        documentNumber: "P123456789",
        expiryDate: "2030-01-15",
        uploadedAt: new Date(),
        status: "uploaded", // uploaded, verified, rejected
      },
      addressProof: {
        type: "utility_bill",
        uploadedAt: new Date(),
        status: "uploaded",
      },
      businessRegistration: {
        type: "certificate_of_incorporation",
        uploadedAt: new Date(),
        status: "uploaded",
      },
    },
    status: "submitted", // submitted, under_review, approved, rejected, requires_resubmission
    submittedAt: new Date(),
    updatedAt: new Date(),
    reviewNotes: "",
    approvedBy: null,
    approvedAt: null,
  };

  await kycRef.doc(sampleKYC.id).set(sampleKYC);
  console.log("✓ KYC Submission collection initialized");
}

/**
 * Initialize Store Requests collection
 */
async function initializeStoreRequestsCollection() {
  const storeRequestsRef = db.collection(collections.STORE_REQUESTS);

  const sampleStoreRequest = {
    id: "store_req_001",
    userId: "sample_user_001",
    userName: "John Doe",
    storeName: "Tech Store Pro",
    storeUrl: "techstorepro.com",
    email: "john@techstore.com",
    phone: "+1 555-0123",
    country: "United States",
    city: "New York",
    postalCode: "10001",
    status: "pending", // pending, approved, rejected
    requestDate: new Date().toISOString().split("T")[0],
    createdAt: new Date(),
    updatedAt: new Date(),
    reviewedBy: null,
    reviewedAt: null,
    reviewNotes: "",
  };

  await storeRequestsRef.doc(sampleStoreRequest.id).set(sampleStoreRequest);
  console.log("✓ Store Requests collection initialized");
}

// Run initialization if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
    .then(() => {
      console.log("Database initialization script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Database initialization failed:", error);
      process.exit(1);
    });
}
