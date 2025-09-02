import express from "express";
import { db } from "../config/firebase.js";

const router = express.Router();

// GET /api/debug/prequal - List all prequalifications with their booking status
router.get("/prequal", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const snap = await db
      .collection("prequalifications")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const items = [];
    snap.forEach((doc) => {
      const data = doc.data();
      items.push({
        id: doc.id,
        leadId: data.leadId,
        name: data.name,
        email: data.email,
        appointmentBooked: data.appointmentBooked || false,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    // Generate HTML for easy viewing
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Pre-qualification Debug</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .booked { background-color: #d4edda; }
          .not-booked { background-color: #f8d7da; }
          .mark-btn { padding: 4px 8px; cursor: pointer; }
        </style>
      </head>
      <body>
        <h1>Pre-qualification Debug Dashboard</h1>
        <p>Total records: ${items.length}</p>
        
        <table>
          <tr>
            <th>Lead ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Appointment Booked</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
          ${items
            .map(
              (item) => `
            <tr class="${item.appointmentBooked ? "booked" : "not-booked"}">
              <td>${item.leadId}</td>
              <td>${item.name || "N/A"}</td>
              <td>${item.email}</td>
              <td>${item.appointmentBooked ? "✅ Yes" : "❌ No"}</td>
              <td>${new Date(item.createdAt).toLocaleDateString()}</td>
              <td>
                ${
                  !item.appointmentBooked
                    ? `
                  <button class="mark-btn" onclick="markAsBooked('${item.leadId}')">
                    Mark as Booked
                  </button>
                `
                    : "✅ Booked"
                }
              </td>
            </tr>
          `
            )
            .join("")}
        </table>

        <script>
          function markAsBooked(leadId) {
            if (confirm('Mark this appointment as booked?')) {
              fetch('/api/calendly/mark-booked', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId })
              })
              .then(r => r.json())
              .then(data => {
                if (data.success) {
                  alert('Marked as booked!');
                  location.reload();
                } else {
                  alert('Error: ' + data.error);
                }
              })
              .catch(e => alert('Error: ' + e.message));
            }
          }
        </script>
      </body>
      </html>
    `;

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (err) {
    console.error("Debug prequal error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/debug/reset-booking/:id - Reset booking status for testing
router.post("/reset-booking/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await db.collection("prequalifications").doc(id).update({
      appointmentBooked: false,
      updatedAt: new Date().toISOString(),
    });

    res.json({ success: true, message: `Reset booking status for ${id}` });
  } catch (err) {
    console.error("Reset booking error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
