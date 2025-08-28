import express from "express";
import { BusinessManualService } from "../services/businessManualService.js";

const router = express.Router();

// POST /api/business-manual/submit - Submit business manual request
router.post("/submit", async (req, res) => {
  try {
    const submissionData = req.body;

    // Basic validation
    if (!submissionData.userId || !submissionData.businessName) {
      return res.status(400).json({
        success: false,
        error: "User ID and business name are required",
      });
    }

    const result = await BusinessManualService.submitBusinessManual(
      submissionData
    );

    if (result.success) {
      res.status(201).json({ success: true, submission: result.data });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/business-manual/submissions/:id - Get submission by ID
router.get("/submissions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await BusinessManualService.getSubmissionById(id);

    if (result.success) {
      res.json({ success: true, submission: result.data });
    } else {
      res.status(404).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/business-manual/user/:userId - Get submissions by user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    const result = await BusinessManualService.getSubmissionsByUser(
      userId,
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

// PUT /api/business-manual/submissions/:id/status - Update submission status
router.put("/submissions/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ...additionalData } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: "Status is required",
      });
    }

    const result = await BusinessManualService.updateSubmissionStatus(
      id,
      status,
      additionalData
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

// POST /api/business-manual/response - Create manual response
router.post("/response", async (req, res) => {
  try {
    const responseData = req.body;

    // Basic validation
    if (!responseData.submissionId || !responseData.userId) {
      return res.status(400).json({
        success: false,
        error: "Submission ID and User ID are required",
      });
    }

    const result = await BusinessManualService.createManualResponse(
      responseData
    );

    if (result.success) {
      res.status(201).json({ success: true, response: result.data });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/business-manual/response/submission/:submissionId - Get response by submission ID
router.get("/response/submission/:submissionId", async (req, res) => {
  try {
    const { submissionId } = req.params;
    const result = await BusinessManualService.getResponseBySubmissionId(
      submissionId
    );

    if (result.success) {
      res.json({ success: true, response: result.data });
    } else {
      res.status(404).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/business-manual/responses/user/:userId - Get responses by user
router.get("/responses/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    const result = await BusinessManualService.getResponsesByUser(
      userId,
      parseInt(limit)
    );

    if (result.success) {
      res.json({ success: true, responses: result.data });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/business-manual/pending - Get pending submissions (admin)
router.get("/pending", async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const result = await BusinessManualService.getPendingSubmissions(
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

// POST /api/business-manual/generate - Generate business manual
router.post("/generate", async (req, res) => {
  try {
    const submissionData = req.body;
    console.log("[Generate Route] Received request:", {
      businessName: submissionData.businessName,
      userId: submissionData.userId,
      hasId: !!submissionData.id,
    });

    // Basic validation
    if (!submissionData || !submissionData.businessName) {
      return res.status(400).json({
        success: false,
        error: "Submission data with business name is required",
      });
    }

    // First, create a submission record if it doesn't exist
    let submission;
    if (!submissionData.id) {
      const submitResult = await BusinessManualService.submitBusinessManual(
        submissionData
      );
      if (!submitResult.success) {
        return res.status(400).json({
          success: false,
          error: submitResult.error || "Failed to create submission",
        });
      }
      submission = submitResult.data;
      submissionData.id = submission.id;
    }

    // Generate and store the business manual
    console.log(
      "[Generate Route] Starting generation for submission:",
      submissionData.id
    );
    const result = await BusinessManualService.generateAndStoreResponse(
      submissionData
    );

    if (result.success) {
      const responseObj = result.data;
      console.log("[Generate Route] Generation successful:", {
        responseId: responseObj?.id,
        hasContent: !!responseObj?.content,
        contentLength: (responseObj?.content || "").length,
      });

      // Return the persisted response id and content so the client can fetch it later
      res.status(200).json({
        success: true,
        response: responseObj?.content || null,
        responseId: responseObj?.id || null,
        submissionId: submissionData.id,
        responseObj,
      });
    } else {
      console.error("[Generate Route] Generation failed:", result.error);
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error("[Generate Route] Unexpected error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
