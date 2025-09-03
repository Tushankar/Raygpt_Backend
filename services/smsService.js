import dotenv from "dotenv";
import Twilio from "twilio";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

let client = null;
if (accountSid && authToken) {
  client = Twilio(accountSid, authToken);
} else {
  console.warn(
    "Twilio not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to enable SMS."
  );
}

function randDelay(minSec = 10, maxSec = 20) {
  const min = Math.max(0, Math.floor(minSec));
  const max = Math.max(min + 1, Math.floor(maxSec));
  const s = Math.floor(Math.random() * (max - min + 1)) + min;
  return s * 1000;
}

export async function sendSms({ to, body }) {
  if (!client) throw new Error("Twilio client not configured");
  if (!fromPhone) throw new Error("TWILIO_PHONE_NUMBER not configured");

  // Normalize recipient to E.164 where possible
  const originalTo = to;
  // Default to India country code if not explicitly configured (numbers like 9362... look Indian)
  const defaultCountry = process.env.DEFAULT_PHONE_COUNTRY_CODE || "91";
  function normalize(num) {
    if (!num) return num;
    const trimmed = String(num).trim();
    if (trimmed.startsWith("+")) return trimmed;
    if (defaultCountry) {
      // ensure defaultCountry starts with +
      const c = defaultCountry.startsWith("+")
        ? defaultCountry
        : `+${defaultCountry}`;
      return `${c}${trimmed}`;
    }
    return trimmed;
  }

  const toNormalized = normalize(to);
  if (toNormalized !== originalTo) {
    console.log(`Normalized phone ${originalTo} -> ${toNormalized}`);
  }
  try {
    const resp = await client.messages.create({
      body,
      from: fromPhone,
      to: toNormalized,
    });
    console.log(
      `Twilio message created. to=${toNormalized} (original=${originalTo}) sid=${resp.sid} status=${resp.status}`
    );
    return resp;
  } catch (err) {
    console.error(
      `Twilio send error for to=${toNormalized} (original=${originalTo}):`,
      err?.message || err
    );
    throw err;
  }
}

// Simple scheduler for short demo sequences. For production use a job queue.
export async function scheduleSmsSequence(
  { to, bookingLink, leadId },
  options = {}
) {
  // Default to randomized short delays 10-15 seconds for testing
  const minSec = options.minSec || 10;
  const maxSec = options.maxSec || 15;

  let link =
    bookingLink ||
    process.env.BOOKING_LINK ||
    `${process.env.FRONTEND_URL}/book-call`;

  // Add leadId parameter to the booking link for webhook matching
  if (leadId) {
    const separator = link.includes("?") ? "&" : "?";
    link = `${link}${separator}leadId=${encodeURIComponent(leadId)}`;
  }

  const bodies = [
    `Thanks for your interest — book a quick call: ${link}`,
    `Friendly reminder: still time to book: ${link}`,
    `Last nudge: we'd love to chat — book here: ${link}`,
  ];

  let cumulative = 0;
  bodies.forEach((body, idx) => {
    const dsec =
      options.delays?.[idx] ??
      Math.floor(Math.random() * (maxSec - minSec + 1)) + minSec;
    cumulative += dsec * 1000;
    setTimeout(async () => {
      try {
        await sendSms({ to, body });
        console.log(`SMS ${idx + 1} sent to ${to}`);
      } catch (err) {
        console.error(
          `Failed to send SMS ${idx + 1} to ${to}:`,
          err?.message || err
        );
      }
    }, cumulative + randDelay(1, 5));
  });

  return { scheduled: true, estimatedDurationMs: cumulative };
}

export default { sendSms, scheduleSmsSequence };
