import express from "express";
import { UserService } from "../services/userService.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = express.Router();

// Admin register
router.post("/admin/register", async (req, res) => {
  try {
    const { email, password, name, username } = req.body;
    const result = await UserService.registerAdmin({
      email,
      password,
      name,
      username,
    });

    if (result.success) {
      res.status(201).json({ success: true, admin: result.data });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// Admin login
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await UserService.adminLogin({ email, password });

    if (result.success) {
      res.json({
        success: true,
        user: result.data.user,
        token: result.data.token,
      });
    } else {
      res.status(401).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/users - Get all users (admin only)
router.get("/", authenticateAdmin, async (req, res) => {
  try {
    const { limit = 10, startAfter } = req.query;
    const result = await UserService.getAllUsers(parseInt(limit), startAfter);

    if (result.success) {
      res.json({ success: true, users: result.data });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/users/:id - Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await UserService.getUserById(id);

    if (result.success) {
      res.json({ success: true, user: result.data });
    } else {
      res.status(404).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/users/email/:email - Get user by email
router.get("/email/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const result = await UserService.getUserByEmail(email);

    if (result.success) {
      res.json({ success: true, user: result.data });
    } else {
      res.status(404).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/users - Create new user
router.post("/", async (req, res) => {
  try {
    const userData = req.body;

    // Basic validation
    if (!userData.email || !userData.name) {
      return res.status(400).json({
        success: false,
        error: "Email and name are required",
      });
    }

    const result = await UserService.createUser(userData);

    if (result.success) {
      res.status(201).json({ success: true, user: result.data });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PUT /api/users/:id - Update user
router.put("/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const result = await UserService.updateUser(id, updateData);

    if (result.success) {
      res.json({ success: true, user: result.data });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// DELETE /api/users/:id - Delete user
router.delete("/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await UserService.deleteUser(id);

    if (result.success) {
      res.json({ success: true, message: "User deleted successfully" });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PUT /api/users/:id/toggle-status - Toggle user active/inactive status
router.put("/:id/toggle-status", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await UserService.toggleUserStatus(id);

    if (result.success) {
      res.json({ success: true, user: result.data });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
