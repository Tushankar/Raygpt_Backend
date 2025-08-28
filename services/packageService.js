import { db, collections } from "../config/firebase.js";

function normalizePackage(raw) {
  if (!raw) return raw;
  const normalized = { ...raw };
  // Firestore Timestamp objects -> ISO strings
  if (normalized.createdAt && normalized.createdAt.toDate) {
    normalized.createdAt = normalized.createdAt.toDate().toISOString();
  } else if (normalized.createdAt instanceof Date) {
    normalized.createdAt = normalized.createdAt.toISOString();
  }
  if (normalized.updatedAt && normalized.updatedAt.toDate) {
    normalized.updatedAt = normalized.updatedAt.toDate().toISOString();
  } else if (normalized.updatedAt instanceof Date) {
    normalized.updatedAt = normalized.updatedAt.toISOString();
  }
  // Ensure numbers
  normalized.price = Number(normalized.price) || 0;
  normalized.activeUsers = Number(normalized.activeUsers) || 0;
  normalized.features = Array.isArray(normalized.features)
    ? normalized.features
    : [];
  return normalized;
}

export class PackageService {
  static async listPackages() {
    try {
      const snapshot = await db
        .collection(collections.PACKAGES)
        .orderBy("createdAt", "desc")
        .get();
      const packages = snapshot.docs.map((doc) => normalizePackage(doc.data()));
      return { success: true, data: packages };
    } catch (error) {
      console.error("Error listing packages:", error);
      return { success: false, error: error.message };
    }
  }

  static async createPackage(payload) {
    try {
      const ref = db.collection(collections.PACKAGES).doc();
      const pkg = {
        id: ref.id,
        name: payload.name || "Untitled",
        price: Number(payload.price) || 0,
        duration: payload.duration || "monthly",
        features: Array.isArray(payload.features) ? payload.features : [],
        status: payload.status || "active",
        activeUsers: Number(payload.activeUsers) || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await ref.set(pkg);
      return { success: true, data: normalizePackage(pkg) };
    } catch (error) {
      console.error("Error creating package:", error);
      return { success: false, error: error.message };
    }
  }

  static async updatePackage(id, payload) {
    try {
      const ref = db.collection(collections.PACKAGES).doc(id);
      const update = {
        ...payload,
        price: payload.price !== undefined ? Number(payload.price) : undefined,
        updatedAt: new Date(),
      };
      // remove undefined keys
      Object.keys(update).forEach(
        (k) => update[k] === undefined && delete update[k]
      );
      await ref.update(update);
      const doc = await ref.get();
      return { success: true, data: normalizePackage(doc.data()) };
    } catch (error) {
      console.error("Error updating package:", error);
      return { success: false, error: error.message };
    }
  }

  static async deletePackage(id) {
    try {
      await db.collection(collections.PACKAGES).doc(id).delete();
      return { success: true };
    } catch (error) {
      console.error("Error deleting package:", error);
      return { success: false, error: error.message };
    }
  }
}
