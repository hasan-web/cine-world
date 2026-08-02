import "server-only";

const RESEND_API = "https://api.resend.com/emails";
const FROM = "Constellation <hello@loveforcinema.com>";

const FONT_DISPLAY = "'Jost', Helvetica, Arial, sans-serif";
const FONT_BODY = "'Libre Baskerville', Georgia, 'Times New Roman', serif";
const FONT_MONO = "'JetBrains Mono', 'Courier New', Courier, monospace";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface EmailShellOptions {
  preheader: string;
  heading: string;
  /** Raw HTML — caller is responsible for escaping any interpolated user data. */
  bodyHtml: string;
  ctaLabel: string;
  ctaHref: string;
}

/**
 * The one visual shell every Constellation email shares — table-based and
 * inline-styled since email clients don't reliably support Tailwind, custom
 * fonts, or modern CSS. Mirrors the app's herbarium/marquee "keepsake
 * program" look with web-safe fallbacks for Jost/Libre Baskerville/JetBrains Mono.
 */
export function renderEmailShell({ preheader, heading, bodyHtml, ctaLabel, ctaHref }: EmailShellOptions): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Constellation</title>
  </head>
  <body style="margin:0; padding:32px 16px; background:#f2e9d3; font-family:${FONT_BODY};">
    <span style="display:none; font-size:1px; color:#f2e9d3; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">${escapeHtml(preheader)}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; margin:0 auto; background:#e8dcc0; border:1px solid rgba(43,32,24,0.14);">
      <tr>
        <td style="padding:40px 36px; text-align:center;">
          <div style="font-family:${FONT_DISPLAY}; font-size:11px; letter-spacing:3px; color:#6b2027; text-transform:uppercase;">Constellation</div>
          <div style="width:36px; height:1px; background:#a97c2f; margin:16px auto;"></div>
          <div style="font-family:${FONT_BODY}; font-style:italic; font-size:20px; color:#2b2018; margin-bottom:16px;">${escapeHtml(heading)}</div>
          <div style="font-family:${FONT_BODY}; font-size:14px; line-height:1.7; color:#5a4d3e; text-align:left;">${bodyHtml}</div>
          <div style="margin-top:28px;">
            <a href="${ctaHref}" style="display:inline-block; border:1px solid #a97c2f; padding:12px 28px; color:#6b2027; text-decoration:none; font-family:${FONT_DISPLAY}; font-size:11px; letter-spacing:1.5px; text-transform:uppercase;">${escapeHtml(ctaLabel)}</a>
          </div>
        </td>
      </tr>
    </table>
    <div style="max-width:480px; margin:16px auto 0; text-align:center; font-family:${FONT_MONO}; font-size:10px; letter-spacing:0.5px; color:#5a4d3e; text-transform:uppercase;">
      a keepsake program for what you&rsquo;ve watched
    </div>
  </body>
</html>`;
}

/** Fire-and-log, never throws — an email failing to send shouldn't fail the action that triggered it. */
async function sendEmail(params: { to: string; subject: string; html: string }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set — skipping email send");
    return;
  }

  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: params.to, subject: params.subject, html: params.html }),
    });
    if (!res.ok) {
      console.error(`Failed to send email: ${res.status} ${await res.text()}`);
    }
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}

export async function sendFriendRequestEmail(toEmail: string, fromEmail: string, siteUrl: string): Promise<void> {
  const safeFrom = escapeHtml(fromEmail);
  const html = renderEmailShell({
    preheader: `${fromEmail} wants to compare skies with you on Constellation.`,
    heading: "a request has arrived",
    bodyHtml: `<strong style="color:#2b2018;">${safeFrom}</strong> wants to see where your collections agree — accept to open your sky to each other, or leave it for later.`,
    ctaLabel: "View the request →",
    ctaHref: `${siteUrl}/friends`,
  });

  await sendEmail({ to: toEmail, subject: `${fromEmail} sent you a friend request`, html });
}
