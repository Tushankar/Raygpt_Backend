import emailService from "./emailService.js";

// 3-email sequence for 'filled but didn't book' automation
// Uses emailService.sendMail for delivery. Delays are configurable (seconds).

function makeTemplates(name, bookingLink) {
  const link =
    bookingLink ||
    process.env.BOOKING_LINK ||
    `${process.env.FRONTEND_URL}/book-call`;

  const t1 = {
    subject: "Thanks — here's a quick next step",
    html: `
      <div style="font-family:Arial;color:#111;padding:12px">
        <h2 style="color:#E4631F">Quick next step</h2>
        <p>Hi ${name || "there"},</p>
        <p>Thanks for your interest. If you'd like to talk through your plan, book a short 15-minute call:</p>
        <p><a href="${link}" style="background:#E4631F;color:#fff;padding:8px 12px;border-radius:6px;text-decoration:none">Book a Call</a></p>
        <p style="color:#666;margin-top:12px">If this time doesn't work, reply and we'll find another slot.</p>
      </div>`,
    text: `Hi ${name || "there"},\nBook a short 15-minute call: ${link}`,
  };

  const t2 = {
    subject: "Still interested? Quick reminder",
    html: `
      <div style="font-family:Arial;color:#111;padding:12px">
        <h2 style="color:#E4631F">Friendly reminder</h2>
        <p>Hi ${name || "there"},</p>
        <p>We wanted to follow up in case you missed our earlier message. Here's the booking link again:</p>
    <p><a href="${link}" style="background:#E4631F;color:#fff;padding:8px 12px;border-radius:6px;text-decoration:none">Book a Call</a></p>
    <p style="color:#666;margin-top:12px">No pressure — just here to help if you're ready.</p>
      </div>`,
    text: `Hi ${name || "there"},\nReminder: book a short call: ${link}`,
  };

  const t3 = {
    subject: "Last chance to grab a quick call",
    html: `
      <div style="font-family:Arial;color:#111;padding:12px">
        <h2 style="color:#E4631F">Final nudge</h2>
        <p>Hi ${name || "there"},</p>
        <p>This is the last reminder from us — we'd love to help you get started. Book here:</p>
    <p><a href="${link}" style="background:#E4631F;color:#fff;padding:8px 12px;border-radius:6px;text-decoration:none">Book a Call</a></p>
    <p style="color:#666;margin-top:12px">If you'd like us to reach out another way, reply to this email.</p>
      </div>`,
    text: `Hi ${name || "there"},\nFinal reminder: book a call: ${link}`,
  };

  return [t1, t2, t3];
}

function randDelaySec(min = 10, max = 15) {
  const mn = Math.max(0, Math.floor(min));
  const mx = Math.max(mn + 1, Math.floor(max));
  return Math.floor(Math.random() * (mx - mn + 1)) + mn;
}

export async function scheduleThreeEmailSequence(
  { email, name, bookingLink },
  options = {}
) {
  // For quick testing use randomized delays of 10-15 seconds per message
  const minSec = options.minSec || 10;
  const maxSec = options.maxSec || 15;

  const templates = makeTemplates(
    name,
    bookingLink ||
      process.env.BOOKING_LINK ||
      `${process.env.FRONTEND_URL}/book-call`
  );

  let cumulative = 0;
  templates.forEach((tpl, idx) => {
    const dsec = options.delays?.[idx] ?? randDelaySec(minSec, maxSec);
    cumulative += dsec * 1000;
    setTimeout(async () => {
      try {
        await emailService.sendMail({
          to: email,
          subject: tpl.subject,
          html: tpl.html,
          text: tpl.text,
        });
        console.log(`Automation email ${idx + 1} sent to ${email}`);
      } catch (err) {
        console.error(
          `Failed to send automation email ${idx + 1} to ${email}:`,
          err?.message || err
        );
      }
    }, cumulative);
  });

  return { scheduled: true, estimatedDurationMs: cumulative };
}

export default { scheduleThreeEmailSequence };
