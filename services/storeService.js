import { db, collections } from "../config/firebase.js";

/**
 * Store Service - Handle all store request related database operations
 */
export class StoreService {
  /**
   * Create a new store request
   */
  static async createStoreRequest(storeData) {
    try {
      const storeRef = db.collection(collections.STORE_REQUESTS).doc();
      const storeRequest = {
        id: storeRef.id,
        ...storeData,
        status: "pending", // pending, approved, rejected
        requestDate: new Date().toISOString().split("T")[0],
        createdAt: new Date(),
        updatedAt: new Date(),
        reviewedBy: null,
        reviewedAt: null,
        reviewNotes: "",
      };

      await storeRef.set(storeRequest);
      return { success: true, data: storeRequest };
    } catch (error) {
      console.error("Error creating store request:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all store requests
   */
  static async getAllStoreRequests() {
    try {
      const storeRequestsRef = db.collection(collections.STORE_REQUESTS);
      const snapshot = await storeRequestsRef
        .orderBy("createdAt", "desc")
        .get();

      const storeRequests = [];
      snapshot.forEach((doc) => {
        storeRequests.push({ id: doc.id, ...doc.data() });
      });

      return { success: true, data: storeRequests };
    } catch (error) {
      console.error("Error fetching store requests:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get store request by ID
   */
  static async getStoreRequestById(id) {
    try {
      const storeRef = db.collection(collections.STORE_REQUESTS).doc(id);
      const doc = await storeRef.get();

      if (!doc.exists) {
        return { success: false, error: "Store request not found" };
      }

      return { success: true, data: { id: doc.id, ...doc.data() } };
    } catch (error) {
      console.error("Error fetching store request:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update store request status
   */
  static async updateStoreRequestStatus(
    id,
    status,
    reviewedBy = null,
    reviewNotes = ""
  ) {
    try {
      const storeRef = db.collection(collections.STORE_REQUESTS).doc(id);
      const updateData = {
        status,
        updatedAt: new Date(),
      };

      if (reviewedBy) {
        updateData.reviewedBy = reviewedBy;
        updateData.reviewedAt = new Date();
      }

      if (reviewNotes) {
        updateData.reviewNotes = reviewNotes;
      }

      await storeRef.update(updateData);

      // Get updated document
      const doc = await storeRef.get();
      return { success: true, data: { id: doc.id, ...doc.data() } };
    } catch (error) {
      console.error("Error updating store request:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete store request
   */
  static async deleteStoreRequest(id) {
    try {
      await db.collection(collections.STORE_REQUESTS).doc(id).delete();
      return { success: true };
    } catch (error) {
      console.error("Error deleting store request:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get store requests by status
   */
  static async getStoreRequestsByStatus(status) {
    try {
      const storeRequestsRef = db.collection(collections.STORE_REQUESTS);
      const snapshot = await storeRequestsRef
        .where("status", "==", status)
        .orderBy("createdAt", "desc")
        .get();

      const storeRequests = [];
      snapshot.forEach((doc) => {
        storeRequests.push({ id: doc.id, ...doc.data() });
      });

      return { success: true, data: storeRequests };
    } catch (error) {
      console.error("Error fetching store requests by status:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get store requests by user ID
   */
  static async getStoreRequestsByUserId(userId) {
    try {
      const storeRequestsRef = db.collection(collections.STORE_REQUESTS);
      const snapshot = await storeRequestsRef
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();

      const storeRequests = [];
      snapshot.forEach((doc) => {
        storeRequests.push({ id: doc.id, ...doc.data() });
      });

      return { success: true, data: storeRequests };
    } catch (error) {
      console.error("Error fetching store requests by user ID:", error);
      return { success: false, error: error.message };
    }
  }
}
