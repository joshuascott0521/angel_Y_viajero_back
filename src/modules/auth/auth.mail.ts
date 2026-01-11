export function buildResetPasswordEmail(input: {
  nombre?: string;
  token: string;
  expiraMin: number;
}) {
  const nombre = (input.nombre || "Hola").trim();

  const subject = "Recuperación de contraseña - Ángeles Viajeros";

  const text = `Hola ${nombre},

Tu código de recuperación es:

${input.token}

Este código expira en ${input.expiraMin} minutos.
Si no solicitaste este cambio, ignora este mensaje.`;

  const html = `<div style="font-family:Arial,sans-serif;line-height:1.5">
  <h2>Recuperación de contraseña</h2>
  <p>Hola <b>${escapeHtml(nombre)}</b>,</p>
  <p>Tu código de recuperación es:</p>
  <div style="font-size:20px;font-weight:bold;letter-spacing:1px;padding:12px 16px;border:1px solid #ddd;display:inline-block;border-radius:8px">
    ${escapeHtml(input.token)}
  </div>
  <p style="margin-top:16px">Este código expira en <b>${
    input.expiraMin
  } minutos</b>.</p>
  <p>Si no solicitaste este cambio, ignora este mensaje.</p>
</div>`;

  return { subject, text, html };
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
