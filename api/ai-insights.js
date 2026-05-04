export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  if (!OPENROUTER_API_KEY) {
    return res.status(200).json({
      success: false,
      error: 'Missing OpenRouter API Key',
      message: 'To use AI Insights, please add OPENROUTER_API_KEY to your Vercel environment variables.'
    });
  }

  const { animeData, config, schedule, news, demo } = req.body;

  if (demo) {
    return res.status(200).json({
      success: true,
      insights: {
        ui_ux: [
          "Add a 'Continue Watching' row using localStorage — track which episode the user last opened and surface it at the top of the homepage.",
          "The hero slider autoplay is 4s which is very fast for reading a description. Increase it to 6–7s and add a pause-on-hover indicator so users know it's paused.",
          "Episode download buttons have no visual feedback on tap. Add a brief 'Copied/Opening' micro-animation so mobile users know their tap registered."
        ],
        content_strategy: [
          "You have several multi-season series (Re:ZERO S1+S2, AoT S3+S4, Solo Leveling S1+S2). Group them visually with a 'Season' badge and a 'Watch from S1' shortcut — reduces friction for new viewers.",
          "The 'Newly Added' section currently mixes movies and long series. Consider a separate 'New Episodes' row for ongoing airing anime so returning visitors instantly see what's updated.",
          "News section only has 2 entries. Even short 'Episode X of Y is now live' posts drive repeat visits — aim for one post per week tied to your schedule data."
        ],
        seo: [
          "Each anime details page title is generic ('Anime Bloom — Download & Watch...'). Dynamically inject the anime name, season, language and year into the <title> tag for long-tail search traffic.",
          "Your sitemap.xml at the root is static and misses most anime detail URLs. The dynamic /api/sitemap covers them — add a <sitemapindex> at /sitemap.xml pointing to /api/sitemap so Google discovers all pages.",
          "Add structured data (FAQPage or BreadcrumbList schema) to detail pages for episode counts and genres. This can trigger rich snippets in search results."
        ],
        features: [
          "Add a 'Random Anime' button in the library — one of the most-requested features on anime sites, and trivial to implement by picking a random index from your animeData array.",
          "Implement a lightweight URL-based watchlist: /watchlist?ids=id1,id2 — shareable, no login needed, persists via URL. Users can bookmark or share their list.",
          "Show episode release countdowns on the schedule page using the releaseDate field you already store. A live timer next to the episode name adds excitement."
        ],
        performance: [
          "Your data.js file grows with every new anime and is loaded on every page. Consider lazy-loading it only when needed (details, search) and keeping a lighter anime-meta.json on the homepage.",
          "Hero slider images are loaded all at once via background-image. Preload only the first slide's image in <head> with <link rel='preload' as='image'> and lazy-load the rest when the slide activates.",
          "The ripple effect spawns DOM nodes on every click — fine for light use, but on low-end Android devices it can cause jank. Add a check for prefers-reduced-motion and skip the animation for those users."
        ],
        user_experience: [
          "There is no visual indication when a series is fully dubbed vs still airing. Show the episode completion ratio (e.g. '10/12 episodes') on every card hover, not just in the admin panel — users need to know before clicking.",
          "The search dropdown closes on blur with a 150ms timeout, which is too short on mobile — tapping a suggestion often triggers blur before the click registers. Increase the timeout to 300ms.",
          "Add keyboard navigation to the category filters (Left/Right arrow keys). Power users and accessibility tools expect this, and it takes under 10 lines of JS."
        ],
        recommended_ids: (animeData || []).slice(0, 10).map(a => a.id)
      }
    });
  }

  // ── COMPUTED STATS FOR RICHER CONTEXT ──
  const totalAnime = animeData?.length || 0;
  const totalEpisodes = (animeData || []).reduce((s, a) => s + (a.downloadLinks || []).length, 0);
  const airingCount = (animeData || []).filter(a => a.status === 'airing').length;
  const completedCount = (animeData || []).filter(a => a.status === 'completed').length;
  const hindiCount = (animeData || []).filter(a => a.language?.includes('Hindi')).length;
  const englishCount = (animeData || []).filter(a => a.language?.includes('English')).length;

  // Top genres
  const genreFreq = {};
  (animeData || []).forEach(a => (a.genres || []).forEach(g => { genreFreq[g] = (genreFreq[g] || 0) + 1; }));
  const topGenres = Object.entries(genreFreq).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([g, c]) => `${g}(${c})`).join(', ');

  // Series with gaps (incomplete)
  const incompleteAiring = (animeData || [])
    .filter(a => a.status === 'airing' && a.episodes && (a.downloadLinks || []).length < a.episodes)
    .slice(0, 5)
    .map(a => `${a.name} (${(a.downloadLinks || []).length}/${a.episodes} eps)`);

  // Recently added (high release year)
  const recentAnime = [...(animeData || [])]
    .sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0))
    .slice(0, 10)
    .map(a => ({ id: a.id, name: a.name, status: a.status, releaseYear: a.releaseYear, genres: a.genres, rating: a.rating, language: a.language }));

  // Hero IDs resolved to names
  const heroNames = (config?.h || [])
    .map(id => (animeData || []).find(a => a.id === id)?.name)
    .filter(Boolean);

  // Config completeness check
  const configHealth = {
    heroCount: config?.h?.length || 0,
    newlyAddedCount: config?.n?.length || 0,
    recommendedCount: config?.r?.length || 0,
    trendingCount: config?.t?.length || 0,
  };

  // Schedule density
  const schedDays = {};
  (schedule || []).forEach(s => { schedDays[s.day] = (schedDays[s.day] || 0) + 1; });
  const emptyDays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].filter(d => !schedDays[d]);

  const prompt = `
You are an expert product consultant specializing in anime streaming and download websites.
You are reviewing "AnimeBloom" — a Vercel-hosted anime site that serves Hindi and English dubbed anime via Telegram download links.
The site has these pages: Home (hero slider + category rows), Library (discovery mode + grid search), Details (episode download buttons), Schedule (weekly release timetable), About/Contact.
The tech stack is: vanilla JS, no framework, Vercel serverless API, GitHub-based CMS via admin panel.

Your job is to give SPECIFIC, ACTIONABLE improvement suggestions — not generic web advice.
Reference actual data from the site (anime names, counts, config, schedule) wherever possible.
Every suggestion must be something the site owner can actually implement — no "redesign the whole site" or "hire a team" suggestions.

=== SITE DATA SNAPSHOT ===
Total anime: ${totalAnime}
Total episodes uploaded: ${totalEpisodes}
Currently airing: ${airingCount} | Completed: ${completedCount}
Hindi dubbed: ${hindiCount} | English dubbed: ${englishCount}
Top genres: ${topGenres}
Hero slider anime (${configHealth.heroCount}): ${heroNames.join(', ')}
Newly Added count: ${configHealth.newlyAddedCount}
Recommended count: ${configHealth.recommendedCount}
Trending count: ${configHealth.trendingCount}
Schedule empty days: ${emptyDays.length > 0 ? emptyDays.join(', ') : 'None — all days covered'}
Active news items: ${(news || []).length}
Incomplete airing series (missing episodes): ${incompleteAiring.length > 0 ? incompleteAiring.join('; ') : 'None'}

Most recently added anime:
${JSON.stringify(recentAnime)}

=== YOUR TASK ===
Respond with a JSON object containing EXACTLY these keys. All values are arrays of strings.
Each string must be 1–2 sentences, specific to AnimeBloom, and immediately actionable.
Do NOT use bullet sub-lists inside strings. Do NOT be vague or generic.

Keys required:
1. "ui_ux" — 3 UI/UX improvements. Reference actual page names or components (hero slider, episode download buttons, search dropdown, etc.).
2. "content_strategy" — 3 content ideas. Reference actual anime on the site, the schedule, or the news section.
3. "seo" — 3 SEO improvements. Reference specific pages (details page, sitemap, homepage) and actual issues like missing meta tags, static sitemap, or duplicate titles.
4. "features" — 3 new feature ideas. Must be implementable in vanilla JS or a simple Vercel serverless function. No login/auth systems.
5. "performance" — 3 performance improvements. Reference specific files (data.js, hero slider images, ripple animation) or Vercel config.
6. "user_experience" — 3 UX improvements focused on the viewer journey: discovery → detail page → download. Mention specific friction points.
7. "recommended_ids" — Array of exactly 10 anime IDs chosen from the data below. Prioritize: (a) high rating, (b) 2026 release year, (c) completed series so all episodes are available, (d) variety of genres. Return ONLY the IDs as strings.

Available IDs to choose from for recommended_ids:
${JSON.stringify((animeData || []).map(a => ({ id: a.id, name: a.name, rating: a.rating, releaseYear: a.releaseYear, status: a.status, genres: a.genres })))}

Respond ONLY with the raw JSON object. No markdown, no code fences, no extra text.
`.trim();

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://anime-bloom.vercel.app',
        'X-Title': 'AnimeBloom Admin',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a senior product consultant. You respond only with valid JSON objects — no markdown, no extra text, no code fences. Every suggestion must be specific, actionable, and grounded in the data provided.'
          },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.65,
        max_tokens: 2000
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenRouter API error');
    }

    let insights;
    try {
      insights = JSON.parse(data.choices[0].message.content);
    } catch {
      throw new Error('AI returned invalid JSON');
    }

    return res.status(200).json({ success: true, insights });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
