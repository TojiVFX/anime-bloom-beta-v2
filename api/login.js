export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminSecret = process.env.ADMIN_SECRET;

  // Safety check — env vars must be set
  if (!adminPassword || !adminSecret) {
    return res.status(500).json({
      error: 'Server misconfigured. Set ADMIN_PASSWORD and ADMIN_SECRET in Vercel environment variables.'
    });
  }

  // Validate password
  if (!password || password !== adminPassword) {
    // Small delay to slow brute-force attempts
    await new Promise(r => setTimeout(r, 800));
    return res.status(401).json({ error: 'Wrong password' });
  }

  // Set secure HttpOnly cookie (7 days)
  const maxAge = 60 * 60 * 24 * 7;
  res.setHeader('Set-Cookie',
    `admin_auth=${encodeURIComponent(adminSecret)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`
  );

  return res.status(200).json({ success: true });
}
