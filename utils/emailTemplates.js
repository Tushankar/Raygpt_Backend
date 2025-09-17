export function getStoreRequestStatusEmail(
  requestData,
  status,
  reviewNotes = "",
  clientBaseUrl = ""
) {
  const name = requestData.userName || "User";
  const store = requestData.storeName || "";

  const subject = `Your store request has been ${status}`;

  const text = `Hello ${name},\n\nYour store request for "${store}" has been ${status}.\n\n${
    reviewNotes ? "Notes: " + reviewNotes + "\n\n" : ""
  }If you have any questions, please reply to this email.\n\nBest regards,\nrayOne`;

  const logoUrl = clientBaseUrl
    ? `${clientBaseUrl.replace(/\/$/, "")}/logoPng.png`
    : "/logoPng.png";

  const html = `
		<div style="font-family: Arial, sans-serif; color: #111; line-height:1.4">
			<div style="text-align:center;margin-bottom:16px">
				<img src="${logoUrl}" alt="rayOne" style="max-width:140px;height:auto;display:block;margin:0 auto 8px" />
			</div>
			<h2 style="color:#333">Hello ${name},</h2>
			<p>Your store request for <strong>${store}</strong> has been <strong style="color: ${
    status === "approved" ? "#16a34a" : "#dc2626"
  }">${status}</strong>.</p>
			${reviewNotes ? `<p><strong>Notes:</strong><br/>${reviewNotes}</p>` : ""}
			<hr style="border:none;border-top:1px solid #eee;margin:16px 0" />
			<p style="font-size:14px;color:#666">If you have any questions, reply to this email.</p>
			<p style="margin:0;font-weight:600">rayOne</p>
		</div>
	`;

  return { subject, text, html };
}
