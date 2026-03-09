/**
 * Send a magic link email via the Resend API.
 */
export async function sendMagicLink(
  email: string,
  magicToken: string,
  origin: string,
): Promise<boolean> {
  const apiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
  const from = import.meta.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'noreply@talkingwithmachines.xyz';

  if (!apiKey) {
    console.error('RESEND_API_KEY not configured');
    return false;
  }

  const restoreUrl = `${origin}/restore?token=${magicToken}`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;font-family:'Source Serif 4',Georgia,serif;background:#F8F6F3;">
  <div style="max-width:480px;margin:40px auto;padding:40px 32px;background:#FFFFFF;border-radius:16px;border:1px solid rgba(26,26,46,0.06);">
    <div style="width:48px;height:3px;border-radius:2px;background:#7B61FF;margin:0 0 24px;"></div>
    <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:1.5rem;font-weight:800;color:#1A1A2E;margin:0 0 12px;">Restore your access</h1>
    <p style="font-size:1rem;color:#6B7280;line-height:1.6;margin:0 0 28px;">
      Click the button below to restore access to <strong>Talking to Machines</strong> on this device. This link expires in 15 minutes.
    </p>
    <a href="${restoreUrl}" style="display:inline-block;padding:14px 32px;border-radius:10px;background:#7B61FF;color:#FFFFFF;font-weight:700;font-size:1rem;text-decoration:none;">
      Restore Access
    </a>
    <p style="font-size:0.75rem;color:#B0B0B0;margin:28px 0 0;line-height:1.5;">
      If you didn't request this, you can ignore this email. This link can only be used once.
    </p>
  </div>
</body>
</html>`.trim();

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `Talking to Machines <${from}>`,
        to: [email],
        subject: 'Restore your access — Talking to Machines',
        html,
      }),
    });

    return res.ok;
  } catch (err) {
    console.error('Failed to send magic link:', err);
    return false;
  }
}
