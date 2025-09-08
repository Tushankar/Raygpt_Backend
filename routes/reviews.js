import express from "express";
import { ReviewService } from "../services/reviewService.js";
import { authenticateJWT } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/reviews/submit
 * Submit a user review
 */
router.post("/submit", authenticateJWT, async (req, res) => {
  try {
    const { rating, comment, productType } = req.body;
    const userId = req.user?.uid;
    const userEmail = req.user?.email;
    const userName = req.user?.name || req.user?.displayName;

    // Debug logging
    console.log("Review submission debug:");
    console.log("req.body:", req.body);
    console.log("req.user:", req.user);
    console.log("userId:", userId);
    console.log("rating:", rating);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const result = await ReviewService.createReview({
      userId,
      userEmail,
      userName,
      rating,
      comment,
      productType,
    });

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error in review submission:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * GET /api/reviews/user/:userId
 * Get review by user ID
 * Note: This endpoint doesn't require authentication for easier client-side checking
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await ReviewService.getReviewByUserId(userId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error("Error fetching user review:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * GET /api/reviews/check/:userId
 * Check if user has submitted a review (lightweight endpoint)
 * Note: This endpoint doesn't require authentication for easier client-side checking
 */
router.get("/check/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await ReviewService.getReviewByUserId(userId);

    if (result.success) {
      res.json({
        success: true,
        hasReviewed: !!result.review,
        reviewId: result.review?.id || null,
      });
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error("Error checking user review:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * GET /api/reviews/public
 * Get approved reviews for public display
 */
router.get("/public", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const result = await ReviewService.getApprovedReviews(limit);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error("Error fetching public reviews:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * GET /api/reviews/stats
 * Get review statistics
 */
router.get("/stats", async (req, res) => {
  try {
    const result = await ReviewService.getReviewStats();

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error("Error fetching review stats:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Admin routes (require admin authentication)

/**
 * GET /api/reviews/admin/all
 * Get all reviews (admin only)
 */
router.get("/admin/all", authenticateJWT, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Admin access required",
      });
    }

    const limit = parseInt(req.query.limit) || 50;
    const startAfter = req.query.startAfter || null;

    const result = await ReviewService.getAllReviews(limit, startAfter);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * PUT /api/reviews/admin/:reviewId/approve
 * Update review approval status (admin only)
 */
router.put("/admin/:reviewId/approve", authenticateJWT, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Admin access required",
      });
    }

    const { reviewId } = req.params;
    const { isApproved } = req.body;

    const result = await ReviewService.updateReviewApproval(
      reviewId,
      isApproved
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error updating review approval:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * DELETE /api/reviews/admin/:reviewId
 * Delete review (admin only)
 */
router.delete("/admin/:reviewId", authenticateJWT, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Admin access required",
      });
    }

    const { reviewId } = req.params;

    const result = await ReviewService.deleteReview(reviewId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

export default router;
