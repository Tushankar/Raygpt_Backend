import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Configure transporter using env vars. For Gmail app password, ensure
// EMAIL_USER and EMAIL_PASS are set in the server environment (.env).
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
} else {
  console.warn(
    "⚠️ EMAIL_USER or EMAIL_PASS not set. Outgoing emails are disabled. Set these in your .env to enable email sends."
  );
}

function sendMail({ to, subject, text, html, attachments }) {
  if (!transporter) {
    console.warn(
      `sendMail skipped - transporter not configured. to=${to} subject=${subject}`
    );
    return Promise.resolve({ skipped: true });
  }

  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const mail = {
    from,
    to,
    subject,
    text: text || (html ? html.replace(/<[^>]+>/g, "") : "") || "",
    html: html || undefined,
    attachments: attachments || undefined,
  };

  return transporter.sendMail(mail);
}

// Utility to return a random delay between min and max (milliseconds)
function randDelay(minSec = 10, maxSec = 20) {
  const min = Math.max(0, Math.floor(minSec));
  const max = Math.max(min + 1, Math.floor(maxSec));
  const s = Math.floor(Math.random() * (max - min + 1)) + min;
  return s * 1000;
}

// Frontend URL for absolute links in emails
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// The email sequence content with HTML templates (RayGPT-branded)
const EMAIL_SEQUENCE = [
  {
    subject: "Your Vitamin Store Opportunity Manual — Here it is",
    render: (name, email) => {
      const downloadUrl = `${FRONTEND_URL}/manuals/free-business-opportunity-manual.pdf`;
      const plain = `Hi ${
        name || "there"
      },\n\nThanks for signing up — your Vitamin Store Opportunity Manual is ready. Download here: ${downloadUrl}\n\nBest,\nRayGPT Team`;
      const html = `
        <div style="font-family: Arial,Helvetica,sans-serif;color:#111;background:#fff;padding:18px;border-radius:6px">
          <h2 style="color:#E4631F;margin:0 0 8px">RayGPT — Your Manual is ready</h2>
          <p>Hi ${name || "there"},</p>
          <p>Thanks for requesting the Vitamin Store Opportunity Manual. You can download it now:</p>
          <p><a href="${downloadUrl}" style="background:#E4631F;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none">Download the Manual</a></p>
          <p style="color:#666">If the button doesn't work, copy and paste this link into your browser: ${downloadUrl}</p>
          <p style="margin-top:18px;color:#333">— RayGPT Team</p>
        </div>`;
      return { text: plain, html };
    },
  },
  {
    subject: "How one family turned passion into a business",
    render: (name) => {
      const plain = `Hi ${
        name || "there"
      },\n\nRay's story: how a family turned a small passion into a thriving vitamin store. Read the full story and the lessons that mattered most.\n\nWarmly,\nRayGPT`;
      const html = `
        <div style="font-family: Arial,Helvetica,sans-serif;color:#fff;background:linear-gradient(180deg,#111,#0d0d0d);padding:20px;border-radius:8px">
          <h2 style="color:#E4631F">Ray's Story</h2>
          <p style="color:#ddd">Hi ${name || "there"},</p>
          <p style="color:#ccc">A few years ago Ray and his family turned a simple idea into a thriving neighborhood vitamin store. They started small, focused on quality products, and built trust with local customers. The manual you received includes the operational steps they used — pricing, supplier selection, and simple customer-first tactics.</p>
          <p style="color:#ccc">If you'd like, reply to this email and we'll share the exact supplier checklist Ray used.</p>
          <p style="margin-top:12px;color:#aaa">— RayGPT</p>
        </div>`;
      return { text: plain, html };
    },
  },
  {
    subject: "From idea to thriving store — case study & results",
    render: (name) => {
      const plain = `Hi ${
        name || "there"
      },\n\nHere is a case study showing measurable results from one of our members who followed the manual.\n\nCheers,\nRayGPT`;
      const html = `
        <div style="font-family: Arial,Helvetica,sans-serif;color:#111;background:#fff;padding:20px;border-radius:8px">
          <h2 style="color:#E4631F">Case Study: Real Results</h2>
          <p>Hi ${name || "there"},</p>
          <p>See real numbers and concrete steps from a store that used our manual to grow to a profitable operation in under 9 months. We break down traffic, conversion, and product mix so you can replicate the success.</p>
          <p style="color:#666">Want the full case study PDF? Reply and we'll send it over.</p>
          <p style="margin-top:12px;color:#333">— RayGPT</p>
        </div>`;
      return { text: plain, html };
    },
  },
  {
    subject: "Why the wellness industry is booming (and how you can join)",
    render: (name) => {
      const plain = `Hi ${
        name || "there"
      },\n\nShort industry briefing: market size, trends, and why now is a good time to start.\n\nRegards,\nRayGPT`;
      const html = `
        <div style="font-family: Arial,Helvetica,sans-serif;color:#fff;background:linear-gradient(180deg,#111,#0d0d0d);padding:20px;border-radius:8px">
          <h2 style="color:#E4631F">Why Vitamin Stores Now</h2>
          <p>Hi ${name || "there"},</p>
          <p style="color:#ccc">Demand for wellness products is up. Consumers are willing to spend on supplements, and local specialty stores are trusted curators. The manual includes quick-win merchandising and marketing tactics to capture local market share.</p>
          <p style="color:#aaa">— RayGPT</p>
        </div>`;
      return { text: plain, html };
    },
  },
  {
    subject: "Did you read your Vitamin Store Opportunity Manual yet?",
    render: (name) => {
      const downloadUrl = `${FRONTEND_URL}/manuals/free-business-opportunity-manual.pdf`;
      const plain = `Hi ${
        name || "there"
      },\n\nQuick recap and link: ${downloadUrl}\n\nBest,\nRayGPT`;
      const html = `
        <div style="font-family: Arial,Helvetica,sans-serif;color:#111;background:#fff;padding:18px;border-radius:6px">
          <h2 style="color:#E4631F">Quick Recap</h2>
          <p>Hi ${name || "there"},</p>
          <p>Did you get a chance to read the manual? Here's the link again:</p>
          <p><a href="${downloadUrl}" style="background:#E4631F;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none">Open the Manual</a></p>
          <p style="margin-top:12px;color:#333">— RayGPT</p>
        </div>`;
      return { text: plain, html };
    },
  },
  {
    subject: "Let’s talk about building your store — invitation",
    render: (name) => {
      const scheduleUrl = `${FRONTEND_URL}/book-call`;
      const plain = `Hi ${
        name || "there"
      },\n\nJoin a call or webinar to walk through your plan: ${scheduleUrl}\n\nTalk soon,\nRayGPT`;
      const html = `
        <div style="font-family: Arial,Helvetica,sans-serif;color:#fff;background:linear-gradient(180deg,#111,#0d0d0d);padding:20px;border-radius:8px">
          <h2 style="color:#E4631F">Invitation: 1:1 Call or Webinar</h2>
          <p>Hi ${name || "there"},</p>
          <p>If you'd like help applying the manual to your situation, book a short call or join our next webinar.</p>
          <p><a href="${scheduleUrl}" style="background:#E4631F;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none">Book a Call</a></p>
          <p style="color:#aaa">— RayGPT</p>
        </div>`;
      return { text: plain, html };
    },
  },
  {
    subject: "Last chance to join this month’s group",
    render: (name) => {
      const plain = `Hi ${
        name || "there"
      },\n\nFinal reminder — limited spots available for this month's group. Reply if you want in.\n\nSincerely,\nRayGPT`;
      const html = `
        <div style="font-family: Arial,Helvetica,sans-serif;color:#111;background:#fff;padding:18px;border-radius:6px">
          <h2 style="color:#E4631F">Final Reminder</h2>
          <p>Hi ${name || "there"},</p>
          <p>This is the last call for this month's onboarding group. We have limited spots and would love to help you get started.</p>
          <p style="margin-top:12px;color:#333">— RayGPT</p>
        </div>`;
      return { text: plain, html };
    },
  },
];

// Schedule the sequence for a subscriber. This uses in-memory timers (setTimeout).
// For production reliability, use a job queue (Bull, Agenda) or an external scheduler.
export async function scheduleEmailSequence({ email, name }, options = {}) {
  const minSec = options.minSec || 10;
  const maxSec = options.maxSec || 20;

  // Dispatch emails sequentially with randomized gaps
  let cumulative = 0;
  EMAIL_SEQUENCE.forEach((item, idx) => {
    const delay = randDelay(minSec, maxSec);
    cumulative += delay;
    setTimeout(async () => {
      try {
        const rendered = item.render(name, email);
        // Ensure every email includes a booking link (use env fallback)
        const bookingLink =
          process.env.BOOKING_LINK || `${FRONTEND_URL}/book-call`;
        const textWithLink = `${rendered.text}\n\nBook a call: ${bookingLink}`;
        const htmlWithLink = `${rendered.html}\n<p style="margin-top:12px"><a href=\"${bookingLink}\" style=\"background:#E4631F;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none\">Book a Call</a></p>`;

        await sendMail({
          to: email,
          subject: item.subject,
          text: textWithLink,
          html: htmlWithLink,
        });
        console.log(
          `Email ${idx + 1} sent to ${email} (subject: ${item.subject})`
        );
      } catch (err) {
        console.error(
          `Failed to send email ${idx + 1} to ${email}:`,
          err?.message || err
        );
      }
    }, cumulative);
  });

  return { scheduled: true, estimatedDurationMs: cumulative };
}

export default { sendMail, scheduleEmailSequence };
