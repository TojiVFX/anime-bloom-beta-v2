export default async function handler(req, res) {
  const TOKEN = process.env.GITHUB_TOKEN;
  const OWNER = process.env.GITHUB_OWNER;
  const REPO  = process.env.GITHUB_REPO;
  const BRANCH = process.env.GITHUB_BRANCH || 'main';

  const checks = [];

  // ── CHECK 1: Env vars present ──
  checks.push({
    name: 'Environment variables',
    ok: !!(TOKEN && OWNER && REPO),
    detail: !TOKEN ? 'GITHUB_TOKEN is missing'
          : !OWNER ? 'GITHUB_OWNER is missing'
          : !REPO  ? 'GITHUB_REPO is missing'
          : `TOKEN ✓  OWNER="${OWNER}"  REPO="${REPO}"  BRANCH="${BRANCH}"`
  });

  if (!TOKEN || !OWNER || !REPO) {
    return res.status(200).json({ ok: false, checks });
  }

  const HEADERS = {
    'Authorization': `Bearer ${TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'AnimeBloom-Admin'
  };

  // ── CHECK 2: Token valid (get authenticated user) ──
  try {
    const r = await fetch('https://api.github.com/user', { headers: HEADERS });
    const d = await r.json();
    if (r.ok) {
      checks.push({ name: 'GitHub token', ok: true, detail: `Valid — logged in as @${d.login}` });
    } else {
      checks.push({ name: 'GitHub token', ok: false, detail: `Invalid token: ${d.message}` });
      return res.status(200).json({ ok: false, checks });
    }
  } catch (e) {
    checks.push({ name: 'GitHub token', ok: false, detail: `Network error: ${e.message}` });
    return res.status(200).json({ ok: false, checks });
  }

  // ── CHECK 3: Repo accessible ──
  try {
    const r = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}`, { headers: HEADERS });
    const d = await r.json();
    if (r.ok) {
      checks.push({
        name: 'Repository access',
        ok: true,
        detail: `Found: ${d.full_name} (${d.private ? 'private' : 'public'}) — default branch: ${d.default_branch}`
      });
    } else if (r.status === 404) {
      checks.push({
        name: 'Repository access',
        ok: false,
        detail: `Repo "${OWNER}/${REPO}" not found. Check GITHUB_OWNER and GITHUB_REPO spelling exactly.`
      });
      return res.status(200).json({ ok: false, checks });
    } else {
      checks.push({ name: 'Repository access', ok: false, detail: `${r.status}: ${d.message}` });
      return res.status(200).json({ ok: false, checks });
    }
  } catch (e) {
    checks.push({ name: 'Repository access', ok: false, detail: e.message });
    return res.status(200).json({ ok: false, checks });
  }

  // ── CHECK 4: Branch exists ──
  try {
    const r = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/branches/${BRANCH}`, { headers: HEADERS });
    const d = await r.json();
    if (r.ok) {
      checks.push({ name: `Branch "${BRANCH}"`, ok: true, detail: `Exists — latest commit: ${d.commit?.sha?.slice(0,7)}` });
    } else {
      checks.push({
        name: `Branch "${BRANCH}"`,
        ok: false,
        detail: `Branch "${BRANCH}" not found. Try setting GITHUB_BRANCH to "master" or your actual branch name.`
      });
      return res.status(200).json({ ok: false, checks });
    }
  } catch (e) {
    checks.push({ name: `Branch "${BRANCH}"`, ok: false, detail: e.message });
  }

  // ── CHECK 5: Token has write permission ──
  try {
    const r = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}`, { headers: HEADERS });
    const d = await r.json();
    const perms = d.permissions || {};
    const canWrite = perms.push || perms.admin;
    checks.push({
      name: 'Write permission',
      ok: !!canWrite,
      detail: canWrite
        ? 'Token has push access to this repo'
        : 'Token has READ-ONLY access. Regenerate token with "repo" scope checked.'
    });
  } catch (e) {
    checks.push({ name: 'Write permission', ok: false, detail: e.message });
  }

  const allOk = checks.every(c => c.ok);
  return res.status(200).json({ ok: allOk, checks });
}
