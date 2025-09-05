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

// Convert days to milliseconds
function daysToMs(days) {
  return days * 24 * 60 * 60 * 1000;
}

// Simple scheduler for SMS sequences with Ray's Healthy Living branding
export async function scheduleSmsSequence(
  { to, name, bookingLink, leadId },
  options = {}
) {
  // Default timing: Day 1, Day 3, Day 7
  // For testing, use options.testMode = true to send every 30 seconds
  const isTestMode = options.testMode || false;

  let delays;
  if (isTestMode) {
    // For testing: 30 seconds, 1 minute, 90 seconds
    delays = [30000, 60000, 90000];
  } else {
    // Production: Day 1, Day 3, Day 7
    delays = [
      daysToMs(1), // 24 hours
      daysToMs(3), // 72 hours
      daysToMs(7), // 168 hours (1 week)
    ];
  }

  let link =
    bookingLink ||
    process.env.BOOKING_LINK ||
    `${process.env.FRONTEND_URL}/book-call`;

  // Add leadId parameter to the booking link for webhook matching
  if (leadId) {
    const separator = link.includes("?") ? "&" : "?";
    link = `${link}${separator}leadId=${encodeURIComponent(leadId)}`;
  }

  // SMS messages under 160 characters with Ray's Healthy Living branding
  const messages = [
    // Day 1 - Quick Reminder
    `Hi ${
      name || "there"
    }, this is Ray's Healthy Living 👋. Thanks for completing your questionnaire — you're almost there! ✅ Book your free consultation: ${link}`,

    // Day 3 - Benefits Prompt
    `${
      name || "Hi there"
    }, your Ray's Healthy Living consultation is where you'll learn how to own a store, partner with us, or join the movement. Spots are filling — secure your time: ${link}`,

    // Day 7 - Last Call
    `Final reminder: Ray's Healthy Living consultation spots are closing this week. Don't miss your chance to be part of the next wave in wellness. Book here: ${link}`,
  ];

  messages.forEach((message, idx) => {
    const delay = delays[idx];
    setTimeout(async () => {
      try {
        await sendSms({ to, body: message });
        console.log(
          `Ray's Healthy Living SMS ${idx + 1} sent to ${to} (Day ${
            idx === 0 ? 1 : idx === 1 ? 3 : 7
          })`
        );
      } catch (err) {
        console.error(
          `Failed to send Ray's Healthy Living SMS ${idx + 1} to ${to}:`,
          err?.message || err
        );
      }
    }, delay);
  });

  const totalDuration = Math.max(...delays);
  return {
    scheduled: true,
    estimatedDurationMs: totalDuration,
    schedule: isTestMode ? "Test mode: 30s, 1m, 90s" : "Day 1, Day 3, Day 7",
    messageCount: messages.length,
  };
}

export default { sendSms, scheduleSmsSequence };
