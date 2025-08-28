import { db, collections, auth } from "../config/firebase.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * User Service - Handle all user-related database operations
 */
export class UserService {
  /**
   * Create a new user
   */
  static async createUser(userData) {
    try {
      const userRef = db.collection(collections.USERS).doc();
      const user = {
        id: userRef.id,
        ...userData,
        status: userData.status || "pending", // Add status field
        phone: userData.phone || "",
        businessName: userData.businessName || "",
        industry: userData.industry || "",
        joinDate: userData.joinDate || new Date().toISOString().split("T")[0],
        kycSubmitted: userData.kycSubmitted || null,
        lastActive:
          userData.lastActive || new Date().toISOString().split("T")[0],
        profile: {
          kycStatus: "not_started",
          kycVerifiedAt: null,
          kycProvider: null,
          kycSessionId: null,
          lastKycUpdate: null,
          ...userData.profile,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await userRef.set(user);
      return { success: true, data: user };
    } catch (error) {
      console.error("Error creating user:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Register a new admin user (creates an admin record in Firestore)
   */
  static async registerAdmin({ email, password, name, username }) {
    try {
      if (!email || !password || !name) {
        return {
          success: false,
          error: "Email, password and name are required",
        };
      }

      // check existing by email
      const existing = await db
        .collection(collections.USERS)
        .where("email", "==", email)
        .limit(1)
        .get();
      if (!existing.empty) {
        return { success: false, error: "User with this email already exists" };
      }

      const hashed = await bcrypt.hash(password, 10);
      const userRef = db.collection(collections.USERS).doc();
      const admin = {
        id: userRef.id,
        email,
        name,
        username: username || null,
        passwordHash: hashed,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await userRef.set(admin);
      // Do not return passwordHash
      delete admin.passwordHash;
      return { success: true, data: admin };
    } catch (error) {
      console.error("Error registering admin:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Authenticate admin and return JWT token
   */
  static async adminLogin({ email, password }) {
    try {
      if (!email || !password) {
        return { success: false, error: "Email and password are required" };
      }

      const query = await db
        .collection(collections.USERS)
        .where("email", "==", email)
        .limit(1)
        .get();
      if (query.empty) {
        return { success: false, error: "Invalid credentials" };
      }

      const user = query.docs[0].data();
      if (user.role !== "admin") {
        return { success: false, error: "Not an admin user" };
      }

      const match = await bcrypt.compare(password, user.passwordHash || "");
      if (!match) {
        return { success: false, error: "Invalid credentials" };
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
      );

      // Clean sensitive fields
      const safeUser = { ...user };
      delete safeUser.passwordHash;

      return { success: true, data: { user: safeUser, token } };
    } catch (error) {
      console.error("Error admin login:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId) {
    try {
      const userDoc = await db.collection(collections.USERS).doc(userId).get();

      if (!userDoc.exists) {
        return { success: false, error: "User not found" };
      }

      return { success: true, data: userDoc.data() };
    } catch (error) {
      console.error("Error getting user:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email) {
    try {
      const querySnapshot = await db
        .collection(collections.USERS)
        .where("email", "==", email)
        .limit(1)
        .get();

      if (querySnapshot.empty) {
        return { success: false, error: "User not found" };
      }

      const userData = querySnapshot.docs[0].data();
      return { success: true, data: userData };
    } catch (error) {
      console.error("Error getting user by email:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update user
   */
  static async updateUser(userId, updateData) {
    try {
      const userRef = db.collection(collections.USERS).doc(userId);
      const updatePayload = {
        ...updateData,
        updatedAt: new Date(),
      };

      await userRef.update(updatePayload);
      return { success: true, data: updatePayload };
    } catch (error) {
      console.error("Error updating user:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all users with pagination and KYC status
   */
  static async getAllUsers(limit = 10, startAfter = null) {
    try {
      let query = db
        .collection(collections.USERS)
        .orderBy("createdAt", "desc")
        .limit(limit);

      if (startAfter) {
        query = query.startAfter(startAfter);
      }

      const querySnapshot = await query.get();
      const users = [];

      for (const doc of querySnapshot.docs) {
        const userData = doc.data();

        // Fetch KYC status for this user
        let kycStatus = "not_started";
        try {
          const kycQuery = await db
            .collection(collections.KYC_SUBMISSION)
            .where("userId", "==", userData.id)
            .orderBy("submittedAt", "desc")
            .limit(1)
            .get();

          if (!kycQuery.empty) {
            const kycData = kycQuery.docs[0].data();
            kycStatus = kycData.status || "pending";
          }
        } catch (error) {
          console.log(`No KYC data found for user ${userData.id}`);
        }

        users.push({
          ...userData,
          kycStatus,
        });
      }

      return { success: true, data: users };
    } catch (error) {
      console.error("Error getting all users:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(userId) {
    try {
      await db.collection(collections.USERS).doc(userId).delete();
      return { success: true };
    } catch (error) {
      console.error("Error deleting user:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Toggle user status (activate/deactivate)
   */
  static async toggleUserStatus(userId) {
    try {
      const userRef = db.collection(collections.USERS).doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return { success: false, error: "User not found" };
      }

      const userData = userDoc.data();
      const newStatus =
        userData.status === "inactive" ? "verified" : "inactive";

      // Update Firestore user status
      await userRef.update({
        status: newStatus,
        updatedAt: new Date(),
      });

      // Also update Firebase Auth account disabled flag if we can find the user by email.
      // This prevents deactivated users from signing in using Firebase Auth.
      if (userData.email) {
        try {
          const fbUser = await auth.getUserByEmail(userData.email);
          await auth.updateUser(fbUser.uid, {
            disabled: newStatus === "inactive",
          });
          // If user was deactivated, revoke refresh tokens to force sign-out for active sessions
          if (newStatus === "inactive") {
            try {
              await auth.revokeRefreshTokens(fbUser.uid);
              console.log(
                `Revoked refresh tokens for Firebase UID ${fbUser.uid}`
              );
            } catch (revErr) {
              console.warn(
                "Failed to revoke refresh tokens for user:",
                revErr.message || revErr
              );
            }
          }
          // attach firebase uid to returned data for visibility
          userData.firebaseUid = fbUser.uid;
        } catch (err) {
          // Log and continue - backend status is the source of truth here, but disabling
          // the Firebase Auth account prevents sign-in at the auth layer.
          console.warn(
            "Failed to update Firebase Auth disabled flag:",
            err.message || err
          );
        }
      }

      return { success: true, data: { ...userData, status: newStatus } };
    } catch (error) {
      console.error("Error toggling user status:", error);
      return { success: false, error: error.message };
    }
  }
}
