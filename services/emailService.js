import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

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
    // CRITICAL: Add timeout settings to prevent hanging in production
    connectionTimeout: 5000, // 5 seconds to connect
    socketTimeout: 5000, // 5 seconds for socket operations
    // Connection pool settings for better reliability
    pool: {
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 20000, // milliseconds for rate limiting
      rateLimit: 14, // max messages per rateDelta
    },
  });

  // Verify transporter connection on startup
  transporter.verify((err, success) => {
    if (err) {
      console.error("❌ Email transporter verification failed:", err?.message);
    } else if (success) {
      console.log("✅ Email transporter verified and ready");
    }
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

  // Append unsubscribe footer to text and html
  const backendUrl = process.env.BACKEND_URL || FRONTEND_URL;
  const unsubscribeUrl = `${backendUrl.replace(
    /\/$/,
    ""
  )}/api/subscribe/unsubscribe?email=${encodeURIComponent(
    (to || "").toString().toLowerCase().trim()
  )}`;

  const receivingReason =
    "You are receiving this email because you opted in at our website or signed up through a Ray's Healthy Living form.";

  const footerText = `\n\n${receivingReason}\n\nTo unsubscribe, click here: ${unsubscribeUrl}`;
  const footerHtml = `
    <div style="margin-top:36px;border-top:1px solid #e6e6e6;padding-top:12px;font-size:12px;color:#888">
      <p style="margin:0">${receivingReason}</p>
      <p style="margin:6px 0 0">If you no longer wish to receive these emails, <a href="${unsubscribeUrl}">unsubscribe</a>.</p>
    </div>
  `;

  const finalText =
    (text || (html ? html.replace(/<[^>]+>/g, "") : "") || "") + footerText;
  const finalHtml = (html || "") + footerHtml;

  const mail = {
    from,
    to,
    subject,
    text: finalText,
    html: finalHtml || undefined,
    attachments: attachments || undefined,
  };

  // CRITICAL FIX: Wrap sendMail in a Promise with explicit timeout to prevent hanging
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      const timeoutErr = new Error(
        `Email send timeout (30s) for ${to}. Nodemailer may be hanging due to network issues.`
      );
      console.error(`⏱️ TIMEOUT: ${timeoutErr.message} - Subject: ${subject}`);
      reject(timeoutErr);
    }, 30000); // 30 second timeout

    transporter.sendMail(mail, (err, info) => {
      clearTimeout(timeoutId);

      if (err) {
        console.error(`❌ Email send failed for ${to}:`, err?.message || err);
        console.error(`   Subject: ${subject}`);
        console.error(`   Error details:`, err);
        reject(err);
      } else {
        console.log(
          `✅ Email sent successfully to ${to}: ${
            info?.messageId || "unknown ID"
          }`
        );
        console.log(`   Subject: ${subject}`);
        resolve(info);
      }
    });
  });
}

// Utility to return a random delay between min and max (milliseconds)
function randDelay(minSec = 10, maxSec = 20) {
  const min = Math.max(0, Math.floor(minSec));
  const max = Math.max(min + 1, Math.floor(maxSec));
  const s = Math.floor(Math.random() * (max - min + 1)) + min;
  return s * 1000;
}

// Frontend URL for absolute links in emails
const FRONTEND_URL =
  process.env.FRONTEND_URL || "https://raygpt-backend-2.onrender.com";

// Production environment check
const isProduction = process.env.NODE_ENV === "production";

console.log(`📧 Email Service initialized:`);
console.log(`   - Frontend URL: ${FRONTEND_URL}`);
console.log(`   - Environment: ${isProduction ? "Production" : "Development"}`);
console.log(`   - Email configured: ${transporter ? "Yes" : "No"}`);
console.log(`   - Working directory: ${process.cwd()}`);

// Log available manual files at startup
try {
  const manualPaths = [
    path.join(process.cwd(), "public", "manuals"),
    path.join(process.cwd(), "server", "public", "manuals"),
    path.join(process.cwd(), "client", "public", "manuals"),
  ];

  console.log(`📁 Checking for manual files in production:`);
  manualPaths.forEach((dir) => {
    try {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        console.log(`   - ${dir}: ${files.join(", ")}`);
      } else {
        console.log(`   - ${dir}: [not found]`);
      }
    } catch (e) {
      console.log(`   - ${dir}: [error: ${e.message}]`);
    }
  });
} catch (e) {
  console.warn("Could not check manual files:", e.message);
}

// Spanish email templates
const EMAIL_SEQUENCE_ES = [
  {
    subject: "Tu Manual de Oportunidad de Negocio de Vitaminas — Aquí está",
    render: (name, email) => {
      const backendUrl = process.env.BACKEND_URL || FRONTEND_URL;
      const downloadUrl = `${backendUrl}/api/download/manual`;
      const plain = `Hola ${
        name || "amigo/a"
      },\n\nGracias por registrarte — tu Manual de Oportunidad de Negocio de Vitaminas está listo. Descárgalo aquí: ${downloadUrl}\n\nSaludos,\nEquipo de Ray's Healthy Living`;
      const html = `
        <div style="font-family: Arial,Helvetica,sans-serif;color:#2c2c2c;background:#ffffff;padding:30px;border-radius:8px;max-width:600px;margin:0 auto;border:1px solid #e0e0e0">
          <h2 style="color:#E4631F;margin:0 0 20px;font-size:24px;font-weight:bold">Ray's Healthy Living — Tu Manual está listo</h2>
          <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 15px">Hola ${
            name || "amigo/a"
          },</p>
          <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 20px">Gracias por solicitar el Manual de Oportunidad de Negocio de Vitaminas. Puedes descargarlo ahora:</p>
          <div style="text-align:center;margin:25px 0">
            <a href="${downloadUrl}" style="background:#E4631F;color:#ffffff;padding:15px 25px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block">📥 Descargar el Manual</a>
          </div>
          <p style="color:#666666;font-size:14px;line-height:1.5;margin:20px 0">Si el botón no funciona, copia y pega este enlace en tu navegador: ${downloadUrl}</p>
          <p style="margin-top:30px;color:#2c2c2c;font-size:16px">— Equipo de Ray's Healthy Living</p>
        </div>`;
      return { text: plain, html };
    },
  },
  {
    subject: "¿Por qué elegir Ray's Healthy Living?",
    render: (name) => {
      const plain = `Hola ${
        name || "amigo/a"
      },\n\nEn Ray's Healthy Living, hemos construido un sistema diseñado para personas reales que quieren ser dueños de un negocio de bienestar sin años de prueba y error. Nuestro marco probado hace posible que cualquier persona con pasión y determinación tenga éxito.\n\nNuestros 4 Pilares:\n• Sistema – Operaciones paso a paso sin conjeturas\n• Crecimiento – Un modelo de negocio diseñado para expandirse y escalar\n• Estrategia – Respaldado por años de experiencia en suplementos y venta al por menor\n• Legado – Construye algo que perdure para tu familia y comunidad\n\nSaludos,\nRay's Healthy Living`;
      const html = `
        <div style="font-family: Arial,Helvetica,sans-serif;color:#ffffff;background:linear-gradient(180deg,#1a1a1a,#0f0f0f);padding:30px;border-radius:8px;max-width:600px;margin:0 auto;border:1px solid #333">
          <h2 style="color:#E4631F;margin:0 0 20px;font-size:24px;font-weight:bold">¿Por qué elegir Ray's Healthy Living?</h2>
          <p style="color:#f0f0f0;font-size:16px;line-height:1.6;margin:0 0 15px">Hola ${
            name || "amigo/a"
          },</p>
          <p style="color:#e0e0e0;font-size:16px;line-height:1.6;margin:0 0 25px">En Ray's Healthy Living, hemos construido un sistema diseñado para personas reales que quieren ser dueños de un negocio de bienestar sin años de prueba y error. Nuestro marco probado hace posible que cualquier persona con pasión y determinación tenga éxito.</p>
          <div style="margin: 25px 0;">
            <h3 style="color:#E4631F; margin-bottom: 15px;font-size:20px;font-weight:bold">Nuestros 4 Pilares:</h3>
            <p style="color:#e0e0e0; margin: 12px 0;font-size:16px;line-height:1.5"><strong style="color:#E4631F">•</strong> <strong style="color:#ffffff">Sistema</strong> – Operaciones paso a paso sin conjeturas.</p>
            <p style="color:#e0e0e0; margin: 12px 0;font-size:16px;line-height:1.5"><strong style="color:#E4631F">•</strong> <strong style="color:#ffffff">Crecimiento</strong> – Un modelo de negocio diseñado para expandirse y escalar.</p>
            <p style="color:#e0e0e0; margin: 12px 0;font-size:16px;line-height:1.5"><strong style="color:#E4631F">•</strong> <strong style="color:#ffffff">Estrategia</strong> – Respaldado por años de experiencia en suplementos y venta al por menor.</p>
            <p style="color:#e0e0e0; margin: 12px 0;font-size:16px;line-height:1.5"><strong style="color:#E4631F">•</strong> <strong style="color:#ffffff">Legado</strong> – Construye algo que perdure para tu familia y comunidad.</p>
          </div>
          <p style="margin-top:30px;color:#cccccc;font-size:16px">— Ray's Healthy Living</p>
        </div>`;
      return { text: plain, html };
    },
  },
  {
    subject: "De Negocio Familiar a Sistema Escalable",
    render: (name) => {
      const plain = `Hola ${
        name || "amigo/a"
      },\n\nEste viaje comenzó con un sueño familiar. El fundador Rayman Khan ayudó a su madre a establecer dos tiendas de vitaminas exitosas y luego construyó su propia operación próspera. A través de esas experiencias, creó un sistema repetible y escalable que otros pueden seguir.\n\nHoy, ese sistema se ha convertido en Ray's Healthy Living — una marca que te equipa con todo lo que necesitas para abrir tu propia tienda, servir a tu comunidad y construir un legado de salud.\n\nSaludos,\nRay's Healthy Living`;
      const html = `
        <div style="font-family: Arial,Helvetica,sans-serif;color:#2c2c2c;background:#ffffff;padding:30px;border-radius:8px;max-width:600px;margin:0 auto;border:1px solid #e0e0e0">
          <h2 style="color:#E4631F;margin:0 0 20px;font-size:24px;font-weight:bold">De Negocio Familiar a Sistema Escalable</h2>
          <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 15px">Hola ${
            name || "amigo/a"
          },</p>
          <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 20px">Este viaje comenzó con un sueño familiar. El fundador Rayman Khan ayudó a su madre a establecer dos tiendas de vitaminas exitosas y luego construyó su propia operación próspera. A través de esas experiencias, creó un sistema repetible y escalable que otros pueden seguir.</p>
          <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 20px">Hoy, ese sistema se ha convertido en Ray's Healthy Living — una marca que te equipa con todo lo que necesitas para abrir tu propia tienda, servir a tu comunidad y construir un legado de salud.</p>
          <p style="margin-top:30px;color:#2c2c2c;font-size:16px">— Ray's Healthy Living</p>
        </div>`;
      return { text: plain, html };
    },
  },
  {
    subject: "Esto es lo que recibes",
    render: (name) => {
      const plain = `Hola ${
        name || "amigo/a"
      },\n\nEsto es lo que recibes con Ray's Healthy Living:\n\n• Manual de Oportunidad – Tu plan paso a paso para comenzar\n• Línea de Productos Probada – Acceso a más de 1,000 productos de bienestar\n• Sistemas de Configuración de Tienda – Orientación sobre diseño, inventario y operaciones\n• Entrenamiento y Mentoría – Aprende directamente de quienes lo han hecho\n• Comunidad y Apoyo – Únete a una red de dueños de tiendas y visionarios\n\nNo necesitas experiencia previa en negocios — solo pasión y el sistema correcto. Nosotros nos encargamos del marco. Tú aportas la determinación.\n\nSaludos,\nRay's Healthy Living`;
      const html = `
        <div style="font-family: Arial,Helvetica,sans-serif;color:#ffffff;background:linear-gradient(180deg,#1a1a1a,#0f0f0f);padding:30px;border-radius:8px;max-width:600px;margin:0 auto;border:1px solid #333">
          <h2 style="color:#E4631F;margin:0 0 20px;font-size:24px;font-weight:bold">Esto es lo que recibes</h2>
          <p style="color:#f0f0f0;font-size:16px;line-height:1.6;margin:0 0 25px">Hola ${
            name || "amigo/a"
          },</p>
          <div style="margin: 25px 0;">
            <p style="color:#e0e0e0; margin: 15px 0;font-size:16px;line-height:1.5"><strong style="color:#E4631F">•</strong> <strong style="color:#ffffff">Manual de Oportunidad</strong> – Tu plan paso a paso para comenzar.</p>
            <p style="color:#e0e0e0; margin: 15px 0;font-size:16px;line-height:1.5"><strong style="color:#E4631F">•</strong> <strong style="color:#ffffff">Línea de Productos Probada</strong> – Acceso a más de 1,000 productos de bienestar.</p>
            <p style="color:#e0e0e0; margin: 15px 0;font-size:16px;line-height:1.5"><strong style="color:#E4631F">•</strong> <strong style="color:#ffffff">Sistemas de Configuración de Tienda</strong> – Orientación sobre diseño, inventario y operaciones.</p>
            <p style="color:#e0e0e0; margin: 15px 0;font-size:16px;line-height:1.5"><strong style="color:#E4631F">•</strong> <strong style="color:#ffffff">Entrenamiento y Mentoría</strong> – Aprende directamente de quienes lo han hecho.</p>
            <p style="color:#e0e0e0; margin: 15px 0;font-size:16px;line-height:1.5"><strong style="color:#E4631F">•</strong> <strong style="color:#ffffff">Comunidad y Apoyo</strong> – Únete a una red de dueños de tiendas y visionarios.</p>
          </div>
          <p style="color:#e0e0e0;font-style:italic;font-size:16px;line-height:1.6;margin:20px 0;padding:15px;background:rgba(228,99,31,0.1);border-left:3px solid #E4631F">No necesitas experiencia previa en negocios — solo pasión y el sistema correcto. Nosotros nos encargamos del marco. Tú aportas la determinación.</p>
          <p style="color:#cccccc;font-size:16px;margin-top:30px">— Ray's Healthy Living</p>
        </div>`;
      return { text: plain, html };
    },
  },
  {
    subject: "¿Por qué Tiendas de Vitaminas? ¿Por qué ahora?",
    render: (name) => {
      const plain = `Hola ${
        name || "amigo/a"
      },\n\nLa industria de la salud y el bienestar está en auge. Los consumidores están invirtiendo más que nunca en suplementos, productos naturales y soluciones de salud holística. Con las ventas globales de suplementos proyectadas a crecer por miles de millones en los próximos años, ahora es el momento de posicionarte en este mercado de rápido crecimiento.\n\nRay's Healthy Living proporciona la plataforma, productos y sistemas para ayudarte a aprovechar esta oportunidad con confianza.\n\nSaludos,\nRay's Healthy Living`;
      const html = ` 
        <div style="font-family: Arial,Helvetica,sans-serif;color:#2c2c2c;background:#ffffff;padding:30px;border-radius:8px;max-width:600px;margin:0 auto;border:1px solid #e0e0e0">
          <h2 style="color:#E4631F;margin:0 0 20px;font-size:24px;font-weight:bold">¿Por qué Tiendas de Vitaminas? ¿Por qué ahora?</h2>
          <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 15px">Hola ${
            name || "amigo/a"
          },</p>
          <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 20px">La industria de la salud y el bienestar está en auge. Los consumidores están invirtiendo más que nunca en suplementos, productos naturales y soluciones de salud holística. Con las ventas globales de suplementos proyectadas a crecer por miles de millones en los próximos años, ahora es el momento de posicionarte en este mercado de rápido crecimiento.</p>
          <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 20px">Ray's Healthy Living proporciona la plataforma, productos y sistemas para ayudarte a aprovechar esta oportunidad con confianza.</p>
          <p style="margin-top:30px;color:#2c2c2c;font-size:16px">— Ray's Healthy Living</p>
        </div>`;
      return { text: plain, html };
    },
  },
  {
    subject: "Reclama tu Manual Gratuito y Mantente Conectado",
    render: (name) => {
      const backendUrl = process.env.BACKEND_URL || FRONTEND_URL;
      const downloadUrl = `${backendUrl}/api/download/manual`;
      const plain = `Hola ${
        name || "amigo/a"
      },\n\nCuando te registraste, recibiste:\n• El Manual completo de Oportunidad de Negocio de Tienda de Vitaminas\n• Perspectivas semanales sobre emprendimiento en salud y bienestar\n• Invitaciones exclusivas a seminarios web y sesiones informativas\n\nEnlace del manual: ${downloadUrl}\n\nSaludos,\nRay's Healthy Living`;
      const html = `
        <div style="font-family: Arial,Helvetica,sans-serif;color:#ffffff;background:linear-gradient(180deg,#1a1a1a,#0f0f0f);padding:30px;border-radius:8px;max-width:600px;margin:0 auto;border:1px solid #333">
          <h2 style="color:#E4631F;margin:0 0 20px;font-size:24px;font-weight:bold">Reclama tu Manual Gratuito y Mantente Conectado</h2>
          <p style="color:#f0f0f0;font-size:16px;line-height:1.6;margin:0 0 15px">Hola ${
            name || "amigo/a"
          },</p>
          <p style="color:#e0e0e0;font-size:16px;line-height:1.6;margin:0 0 20px">Cuando te registraste, recibiste:</p>
          <div style="margin: 20px 0;">
            <p style="color:#e0e0e0; margin: 12px 0;font-size:16px;line-height:1.5"><strong style="color:#E4631F">•</strong> El Manual completo de Oportunidad de Negocio de Tienda de Vitaminas</p>
            <p style="color:#e0e0e0; margin: 12px 0;font-size:16px;line-height:1.5"><strong style="color:#E4631F">•</strong> Perspectivas semanales sobre emprendimiento en salud y bienestar</p>
            <p style="color:#e0e0e0; margin: 12px 0;font-size:16px;line-height:1.5"><strong style="color:#E4631F">•</strong> Invitaciones exclusivas a seminarios web y sesiones informativas</p>
          </div>
          <div style="text-align:center;margin:25px 0">
            <a href="${downloadUrl}" style="background:#E4631F;color:#ffffff;padding:15px 25px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block">👉 Sí, Envíame el Manual</a>
          </div>
          <p style="color:#cccccc;font-size:16px;margin-top:30px">— Ray's Healthy Living</p>
        </div>`;
      return { text: plain, html };
    },
  },
  {
    subject: "🎁 Aquí está tu Manual de Negocio Final + Próximos Pasos",
    render: (name) => {
      const scheduleUrl = "https://calendly.com/sahatushankar234/30min";
      const backendUrl = process.env.BACKEND_URL || FRONTEND_URL;
      const finalManualUrl = `${backendUrl}/api/download/final-manual`;
      const plain = `Hola ${
        name || "amigo/a"
      },\n\n¡Aquí está tu correo final! 🎉\n\nComo prometí, te envío la versión FINAL y más completa de nuestro Manual de Oportunidad de Negocio. Este manual actualizado incluye:\n\n• Estrategias avanzadas no cubiertas en la versión inicial\n• Estudios de casos reales de dueños de tiendas exitosos\n• Datos de mercado actualizados y proyecciones para 2024-2025\n• Cronograma de implementación paso a paso\n• Contactos exclusivos de proveedores y guías de precios\n\nDescarga tu manual final: ${finalManualUrl}\n\nAhora que tienes toda la información, es hora de tomar acción. Cada negocio exitoso comienza con un solo paso. Para ti, ese paso es programar una llamada de consulta gratuita. En esta llamada, discutiremos tus objetivos, te guiaremos a través del sistema y te mostraremos cómo lanzar tu propia tienda.\n\nReserva tu llamada: ${scheduleUrl}\n\nLos espacios son limitados — asegura tu lugar hoy y comienza a construir tu legado con Ray's Healthy Living.\n\nEste es tu momento. No lo dejes pasar.\n\nSaludos,\nEquipo de Ray's Healthy Living`;
      const html = `
        <div style="font-family: Arial,Helvetica,sans-serif;color:#2c2c2c;background:#ffffff;padding:30px;border-radius:8px;max-width:600px;margin:0 auto;border:1px solid #e0e0e0">
          <h2 style="color:#E4631F;margin:0 0 20px;font-size:26px;font-weight:bold">🎁 Aquí está tu Manual de Negocio Final</h2>
          <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 15px">Hola ${
            name || "amigo/a"
          },</p>
          <div style="background:#fff3e0;border-left:4px solid #E4631F;padding:20px;margin:20px 0;border-radius:0 8px 8px 0">
            <p style="color:#d4620a;font-size:18px;font-weight:bold;margin:0 0 10px">🎉 ¡Aquí está tu correo final!</p>
            <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0">Como prometí, te envío la versión FINAL y más completa de nuestro Manual de Oportunidad de Negocio.</p>
          </div>
          <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:20px 0">Este manual actualizado incluye:</p>
          <div style="margin: 20px 0;">
            <p style="color:#2c2c2c; margin: 8px 0;font-size:15px;line-height:1.5"><strong style="color:#E4631F">✓</strong> Estrategias avanzadas no cubiertas en la versión inicial</p>
            <p style="color:#2c2c2c; margin: 8px 0;font-size:15px;line-height:1.5"><strong style="color:#E4631F">✓</strong> Estudios de casos reales de dueños de tiendas exitosos</p>
            <p style="color:#2c2c2c; margin: 8px 0;font-size:15px;line-height:1.5"><strong style="color:#E4631F">✓</strong> Datos de mercado actualizados y proyecciones para 2024-2025</p>
            <p style="color:#2c2c2c; margin: 8px 0;font-size:15px;line-height:1.5"><strong style="color:#E4631F">✓</strong> Cronograma de implementación paso a paso</p>
            <p style="color:#2c2c2c; margin: 8px 0;font-size:15px;line-height:1.5"><strong style="color:#E4631F">✓</strong> Contactos exclusivos de proveedores y guías de precios</p>
          </div>
          <div style="text-align:center;margin:25px 0">
            <a href="${finalManualUrl}" style="background:#E4631F;color:#ffffff;padding:15px 25px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;margin-bottom:15px">📥 Descarga tu Manual Final</a>
          </div>
          <div style="border-top:2px solid #E4631F;padding-top:25px;margin-top:30px">
            <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 20px">Ahora que tienes toda la información, es hora de tomar acción. Cada negocio exitoso comienza con un solo paso. Para ti, ese paso es programar una llamada de consulta gratuita.</p>
            <div style="text-align:center;margin:25px 0">
              <a href="${scheduleUrl}" style="background:#28a745;color:#ffffff;padding:18px 30px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:18px;display:inline-block">📞 Reservar Mi Consulta Gratuita</a>
            </div>
            <p style="color:#666666;font-style:italic;font-size:16px;line-height:1.6;margin:20px 0;text-align:center;padding:15px;background:#f9f9f9;border-radius:6px;border-left:4px solid #28a745"><strong>Este es tu momento. No lo dejes pasar.</strong><br>Los espacios son limitados — ¡asegura tu lugar hoy!</p>
          </div>
          <p style="margin-top:30px;color:#2c2c2c;font-size:16px">— Equipo de Ray's Healthy Living</p>
        </div>`;
      return {
        text: plain,
        html,
        attachments: (() => {
          const possiblePaths = [
            path.join(
              process.cwd(),
              "public",
              "manuals",
              "free-business-opportunity-manual-final.pdf"
            ),
            path.join(
              process.cwd(),
              "server",
              "public",
              "manuals",
              "free-business-opportunity-manual-final.pdf"
            ),
            path.join(
              process.cwd(),
              "client",
              "public",
              "manuals",
              "free-business-opportunity-manual-final.pdf"
            ),
          ];

          for (const testPath of possiblePaths) {
            try {
              if (fs.existsSync(testPath)) {
                console.log(`Found final manual at: ${testPath}`);
                return [
                  {
                    filename: "Ray-Healthy-Living-Manual-Final-Negocio.pdf",
                    path: testPath,
                    contentType: "application/pdf",
                  },
                ];
              }
            } catch (e) {
              console.warn(`Could not access path: ${testPath}`, e.message);
            }
          }

          console.warn(
            "Final manual PDF not found for email attachment. Searched paths:",
            possiblePaths
          );
          return [];
        })(),
      };
    },
  },
];

// The email sequence content with HTML templates (Ray's Healthy Living branded)
const EMAIL_SEQUENCE = [
  {
    subject: "Your Vitamin Store Opportunity Manual — Here it is",
    render: (name, email) => {
      // Use the backend URL for production (Render) since files are served from server
      const backendUrl = process.env.BACKEND_URL || FRONTEND_URL;
      const downloadUrl = `${backendUrl}/api/download/manual`;
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
      // Use the backend URL for production (Render) since files are served from server
      const backendUrl = process.env.BACKEND_URL || FRONTEND_URL;
      const downloadUrl = `${backendUrl}/api/download/manual`;
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
          
          </div>
          <p style="color:#cccccc;font-size:16px;margin-top:30px">— Ray's Healthy Living</p>
        </div>`;
      return { text: plain, html };
    },
  },
  {
    subject: "🎁 Here's Your Final Business Manual + Next Steps",
    render: (name) => {
      const scheduleUrl = "https://calendly.com/sahatushankar234/30min";
      // Use the backend URL for production (Render) since files are served from server
      const backendUrl = process.env.BACKEND_URL || FRONTEND_URL;
      const finalManualUrl = `${backendUrl}/api/download/final-manual`;
      const plain = `Hi ${
        name || "there"
      },\n\nHere is your final email! 🎉\n\nAs promised, I'm sending you the FINAL and most comprehensive version of our Business Opportunity Manual. This updated manual includes:\n\n• Advanced strategies not covered in the initial version\n• Real case studies from successful store owners\n• Updated market data and projections for 2024-2025\n• Step-by-step implementation timeline\n• Exclusive supplier contacts and pricing guides\n\nDownload your final manual: ${finalManualUrl}\n\nNow that you have all the information, it's time to take action. Every successful business starts with a single step. For you, that step is scheduling a free consultation call. On this call, we'll discuss your goals, walk you through the system, and show you how to launch your own store.\n\nBook your call: ${scheduleUrl}\n\nSpaces are limited — secure your spot today and start building your legacy with Ray's Healthy Living.\n\nThis is your moment. Don't let it pass.\n\nBest,\nRay's Healthy Living Team`;
      const html = `
        <div style="font-family: Arial,Helvetica,sans-serif;color:#2c2c2c;background:#ffffff;padding:30px;border-radius:8px;max-width:600px;margin:0 auto;border:1px solid #e0e0e0">
          <h2 style="color:#E4631F;margin:0 0 20px;font-size:26px;font-weight:bold">🎁 Here's Your Final Business Manual</h2>
          <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 15px">Hi ${
            name || "there"
          },</p>
          <div style="background:#fff3e0;border-left:4px solid #E4631F;padding:20px;margin:20px 0;border-radius:0 8px 8px 0">
            <p style="color:#d4620a;font-size:18px;font-weight:bold;margin:0 0 10px">🎉 Here is your final email!</p>
            <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0">As promised, I'm sending you the FINAL and most comprehensive version of our Business Opportunity Manual.</p>
          </div>
          <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:20px 0">This updated manual includes:</p>
          <div style="margin: 20px 0;">
            <p style="color:#2c2c2c; margin: 8px 0;font-size:15px;line-height:1.5"><strong style="color:#E4631F">✓</strong> Advanced strategies not covered in the initial version</p>
            <p style="color:#2c2c2c; margin: 8px 0;font-size:15px;line-height:1.5"><strong style="color:#E4631F">✓</strong> Real case studies from successful store owners</p>
            <p style="color:#2c2c2c; margin: 8px 0;font-size:15px;line-height:1.5"><strong style="color:#E4631F">✓</strong> Updated market data and projections for 2024-2025</p>
            <p style="color:#2c2c2c; margin: 8px 0;font-size:15px;line-height:1.5"><strong style="color:#E4631F">✓</strong> Step-by-step implementation timeline</p>
            <p style="color:#2c2c2c; margin: 8px 0;font-size:15px;line-height:1.5"><strong style="color:#E4631F">✓</strong> Exclusive supplier contacts and pricing guides</p>
          </div>
          <div style="text-align:center;margin:25px 0">
            <a href="${finalManualUrl}" style="background:#E4631F;color:#ffffff;padding:15px 25px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;margin-bottom:15px">📥 Download Your Final Manual</a>
          </div>
          <div style="border-top:2px solid #E4631F;padding-top:25px;margin-top:30px">
            <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 20px">Now that you have all the information, it's time to take action. Every successful business starts with a single step. For you, that step is scheduling a free consultation call.</p>
            <div style="text-align:center;margin:25px 0">
              <a href="${scheduleUrl}" style="background:#28a745;color:#ffffff;padding:18px 30px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:18px;display:inline-block">� Book My Free Consultation</a>
            </div>
            <p style="color:#666666;font-style:italic;font-size:16px;line-height:1.6;margin:20px 0;text-align:center;padding:15px;background:#f9f9f9;border-radius:6px;border-left:4px solid #28a745"><strong>This is your moment. Don't let it pass.</strong><br>Spaces are limited — secure your spot today!</p>
          </div>
          <p style="margin-top:30px;color:#2c2c2c;font-size:16px">— Ray's Healthy Living Team</p>
        </div>`;
      return {
        text: plain,
        html,
        attachments: (() => {
          // Try multiple paths for the final manual in production (server paths first for Render deployment)
          const possiblePaths = [
            path.join(
              process.cwd(),
              "public",
              "manuals",
              "free-business-opportunity-manual-final.pdf"
            ),
            path.join(
              process.cwd(),
              "server",
              "public",
              "manuals",
              "free-business-opportunity-manual-final.pdf"
            ),
            path.join(
              process.cwd(),
              "client",
              "public",
              "manuals",
              "free-business-opportunity-manual-final.pdf"
            ),
          ];

          for (const testPath of possiblePaths) {
            try {
              if (fs.existsSync(testPath)) {
                console.log(`Found final manual at: ${testPath}`);
                return [
                  {
                    filename: "Ray-Healthy-Living-Final-Business-Manual.pdf",
                    path: testPath,
                    contentType: "application/pdf",
                  },
                ];
              }
            } catch (e) {
              console.warn(`Could not access path: ${testPath}`, e.message);
            }
          }

          console.warn(
            "Final manual PDF not found for email attachment. Searched paths:",
            possiblePaths
          );
          return []; // Return empty array if file not found
        })(),
      };
    },
  },
];

// Send only the first email (manual with download) immediately
export async function sendFirstEmail({ email, name, language = "en" }) {
  try {
    const emailSequence =
      language === "es" ? EMAIL_SEQUENCE_ES : EMAIL_SEQUENCE;
    const firstEmail = emailSequence[0];
    const rendered = firstEmail.render(name, email);

    console.log(`📧 Sending first email to ${email} in ${language}...`);
    const result = await sendMail({
      to: email,
      subject: firstEmail.subject,
      text: rendered.text,
      html: rendered.html,
    });

    console.log(`✅ First email (manual) sent to ${email} in ${language}`);
    return {
      success: true,
      emailSent: firstEmail.subject,
      messageId: result?.messageId,
    };
  } catch (err) {
    console.error(
      `❌ Failed to send first email to ${email}:`,
      err?.message || err
    );
    throw err;
  }
}

// Schedule the remaining email sequence (emails 2-7) after user engagement
export async function scheduleRemainingEmails(
  { email, name, language = "en" },
  options = {}
) {
  // For testing, use options.testMode = true to send every 30 seconds
  const isTestMode = options.testMode || false;

  // Skip the first email (index 0) and schedule the remaining emails
  const emailSequence = language === "es" ? EMAIL_SEQUENCE_ES : EMAIL_SEQUENCE;
  const remainingEmails = emailSequence.slice(1);

  // Email timing: For testing, send emails quickly with short delays
  let emailDelays;
  if (isTestMode) {
    // For testing: 5s, 10s, 15s, 20s, 25s, 30s
    emailDelays = [5000, 10000, 15000, 20000, 25000, 30000];
  } else {
    // For immediate testing: 2s, 4s, 6s, 8s, 10s, 12s (change this back to days for production)
    emailDelays = [2000, 4000, 6000, 8000, 10000, 12000];

    // Production delays (uncomment when ready for production):
    // const dayInMs = 24 * 60 * 60 * 1000;
    // emailDelays = [
    //   dayInMs,
    //   2 * dayInMs,
    //   3 * dayInMs,
    //   4 * dayInMs,
    //   5 * dayInMs,
    //   6 * dayInMs,
    // ];
  }

  // Schedule each remaining email with its specific delay
  remainingEmails.forEach((item, idx) => {
    const delay = emailDelays[idx] || 0;

    setTimeout(async () => {
      try {
        const rendered = item.render(name, email);

        console.log(
          `📧 Scheduling email ${
            idx + 2
          } to ${email} in ${language} (delay: ${delay}ms)...`
        );

        const result = await sendMail({
          to: email,
          subject: item.subject,
          text: rendered.text,
          html: rendered.html,
          attachments: rendered.attachments || undefined,
        });

        console.log(
          `✅ Email ${idx + 2} sent to ${email} in ${language} (messageId: ${
            result?.messageId || "unknown"
          }, subject: ${item.subject})`
        );
      } catch (err) {
        console.error(
          `❌ Failed to send email ${idx + 2} to ${email}:`,
          err?.message || err
        );
        console.error(`   Language: ${language}, Subject: ${item.subject}`);
      }
    }, delay);
  });

  const totalDuration = isTestMode ? "30 seconds" : "12 seconds (testing mode)";
  return {
    scheduled: true,
    emailCount: remainingEmails.length,
    duration: totalDuration,
    timing: isTestMode
      ? "Test mode: every 5 seconds starting in 5s"
      : "Testing mode: every 2 seconds starting in 2s",
  };
}

// Legacy function - now only sends first email
export async function scheduleEmailSequence(
  { email, name, language = "en" },
  options = {}
) {
  return await sendFirstEmail({ email, name, language });
}

export default {
  sendMail,
  scheduleEmailSequence,
  sendFirstEmail,
  scheduleRemainingEmails,
};
