// import express from "express";
// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import { KYCService } from "../services/kycService.js";
// import { db, collections } from "../config/firebase.js";

// const router = express.Router();

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const uploadDir = path.join(process.cwd(), "uploads", "kyc");
//     // Create directory if it doesn't exist
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     // Generate unique filename with timestamp and original extension
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(
//       null,
//       file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
//     );
//   },
// });

// const fileFilter = (req, file, cb) => {
//   // Check file type
//   const allowedTypes = /jpeg|jpg|png|pdf/;
//   const extname = allowedTypes.test(
//     path.extname(file.originalname).toLowerCase()
//   );
//   const mimetype = allowedTypes.test(file.mimetype);

//   if (mimetype && extname) {
//     return cb(null, true);
//   } else {
//     cb(new Error("Only JPG, PNG, and PDF files are allowed!"));
//   }
// };

// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 10 * 1024 * 1024, // 10MB limit
//   },
//   fileFilter: fileFilter,
// });

// // POST /api/kyc/upload - Upload KYC documents
// router.post(
//   "/upload",
//   upload.fields([
//     { name: "governmentId", maxCount: 1 },
//     { name: "selfieWithId", maxCount: 1 },
//     { name: "addressProof", maxCount: 1 },
//   ]),
//   async (req, res) => {
//     try {
//       console.log("Upload endpoint hit:", {
//         body: req.body,
//         files: req.files ? Object.keys(req.files) : "no files",
//         headers: req.headers["content-type"],
//       });

//       const { userId } = req.body;

//       if (!userId) {
//         console.log("No userId provided");
//         return res.status(400).json({
//           success: false,
//           error: "User ID is required",
//         });
//       }

//       if (!req.files || Object.keys(req.files).length === 0) {
//         console.log("No files uploaded");
//         return res.status(400).json({
//           success: false,
//           error: "No files uploaded",
//         });
//       }

//       const uploadedFiles = {};
//       Object.keys(req.files).forEach((fieldName) => {
//         const file = req.files[fieldName][0];
//         uploadedFiles[fieldName] = {
//           filename: file.filename,
//           originalname: file.originalname,
//           mimetype: file.mimetype,
//           size: file.size,
//           path: file.path,
//         };
//       });

//       console.log("Files uploaded successfully:", uploadedFiles);
//       res.json({
//         success: true,
//         message: "Files uploaded successfully",
//         files: uploadedFiles,
//       });
//     } catch (error) {
//       console.error("File upload error:", error);
//       res.status(500).json({
//         success: false,
//         error: error.message || "File upload failed",
//       });
//     }
//   }
// );

// // POST /api/kyc/verify - Verify KYC documents with DIDit API
// // POST /api/kyc/verify - Verify KYC documents with DIDit API
// // POST /api/kyc/verify - Verify KYC documents with DIDit API
// // router.post(
// //   "/verify",
// //   upload.fields([
// //     { name: "governmentId", maxCount: 1 },
// //     { name: "selfie", maxCount: 1 },
// //     { name: "proofOfAddress", maxCount: 1 },
// //   ]),
// //   async (req, res) => {
// //     try {
// //       const { userId } = req.body;

// //       if (!userId) {
// //         return res
// //           .status(400)
// //           .json({ success: false, error: "User ID is required" });
// //       }

// //       if (!req.files || Object.keys(req.files).length < 3) {
// //         return res
// //           .status(400)
// //           .json({ success: false, error: "All three documents are required" });
// //       }

// //       console.log("Starting KYC verification process for user:", userId);

// //       // 1. Process KYC with the Didit API
// //       const result = await KYCService.processKYC(userId, {
// //         frontIdPath: req.files.governmentId[0].path,
// //         selfiePath: req.files.selfie[0].path,
// //         proofOfAddressPath: req.files.proofOfAddress[0].path,
// //       });

// //       // Clean up temporary files
// //       Object.values(req.files).forEach((fileArray) => {
// //         fileArray.forEach((file) => {
// //           fs.unlink(file.path, (err) => {
// //             if (err) console.error("Error deleting temp file:", err);
// //           });
// //         });
// //       });

// //       if (!result.success) {
// //         const code = result.error?.status || 400;
// //         return res
// //           .status(code)
// //           .json({
// //             success: false,
// //             error: result.error?.detail || "KYC provider error.",
// //           });
// //       }

// //       // ✅ 2. DETERMINE THE OVERALL STATUS FROM THE API RESPONSE
// //       const idStatus =
// //         result.data.idResult.id_verification.status === "Approved";
// //       const faceStatus =
// //         result.data.faceResult.face_match.status === "Approved";
// //       const poaStatus = result.data.poaResult.poa.status === "Approved";

// //       const isApproved = idStatus && faceStatus && poaStatus;
// //       const overallStatus = isApproved ? "approved" : "rejected";

// //       console.log(
// //         `[KYC Route] Individual Statuses -> ID: ${idStatus}, Face: ${faceStatus}, POA: ${poaStatus}`
// //       );
// //       console.log(`[KYC Route] Overall determined status: ${overallStatus}`);

// //       // 3. SAVE THE RESULTS TO FIRESTORE
// //       const kycSubmissionRef = db.collection(collections.KYC_SUBMISSION).doc();
// //       await kycSubmissionRef.set({
// //         id: kycSubmissionRef.id,
// //         userId: userId,
// //         status: overallStatus, // Use the correctly determined status
// //         provider: "didit",
// //         providerData: result.data,
// //         submittedAt: new Date(),
// //         updatedAt: new Date(),
// //         ...(isApproved && { approvedAt: new Date() }), // Only set approvedAt if successful
// //       });
// //       console.log(
// //         `[KYC Route] Created KYC submission record: ${kycSubmissionRef.id}`
// //       );

// //       // 4. UPDATE THE USER'S PROFILE
// //       const userRef = db.collection(collections.USERS).doc(userId);
// //       await userRef.set(
// //         {
// //           profile: {
// //             kycStatus: overallStatus, // Use the correctly determined status
// //             kycProvider: "didit",
// //             lastKycUpdate: new Date(),
// //             ...(isApproved && { kycVerifiedAt: new Date() }),
// //           },
// //         },
// //         { merge: true }
// //       );
// //       console.log(`[KYC Route] User profile updated for userId: ${userId}`);

// //       // 5. Return success response
// //       res.json({
// //         success: true,
// //         message: `KYC verification completed with status: ${overallStatus}`,
// //         data: result.data,
// //       });
// //     } catch (error) {
// //       console.error("KYC verification route error:", error);
// //       res.status(500).json({
// //         success: false,
// //         error: error.message || "Internal server error during KYC verification",
// //       });
// //     }
// //   }
// // );

// // POST /api/kyc/verify - Saves profile data AND verifies documents with Didit
// router.post(
//   "/verify",
//   upload.fields([
//     { name: "governmentId", maxCount: 1 },
//     { name: "selfie", maxCount: 1 },
//     { name: "proofOfAddress", maxCount: 1 },
//   ]),
//   async (req, res) => {
//     try {
//       const { userId, profileData } = req.body; // <-- Receive profileData

//       if (!userId) {
//         return res
//           .status(400)
//           .json({ success: false, error: "User ID is required" });
//       }
//       if (!req.files || Object.keys(req.files).length < 3) {
//         return res
//           .status(400)
//           .json({ success: false, error: "All three documents are required" });
//       }

//       // ✅ 1. SAVE THE PROFILE INFORMATION FIRST
//       if (profileData) {
//         console.log(
//           `[KYC Route] Saving profile form data for userId: ${userId}`
//         );
//         const userRef = db.collection(collections.USERS).doc(userId);
//         await userRef.set(
//           {
//             profile: JSON.parse(profileData), // Save the form data
//           },
//           { merge: true }
//         );
//         console.log(`[KYC Route] Successfully saved profile form data.`);
//       }

//       console.log("Starting automated verification process for user:", userId);
//       const result = await KYCService.processKYC(userId, {
//         frontIdPath: req.files.governmentId[0].path,
//         selfiePath: req.files.selfie[0].path,
//         proofOfAddressPath: req.files.proofOfAddress[0].path,
//       });

//       // Clean up temporary files
//       Object.values(req.files).forEach((fileArray) => {
//         fileArray.forEach((file) =>
//           fs.unlink(file.path, (err) => {
//             if (err) console.error("Error deleting temp file:", err);
//           })
//         );
//       });

//       if (!result.success) {
//         const code = result.error?.status || 400;
//         return res
//           .status(code)
//           .json({
//             success: false,
//             error: result.error?.detail || "KYC provider error.",
//           });
//       }

//       // 2. DETERMINE THE OVERALL STATUS
//       const idStatus =
//         result.data.idResult.id_verification.status === "Approved";
//       const faceStatus =
//         result.data.faceResult.face_match.status === "Approved";
//       const poaStatus = result.data.poaResult.poa.status === "Approved";
//       const isApproved = idStatus && faceStatus && poaStatus;
//       const overallStatus = isApproved ? "approved" : "rejected";
//       console.log(`[KYC Route] Overall determined status: ${overallStatus}`);

//       // 3. SAVE THE VERIFICATION RESULTS
//       const kycSubmissionRef = db.collection(collections.KYC_SUBMISSION).doc();
//       await kycSubmissionRef.set({
//         id: kycSubmissionRef.id,
//         userId: userId,
//         status: overallStatus,
//         provider: "didit",
//         providerData: result.data,
//         submittedAt: new Date(),
//         updatedAt: new Date(),
//         ...(isApproved && { approvedAt: new Date() }),
//       });

//       // 4. UPDATE THE USER'S KYC STATUS
//       const userRef = db.collection(collections.USERS).doc(userId);
//       await userRef.set(
//         {
//           profile: {
//             kycStatus: overallStatus,
//             kycProvider: "didit",
//             lastKycUpdate: new Date(),
//             ...(isApproved && { kycVerifiedAt: new Date() }),
//           },
//         },
//         { merge: true }
//       );
//       console.log(
//         `[KYC Route] User profile kycStatus updated for userId: ${userId}`
//       );

//       res.json({
//         success: true,
//         message: `KYC verification completed with status: ${overallStatus}`,
//         data: result.data,
//       });
//     } catch (error) {
//       console.error("KYC verification route error:", error);
//       res
//         .status(500)
//         .json({
//           success: false,
//           error: error.message || "Internal server error.",
//         });
//     }
//   }
// );

// // POST /api/kyc/submit-with-verification - Upload documents and submit for review
// router.post("/submit-with-verification", async (req, res) => {
//   try {
//     const { userId, personalInfo, businessInfo, uploadedFiles } = req.body;

//     if (!userId || !personalInfo || !uploadedFiles) {
//       return res.status(400).json({
//         success: false,
//         error: "User ID, personal information, and uploaded files are required",
//       });
//     }

//     // Prepare data for KYC submission
//     const kycData = {
//       userId,
//       fullName: personalInfo.fullName,
//       phoneNumber: personalInfo.phoneNumber,
//       businessName: businessInfo?.businessName || "",
//       documentsUploaded: uploadedFiles,
//     };

//     console.log(
//       "Submitting KYC documentation:",
//       JSON.stringify(kycData, null, 2)
//     );

//     // Submit KYC data to Firebase for manual review
//     const result = await KYCService.submitKYC(kycData);

//     if (result.success) {
//       res.status(201).json({
//         success: true,
//         message: "KYC submitted successfully for review",
//         data: result.data,
//       });
//     } else {
//       res.status(400).json({
//         success: false,
//         error: result.error,
//       });
//     }
//   } catch (error) {
//     console.error("Error submitting KYC with verification:", error);
//     res.status(500).json({
//       success: false,
//       error: "Internal server error",
//     });
//   }
// });

// // POST /api/kyc/test/approve/:userId - Test endpoint to approve KYC (development only)
// router.post("/test/approve/:userId", async (req, res) => {
//   try {
//     if (process.env.NODE_ENV !== "development") {
//       return res.status(403).json({
//         success: false,
//         error: "This endpoint is only available in development mode",
//       });
//     }

//     const { userId } = req.params;

//     // Update user's KYC status to approved
//     await db
//       .collection(collections.USERS)
//       .doc(userId)
//       .update({
//         "profile.kycStatus": "approved",
//         "profile.kycVerifiedAt": new Date(),
//         "profile.kycProvider": "manual",
//         "profile.kycSessionId": `manual_session_${Date.now()}`,
//         "profile.lastKycUpdate": new Date(),
//         updatedAt: new Date(),
//       });

//     // Create a mock KYC submission record
//     const kycRef = db.collection(collections.KYC_SUBMISSION).doc();
//     await kycRef.set({
//       id: kycRef.id,
//       userId: userId,
//       status: "approved",
//       provider: "manual",
//       sessionId: `manual_session_${Date.now()}`,
//       personalInfo: {
//         fullName: "Test User",
//         phoneNumber: "+1234567890",
//       },
//       businessInfo: {
//         businessName: "Test Business",
//       },
//       submittedAt: new Date(),
//       updatedAt: new Date(),
//       approvedAt: new Date(),
//     });

//     res.json({
//       success: true,
//       message: "KYC status set to approved for testing",
//       userId: userId,
//     });
//   } catch (error) {
//     console.error("Error approving test KYC:", error);
//     res.status(500).json({ success: false, error: "Internal server error" });
//   }
// });

// // POST /api/kyc/test/didit - Development-only: run full DIDit KYC flow using sample files
// router.post("/test/didit", async (req, res) => {
//   try {
//     if (process.env.NODE_ENV !== "development") {
//       return res.status(403).json({
//         success: false,
//         error: "This endpoint is only available in development mode",
//       });
//     }

//     const uploadsDir = path.join(process.cwd(), "uploads", "kyc");
//     if (!fs.existsSync(uploadsDir)) {
//       return res
//         .status(500)
//         .json({ success: false, error: "Uploads directory does not exist" });
//     }

//     const files = fs.readdirSync(uploadsDir).filter((f) => !f.startsWith("."));
//     if (files.length < 3) {
//       return res.status(400).json({
//         success: false,
//         error: "Not enough sample files in uploads/kyc to run test",
//       });
//     }

//     // pick three distinct files for governmentId, selfie, proofOfAddress
//     const govFile =
//       files.find((f) => /gov|id|government|passport|driver/i.test(f)) ||
//       files[0];
//     const selfieFile =
//       files.find(
//         (f) => /selfie|face|portrait|user/i.test(f) && f !== govFile
//       ) ||
//       files[1] ||
//       files[0];
//     const poaFile =
//       files.find(
//         (f) =>
//           /address|proof|poa|bill|utility|statement/i.test(f) &&
//           f !== govFile &&
//           f !== selfieFile
//       ) ||
//       files[2] ||
//       files[1];

//     const govPath = path.join(uploadsDir, govFile);
//     const selfiePath = path.join(uploadsDir, selfieFile);
//     const poaPath = path.join(uploadsDir, poaFile);

//     console.log("Running DIDit test with files:", {
//       govPath,
//       selfiePath,
//       poaPath,
//     });

//     const result = await KYCService.processKYC("test_user_for_didit", {
//       frontIdPath: govPath,
//       selfiePath: selfiePath,
//       proofOfAddressPath: poaPath,
//     });

//     if (result.success) {
//       return res.json({ success: true, data: result.data });
//     }

//     // Forward provider-style error if available
//     if (result.error && result.error.status) {
//       return res
//         .status(result.error.status)
//         .json({ success: false, error: result.error.detail || result.error });
//     }

//     return res
//       .status(400)
//       .json({ success: false, error: result.error || "KYC test failed" });
//   } catch (error) {
//     console.error("Error running DIDit test endpoint:", error);
//     return res.status(500).json({
//       success: false,
//       error: error.message || "Internal server error",
//     });
//   }
// });

// // GET /api/kyc/user/:userId/status - Get user's current KYC status
// router.get("/user/:userId/status", async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const result = await KYCService.getUserKYCStatus(userId);

//     if (result.success) {
//       res.json({
//         success: true,
//         status: result.data.status,
//         isVerified: result.data.status === "approved",
//         data: result.data,
//       });
//     } else {
//       res.status(404).json({ success: false, error: result.error });
//     }
//   } catch (error) {
//     console.error("Error getting user KYC status:", error);
//     res.status(500).json({ success: false, error: "Internal server error" });
//   }
// });

// // POST /api/kyc/submit - Submit KYC documentation
// router.post("/submit", async (req, res) => {
//   try {
//     const kycData = req.body;

//     // Basic validation
//     if (!kycData.userId || !kycData.personalInfo) {
//       return res.status(400).json({
//         success: false,
//         error: "User ID and personal information are required",
//       });
//     }

//     const result = await KYCService.submitKYC(kycData);

//     if (result.success) {
//       res.status(201).json({ success: true, kyc: result.data });
//     } else {
//       res.status(400).json({ success: false, error: result.error });
//     }
//   } catch (error) {
//     res.status(500).json({ success: false, error: "Internal server error" });
//   }
// });

// // GET /api/kyc/:id - Get KYC submission by ID
// router.get("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const result = await KYCService.getKYCById(id);

//     if (result.success) {
//       res.json({ success: true, kyc: result.data });
//     } else {
//       res.status(404).json({ success: false, error: result.error });
//     }
//   } catch (error) {
//     res.status(500).json({ success: false, error: "Internal server error" });
//   }
// });

// // GET /api/kyc/user/:userId - Get KYC submission by user ID
// router.get("/user/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const result = await KYCService.getKYCByUserId(userId);

//     if (result.success) {
//       res.json({ success: true, kyc: result.data });
//     } else {
//       res.status(404).json({ success: false, error: result.error });
//     }
//   } catch (error) {
//     res.status(500).json({ success: false, error: "Internal server error" });
//   }
// });

// // PUT /api/kyc/:id/status - Update KYC status
// router.put("/:id/status", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status, reviewNotes = "", approvedBy = null } = req.body;

//     if (!status) {
//       return res.status(400).json({
//         success: false,
//         error: "Status is required",
//       });
//     }

//     const validStatuses = [
//       "submitted",
//       "under_review",
//       "approved",
//       "rejected",
//       "requires_resubmission",
//     ];
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid status",
//       });
//     }

//     const result = await KYCService.updateKYCStatus(
//       id,
//       status,
//       reviewNotes,
//       approvedBy
//     );

//     if (result.success) {
//       res.json({ success: true, data: result.data });
//     } else {
//       res.status(400).json({ success: false, error: result.error });
//     }
//   } catch (error) {
//     res.status(500).json({ success: false, error: "Internal server error" });
//   }
// });

// // PUT /api/kyc/:id/document/:documentType/status - Update document status
// router.put("/:id/document/:documentType/status", async (req, res) => {
//   try {
//     const { id, documentType } = req.params;
//     const { status } = req.body;

//     if (!status) {
//       return res.status(400).json({
//         success: false,
//         error: "Status is required",
//       });
//     }

//     const validStatuses = ["uploaded", "verified", "rejected"];
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid document status",
//       });
//     }

//     const result = await KYCService.updateDocumentStatus(
//       id,
//       documentType,
//       status
//     );

//     if (result.success) {
//       res.json({
//         success: true,
//         message: "Document status updated successfully",
//       });
//     } else {
//       res.status(400).json({ success: false, error: result.error });
//     }
//   } catch (error) {
//     res.status(500).json({ success: false, error: "Internal server error" });
//   }
// });

// // GET /api/kyc - Get all KYC submissions (admin)
// router.get("/", async (req, res) => {
//   try {
//     const { status, limit = 20 } = req.query;
//     const result = await KYCService.getAllKYCSubmissions(
//       status,
//       parseInt(limit)
//     );

//     if (result.success) {
//       res.json({ success: true, submissions: result.data });
//     } else {
//       res.status(400).json({ success: false, error: result.error });
//     }
//   } catch (error) {
//     res.status(500).json({ success: false, error: "Internal server error" });
//   }
// });

// // GET /api/kyc/pending - Get pending KYC submissions
// router.get("/status/pending", async (req, res) => {
//   try {
//     const { limit = 20 } = req.query;
//     const result = await KYCService.getPendingKYCSubmissions(parseInt(limit));

//     if (result.success) {
//       res.json({ success: true, submissions: result.data });
//     } else {
//       res.status(400).json({ success: false, error: result.error });
//     }
//   } catch (error) {
//     res.status(500).json({ success: false, error: "Internal server error" });
//   }
// });

// // GET /api/kyc/statistics - Get KYC statistics
// router.get("/admin/statistics", async (req, res) => {
//   try {
//     const result = await KYCService.getKYCStatistics();

//     if (result.success) {
//       res.json({ success: true, statistics: result.data });
//     } else {
//       res.status(400).json({ success: false, error: result.error });
//     }
//   } catch (error) {
//     res.status(500).json({ success: false, error: "Internal server error" });
//   }
// });

// export default router;

import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { KYCService } from "../services/kycService.js";
import { db, collections } from "../config/firebase.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), "uploads", "kyc"); // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, and PDF files are allowed!"));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

// POST /api/kyc/verify - Saves profile data AND verifies documents with Didit
router.post(
  "/verify",
  upload.fields([
    { name: "governmentId", maxCount: 1 },
    { name: "selfie", maxCount: 1 }, // { name: "proofOfAddress", maxCount: 1 }, // Commented out
  ]),
  async (req, res) => {
    try {
      const { userId, profileData } = req.body;

      if (!userId) {
        return res
          .status(400)
          .json({ success: false, error: "User ID is required" });
      }
      // The original code checked for 3 files. We modify it to check for 2.
      if (!req.files || Object.keys(req.files).length < 2) {
        return res
          .status(400)
          .json({
            success: false,
            error: "Government ID and Selfie documents are required",
          });
      } // ✅ 1. SAVE THE PROFILE INFORMATION FIRST

      if (profileData) {
        const userRef = db.collection(collections.USERS).doc(userId);
        await userRef.set(
          {
            profile: JSON.parse(profileData),
          },
          { merge: true }
        );
      }

      const result = await KYCService.processKYC(userId, {
        frontIdPath: req.files.governmentId[0].path,
        selfiePath: req.files.selfie[0].path, // proofOfAddressPath: req.files.proofOfAddress[0].path, // Commented out
      }); // Clean up temporary files

      Object.values(req.files).forEach((fileArray) => {
        fileArray.forEach((file) =>
          fs.unlink(file.path, (err) => {
            if (err) console.error("Error deleting temp file:", err);
          })
        );
      });

      if (!result.success) {
        const code = result.error?.status || 400;
        return res.status(code).json({
          success: false,
          error: result.error?.detail || "KYC provider error.",
        });
      } // 2. DETERMINE THE OVERALL STATUS

      const idStatus =
        result.data.idResult.id_verification.status === "Approved";
      const faceStatus =
        result.data.faceResult.face_match.status === "Approved"; // const poaStatus = result.data.poaResult.poa.status === "Approved"; // Commented out
      // We only check idStatus and faceStatus now
      const isApproved = idStatus && faceStatus;
      const overallStatus = isApproved ? "approved" : "rejected"; // 3. SAVE THE VERIFICATION RESULTS

      const kycSubmissionRef = db.collection(collections.KYC_SUBMISSION).doc();
      await kycSubmissionRef.set({
        id: kycSubmissionRef.id,
        userId: userId,
        status: overallStatus,
        provider: "didit",
        providerData: result.data,
        submittedAt: new Date(),
        updatedAt: new Date(),
        ...(isApproved && { approvedAt: new Date() }),
      }); // 4. UPDATE THE USER'S KYC STATUS

      const userRef = db.collection(collections.USERS).doc(userId);
      await userRef.set(
        {
          profile: {
            kycStatus: overallStatus,
            kycProvider: "didit",
            lastKycUpdate: new Date(),
            ...(isApproved && { kycVerifiedAt: new Date() }),
          },
        },
        { merge: true }
      );

      res.json({
        success: true,
        message: `KYC verification completed with status: ${overallStatus}`,
        data: result.data,
      });
    } catch (error) {
      console.error("KYC verification route error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Internal server error.",
      });
    }
  }
);

// POST /api/kyc/submit-with-verification - Upload documents and submit for review
router.post("/submit-with-verification", async (req, res) => {
  try {
    const { userId, personalInfo, businessInfo, uploadedFiles } = req.body;

    if (!userId || !personalInfo || !uploadedFiles) {
      return res.status(400).json({
        success: false,
        error: "User ID, personal information, and uploaded files are required",
      });
    } // Prepare data for KYC submission

    const kycData = {
      userId,
      fullName: personalInfo.fullName,
      phoneNumber: personalInfo.phoneNumber,
      businessName: businessInfo?.businessName || "",
      documentsUploaded: uploadedFiles,
    };

    console.log(
      "Submitting KYC documentation:",
      JSON.stringify(kycData, null, 2)
    ); // Submit KYC data to Firebase for manual review

    const result = await KYCService.submitKYC(kycData);

    if (result.success) {
      res.status(201).json({
        success: true,
        message: "KYC submitted successfully for review",
        data: result.data,
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error submitting KYC with verification:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// POST /api/kyc/test/approve/:userId - Test endpoint to approve KYC (development only)
router.post("/test/approve/:userId", async (req, res) => {
  try {
    if (process.env.NODE_ENV !== "development") {
      return res.status(403).json({
        success: false,
        error: "This endpoint is only available in development mode",
      });
    }

    const { userId } = req.params; // Update user's KYC status to approved

    await db
      .collection(collections.USERS)
      .doc(userId)
      .update({
        "profile.kycStatus": "approved",
        "profile.kycVerifiedAt": new Date(),
        "profile.kycProvider": "manual",
        "profile.kycSessionId": `manual_session_${Date.now()}`,
        "profile.lastKycUpdate": new Date(),
        updatedAt: new Date(),
      }); // Create a mock KYC submission record

    const kycRef = db.collection(collections.KYC_SUBMISSION).doc();
    await kycRef.set({
      id: kycRef.id,
      userId: userId,
      status: "approved",
      provider: "manual",
      sessionId: `manual_session_${Date.now()}`,
      personalInfo: {
        fullName: "Test User",
        phoneNumber: "+1234567890",
      },
      businessInfo: {
        businessName: "Test Business",
      },
      submittedAt: new Date(),
      updatedAt: new Date(),
      approvedAt: new Date(),
    });

    res.json({
      success: true,
      message: "KYC status set to approved for testing",
      userId: userId,
    });
  } catch (error) {
    console.error("Error approving test KYC:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/kyc/test/didit - Development-only: run full DIDit KYC flow using sample files
router.post("/test/didit", async (req, res) => {
  try {
    if (process.env.NODE_ENV !== "development") {
      return res.status(403).json({
        success: false,
        error: "This endpoint is only available in development mode",
      });
    }

    const uploadsDir = path.join(process.cwd(), "uploads", "kyc");
    if (!fs.existsSync(uploadsDir)) {
      return res
        .status(500)
        .json({ success: false, error: "Uploads directory does not exist" });
    }

    const files = fs.readdirSync(uploadsDir).filter((f) => !f.startsWith("."));
    if (files.length < 3) {
      return res.status(400).json({
        success: false,
        error: "Not enough sample files in uploads/kyc to run test",
      });
    } // pick three distinct files for governmentId, selfie, proofOfAddress

    const govFile =
      files.find((f) => /gov|id|government|passport|driver/i.test(f)) ||
      files[0];
    const selfieFile =
      files.find(
        (f) => /selfie|face|portrait|user/i.test(f) && f !== govFile
      ) ||
      files[1] ||
      files[0];
    const poaFile =
      files.find(
        (f) =>
          /address|proof|poa|bill|utility|statement/i.test(f) &&
          f !== govFile &&
          f !== selfieFile
      ) ||
      files[2] ||
      files[1];

    const govPath = path.join(uploadsDir, govFile);
    const selfiePath = path.join(uploadsDir, selfieFile);
    const poaPath = path.join(uploadsDir, poaFile);

    console.log("Running DIDit test with files:", {
      govPath,
      selfiePath,
      poaPath,
    });

    const result = await KYCService.processKYC("test_user_for_didit", {
      frontIdPath: govPath,
      selfiePath: selfiePath,
      proofOfAddressPath: poaPath,
    });

    if (result.success) {
      return res.json({ success: true, data: result.data });
    } // Forward provider-style error if available

    if (result.error && result.error.status) {
      return res
        .status(result.error.status)
        .json({ success: false, error: result.error.detail || result.error });
    }

    return res
      .status(400)
      .json({ success: false, error: result.error || "KYC test failed" });
  } catch (error) {
    console.error("Error running DIDit test endpoint:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// GET /api/kyc/user/:userId/status - Get user's current KYC status
router.get("/user/:userId/status", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await KYCService.getUserKYCStatus(userId);

    if (result.success) {
      res.json({
        success: true,
        status: result.data.status,
        isVerified: result.data.status === "approved",
        data: result.data,
      });
    } else {
      res.status(404).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error("Error getting user KYC status:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/kyc/submit - Submit KYC documentation
router.post("/submit", async (req, res) => {
  try {
    const kycData = req.body; // Basic validation

    if (!kycData.userId || !kycData.personalInfo) {
      return res.status(400).json({
        success: false,
        error: "User ID and personal information are required",
      });
    }

    const result = await KYCService.submitKYC(kycData);

    if (result.success) {
      res.status(201).json({ success: true, kyc: result.data });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/kyc/:id - Get KYC submission by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await KYCService.getKYCById(id);

    if (result.success) {
      res.json({ success: true, kyc: result.data });
    } else {
      res.status(404).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/kyc/user/:userId - Get KYC submission by user ID
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await KYCService.getKYCByUserId(userId);

    if (result.success) {
      res.json({ success: true, kyc: result.data });
    } else {
      res.status(404).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PUT /api/kyc/:id/status - Update KYC status
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes = "", approvedBy = null } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: "Status is required",
      });
    }

    const validStatuses = [
      "submitted",
      "under_review",
      "approved",
      "rejected",
      "requires_resubmission",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status",
      });
    }

    const result = await KYCService.updateKYCStatus(
      id,
      status,
      reviewNotes,
      approvedBy
    );

    if (result.success) {
      res.json({ success: true, data: result.data });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PUT /api/kyc/:id/document/:documentType/status - Update document status
router.put("/:id/document/:documentType/status", async (req, res) => {
  try {
    const { id, documentType } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: "Status is required",
      });
    }

    const validStatuses = ["uploaded", "verified", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid document status",
      });
    }

    const result = await KYCService.updateDocumentStatus(
      id,
      documentType,
      status
    );

    if (result.success) {
      res.json({
        success: true,
        message: "Document status updated successfully",
      });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/kyc - Get all KYC submissions (admin)
router.get("/", async (req, res) => {
  try {
    const { status, limit = 20 } = req.query;
    const result = await KYCService.getAllKYCSubmissions(
      status,
      parseInt(limit)
    );

    if (result.success) {
      res.json({ success: true, submissions: result.data });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/kyc/pending - Get pending KYC submissions
router.get("/status/pending", async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const result = await KYCService.getPendingKYCSubmissions(parseInt(limit));

    if (result.success) {
      res.json({ success: true, submissions: result.data });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/kyc/statistics - Get KYC statistics
router.get("/admin/statistics", async (req, res) => {
  try {
    const result = await KYCService.getKYCStatistics();

    if (result.success) {
      res.json({ success: true, statistics: result.data });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
