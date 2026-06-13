export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, vehicle, service, message } = req.body;

  try {
    const response = await fetch(
      'https://services.leadconnectorhq.com/hooks/vw4iQvov9OQ3rsoeOAnb/webhook-trigger/ea776b6c-5d99-40c5-ac4a-368fb889db5d',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, vehicle, service, message }),
      }
    );

    if (!response.ok) {
      throw new Error(`GHL responded with ${response.status}`);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('GHL webhook error:', err);
    return res.status(500).json({ error: 'Submission failed' });
  }
}
