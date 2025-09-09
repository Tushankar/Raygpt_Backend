import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Download manual endpoint
router.get("/manual", (req, res) => {
  try {
    // Define multiple possible paths for the manual file (server paths first for production)
    const possiblePaths = [
      path.join(
        process.cwd(),
        "public/manuals/free-business-opportunity-manual.pdf"
      ),
      path.join(
        __dirname,
        "../public/manuals/free-business-opportunity-manual.pdf"
      ),
      path.join(
        process.cwd(),
        "client/public/manuals/free-business-opportunity-manual.pdf"
      ),
      path.join(
        __dirname,
        "../../client/public/manuals/free-business-opportunity-manual.pdf"
      ),
    ];

    let manualPath = null;
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        manualPath = testPath;
        break;
      }
    }

    // Check if file exists
    if (!manualPath) {
      console.error(
        "Manual file not found in any of the expected locations:",
        possiblePaths
      );
      return res.status(404).json({ error: "Manual file not found" });
    }

    // Set appropriate headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Ray-Healthy-Living-Business-Manual.pdf"'
    );
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    // Stream the file
    const fileStream = fs.createReadStream(manualPath);
    fileStream.pipe(res);

    fileStream.on("error", (error) => {
      console.error("Error streaming file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    });
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Download final manual endpoint
router.get("/final-manual", (req, res) => {
  try {
    // Define multiple possible paths for the final manual file (server paths first for production)
    const possiblePaths = [
      path.join(
        process.cwd(),
        "public/manuals/free-business-opportunity-manual-final.pdf"
      ),
      path.join(
        __dirname,
        "../public/manuals/free-business-opportunity-manual-final.pdf"
      ),
      path.join(
        process.cwd(),
        "client/public/manuals/free-business-opportunity-manual-final.pdf"
      ),
      path.join(
        __dirname,
        "../../client/public/manuals/free-business-opportunity-manual-final.pdf"
      ),
    ];

    let finalManualPath = null;
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        finalManualPath = testPath;
        break;
      }
    }

    // Check if file exists
    if (!finalManualPath) {
      console.error(
        "Final manual file not found in any of the expected locations:",
        possiblePaths
      );
      return res.status(404).json({ error: "Final manual file not found" });
    }

    // Set appropriate headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Ray-Healthy-Living-Final-Business-Manual.pdf"'
    );
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    // Stream the file
    const fileStream = fs.createReadStream(finalManualPath);
    fileStream.pipe(res);

    fileStream.on("error", (error) => {
      console.error("Error streaming final manual file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading final manual" });
      }
    });
  } catch (error) {
    console.error("Final manual download error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Test endpoint to check file availability
router.get("/test-files", (req, res) => {
  try {
    const testResults = {};

    // Test regular manual
    const regularPaths = [
      path.join(
        process.cwd(),
        "public/manuals/free-business-opportunity-manual.pdf"
      ),
      path.join(
        __dirname,
        "../public/manuals/free-business-opportunity-manual.pdf"
      ),
      path.join(
        process.cwd(),
        "client/public/manuals/free-business-opportunity-manual.pdf"
      ),
    ];

    testResults.regularManual = {
      found: false,
      paths: regularPaths.map((p) => ({
        path: p,
        exists: fs.existsSync(p),
      })),
    };

    for (const testPath of regularPaths) {
      if (fs.existsSync(testPath)) {
        testResults.regularManual.found = true;
        testResults.regularManual.foundAt = testPath;
        break;
      }
    }

    // Test final manual
    const finalPaths = [
      path.join(
        process.cwd(),
        "public/manuals/free-business-opportunity-manual-final.pdf"
      ),
      path.join(
        __dirname,
        "../public/manuals/free-business-opportunity-manual-final.pdf"
      ),
      path.join(
        process.cwd(),
        "client/public/manuals/free-business-opportunity-manual-final.pdf"
      ),
    ];

    testResults.finalManual = {
      found: false,
      paths: finalPaths.map((p) => ({
        path: p,
        exists: fs.existsSync(p),
      })),
    };

    for (const testPath of finalPaths) {
      if (fs.existsSync(testPath)) {
        testResults.finalManual.found = true;
        testResults.finalManual.foundAt = testPath;
        break;
      }
    }

    testResults.workingDirectory = process.cwd();
    testResults.serverPath = __dirname;

    res.json({
      success: true,
      results: testResults,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("File test error:", error);
    res.status(500).json({
      success: false,
      error: "Error testing file availability",
      details: error.message,
    });
  }
});

export default router;
