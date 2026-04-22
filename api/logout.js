export default function handler(req, res) {
  // Clear the auth cookie by setting it expired
  res.setHeader('Set-Cookie',
    'admin_auth=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'
  );
  res.redirect(302, '/login');
}
