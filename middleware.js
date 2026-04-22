export default function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Only protect /admin and /admin.html
  if (path === '/admin' || path === '/admin.html') {
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/admin_auth=([^;]+)/);
    const token = match ? decodeURIComponent(match[1]) : '';
    const secret = process.env.ADMIN_SECRET || '';

    // If token doesn't match secret, redirect to login
    if (!secret || token !== secret) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', path);
      return Response.redirect(loginUrl, 302);
    }
  }

  // Block direct access to login API (only allow POST)
  if (path === '/api/login' && request.method === 'GET') {
    return Response.redirect(new URL('/login', request.url), 302);
  }
}

export const config = {
  matcher: ['/admin', '/admin.html', '/api/login'],
};
