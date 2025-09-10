import { db } from "../config/firebase.js";

export class GoogleReviewsService {
  /**
   * Fetch reviews from Google Places API and store in Firestore
   */
  static async fetchAndStoreGoogleReviews() {
    try {
      const API_KEY = "AIzaSyDnwBHYVZjvlrU2FHW5ZxTs1VFPzNxXDWE";
      const PLACE_ID = "ChIJ5V5Yx4q5t4kRm7jPw3L4H3g";

      // Fetch data from Google Places API
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=name,rating,reviews&key=${API_KEY}`;

      console.log("Fetching Google reviews from:", url);

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "OK") {
        throw new Error(
          `Google Places API error: ${data.status} - ${
            data.error_message || "Unknown error"
          }`
        );
      }

      if (!data.result || !data.result.reviews) {
        throw new Error("No reviews found in Google Places API response");
      }

      const placeName = data.result.name || "Ray's Healthy Living";
      const reviews = data.result.reviews.slice(0, 5); // Get first 5 reviews

      console.log(`Found ${reviews.length} reviews for ${placeName}`);

      // Clear existing Google reviews first
      await this.clearExistingGoogleReviews();

      // Store each review in Firestore
      const batch = db.batch();
      const storedReviews = [];

      for (let i = 0; i < reviews.length; i++) {
        const review = reviews[i];
        const reviewDoc = {
          author_name: review.author_name,
          rating: review.rating,
          text: review.text,
          relative_time_description: review.relative_time_description,
          place_name: placeName,
          source: "google_places",
          isGoogleReview: true,
          isApproved: true, // Auto-approve Google reviews
          createdAt: new Date(),
          updatedAt: new Date(),
          // Add additional fields for sorting and display
          time: review.time ? new Date(review.time * 1000) : new Date(),
          profile_photo_url: review.profile_photo_url || null,
          author_url: review.author_url || null,
        };

        const docRef = db.collection("reviews").doc();
        batch.set(docRef, reviewDoc);

        storedReviews.push({
          id: docRef.id,
          ...reviewDoc,
        });
      }

      await batch.commit();

      console.log(`Successfully stored ${storedReviews.length} Google reviews`);

      return {
        success: true,
        message: `Fetched and stored ${storedReviews.length} reviews for ${placeName}.`,
        reviews: storedReviews,
        placeName: placeName,
      };
    } catch (error) {
      console.error("Error fetching Google reviews:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch Google reviews",
      };
    }
  }

  /**
   * Clear existing Google reviews from Firestore
   */
  static async clearExistingGoogleReviews() {
    try {
      const snapshot = await db
        .collection("reviews")
        .where("isGoogleReview", "==", true)
        .get();

      if (snapshot.empty) {
        console.log("No existing Google reviews to clear");
        return;
      }

      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`Cleared ${snapshot.docs.length} existing Google reviews`);
    } catch (error) {
      console.error("Error clearing existing Google reviews:", error);
      throw error;
    }
  }

  /**
   * Get all Google reviews from Firestore
   */
  static async getGoogleReviews(limit = 5) {
    try {
      const snapshot = await db
        .collection("reviews")
        .where("isGoogleReview", "==", true)
        .where("isApproved", "==", true)
        .orderBy("createdAt", "desc")
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
        reviews: reviews,
      };
    } catch (error) {
      console.error("Error fetching Google reviews from Firestore:", error);
      return {
        success: false,
        error: "Failed to fetch Google reviews",
      };
    }
  }

  /**
   * Get mixed reviews (both Google and user reviews)
   */
  static async getMixedReviews(limit = 10) {
    try {
      const snapshot = await db
        .collection("reviews")
        .where("isApproved", "==", true)
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();

      const reviews = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        reviews.push({
          id: doc.id,
          ...data,
          isGoogleReview: data.isGoogleReview || false,
        });
      });

      return {
        success: true,
        reviews: reviews,
      };
    } catch (error) {
      console.error("Error fetching mixed reviews:", error);
      return {
        success: false,
        error: "Failed to fetch reviews",
      };
    }
  }
}
