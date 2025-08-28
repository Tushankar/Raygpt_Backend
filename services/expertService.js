import { db, collections } from "../config/firebase.js";

/**
 * Expert Service - Handle expert hire requests
 */
export class ExpertService {
  static async createExpertRequest(data) {
    try {
      const ref = db.collection(collections.EXPERT_REQUESTS).doc();
      const payload = {
        id: ref.id,
        fullName: data.fullName || "",
        email: data.email || "",
        phone: data.phone || "",
        helpWith: data.helpWith || [],
        deadline: data.deadline || null,
        businessType: data.businessType || "",
        logo: data.logo || null,
        status: "pending",
        requestDate: new Date().toISOString().split("T")[0],
        createdAt: new Date(),
        updatedAt: new Date(),
        reviewedBy: null,
        reviewedAt: null,
        reviewNotes: "",
      };

      await ref.set(payload);
      return { success: true, data: payload };
    } catch (err) {
      console.error("Error creating expert request:", err);
      return { success: false, error: err.message };
    }
  }

  static async getAllExpertRequests() {
    try {
      const snapshot = await db
        .collection(collections.EXPERT_REQUESTS)
        .orderBy("createdAt", "desc")
        .get();
      const items = [];
      snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
      return { success: true, data: items };
    } catch (err) {
      console.error("Error fetching expert requests:", err);
      return { success: false, error: err.message };
    }
  }

  static async getExpertRequestById(id) {
    try {
      const doc = await db
        .collection(collections.EXPERT_REQUESTS)
        .doc(id)
        .get();
      if (!doc.exists)
        return { success: false, error: "Expert request not found" };
      return { success: true, data: { id: doc.id, ...doc.data() } };
    } catch (err) {
      console.error("Error fetching expert request by id:", err);
      return { success: false, error: err.message };
    }
  }

  static async updateExpertRequestStatus(
    id,
    status,
    reviewedBy = null,
    reviewNotes = ""
  ) {
    try {
      const ref = db.collection(collections.EXPERT_REQUESTS).doc(id);
      const updateData = { status, updatedAt: new Date() };
      if (reviewedBy) {
        updateData.reviewedBy = reviewedBy;
        updateData.reviewedAt = new Date();
      }
      if (reviewNotes) updateData.reviewNotes = reviewNotes;
      await ref.update(updateData);
      const doc = await ref.get();
      return { success: true, data: { id: doc.id, ...doc.data() } };
    } catch (err) {
      console.error("Error updating expert request status:", err);
      return { success: false, error: err.message };
    }
  }

  static async deleteExpertRequest(id) {
    try {
      await db.collection(collections.EXPERT_REQUESTS).doc(id).delete();
      return { success: true };
    } catch (err) {
      console.error("Error deleting expert request:", err);
      return { success: false, error: err.message };
    }
  }
}
