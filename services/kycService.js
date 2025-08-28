// import axios from "axios";
// import FormData from "form-data";
// import fs from "fs";
// import { db, collections } from "../config/firebase.js";

// const DIDIT_API_BASE = "https://verification.didit.me/v2";
// const DIDIT_API_KEY = process.env.DIDIT_API_KEY;

// async function callDiditAPI(endpoint, formData) {
//   // Log the attempt to call the Didit API
//   console.log(`[KYCService] Calling Didit API endpoint: ${endpoint}`);

//   if (!DIDIT_API_KEY) {
//     console.error(
//       "[KYCService] Didit API Key is not configured. Please check your .env file."
//     );
//     return {
//       success: false,
//       error: {
//         status: 500,
//         detail: "KYC provider is not configured on the server.",
//       },
//     };
//   }

//   try {
//     const response = await axios.post(
//       `${DIDIT_API_BASE}/${endpoint}`,
//       formData,
//       {
//         headers: {
//           ...formData.getHeaders(),
//           "x-api-key": DIDIT_API_KEY,
//           accept: "application/json",
//         },
//       }
//     );
//     // Log a successful API response
//     console.log(
//       `[KYCService] Successfully received response from ${endpoint}.`
//     );
//     return { success: true, data: response.data };
//   } catch (error) {
//     const providerError = error.response?.data || { detail: error.message };
//     const status = error.response?.status || 500;
//     // Log the detailed error from the API
//     console.error(
//       `[KYCService] Didit API Error from ${endpoint}:`,
//       status,
//       providerError
//     );
//     return {
//       success: false,
//       error: {
//         status,
//         detail:
//           providerError.detail ||
//           providerError.message ||
//           "An error occurred with the KYC provider.",
//       },
//     };
//   }
// }

// export class KYCService {
//   // ===============================================
//   // == Methods for interacting with the Didit API
//   // ===============================================

//   /**
//    * Verify ID (front image of document)
//    */
//   static async verifyID(frontImagePath) {
//     const formData = new FormData();
//     formData.append("front_image", fs.createReadStream(frontImagePath));
//     return await callDiditAPI("id-verification/", formData);
//   }

//   /**
//    * Face Match: Compare selfie with ID photo
//    */
//   static async faceMatch(userImagePath, refImagePath) {
//     const formData = new FormData();
//     formData.append("user_image", fs.createReadStream(userImagePath));
//     formData.append("ref_image", fs.createReadStream(refImagePath));
//     return await callDiditAPI("face-match/", formData);
//   }

//   /**
//    * Proof of Address Verification
//    */
//   static async verifyProofOfAddress(documentPath) {
//     const formData = new FormData();
//     formData.append("document", fs.createReadStream(documentPath));
//     return await callDiditAPI("poa/", formData);
//   }

//   /**
//    * Full KYC Flow using the Didit API
//    */
//   static async processKYC(
//     userId,
//     { frontIdPath, selfiePath, proofOfAddressPath }
//   ) {
//     console.log(`[KYCService] Starting full KYC process for userId: ${userId}`);

//     // Step 1: ID Verification
//     console.log(`[KYCService] Step 1: Verifying ID for userId: ${userId}`);
//     const idResult = await this.verifyID(frontIdPath);
//     if (!idResult.success) {
//       console.error(
//         `[KYCService] ID verification failed for userId: ${userId}`
//       );
//       return idResult;
//     }
//     console.log(
//       `[KYCService] ID verification successful for userId: ${userId}`
//     );

//     // Step 2: Face Match
//     console.log(
//       `[KYCService] Step 2: Performing face match for userId: ${userId}`
//     );
//     const faceResult = await this.faceMatch(selfiePath, frontIdPath);
//     if (!faceResult.success) {
//       console.error(`[KYCService] Face match failed for userId: ${userId}`);
//       return faceResult;
//     }
//     console.log(`[KYCService] Face match successful for userId: ${userId}`);

//     // Step 3: Proof of Address
//     console.log(
//       `[KYCService] Step 3: Verifying proof of address for userId: ${userId}`
//     );
//     const poaResult = await this.verifyProofOfAddress(proofOfAddressPath);
//     if (!poaResult.success) {
//       console.error(
//         `[KYCService] Proof of address verification failed for userId: ${userId}`
//       );
//       return poaResult;
//     }
//     console.log(
//       `[KYCService] Proof of address verification successful for userId: ${userId}`
//     );

//     const finalData = {
//       idResult: idResult.data,
//       faceResult: faceResult.data,
//       poaResult: poaResult.data,
//     };

//     // Log the raw data from Didit in a readable format
//     console.log(
//       `[KYCService] Raw data from Didit for userId: ${userId}`,
//       JSON.stringify(finalData, null, 2)
//     );

//     console.log(
//       `[KYCService] Full KYC process completed successfully for userId: ${userId}`
//     );
//     return { success: true, data: finalData };
//   }

//   // ===============================================
//   // == Methods for interacting with Firebase DB
//   // ===============================================

//   /**
//    * Get user's KYC status and verification data from their profile.
//    */
//   static async getUserKYCStatus(userId) {
//     console.log(`[KYCService] Getting KYC status for userId: ${userId}`);
//     try {
//       const userDoc = await db.collection(collections.USERS).doc(userId).get();
//       if (!userDoc.exists) {
//         console.warn(`[KYCService] User not found for userId: ${userId}`);
//         return { success: false, error: "User not found" };
//       }

//       const userData = userDoc.data();
//       const kycStatus = userData.profile?.kycStatus || "not_started";
//       console.log(
//         `[KYCService] Found KYC status '${kycStatus}' for userId: ${userId}`
//       );

//       return {
//         success: true,
//         data: {
//           status: kycStatus,
//           isVerified: kycStatus === "approved",
//           ...userData.profile,
//         },
//       };
//     } catch (error) {
//       console.error(
//         `[KYCService] Error getting user KYC status for userId: ${userId}`,
//         error
//       );
//       return { success: false, error: error.message };
//     }
//   }

//   /**
//    * Submit KYC documentation for manual review.
//    */
//   static async submitKYC(kycData) {
//     console.log(
//       `[KYCService] Submitting KYC data for userId: ${kycData.userId}`
//     );
//     try {
//       const kycRef = db.collection(collections.KYC_SUBMISSION).doc();
//       const kyc = {
//         id: kycRef.id,
//         ...kycData,
//         status: "submitted",
//         submittedAt: new Date(),
//         updatedAt: new Date(),
//         reviewNotes: "",
//         approvedBy: null,
//         approvedAt: null,
//       };
//       await kycRef.set(kyc);

//       // Update the user's profile status
//       await db.collection(collections.USERS).doc(kycData.userId).update({
//         "profile.kycStatus": "submitted",
//       });
//       console.log(
//         `[KYCService] Successfully submitted KYC for userId: ${kycData.userId} with submissionId: ${kycRef.id}`
//       );

//       return { success: true, data: kyc };
//     } catch (error) {
//       console.error(
//         `[KYCService] Error submitting KYC for userId: ${kycData.userId}`,
//         error
//       );
//       return { success: false, error: error.message };
//     }
//   }

//   /**
//    * Get a specific KYC submission by its ID.
//    */
//   static async getKYCById(kycId) {
//     console.log(`[KYCService] Getting KYC submission by ID: ${kycId}`);
//     try {
//       const kycDoc = await db
//         .collection(collections.KYC_SUBMISSION)
//         .doc(kycId)
//         .get();
//       if (!kycDoc.exists) {
//         console.warn(`[KYCService] KYC submission not found for ID: ${kycId}`);
//         return { success: false, error: "KYC submission not found" };
//       }
//       return { success: true, data: kycDoc.data() };
//     } catch (error) {
//       console.error(`[KYCService] Error getting KYC by ID: ${kycId}`, error);
//       return { success: false, error: error.message };
//     }
//   }

//   /**
//    * Get the latest KYC submission for a specific user.
//    */
//   static async getKYCByUserId(userId) {
//     console.log(`[KYCService] Getting KYC submission by userId: ${userId}`);
//     try {
//       const querySnapshot = await db
//         .collection(collections.KYC_SUBMISSION)
//         .where("userId", "==", userId)
//         .orderBy("submittedAt", "desc")
//         .limit(1)
//         .get();

//       if (querySnapshot.empty) {
//         console.warn(
//           `[KYCService] No KYC submission found for userId: ${userId}`
//         );
//         return {
//           success: false,
//           error: "No KYC submission found for this user",
//         };
//       }
//       return { success: true, data: querySnapshot.docs[0].data() };
//     } catch (error) {
//       console.error(
//         `[KYCService] Error getting KYC by userId: ${userId}`,
//         error
//       );
//       return { success: false, error: error.message };
//     }
//   }

//   /**
//    * Update the status of a KYC submission.
//    */
//   static async updateKYCStatus(
//     kycId,
//     status,
//     reviewNotes = "",
//     approvedBy = null
//   ) {
//     console.log(
//       `[KYCService] Updating KYC status for submissionId: ${kycId} to '${status}'`
//     );
//     try {
//       const kycRef = db.collection(collections.KYC_SUBMISSION).doc(kycId);
//       const updatePayload = {
//         status,
//         reviewNotes,
//         updatedAt: new Date(),
//       };

//       if (status === "approved" && approvedBy) {
//         updatePayload.approvedBy = approvedBy;
//         updatePayload.approvedAt = new Date();
//       }

//       await kycRef.update(updatePayload);
//       console.log(
//         `[KYCService] Updated submission document for kycId: ${kycId}`
//       );

//       // Also update the user's main profile status
//       const kycSubmission = (await kycRef.get()).data();
//       if (kycSubmission && kycSubmission.userId) {
//         const userRef = db
//           .collection(collections.USERS)
//           .doc(kycSubmission.userId);
//         await userRef.update({
//           "profile.kycStatus": status,
//           "profile.lastKycUpdate": new Date(),
//           ...(status === "approved" && { "profile.kycVerifiedAt": new Date() }),
//         });
//         console.log(
//           `[KYCService] Updated user profile for userId: ${kycSubmission.userId}`
//         );
//       }

//       return { success: true, data: updatePayload };
//     } catch (error) {
//       console.error(
//         `[KYCService] Error updating KYC status for kycId: ${kycId}`,
//         error
//       );
//       return { success: false, error: error.message };
//     }
//   }

//   /**
//    * Update the verification status of a single document within a KYC submission.
//    */
//   static async updateDocumentStatus(kycId, documentType, status) {
//     console.log(
//       `[KYCService] Updating document status for kycId: ${kycId}, docType: ${documentType}, status: ${status}`
//     );
//     try {
//       const kycRef = db.collection(collections.KYC_SUBMISSION).doc(kycId);
//       const updateField = `documentsUploaded.${documentType}.status`;

//       await kycRef.update({
//         [updateField]: status,
//         updatedAt: new Date(),
//       });

//       return { success: true };
//     } catch (error) {
//       console.error(
//         `[KYCService] Error updating document status for kycId: ${kycId}`,
//         error
//       );
//       return { success: false, error: error.message };
//     }
//   }

//   /**
//    * Get all KYC submissions (for admin).
//    */
//   static async getAllKYCSubmissions(status = null, limit = 20) {
//     console.log(
//       `[KYCService] Getting all KYC submissions with status filter: ${
//         status || "any"
//       }`
//     );
//     try {
//       let query = db.collection(collections.KYC_SUBMISSION);
//       if (status) {
//         query = query.where("status", "==", status);
//       }
//       query = query.orderBy("submittedAt", "desc").limit(limit);
//       const querySnapshot = await query.get();
//       const submissions = querySnapshot.docs.map((doc) => doc.data());
//       console.log(`[KYCService] Found ${submissions.length} submissions.`);
//       return { success: true, data: submissions };
//     } catch (error) {
//       console.error(`[KYCService] Error getting all KYC submissions:`, error);
//       return { success: false, error: error.message };
//     }
//   }

//   /**
//    * Get pending KYC submissions.
//    */
//   static async getPendingKYCSubmissions(limit = 20) {
//     console.log(`[KYCService] Getting pending KYC submissions.`);
//     try {
//       const querySnapshot = await db
//         .collection(collections.KYC_SUBMISSION)
//         .where("status", "in", ["submitted", "under_review"])
//         .orderBy("submittedAt", "asc")
//         .limit(limit)
//         .get();
//       const submissions = querySnapshot.docs.map((doc) => doc.data());
//       console.log(
//         `[KYCService] Found ${submissions.length} pending submissions.`
//       );
//       return { success: true, data: submissions };
//     } catch (error) {
//       console.error(
//         `[KYCService] Error getting pending KYC submissions:`,
//         error
//       );
//       return { success: false, error: error.message };
//     }
//   }

//   /**
//    * Get KYC statistics (for admin dashboard).
//    */
//   static async getKYCStatistics() {
//     console.log(`[KYCService] Getting KYC statistics.`);
//     try {
//       const collectionRef = db.collection(collections.KYC_SUBMISSION);
//       const statusCounts = {
//         total: 0,
//         approved: 0,
//         rejected: 0,
//         submitted: 0,
//         under_review: 0,
//       };

//       const snapshot = await collectionRef.get();
//       snapshot.forEach((doc) => {
//         statusCounts.total++;
//         const status = doc.data().status;
//         if (status in statusCounts) {
//           statusCounts[status]++;
//         }
//       });
//       console.log(`[KYCService] Calculated statistics:`, statusCounts);

//       return { success: true, data: statusCounts };
//     } catch (error) {
//       console.error(`[KYCService] Error getting KYC statistics:`, error);
//       return { success: false, error: error.message };
//     }
//   }
// }

import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { db, collections } from "../config/firebase.js";

const DIDIT_API_BASE = "https://verification.didit.me/v2";
const DIDIT_API_KEY = process.env.DIDIT_API_KEY;

async function callDiditAPI(endpoint, formData) {
  // Log the attempt to call the Didit API
  console.log(`[KYCService] Calling Didit API endpoint: ${endpoint}`);

  if (!DIDIT_API_KEY) {
    console.error(
      "[KYCService] Didit API Key is not configured. Please check your .env file."
    );
    return {
      success: false,
      error: {
        status: 500,
        detail: "KYC provider is not configured on the server.",
      },
    };
  }

  try {
    const response = await axios.post(
      `${DIDIT_API_BASE}/${endpoint}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "x-api-key": DIDIT_API_KEY,
          accept: "application/json",
        },
      }
    ); // Log a successful API response
    console.log(
      `[KYCService] Successfully received response from ${endpoint}.`
    );
    return { success: true, data: response.data };
  } catch (error) {
    const providerError = error.response?.data || { detail: error.message };
    const status = error.response?.status || 500; // Log the detailed error from the API
    console.error(
      `[KYCService] Didit API Error from ${endpoint}:`,
      status,
      providerError
    );
    return {
      success: false,
      error: {
        status,
        detail:
          providerError.detail ||
          providerError.message ||
          "An error occurred with the KYC provider.",
      },
    };
  }
}

export class KYCService {
  // ===============================================
  // == Methods for interacting with the Didit API
  // ===============================================

  /**
   * Verify ID (front image of document)
   */
  static async verifyID(frontImagePath) {
    const formData = new FormData();
    formData.append("front_image", fs.createReadStream(frontImagePath));
    return await callDiditAPI("id-verification/", formData);
  }
  /**
   * Face Match: Compare selfie with ID photo
   */

  static async faceMatch(userImagePath, refImagePath) {
    const formData = new FormData();
    formData.append("user_image", fs.createReadStream(userImagePath));
    formData.append("ref_image", fs.createReadStream(refImagePath));
    return await callDiditAPI("face-match/", formData);
  }
  /**
   * Proof of Address Verification - COMMENTED OUT
   */  // static async verifyProofOfAddress(documentPath) { //   const formData = new FormData(); //   formData.append("document", fs.createReadStream(documentPath)); //   return await callDiditAPI("poa/", formData); // }
  /**
   * Full KYC Flow using the Didit API
   */

  static async processKYC(
    userId, // { frontIdPath, selfiePath, proofOfAddressPath } // Original
    { frontIdPath, selfiePath } // Modified
  ) {
    console.log(`[KYCService] Starting full KYC process for userId: ${userId}`); // Step 1: ID Verification

    console.log(`[KYCService] Step 1: Verifying ID for userId: ${userId}`);
    const idResult = await this.verifyID(frontIdPath);
    if (!idResult.success) {
      console.error(
        `[KYCService] ID verification failed for userId: ${userId}`
      );
      return idResult;
    }
    console.log(
      `[KYCService] ID verification successful for userId: ${userId}`
    ); // Step 2: Face Match

    console.log(
      `[KYCService] Step 2: Performing face match for userId: ${userId}`
    );
    const faceResult = await this.faceMatch(selfiePath, frontIdPath);
    if (!faceResult.success) {
      console.error(`[KYCService] Face match failed for userId: ${userId}`);
      return faceResult;
    }
    console.log(`[KYCService] Face match successful for userId: ${userId}`); // Step 3: Proof of Address - COMMENTED OUT // console.log( //   `[KYCService] Step 3: Verifying proof of address for userId: ${userId}` // ); // const poaResult = await this.verifyProofOfAddress(proofOfAddressPath); // if (!poaResult.success) { //   console.error( //     `[KYCService] Proof of address verification failed for userId: ${userId}` //   ); //   return poaResult; // } // console.log( //   `[KYCService] Proof of address verification successful for userId: ${userId}` // );

    const finalData = {
      idResult: idResult.data,
      faceResult: faceResult.data, // poaResult: poaResult.data, // Commented out
    }; // Log the raw data from Didit in a readable format

    console.log(
      `[KYCService] Raw data from Didit for userId: ${userId}`,
      JSON.stringify(finalData, null, 2)
    );

    console.log(
      `[KYCService] Full KYC process completed successfully for userId: ${userId}`
    );
    return { success: true, data: finalData };
  }  // =============================================== // == Methods for interacting with Firebase DB // ===============================================
  /**
   * Get user's KYC status and verification data from their profile.
   */

  static async getUserKYCStatus(userId) {
    console.log(`[KYCService] Getting KYC status for userId: ${userId}`);
    try {
      const userDoc = await db.collection(collections.USERS).doc(userId).get();
      if (!userDoc.exists) {
        console.warn(`[KYCService] User not found for userId: ${userId}`);
        return { success: false, error: "User not found" };
      }

      const userData = userDoc.data();
      const kycStatus = userData.profile?.kycStatus || "not_started";
      console.log(
        `[KYCService] Found KYC status '${kycStatus}' for userId: ${userId}`
      );

      return {
        success: true,
        data: {
          status: kycStatus,
          isVerified: kycStatus === "approved",
          ...userData.profile,
        },
      };
    } catch (error) {
      console.error(
        `[KYCService] Error getting user KYC status for userId: ${userId}`,
        error
      );
      return { success: false, error: error.message };
    }
  }
  /**
   * Submit KYC documentation for manual review.
   */

  static async submitKYC(kycData) {
    console.log(
      `[KYCService] Submitting KYC data for userId: ${kycData.userId}`
    );
    try {
      const kycRef = db.collection(collections.KYC_SUBMISSION).doc();
      const kyc = {
        id: kycRef.id,
        ...kycData,
        status: "submitted",
        submittedAt: new Date(),
        updatedAt: new Date(),
        reviewNotes: "",
        approvedBy: null,
        approvedAt: null,
      };
      await kycRef.set(kyc); // Update the user's profile status

      await db.collection(collections.USERS).doc(kycData.userId).update({
        "profile.kycStatus": "submitted",
      });
      console.log(
        `[KYCService] Successfully submitted KYC for userId: ${kycData.userId} with submissionId: ${kycRef.id}`
      );

      return { success: true, data: kyc };
    } catch (error) {
      console.error(
        `[KYCService] Error submitting KYC for userId: ${kycData.userId}`,
        error
      );
      return { success: false, error: error.message };
    }
  }
  /**
   * Get a specific KYC submission by its ID.
   */

  static async getKYCById(kycId) {
    console.log(`[KYCService] Getting KYC submission by ID: ${kycId}`);
    try {
      const kycDoc = await db
        .collection(collections.KYC_SUBMISSION)
        .doc(kycId)
        .get();
      if (!kycDoc.exists) {
        console.warn(`[KYCService] KYC submission not found for ID: ${kycId}`);
        return { success: false, error: "KYC submission not found" };
      }
      return { success: true, data: kycDoc.data() };
    } catch (error) {
      console.error(`[KYCService] Error getting KYC by ID: ${kycId}`, error);
      return { success: false, error: error.message };
    }
  }
  /**
   * Get the latest KYC submission for a specific user.
   */

  static async getKYCByUserId(userId) {
    console.log(`[KYCService] Getting KYC submission by userId: ${userId}`);
    try {
      const querySnapshot = await db
        .collection(collections.KYC_SUBMISSION)
        .where("userId", "==", userId)
        .orderBy("submittedAt", "desc")
        .limit(1)
        .get();

      if (querySnapshot.empty) {
        console.warn(
          `[KYCService] No KYC submission found for userId: ${userId}`
        );
        return {
          success: false,
          error: "No KYC submission found for this user",
        };
      }
      return { success: true, data: querySnapshot.docs[0].data() };
    } catch (error) {
      console.error(
        `[KYCService] Error getting KYC by userId: ${userId}`,
        error
      );
      return { success: false, error: error.message };
    }
  }
  /**
   * Update the status of a KYC submission.
   */

  static async updateKYCStatus(
    kycId,
    status,
    reviewNotes = "",
    approvedBy = null
  ) {
    console.log(
      `[KYCService] Updating KYC status for submissionId: ${kycId} to '${status}'`
    );
    try {
      const kycRef = db.collection(collections.KYC_SUBMISSION).doc(kycId);
      const updatePayload = {
        status,
        reviewNotes,
        updatedAt: new Date(),
      };

      if (status === "approved" && approvedBy) {
        updatePayload.approvedBy = approvedBy;
        updatePayload.approvedAt = new Date();
      }

      await kycRef.update(updatePayload);
      console.log(
        `[KYCService] Updated submission document for kycId: ${kycId}`
      ); // Also update the user's main profile status

      const kycSubmission = (await kycRef.get()).data();
      if (kycSubmission && kycSubmission.userId) {
        const userRef = db
          .collection(collections.USERS)
          .doc(kycSubmission.userId);
        await userRef.update({
          "profile.kycStatus": status,
          "profile.lastKycUpdate": new Date(),
          ...(status === "approved" && { "profile.kycVerifiedAt": new Date() }),
        });
        console.log(
          `[KYCService] Updated user profile for userId: ${kycSubmission.userId}`
        );
      }

      return { success: true, data: updatePayload };
    } catch (error) {
      console.error(
        `[KYCService] Error updating KYC status for kycId: ${kycId}`,
        error
      );
      return { success: false, error: error.message };
    }
  }
  /**
   * Update the verification status of a single document within a KYC submission.
   */

  static async updateDocumentStatus(kycId, documentType, status) {
    console.log(
      `[KYCService] Updating document status for kycId: ${kycId}, docType: ${documentType}, status: ${status}`
    );
    try {
      const kycRef = db.collection(collections.KYC_SUBMISSION).doc(kycId);
      const updateField = `documentsUploaded.${documentType}.status`;

      await kycRef.update({
        [updateField]: status,
        updatedAt: new Date(),
      });

      return { success: true };
    } catch (error) {
      console.error(
        `[KYCService] Error updating document status for kycId: ${kycId}`,
        error
      );
      return { success: false, error: error.message };
    }
  }
  /**
   * Get all KYC submissions (for admin).
   */

  static async getAllKYCSubmissions(status = null, limit = 20) {
    console.log(
      `[KYCService] Getting all KYC submissions with status filter: ${
        status || "any"
      }`
    );
    try {
      let query = db.collection(collections.KYC_SUBMISSION);
      if (status) {
        query = query.where("status", "==", status);
      }
      query = query.orderBy("submittedAt", "desc").limit(limit);
      const querySnapshot = await query.get();
      const submissions = querySnapshot.docs.map((doc) => doc.data());
      console.log(`[KYCService] Found ${submissions.length} submissions.`);
      return { success: true, data: submissions };
    } catch (error) {
      console.error(`[KYCService] Error getting all KYC submissions:`, error);
      return { success: false, error: error.message };
    }
  }
  /**
   * Get pending KYC submissions.
   */

  static async getPendingKYCSubmissions(limit = 20) {
    console.log(`[KYCService] Getting pending KYC submissions.`);
    try {
      const querySnapshot = await db
        .collection(collections.KYC_SUBMISSION)
        .where("status", "in", ["submitted", "under_review"])
        .orderBy("submittedAt", "asc")
        .limit(limit)
        .get();
      const submissions = querySnapshot.docs.map((doc) => doc.data());
      console.log(
        `[KYCService] Found ${submissions.length} pending submissions.`
      );
      return { success: true, data: submissions };
    } catch (error) {
      console.error(
        `[KYCService] Error getting pending KYC submissions:`,
        error
      );
      return { success: false, error: error.message };
    }
  }
  /**
   * Get KYC statistics (for admin dashboard).
   */

  static async getKYCStatistics() {
    console.log(`[KYCService] Getting KYC statistics.`);
    try {
      const collectionRef = db.collection(collections.KYC_SUBMISSION);
      const statusCounts = {
        total: 0,
        approved: 0,
        rejected: 0,
        submitted: 0,
        under_review: 0,
      };

      const snapshot = await collectionRef.get();
      snapshot.forEach((doc) => {
        statusCounts.total++;
        const status = doc.data().status;
        if (status in statusCounts) {
          statusCounts[status]++;
        }
      });
      console.log(`[KYCService] Calculated statistics:`, statusCounts);

      return { success: true, data: statusCounts };
    } catch (error) {
      console.error(`[KYCService] Error getting KYC statistics:`, error);
      return { success: false, error: error.message };
    }
  }
}
