import express from "express";
import { PackageService } from "../services/packageService.js";

const router = express.Router();

// GET /api/packages - list
router.get("/", async (req, res) => {
  try {
    const result = await PackageService.listPackages();
    if (result.success)
      return res.json({ success: true, packages: result.data });
    return res.status(400).json({ success: false, error: result.error });
  } catch (err) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/packages - create
router.post("/", async (req, res) => {
  try {
    const payload = req.body;
    const result = await PackageService.createPackage(payload);
    if (result.success)
      return res.status(201).json({ success: true, package: result.data });
    return res.status(400).json({ success: false, error: result.error });
  } catch (err) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PUT /api/packages/:id - update
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const result = await PackageService.updatePackage(id, payload);
    if (result.success) return res.json({ success: true });
    return res.status(400).json({ success: false, error: result.error });
  } catch (err) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// DELETE /api/packages/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await PackageService.deletePackage(id);
    if (result.success) return res.json({ success: true });
    return res.status(400).json({ success: false, error: result.error });
  } catch (err) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
