import { db } from "../config/firebase.js";

export class ReviewService {
  /**
   * Create a new user review
   */
  static async createReview(reviewData) {
    try {
      const {
        userId,
        userEmail,
        userName,
        rating,
        comment,
        productType = "business_manual", // default product type
      } = reviewData;

      // Validate required fields
      if (!userId || !rating) {
        return {
          success: false,
          error: "User ID and rating are required",
        };
      }

      if (rating < 1 || rating > 5) {
        return {
          success: false,
          error: "Rating must be between 1 and 5",
        };
      }

      // Check if user has already submitted a review
      const existingReview = await this.getReviewByUserId(userId);
      if (existingReview.success && existingReview.review) {
        return {
          success: false,
          error: "User has already submitted a review",
        };
      }

      const reviewDoc = {
        userId,
        userEmail: userEmail || "",
        userName: userName || "",
        rating: parseInt(rating),
        comment: comment || "",
        productType,
        submittedAt: new Date(),
        isApproved: false, // Reviews need admin approval before being public
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await db.collection("reviews").add(reviewDoc);

      return {
        success: true,
        review: {
          id: docRef.id,
          ...reviewDoc,
        },
        message: "Review submitted successfully",
      };
    } catch (error) {
      console.error("Error creating review:", error);
      return {
        success: false,
        error: "Failed to create review",
      };
    }
  }

  /**
   * Get review by user ID
   */
  static async getReviewByUserId(userId) {
    try {
      const snapshot = await db
        .collection("reviews")
        .where("userId", "==", userId)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return {
          success: true,
          review: null,
        };
      }

      const doc = snapshot.docs[0];
      return {
        success: true,
        review: {
          id: doc.id,
          ...doc.data(),
        },
      };
    } catch (error) {
      console.error("Error fetching review by user ID:", error);
      return {
        success: false,
        error: "Failed to fetch review",
      };
    }
  }

  /**
   * Get all approved reviews (public)
   */
  static async getApprovedReviews(limit = 10) {
    try {
      const snapshot = await db
        .collection("reviews")
        .where("isApproved", "==", true)
        .orderBy("submittedAt", "desc")
        .limit(limit)
        .get();

      const reviews = [];
      snapshot.forEach((doc) => {
        reviews.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return {
        success: true,
        reviews,
      };
    } catch (error) {
      console.error("Error fetching approved reviews:", error);
      return {
        success: false,
        error: "Failed to fetch reviews",
      };
    }
  }

  /**
   * Get all reviews (admin only)
   */
  static async getAllReviews(limit = 50, startAfter = null) {
    try {
      let query = db
        .collection("reviews")
        .orderBy("submittedAt", "desc")
        .limit(limit);

      if (startAfter) {
        query = query.startAfter(startAfter);
      }

      const snapshot = await query.get();

      const reviews = [];
      snapshot.forEach((doc) => {
        reviews.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return {
        success: true,
        reviews,
        hasMore: snapshot.docs.length === limit,
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      };
    } catch (error) {
      console.error("Error fetching all reviews:", error);
      return {
        success: false,
        error: "Failed to fetch reviews",
      };
    }
  }

  /**
   * Update review approval status (admin only)
   */
  static async updateReviewApproval(reviewId, isApproved) {
    try {
      await db
        .collection("reviews")
        .doc(reviewId)
        .update({
          isApproved: Boolean(isApproved),
          updatedAt: new Date(),
        });

      return {
        success: true,
        message: `Review ${
          isApproved ? "approved" : "unapproved"
        } successfully`,
      };
    } catch (error) {
      console.error("Error updating review approval:", error);
      return {
        success: false,
        error: "Failed to update review approval",
      };
    }
  }

  /**
   * Delete review (admin only)
   */
  static async deleteReview(reviewId) {
    try {
      await db.collection("reviews").doc(reviewId).delete();

      return {
        success: true,
        message: "Review deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting review:", error);
      return {
        success: false,
        error: "Failed to delete review",
      };
    }
  }

  /**
   * Get review statistics
   */
  static async getReviewStats() {
    try {
      const snapshot = await db.collection("reviews").get();

      let totalReviews = 0;
      let totalRating = 0;
      let ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let approvedCount = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        totalReviews++;
        totalRating += data.rating;
        ratingCounts[data.rating]++;

        if (data.isApproved) {
          approvedCount++;
        }
      });

      const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

      return {
        success: true,
        stats: {
          totalReviews,
          approvedReviews: approvedCount,
          pendingReviews: totalReviews - approvedCount,
          averageRating: parseFloat(averageRating.toFixed(2)),
          ratingCounts,
        },
      };
    } catch (error) {
      console.error("Error fetching review stats:", error);
      return {
        success: false,
        error: "Failed to fetch review statistics",
      };
    }
  }
}
