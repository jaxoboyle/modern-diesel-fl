export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Vercel usually parses JSON automatically, but guard against a raw string body.
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const { name = '', phone = '', vehicle = '', service = '', message = '' } = body || {};

  const firstName = name.split(' ')[0] || name;
  const lastName = name.split(' ').slice(1).join(' ') || '';

  // 1) Send the notification email via Resend (reliable, full details).
  const emailHtml = `
    <h2>New booking request from your website!</h2>
    <p><strong>Name:</strong> ${name || '—'}</p>
    <p><strong>Phone:</strong> ${phone || '—'}</p>
    <p><strong>Vehicle:</strong> ${vehicle || '—'}</p>
    <p><strong>Service Requested:</strong> ${service || '—'}</p>
    <p><strong>Message:</strong> ${message || '—'}</p>
    <p><strong>Submission Source:</strong> moderndieselfl.com</p>
    <hr>
    <p>Call back within the hour to confirm.</p>
  `;

  let emailOk = false;
  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Modern Diesel Leads <leads@moderndieselfl.com>',
        to: ['jqoboyle@gmail.com', 'moderndieselpsl@gmail.com'],
        subject: `New website lead — ${name || 'Unknown'}`,
        html: emailHtml,
      }),
    });
    emailOk = resendRes.ok;
    if (!resendRes.ok) {
      console.error('Resend error:', resendRes.status, await resendRes.text());
    }
  } catch (err) {
    console.error('Resend request failed:', err);
  }

  // 2) Also push the contact into GHL so the CRM/workflow still fires.
  try {
    await fetch(
      'https://services.leadconnectorhq.com/hooks/vw4iQvov9OQ3rsoeOAnb/webhook-trigger/243fb3b3-2072-4c9c-a305-57b056f22551',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          address1: vehicle,
          companyName: service,
          website: message,
        }),
      }
    );
  } catch (err) {
    console.error('GHL webhook failed:', err);
  }

  // Succeed for the visitor as long as the email went out.
  if (emailOk) {
    return res.status(200).json({ success: true });
  }
  return res.status(500).json({ error: 'Email failed to send' });
}
