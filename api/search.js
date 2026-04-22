const animeData = require('../anime-meta.json');

// ── Levenshtein Distance ─────────────────────────────────────────────────────
function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, (_, i) =>
        Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (a[i - 1] === b[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
        }
    }
    return dp[m][n];
}

// ── Fuzzy Score ──────────────────────────────────────────────────────────────
function fuzzyScore(animeName, query) {
    const name = animeName.toLowerCase();
    const q    = query.toLowerCase();

    if (name === q)           return 100;
    if (name.startsWith(q))   return 95;
    if (name.includes(q))     return 85;

    const words = name.split(/\s+/);
    for (const word of words) {
        if (word.startsWith(q)) return 80;
        if (word.includes(q))   return 70;
    }

    // Fuzzy per word — allow 1 typo per 4 chars
    let bestWordScore = 0;
    for (const word of words) {
        if (word.length < 3) continue;
        const dist      = levenshtein(q, word);
        const tolerance = Math.floor(Math.max(q.length, word.length) / 4);
        if (dist <= tolerance) {
            const score = Math.max(0, 60 - (dist * 10));
            bestWordScore = Math.max(bestWordScore, score);
        }
    }
    if (bestWordScore > 0) return bestWordScore;

    // Full name fuzzy
    const fullDist      = levenshtein(q, name);
    const fullTolerance = Math.floor(name.length / 3);
    if (fullDist <= fullTolerance) {
        return Math.max(0, 50 - fullDist * 5);
    }

    return 0;
}

// ── Did You Mean ─────────────────────────────────────────────────────────────
function suggestCorrection(query) {
    const q = query.toLowerCase();
    let bestWord = null;
    let bestDist = Infinity;

    for (const anime of animeData) {
        const words = anime.name.toLowerCase().split(/\s+/);
        for (const word of words) {
            if (word.length < 3) continue;
            const dist = levenshtein(q, word);
            if (dist < bestDist && dist <= Math.floor(word.length / 3)) {
                bestDist = dist;
                bestWord = word;
            }
        }
    }
    return bestWord;
}

// ── Main Handler ─────────────────────────────────────────────────────────────
module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    const query    = (req.query.q || '').trim();
    const genre    = (req.query.genre || '').toLowerCase().trim();
    const language = (req.query.language || '').toLowerCase().trim();
    const page     = Math.max(1, parseInt(req.query.page) || 1);
    const limit    = Math.min(50, parseInt(req.query.limit) || 10);

    let scored = animeData.map(anime => {
        let score = 0;

        if (query) {
            score = fuzzyScore(anime.name, query);
            if (score === 0 && anime.genres) {
                for (const g of anime.genres) {
                    const gs = fuzzyScore(g, query);
                    if (gs > score) score = gs * 0.7;
                }
            }
        } else {
            score = 50;
        }

        if (genre) {
            const matchesGenre = anime.genres &&
                anime.genres.some(g => g.toLowerCase() === genre ||
                    levenshtein(g.toLowerCase(), genre) <= 1);
            if (!matchesGenre) score = 0;
        }

        if (language) {
            const matchesLang = anime.language &&
                anime.language.toLowerCase().includes(language);
            if (!matchesLang) score = 0;
        }

        return { anime, score };
    });

    const minScore = query ? 40 : 1;
    scored = scored.filter(s => s.score >= minScore);
    scored.sort((a, b) => b.score - a.score);

    const results = scored.map(s => s.anime);

    let didYouMean = null;
    if (query && results.length === 0) {
        didYouMean = suggestCorrection(query);
    }

    const total      = results.length;
    const totalPages = Math.ceil(total / limit);
    const start      = (page - 1) * limit;
    const paginated  = results.slice(start, start + limit);

    res.status(200).json({
        query:      query || null,
        genre:      genre || null,
        language:   language || null,
        total,
        page,
        totalPages,
        limit,
        didYouMean,
        results:    paginated
    });
};
