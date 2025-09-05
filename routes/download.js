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
    // Define the path to the manual file
    const manualPath = path.join(
      __dirname,
      "../public/manuals/free-business-opportunity-manual.pdf"
    );

    // Check if file exists
    if (!fs.existsSync(manualPath)) {
      console.error("Manual file not found at:", manualPath);
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

export default router;
