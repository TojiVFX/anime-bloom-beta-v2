export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_OWNER = process.env.GITHUB_OWNER;
  const GITHUB_REPO  = process.env.GITHUB_REPO;

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return res.status(500).json({
      error: 'Missing env vars: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO must all be set in Vercel.'
    });
  }

  const { files, commitMsg } = req.body;
  if (!files || typeof files !== 'object' || Object.keys(files).length === 0) {
    return res.status(400).json({ error: 'Missing files object in request body.' });
  }

  // Security whitelist — only these files can ever be pushed
  const ALLOWED = new Set(['data.js', 'config.js', 'schedule-data.js', 'anime-meta.json']);

  const BRANCH = process.env.GITHUB_BRANCH || 'main';
  const BASE = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents`;
  const HEADERS = {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
    'User-Agent': 'AnimeBloom-Admin'
  };

  const results = [];

  for (const [filename, content] of Object.entries(files)) {
    // Block anything not in the whitelist
    if (!ALLOWED.has(filename)) {
      results.push({ file: filename, ok: false, error: 'File not in whitelist' });
      continue;
    }

    try {
      // Step 1: Get current file SHA (required for update)
      let sha = null;
      const getRes = await fetch(`${BASE}/${filename}?ref=${BRANCH}`, { headers: HEADERS });
      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
      } else if (getRes.status !== 404) {
        // 404 is fine (new file), but other errors should be reported
        const err = await getRes.json();
        results.push({ file: filename, ok: false, error: err.message });
        continue;
      }

      // Step 2: Push updated file
      const body = {
        message: (commitMsg && commitMsg.length > 5) ? commitMsg : `[AnimeBloom Admin] update ${filename}`,
        content: Buffer.from(content, 'utf8').toString('base64'),
        branch: BRANCH,
        ...(sha && { sha })
      };

      const putRes = await fetch(`${BASE}/${filename}`, {
        method: 'PUT',
        headers: HEADERS,
        body: JSON.stringify(body)
      });

      const putData = await putRes.json();
      if (putRes.ok) {
        results.push({ file: filename, ok: true, commit: putData.commit?.sha?.slice(0, 7) });
      } else {
        results.push({ file: filename, ok: false, error: putData.message });
      }
    } catch (err) {
      results.push({ file: filename, ok: false, error: err.message });
    }
  }

  const allOk = results.every(r => r.ok);
  const failed = results.filter(r => !r.ok);

  return res.status(allOk ? 200 : 207).json({
    success: allOk,
    results,
    message: allOk
      ? `All ${results.length} files pushed to GitHub. Vercel is deploying now...`
      : `${results.length - failed.length} files pushed, ${failed.length} failed.`
  });
}
