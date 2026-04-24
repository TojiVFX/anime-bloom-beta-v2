export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { source, key } = req.body;

  if (!source) return res.status(400).json({ error: 'Missing source (base64 image)' });
  if (!key)    return res.status(400).json({ error: 'Missing API key' });

  // Use URLSearchParams for simple form encoding — works without native FormData in Node
  const params = new URLSearchParams();
  params.append('key', key);
  params.append('source', source);
  params.append('format', 'json');

  let raw = null;
  let parsed = null;

  try {
    const upstream = await fetch('https://freeimage.host/api/1/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    raw = await upstream.text();

    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }

    // Return full upstream response + status for debugging
    return res.status(200).json({
      upstream_status: upstream.status,
      upstream_ok: upstream.ok,
      raw,
      parsed,
      // Convenience field — the direct image URL if successful
      url: parsed?.image?.url || parsed?.image?.display_url || null
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message,
      raw,
      parsed
    });
  }
}
