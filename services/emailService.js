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

// The email sequence content with HTML templates (Ray's Healthy Living branded)
const EMAIL_SEQUENCE = [
  {
    subject: "Your Vitamin Store Opportunity Manual — Here it is",
    render: (name, email) => {
      const downloadUrl = `${FRONTEND_URL}/api/download/manual`;
      const plain = `Hi ${
        name || "there"
      },\n\nThanks for signing up — your Vitamin Store Opportunity Manual is ready. Download here: ${downloadUrl}\n\nBest,\nRay's Healthy Living Team`;
      const html = `
        <div style="font-family: Arial,Helvetica,sans-serif;color:#2c2c2c;background:#ffffff;padding:30px;border-radius:8px;max-width:600px;margin:0 auto;border:1px solid #e0e0e0">
          <h2 style="color:#E4631F;margin:0 0 20px;font-size:24px;font-weight:bold">Ray's Healthy Living — Your Manual is ready</h2>
          <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 15px">Hi ${
            name || "there"
          },</p>
          <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 20px">Thanks for requesting the Vitamin Store Opportunity Manual. You can download it now:</p>
          <div style="text-align:center;margin:25px 0">
            <a href="${downloadUrl}" style="background:#E4631F;color:#ffffff;padding:15px 25px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block">📥 Download the Manual</a>
          </div>
          <p style="color:#666666;font-size:14px;line-height:1.5;margin:20px 0">If the button doesn't work, copy and paste this link into your browser: ${downloadUrl}</p>
          <p style="margin-top:30px;color:#2c2c2c;font-size:16px">— Ray's Healthy Living Team</p>
        </div>`;
      return { text: plain, html };
    },
  },
  {
    subject: "Why Choose Ray's Healthy Living?",
    render: (name) => {
      const plain = `Hi ${
        name || "there"
      },\n\nAt Ray's Healthy Living, we've built a system designed for real people who want to own a wellness business without years of trial and error. Our proven framework makes it possible for anyone with passion and drive to succeed.\n\nOur 4 Pillars:\n• System – Step-by-step operations with no guesswork\n• Growth – A business model designed to expand and scale\n• Strategy – Backed by years of experience in supplements and retail\n• Legacy – Build something that lasts for your family and community\n\nBest,\nRay's Healthy Living`;
      const html = `
        <div style="font-family: Arial,Helvetica,sans-serif;color:#ffffff;background:linear-gradient(180deg,#1a1a1a,#0f0f0f);padding:30px;border-radius:8px;max-width:600px;margin:0 auto;border:1px solid #333">
          <h2 style="color:#E4631F;margin:0 0 20px;font-size:24px;font-weight:bold">Why Choose Ray's Healthy Living?</h2>
          <p style="color:#f0f0f0;font-size:16px;line-height:1.6;margin:0 0 15px">Hi ${
            name || "there"
          },</p>
          <p style="color:#e0e0e0;font-size:16px;line-height:1.6;margin:0 0 25px">At Ray's Healthy Living, we've built a system designed for real people who want to own a wellness business without years of trial and error. Our proven framework makes it possible for anyone with passion and drive to succeed.</p>
          <div style="margin: 25px 0;">
            <h3 style="color:#E4631F; margin-bottom: 15px;font-size:20px;font-weight:bold">Our 4 Pillars:</h3>
            <p style="color:#e0e0e0; margin: 12px 0;font-size:16px;line-height:1.5"><strong style="color:#E4631F">•</strong> <strong style="color:#ffffff">System</strong> – Step-by-step operations with no guesswork.</p>
            <p style="color:#e0e0e0; margin: 12px 0;font-size:16px;line-height:1.5"><strong style="color:#E4631F">•</strong> <strong style="color:#ffffff">Growth</strong> – A business model designed to expand and scale.</p>
            <p style="color:#e0e0e0; margin: 12px 0;font-size:16px;line-height:1.5"><strong style="color:#E4631F">•</strong> <strong style="color:#ffffff">Strategy</strong> – Backed by years of experience in supplements and retail.</p>
            <p style="color:#e0e0e0; margin: 12px 0;font-size:16px;line-height:1.5"><strong style="color:#E4631F">•</strong> <strong style="color:#ffffff">Legacy</strong> – Build something that lasts for your family and community.</p>
          </div>
          <p style="margin-top:30px;color:#cccccc;font-size:16px">— Ray's Healthy Living</p>
        </div>`;
      return { text: plain, html };
    },
  },
  {
    subject: "From Family Business to Scalable System",
    render: (name) => {
      const plain = `Hi ${
        name || "there"
      },\n\nThis journey started with a family dream. Founder Rayman Khan helped his mother establish two successful vitamin stores and later built his own thriving operation. Through those experiences, he created a repeatable, scalable system that others can follow.\n\nToday, that system has grown into Ray's Healthy Living — a brand that equips you with everything you need to open your own store, serve your community, and build a legacy of health.\n\nBest,\nRay's Healthy Living`;
      const html = `
        <div style="font-family: Arial,Helvetica,sans-serif;color:#2c2c2c;background:#ffffff;padding:30px;border-radius:8px;max-width:600px;margin:0 auto;border:1px solid #e0e0e0">
          <h2 style="color:#E4631F;margin:0 0 20px;font-size:24px;font-weight:bold">From Family Business to Scalable System</h2>
          <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 15px">Hi ${
            name || "there"
          },</p>
          <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 20px">This journey started with a family dream. Founder Rayman Khan helped his mother establish two successful vitamin stores and later built his own thriving operation. Through those experiences, he created a repeatable, scalable system that others can follow.</p>
          <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 20px">Today, that system has grown into Ray's Healthy Living — a brand that equips you with everything you need to open your own store, serve your community, and build a legacy of health.</p>
          <p style="margin-top:30px;color:#2c2c2c;font-size:16px">— Ray's Healthy Living</p>
        </div>`;
      return { text: plain, html };
    },
  },
  {
    subject: "Here's What You Receive",
    render: (name) => {
      const plain = `Hi ${
        name || "there"
      },\n\nHere's what you receive with Ray's Healthy Living:\n\n• Opportunity Manual – Your step-by-step blueprint to start\n• Proven Product Line – Access to over 1,000 wellness products\n• Store Setup Systems – Layout, inventory, and operations guidance\n• Training & Mentorship – Learn directly from those who've done it\n• Community & Support – Join a network of store owners and visionaries\n\nYou don't need prior business experience — just passion and the right system. We'll handle the framework. You bring the drive.\n\nBest,\nRay's Healthy Living`;
      const html = `
        <div style="font-family: Arial,Helvetica,sans-serif;color:#ffffff;background:linear-gradient(180deg,#1a1a1a,#0f0f0f);padding:30px;border-radius:8px;max-width:600px;margin:0 auto;border:1px solid #333">
          <h2 style="color:#E4631F;margin:0 0 20px;font-size:24px;font-weight:bold">Here's What You Receive</h2>
          <p style="color:#f0f0f0;font-size:16px;line-height:1.6;margin:0 0 25px">Hi ${
            name || "there"
          },</p>
          <div style="margin: 25px 0;">
            <p style="color:#e0e0e0; margin: 15px 0;font-size:16px;line-height:1.5"><strong style="color:#E4631F">•</strong> <strong style="color:#ffffff">Opportunity Manual</strong> – Your step-by-step blueprint to start.</p>
            <p style="color:#e0e0e0; margin: 15px 0;font-size:16px;line-height:1.5"><strong style="color:#E4631F">•</strong> <strong style="color:#ffffff">Proven Product Line</strong> – Access to over 1,000 wellness products.</p>
            <p style="color:#e0e0e0; margin: 15px 0;font-size:16px;line-height:1.5"><strong style="color:#E4631F">•</strong> <strong style="color:#ffffff">Store Setup Systems</strong> – Layout, inventory, and operations guidance.</p>
            <p style="color:#e0e0e0; margin: 15px 0;font-size:16px;line-height:1.5"><strong style="color:#E4631F">•</strong> <strong style="color:#ffffff">Training & Mentorship</strong> – Learn directly from those who've done it.</p>
            <p style="color:#e0e0e0; margin: 15px 0;font-size:16px;line-height:1.5"><strong style="color:#E4631F">•</strong> <strong style="color:#ffffff">Community & Support</strong> – Join a network of store owners and visionaries.</p>
          </div>
          <p style="color:#e0e0e0;font-style:italic;font-size:16px;line-height:1.6;margin:20px 0;padding:15px;background:rgba(228,99,31,0.1);border-left:3px solid #E4631F">You don't need prior business experience — just passion and the right system. We'll handle the framework. You bring the drive.</p>
          <p style="color:#cccccc;font-size:16px;margin-top:30px">— Ray's Healthy Living</p>
        </div>`;
      return { text: plain, html };
    },
  },
  {
    subject: "Why Vitamin Stores? Why Now?",
    render: (name) => {
      const plain = `Hi ${
        name || "there"
      },\n\nThe health and wellness industry is booming. Consumers are investing more than ever in supplements, natural products, and holistic health solutions. With global supplement sales projected to grow by billions in the coming years, now is the time to position yourself in this fast-growing market.\n\nRay's Healthy Living provides the platform, products, and systems to help you tap into this opportunity with confidence.\n\nBest,\nRay's Healthy Living`;
      const html = `
        <div style="font-family: Arial,Helvetica,sans-serif;color:#2c2c2c;background:#ffffff;padding:30px;border-radius:8px;max-width:600px;margin:0 auto;border:1px solid #e0e0e0">
          <h2 style="color:#E4631F;margin:0 0 20px;font-size:24px;font-weight:bold">Why Vitamin Stores? Why Now?</h2>
          <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 15px">Hi ${
            name || "there"
          },</p>
          <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 20px">The health and wellness industry is booming. Consumers are investing more than ever in supplements, natural products, and holistic health solutions. With global supplement sales projected to grow by billions in the coming years, now is the time to position yourself in this fast-growing market.</p>
          <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 20px">Ray's Healthy Living provides the platform, products, and systems to help you tap into this opportunity with confidence.</p>
          <p style="margin-top:30px;color:#2c2c2c;font-size:16px">— Ray's Healthy Living</p>
        </div>`;
      return { text: plain, html };
    },
  },
  {
    subject: "Claim Your Free Manual & Stay Connected",
    render: (name) => {
      const downloadUrl = `${FRONTEND_URL}/api/download/manual`;
      const plain = `Hi ${
        name || "there"
      },\n\nWhen you signed up, you received:\n• The full Vitamin Store Business Opportunity Manual\n• Weekly insights on health and wellness entrepreneurship\n• Exclusive invitations to webinars and info sessions\n\nManual link: ${downloadUrl}\n\nBest,\nRay's Healthy Living`;
      const html = `
        <div style="font-family: Arial,Helvetica,sans-serif;color:#ffffff;background:linear-gradient(180deg,#1a1a1a,#0f0f0f);padding:30px;border-radius:8px;max-width:600px;margin:0 auto;border:1px solid #333">
          <h2 style="color:#E4631F;margin:0 0 20px;font-size:24px;font-weight:bold">Claim Your Free Manual & Stay Connected</h2>
          <p style="color:#f0f0f0;font-size:16px;line-height:1.6;margin:0 0 15px">Hi ${
            name || "there"
          },</p>
          <p style="color:#e0e0e0;font-size:16px;line-height:1.6;margin:0 0 20px">When you signed up, you received:</p>
          <div style="margin: 20px 0;">
            <p style="color:#e0e0e0; margin: 12px 0;font-size:16px;line-height:1.5"><strong style="color:#E4631F">•</strong> The full Vitamin Store Business Opportunity Manual</p>
            <p style="color:#e0e0e0; margin: 12px 0;font-size:16px;line-height:1.5"><strong style="color:#E4631F">•</strong> Weekly insights on health and wellness entrepreneurship</p>
            <p style="color:#e0e0e0; margin: 12px 0;font-size:16px;line-height:1.5"><strong style="color:#E4631F">•</strong> Exclusive invitations to webinars and info sessions</p>
          </div>
          <div style="text-align:center;margin:25px 0">
            <a href="${downloadUrl}" style="background:#E4631F;color:#ffffff;padding:15px 25px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block">👉 Yes, Send Me the Manual</a>
          </div>
          <p style="color:#cccccc;font-size:16px;margin-top:30px">— Ray's Healthy Living</p>
        </div>`;
      return { text: plain, html };
    },
  },
  {
    subject: "Ready to Take the Next Step?",
    render: (name) => {
      const scheduleUrl = `${FRONTEND_URL}/book-call`;
      const plain = `Hi ${
        name || "there"
      },\n\nEvery successful business starts with a single step. For you, that step is scheduling a free consultation call. On this call, we'll discuss your goals, walk you through the system, and show you how to launch your own store.\n\nBook your call: ${scheduleUrl}\n\nSpaces are limited — secure your spot today and start building your legacy with Ray's Healthy Living.\n\nBest,\nRay's Healthy Living`;
      const html = `
        <div style="font-family: Arial,Helvetica,sans-serif;color:#2c2c2c;background:#ffffff;padding:30px;border-radius:8px;max-width:600px;margin:0 auto;border:1px solid #e0e0e0">
          <h2 style="color:#E4631F;margin:0 0 20px;font-size:24px;font-weight:bold">Ready to Take the Next Step?</h2>
          <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 15px">Hi ${
            name || "there"
          },</p>
          <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 20px">Every successful business starts with a single step. For you, that step is scheduling a free consultation call. On this call, we'll discuss your goals, walk you through the system, and show you how to launch your own store.</p>
          <div style="text-align:center;margin:30px 0">
            <a href="${scheduleUrl}" style="background:#E4631F;color:#ffffff;padding:18px 30px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:18px;display:inline-block">👉 Book My Free Consultation</a>
          </div>
          <p style="color:#666666;font-style:italic;font-size:16px;line-height:1.6;margin:20px 0;text-align:center;padding:15px;background:#f9f9f9;border-radius:6px">Spaces are limited — secure your spot today and start building your legacy with Ray's Healthy Living.</p>
          <p style="margin-top:30px;color:#2c2c2c;font-size:16px">— Ray's Healthy Living</p>
        </div>`;
      return { text: plain, html };
    },
  },
];

// Send only the first email (manual with download) immediately
export async function sendFirstEmail({ email, name }) {
  try {
    const firstEmail = EMAIL_SEQUENCE[0];
    const rendered = firstEmail.render(name, email);
    
    await sendMail({
      to: email,
      subject: firstEmail.subject,
      text: rendered.text,
      html: rendered.html,
    });
    
    console.log(`First email (manual) sent to ${email}`);
    return { success: true, emailSent: firstEmail.subject };
  } catch (err) {
    console.error(`Failed to send first email to ${email}:`, err?.message || err);
    throw err;
  }
}

// Schedule the remaining email sequence (emails 2-7) after user engagement
export async function scheduleRemainingEmails({ email, name }, options = {}) {
  // For testing, use options.testMode = true to send every 30 seconds
  const isTestMode = options.testMode || false;

  // Skip the first email (index 0) and schedule the remaining emails
  const remainingEmails = EMAIL_SEQUENCE.slice(1);

  // Email timing: Day 1, Day 2, Day 3, Day 4, Day 5, Day 6
  let emailDelays;
  if (isTestMode) {
    // For testing: 30s, 1m, 1m30s, 2m, 2m30s, 3m
    emailDelays = [30000, 60000, 90000, 120000, 150000, 180000];
  } else {
    // Production: 1 day, 2 days, 3 days, 4 days, 5 days, 6 days
    const dayInMs = 24 * 60 * 60 * 1000;
    emailDelays = [
      dayInMs,
      2 * dayInMs,
      3 * dayInMs,
      4 * dayInMs,
      5 * dayInMs,
      6 * dayInMs,
    ];
  }

  // Schedule each remaining email with its specific delay
  remainingEmails.forEach((item, idx) => {
    const delay = emailDelays[idx] || 0;

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
          `Email ${idx + 2} sent to ${email} on day ${idx + 1} (subject: ${
            item.subject
          })`
        );
      } catch (err) {
        console.error(
          `Failed to send email ${idx + 2} to ${email}:`,
          err?.message || err
        );
      }
    }, delay);
  });

  const totalDurationDays = isTestMode ? "3 minutes" : "6 days";
  return {
    scheduled: true,
    emailCount: remainingEmails.length,
    duration: totalDurationDays,
    timing: isTestMode
      ? "Test mode: every 30 seconds starting in 30s"
      : "Days 1-6",
  };
}

// Legacy function - now only sends first email
export async function scheduleEmailSequence({ email, name }, options = {}) {
  return await sendFirstEmail({ email, name });
}

export default { sendMail, scheduleEmailSequence, sendFirstEmail, scheduleRemainingEmails };
