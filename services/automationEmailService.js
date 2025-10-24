import emailService from "./emailService.js";

// 3-email sequence for 'filled but didn't book' automation
// Day 1, Day 3, Day 7 timing with Ray's Healthy Living branded content

function makeTemplates(name, bookingLink, leadId, language = "en") {
  let link =
    bookingLink ||
    process.env.BOOKING_LINK ||
    `${process.env.FRONTEND_URL}/book-call`;

  // Add leadId parameter to the booking link for webhook matching
  if (leadId) {
    const separator = link.includes("?") ? "&" : "?";
    link = `${link}${separator}leadId=${encodeURIComponent(leadId)}`;
  }

  if (language === "es") {
    return makeSpanishTemplates(name, link);
  }

  const t1 = {
    subject:
      "You're almost there — finish booking your Ray's Healthy Living consultation",
    html: `
      <div style="font-family: Arial,Helvetica,sans-serif;color:#2c2c2c;background:#ffffff;padding:30px;border-radius:8px;max-width:600px;margin:0 auto;border:1px solid #e0e0e0">
        <h2 style="color:#E4631F;margin:0 0 20px;font-size:24px;font-weight:bold">You're almost there</h2>
        <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 15px">Hi ${
          name || "there"
        },</p>
        <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 20px">Thank you for completing your Ray's Healthy Living pre-qualification questionnaire. You're one step away from securing your free consultation.</p>
        <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 20px">This conversation is where we'll explore how Ray's Healthy Living can align with your goals and walk you through what ownership or partnership could look like.</p>
        <div style="text-align:center;margin:25px 0">
          <a href="${link}" style="background:#E4631F;color:#ffffff;padding:15px 25px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block">👉 Book your call now</a>
        </div>
        <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 20px">Spots are limited, and we don't want you to miss the chance to connect with us directly.</p>
        <p style="color:#2c2c2c;font-size:16px;margin-top:30px">We look forward to talking soon,<br>Ray's Healthy Living Team</p>
      </div>`,
    text: `Hi ${
      name || "there"
    },\n\nThank you for completing your Ray's Healthy Living pre-qualification questionnaire. You're one step away from securing your free consultation.\n\nThis conversation is where we'll explore how Ray's Healthy Living can align with your goals and walk you through what ownership or partnership could look like.\n\nBook your call now: ${link}\n\nSpots are limited, and we don't want you to miss the chance to connect with us directly.\n\nWe look forward to talking soon,\nRay's Healthy Living Team`,
  };

  const t2 = {
    subject: "Why your Ray's Healthy Living consultation matters",
    html: `
      <div style="font-family: Arial,Helvetica,sans-serif;color:#ffffff;background:linear-gradient(180deg,#1a1a1a,#0f0f0f);padding:30px;border-radius:8px;max-width:600px;margin:0 auto;border:1px solid #333">
        <h2 style="color:#E4631F;margin:0 0 20px;font-size:24px;font-weight:bold">Why your Ray's Healthy Living consultation matters</h2>
        <p style="color:#f0f0f0;font-size:16px;line-height:1.6;margin:0 0 15px">Hi ${
          name || "there"
        },</p>
        <p style="color:#e0e0e0;font-size:16px;line-height:1.6;margin:0 0 25px">We noticed you haven't booked your consultation yet. Here's why it's important:</p>
        <div style="margin: 25px 0;">
          <p style="color:#e0e0e0; margin: 15px 0;font-size:16px;line-height:1.5"><strong style="color:#E4631F">•</strong> You'll learn exactly how Ray's Healthy Living is expanding across North America.</p>
          <p style="color:#e0e0e0; margin: 15px 0;font-size:16px;line-height:1.5"><strong style="color:#E4631F">•</strong> You'll see how our proven systems support store owners and partners.</p>
          <p style="color:#e0e0e0; margin: 15px 0;font-size:16px;line-height:1.5"><strong style="color:#E4631F">•</strong> You'll find out if this is the right time for you to take part in the movement.</p>
        </div>
        <p style="color:#e0e0e0;font-size:16px;line-height:1.6;margin:20px 0">This is a no-obligation call designed to answer your questions and give you clarity.</p>
        <div style="text-align:center;margin:25px 0">
          <a href="${link}" style="background:#E4631F;color:#ffffff;padding:15px 25px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block">👉 Secure your consultation now</a>
        </div>
        <p style="color:#e0e0e0;font-size:16px;line-height:1.6;margin:0 0 20px">Your next step toward health, community, and growth starts here.</p>
        <p style="color:#cccccc;font-size:16px;margin-top:30px">To your success,<br>Ray's Healthy Living Team</p>
      </div>`,
    text: `Hi ${
      name || "there"
    },\n\nWe noticed you haven't booked your consultation yet. Here's why it's important:\n\n• You'll learn exactly how Ray's Healthy Living is expanding across North America.\n• You'll see how our proven systems support store owners and partners.\n• You'll find out if this is the right time for you to take part in the movement.\n\nThis is a no-obligation call designed to answer your questions and give you clarity.\n\nSecure your consultation now: ${link}\n\nYour next step toward health, community, and growth starts here.\n\nTo your success,\nRay's Healthy Living Team`,
  };

  const t3 = {
    subject: "Last chance to claim your consultation spot",
    html: `
      <div style="font-family: Arial,Helvetica,sans-serif;color:#2c2c2c;background:#ffffff;padding:30px;border-radius:8px;max-width:600px;margin:0 auto;border:1px solid #e0e0e0">
        <h2 style="color:#E4631F;margin:0 0 20px;font-size:24px;font-weight:bold">Last chance to claim your consultation spot</h2>
        <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 15px">Hi ${
          name || "there"
        },</p>
        <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 20px">Our consultation calendar is filling quickly, and we want to make sure you don't miss your opportunity.</p>
        <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 20px">This is your final reminder to schedule your free consultation with Ray's Healthy Living. After this week, we'll be shifting focus to new applicants.</p>
        <div style="text-align:center;margin:25px 0">
          <a href="${link}" style="background:#E4631F;color:#ffffff;padding:15px 25px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block">👉 Book your consultation today</a>
        </div>
        <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 20px">Don't let hesitation hold you back. This could be the step that changes your path forward.</p>
        <p style="color:#2c2c2c;font-size:16px;margin-top:30px">See you inside,<br>Ray's Healthy Living Team</p>
      </div>`,
    text: `Hi ${
      name || "there"
    },\n\nOur consultation calendar is filling quickly, and we want to make sure you don't miss your opportunity.\n\nThis is your final reminder to schedule your free consultation with Ray's Healthy Living. After this week, we'll be shifting focus to new applicants.\n\nBook your consultation today: ${link}\n\nDon't let hesitation hold you back. This could be the step that changes your path forward.\n\nSee you inside,\nRay's Healthy Living Team`,
  };

  return [t1, t2, t3];
}

function makeSpanishTemplates(name, link) {
  const t1 = {
    subject:
      "Ya casi llegas — termina de reservar tu consulta de Ray's Healthy Living",
    html: `
      <div style="font-family: Arial,Helvetica,sans-serif;color:#2c2c2c;background:#ffffff;padding:30px;border-radius:8px;max-width:600px;margin:0 auto;border:1px solid #e0e0e0">
        <h2 style="color:#E4631F;margin:0 0 20px;font-size:24px;font-weight:bold">Ya casi llegas</h2>
        <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 15px">Hola ${
          name || "amigo/a"
        },</p>
        <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 20px">Gracias por completar tu cuestionario de precalificación de Ray's Healthy Living. Estás a un paso de asegurar tu consulta gratuita.</p>
        <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 20px">Esta conversación es donde exploraremos cómo Ray's Healthy Living puede alinearse con tus objetivos y te guiaremos a través de cómo podría verse la propiedad o asociación.</p>
        <div style="text-align:center;margin:25px 0">
          <a href="${link}" style="background:#E4631F;color:#ffffff;padding:15px 25px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block">👉 Reserva tu llamada ahora</a>
        </div>
        <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 20px">Los espacios son limitados, y no queremos que pierdas la oportunidad de conectar directamente con nosotros.</p>
        <p style="color:#2c2c2c;font-size:16px;margin-top:30px">Esperamos hablar pronto,<br>Equipo de Ray's Healthy Living</p>
      </div>`,
    text: `Hola ${
      name || "amigo/a"
    },\n\nGracias por completar tu cuestionario de precalificación de Ray's Healthy Living. Estás a un paso de asegurar tu consulta gratuita.\n\nEsta conversación es donde exploraremos cómo Ray's Healthy Living puede alinearse con tus objetivos y te guiaremos a través de cómo podría verse la propiedad o asociación.\n\nReserva tu llamada ahora: ${link}\n\nLos espacios son limitados, y no queremos que pierdas la oportunidad de conectar directamente con nosotros.\n\nEsperamos hablar pronto,\nEquipo de Ray's Healthy Living`,
  };

  const t2 = {
    subject: "Por qué importa tu consulta de Ray's Healthy Living",
    html: `
      <div style="font-family: Arial,Helvetica,sans-serif;color:#ffffff;background:linear-gradient(180deg,#1a1a1a,#0f0f0f);padding:30px;border-radius:8px;max-width:600px;margin:0 auto;border:1px solid #333">
        <h2 style="color:#E4631F;margin:0 0 20px;font-size:24px;font-weight:bold">Por qué importa tu consulta de Ray's Healthy Living</h2>
        <p style="color:#f0f0f0;font-size:16px;line-height:1.6;margin:0 0 15px">Hola ${
          name || "amigo/a"
        },</p>
        <p style="color:#e0e0e0;font-size:16px;line-height:1.6;margin:0 0 25px">Notamos que aún no has reservado tu consulta. Aquí te explicamos por qué es importante:</p>
        <div style="margin: 25px 0;">
          <p style="color:#e0e0e0; margin: 15px 0;font-size:16px;line-height:1.5"><strong style="color:#E4631F">•</strong> Aprenderás exactamente cómo Ray's Healthy Living se está expandiendo por América del Norte.</p>
          <p style="color:#e0e0e0; margin: 15px 0;font-size:16px;line-height:1.5"><strong style="color:#E4631F">•</strong> Verás cómo nuestros sistemas probados apoyan a los dueños de tiendas y socios.</p>
          <p style="color:#e0e0e0; margin: 15px 0;font-size:16px;line-height:1.5"><strong style="color:#E4631F">•</strong> Descubrirás si este es el momento adecuado para que participes en el movimiento.</p>
        </div>
        <p style="color:#e0e0e0;font-size:16px;line-height:1.6;margin:20px 0">Esta es una llamada sin compromiso diseñada para responder tus preguntas y darte claridad.</p>
        <div style="text-align:center;margin:25px 0">
          <a href="${link}" style="background:#E4631F;color:#ffffff;padding:15px 25px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block">👉 Asegura tu consulta ahora</a>
        </div>
        <p style="color:#e0e0e0;font-size:16px;line-height:1.6;margin:0 0 20px">Tu próximo paso hacia la salud, comunidad y crecimiento comienza aquí.</p>
        <p style="color:#cccccc;font-size:16px;margin-top:30px">Para tu éxito,<br>Equipo de Ray's Healthy Living</p>
      </div>`,
    text: `Hola ${
      name || "amigo/a"
    },\n\nNotamos que aún no has reservado tu consulta. Aquí te explicamos por qué es importante:\n\n• Aprenderás exactamente cómo Ray's Healthy Living se está expandiendo por América del Norte.\n• Verás cómo nuestros sistemas probados apoyan a los dueños de tiendas y socios.\n• Descubrirás si este es el momento adecuado para que participes en el movimiento.\n\nEsta es una llamada sin compromiso diseñada para responder tus preguntas y darte claridad.\n\nAsegura tu consulta ahora: ${link}\n\nTu próximo paso hacia la salud, comunidad y crecimiento comienza aquí.\n\nPara tu éxito,\nEquipo de Ray's Healthy Living`,
  };

  const t3 = {
    subject: "Última oportunidad para reclamar tu lugar de consulta",
    html: `
      <div style="font-family: Arial,Helvetica,sans-serif;color:#2c2c2c;background:#ffffff;padding:30px;border-radius:8px;max-width:600px;margin:0 auto;border:1px solid #e0e0e0">
        <h2 style="color:#E4631F;margin:0 0 20px;font-size:24px;font-weight:bold">Última oportunidad para reclamar tu lugar de consulta</h2>
        <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 15px">Hola ${
          name || "amigo/a"
        },</p>
        <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 20px">Nuestro calendario de consultas se está llenando rápidamente, y queremos asegurarnos de que no pierdas tu oportunidad.</p>
        <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 20px">Este es tu recordatorio final para programar tu consulta gratuita con Ray's Healthy Living. Después de esta semana, cambiaremos nuestro enfoque a nuevos solicitantes.</p>
        <div style="text-align:center;margin:25px 0">
          <a href="${link}" style="background:#E4631F;color:#ffffff;padding:15px 25px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block">👉 Reserva tu consulta hoy</a>
        </div>
        <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 20px">No dejes que la indecisión te detenga. Este podría ser el paso que cambie tu camino hacia adelante.</p>
        <p style="color:#2c2c2c;font-size:16px;margin-top:30px">Nos vemos adentro,<br>Equipo de Ray's Healthy Living</p>
      </div>`,
    text: `Hola ${
      name || "amigo/a"
    },\n\nNuestro calendario de consultas se está llenando rápidamente, y queremos asegurarnos de que no pierdas tu oportunidad.\n\nEste es tu recordatorio final para programar tu consulta gratuita con Ray's Healthy Living. Después de esta semana, cambiaremos nuestro enfoque a nuevos solicitantes.\n\nReserva tu consulta hoy: ${link}\n\nNo dejes que la indecisión te detenga. Este podría ser el paso que cambie tu camino hacia adelante.\n\nNos vemos adentro,\nEquipo de Ray's Healthy Living`,
  };

  return [t1, t2, t3];
}

// Convert days to milliseconds
function daysToMs(days) {
  return days * 24 * 60 * 60 * 1000;
}

export async function scheduleThreeEmailSequence(
  { email, name, bookingLink, leadId, language = "en" },
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

  const templates = makeTemplates(
    name,
    bookingLink ||
      process.env.BOOKING_LINK ||
      `${process.env.FRONTEND_URL}/book-call`,
    leadId,
    language
  );

  console.log(
    `📧 Scheduling ${templates.length} automation emails for ${email} in ${language}`
  );

  templates.forEach((tpl, idx) => {
    const delay = delays[idx];
    setTimeout(async () => {
      try {
        console.log(
          `⏳ Sending automation email ${idx + 1}/${
            templates.length
          } to ${email} in ${language}...`
        );

        const result = await emailService.sendMail({
          to: email,
          subject: tpl.subject,
          html: tpl.html,
          text: tpl.text,
        });

        console.log(
          `✅ Automation email ${
            idx + 1
          } sent to ${email} in ${language} (Day ${
            idx === 0 ? 1 : idx === 1 ? 3 : 7
          }) - MessageId: ${result?.messageId || "unknown"}`
        );
      } catch (err) {
        console.error(
          `❌ Failed to send automation email ${idx + 1} to ${email}:`,
          err?.message || err
        );
        if (err.response) {
          console.error(`   SendGrid Error Code: ${err.response.statusCode}`);
          console.error(`   SendGrid Error Details:`, err.response.body);
        }
      }
    }, delay);
  });

  const totalDuration = Math.max(...delays);
  return {
    scheduled: true,
    emailCount: templates.length,
    estimatedDurationMs: totalDuration,
    schedule: isTestMode ? "Test mode: 30s, 1m, 90s" : "Day 1, Day 3, Day 7",
    details: `Automation emails will be sent to ${email} in ${language} language`,
  };
}

export default { scheduleThreeEmailSequence };
