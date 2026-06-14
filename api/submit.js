export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, vehicle, service, message } = req.body;

  try {
    const response = await fetch(
      'https://services.leadconnectorhq.com/hooks/vw4iQvov9OQ3rsoeOAnb/webhook-trigger/243fb3b3-2072-4c9c-a305-57b056f22551',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: name.split(' ')[0] || name,
          lastName: name.split(' ').slice(1).join(' ') || '',
          name,
          phone,
          vehicle,
          service,
          message,
          fullSummary: `Name: ${name}\nPhone: ${phone}\nVehicle: ${vehicle}\nService: ${service}\nNotes: ${message}`
        }),
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
