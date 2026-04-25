/**
 * Branded email templates — Muhius Sunnah voice + visual identity.
 *
 * Each template returns { subject, html, text } so the caller just
 * passes them straight into sendEmail(). Inline CSS only — clients
 * still strip <style> blocks.
 */

import "server-only";

const BRAND = {
  primary: "#7c5cff",
  accent: "#22d3ee",
  footerBg: "#f5f7ff",
  textDark: "#0b1020",
  textMuted: "#5b6479",
  border: "#e5e7eb",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Wraps body content in the standard Muhius Sunnah email shell:
 * gradient header bar, white card, footer with platform name + tagline.
 */
function shell(bodyHtml: string, preview: string): string {
  return `
<!doctype html>
<html lang="bn">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Muhius Sunnah</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.footerBg};font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans Bengali',sans-serif;color:${BRAND.textDark};line-height:1.6;">
  <!-- Hidden preview text shown by Gmail/iOS in the inbox preview row -->
  <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preview)}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.footerBg};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(11,16,32,0.08);">
          <!-- Gradient header bar -->
          <tr>
            <td style="background:linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.accent} 100%);height:6px;line-height:6px;font-size:0;">&nbsp;</td>
          </tr>

          <!-- Brand row -->
          <tr>
            <td style="padding:32px 36px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;padding-right:12px;">
                          <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.accent} 100%);display:inline-block;text-align:center;line-height:44px;color:#ffffff;font-weight:700;font-size:18px;">
                            M
                          </div>
                        </td>
                        <td style="vertical-align:middle;">
                          <div style="font-size:18px;font-weight:700;color:${BRAND.textDark};">Muhius Sunnah</div>
                          <div style="font-size:11px;color:${BRAND.textMuted};text-transform:uppercase;letter-spacing:0.1em;">School &amp; Madrasa Platform</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px 36px 36px;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:${BRAND.footerBg};border-top:1px solid ${BRAND.border};padding:24px 36px;text-align:center;">
              <div style="font-size:12px;color:${BRAND.textMuted};line-height:1.7;">
                বাংলাদেশের সেরা স্কুল ও মাদ্রাসা ম্যানেজমেন্ট প্ল্যাটফর্ম<br/>
                <a href="https://muhiussunnah.app" style="color:${BRAND.primary};text-decoration:none;font-weight:600;">muhiussunnah.app</a>
              </div>
            </td>
          </tr>
        </table>

        <!-- Reply-to hint -->
        <div style="font-size:11px;color:${BRAND.textMuted};margin-top:16px;text-align:center;max-width:600px;">
          এই ইমেইলটি স্বয়ংক্রিয়ভাবে পাঠানো হয়েছে। প্রশ্ন থাকলে
          <a href="mailto:muhiussunnah2026@gmail.com" style="color:${BRAND.primary};text-decoration:none;">muhiussunnah2026@gmail.com</a> এ যোগাযোগ করুন।
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

/**
 * Staff invitation — sent when a school admin invites a teacher /
 * accountant / vice-principal etc. The recipient lands on a
 * password-setup page via the recovery link.
 */
export function staffInvitationEmail(params: {
  fullName: string;
  schoolName: string;
  roleLabel: string;
  inviterName: string | null;
  setupUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `${params.schoolName} এ আপনাকে ${params.roleLabel} হিসেবে যুক্ত করা হয়েছে`;
  const preview = `${params.schoolName} এ আপনাকে যোগ করা হয়েছে। পাসওয়ার্ড সেট করুন।`;

  const body = `
    <h1 style="font-size:24px;font-weight:700;margin:0 0 8px;color:${BRAND.textDark};">
      আসসালামু আলাইকুম, ${escapeHtml(params.fullName)} 👋
    </h1>
    <p style="font-size:15px;color:${BRAND.textMuted};margin:0 0 20px;">
      <strong style="color:${BRAND.textDark};">${escapeHtml(params.schoolName)}</strong> এ আপনাকে
      <strong style="color:${BRAND.primary};">${escapeHtml(params.roleLabel)}</strong> হিসেবে যুক্ত করা হয়েছে।
    </p>

    <div style="background:${BRAND.footerBg};border-left:4px solid ${BRAND.primary};border-radius:8px;padding:16px 20px;margin:0 0 24px;">
      <div style="font-size:13px;color:${BRAND.textMuted};margin-bottom:6px;">আপনার অ্যাকাউন্ট প্রস্তুত</div>
      <div style="font-size:15px;font-weight:600;color:${BRAND.textDark};">
        শুধু একটি পাসওয়ার্ড সেট করে লগইন করলেই ড্যাশবোর্ড ব্যবহার শুরু হবে।
      </div>
    </div>

    <p style="font-size:15px;color:${BRAND.textDark};margin:0 0 24px;">
      নিচের বাটনে ক্লিক করে আপনার পাসওয়ার্ড সেট করুন। লিংকটি ১ ঘণ্টার জন্য বৈধ থাকবে।
    </p>

    <div style="text-align:center;margin:0 0 28px;">
      <a href="${params.setupUrl}"
         style="display:inline-block;background:linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.accent} 100%);color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:12px;box-shadow:0 8px 20px rgba(124,92,255,0.35);">
        পাসওয়ার্ড সেট করুন →
      </a>
    </div>

    <p style="font-size:13px;color:${BRAND.textMuted};margin:0 0 8px;">
      বাটন কাজ না করলে এই লিংকটি কপি করে ব্রাউজারে পেস্ট করুন:
    </p>
    <p style="font-size:12px;color:${BRAND.primary};word-break:break-all;background:${BRAND.footerBg};padding:10px 12px;border-radius:6px;margin:0 0 28px;font-family:'Courier New',monospace;">
      ${escapeHtml(params.setupUrl)}
    </p>

    <hr style="border:none;border-top:1px solid ${BRAND.border};margin:28px 0;" />

    <h2 style="font-size:16px;font-weight:600;margin:0 0 12px;color:${BRAND.textDark};">
      পরবর্তী পদক্ষেপ
    </h2>
    <ol style="font-size:14px;color:${BRAND.textMuted};margin:0 0 0 20px;padding:0;line-height:1.8;">
      <li>উপরের বাটনে ক্লিক করে পাসওয়ার্ড সেট করুন</li>
      <li>আপনার ইমেইল (<span style="color:${BRAND.textDark};font-weight:500;">${escapeHtml(params.inviterName ?? "আপনার অ্যাডমিন")} আপনাকে যে ইমেইল দিয়েছেন</span>) ও নতুন পাসওয়ার্ড দিয়ে লগইন করুন</li>
      <li>প্রোফাইল আপডেট করুন এবং কাজ শুরু করুন</li>
    </ol>
  `;

  const html = shell(body, preview);

  const text = `
আসসালামু আলাইকুম, ${params.fullName}

${params.schoolName} এ আপনাকে ${params.roleLabel} হিসেবে যুক্ত করা হয়েছে।

পাসওয়ার্ড সেট করতে এই লিংকে যান:
${params.setupUrl}

লিংকটি ১ ঘণ্টার জন্য বৈধ।

— Muhius Sunnah
muhiussunnah.app
`.trim();

  return { subject, html, text };
}
