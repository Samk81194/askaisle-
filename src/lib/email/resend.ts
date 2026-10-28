/**
 * Transactional Email Helper via Resend REST API (Free Tier: 3,000 emails/month at $0)
 * Covers PRD Requirements D2 (Unanswered Lead Alert), E2 (Shopper Reply), and F2 (80% & 100% Quota Alerts)
 */

const RESEND_API_URL = 'https://api.resend.com/emails';
const DEFAULT_FROM = process.env.EMAIL_FROM || 'AskAisle <notifications@askaisle.com>';

async function sendResendEmail(payload: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith('re_placeholder')) {
    console.info('[AskAisle Email Mock]', payload.subject, '->', payload.to);
    return { mocked: true };
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: DEFAULT_FROM,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
      }),
    });
    return await res.json();
  } catch (err) {
    console.warn('[AskAisle Email Error]', err);
    return null;
  }
}

export async function sendUnansweredAlertEmail(params: {
  merchantEmail: string;
  shopName: string;
  question: string;
  visitorEmail?: string | null;
}) {
  return sendResendEmail({
    to: params.merchantEmail,
    subject: `[AskAisle] New unanswered question on ${params.shopName}`,
    html: `
      <div style="font-family: sans-serif; color: #0f172a; max-width: 540px;">
        <h2>A shopper asked a question not yet in your store catalog</h2>
        <p><strong>Question:</strong> "${params.question}"</p>
        ${params.visitorEmail ? `<p><strong>Shopper Email:</strong> ${params.visitorEmail}</p>` : ''}
        <p>Reply once in your AskAisle Dashboard Learning Loop to automatically answer future shoppers.</p>
      </div>
    `,
  });
}

export async function sendQuotaAlertEmail(params: {
  merchantEmail: string;
  shopName: string;
  threshold: 80 | 100;
  used: number;
  limit: number;
}) {
  return sendResendEmail({
    to: params.merchantEmail,
    subject: `[AskAisle] ${params.threshold}% of your monthly AI message quota reached`,
    html: `
      <div style="font-family: sans-serif; color: #0f172a; max-width: 540px;">
        <h2>${params.shopName} has used ${params.used} / ${params.limit} messages (${params.threshold}%)</h2>
        <p>${
          params.threshold === 100
            ? 'Your widget is now displaying a neutral fallback message. Upgrade your plan in 1 click to resume automated AI replies.'
            : 'You have reached 80% of your monthly message allowance.'
        }</p>
      </div>
    `,
  });
}

export async function sendShopperFollowUpEmail(params: {
  to: string;
  question: string;
  answer: string;
}) {
  return sendResendEmail({
    to: params.to,
    subject: `Answer to your question: "${params.question.slice(0, 50)}"`,
    html: `
      <div style="font-family: sans-serif; color: #0f172a; max-width: 540px;">
        <p>Hi there,</p>
        <p>You recently asked our store assistant: <em>"${params.question}"</em></p>
        <p><strong>Here is our team's official answer:</strong></p>
        <blockquote style="border-left: 3px solid #2563eb; padding-left: 12px; color: #1e293b;">
          ${params.answer}
        </blockquote>
      </div>
    `,
  });
}

