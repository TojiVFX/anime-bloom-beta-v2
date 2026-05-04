const animeData = require('../anime-meta.json');

module.exports = (req, res) => {
    const id = req.query.id || '';
    const anime = animeData.find(a => a.id === id);

    // ── Per-anime title: unique format with season, language, quality ──
    const title = anime
        ? `${anime.name} ${anime.language} Download HD 1080p – Anime Bloom`
        : 'Anime Bloom – Download Anime Hindi Dubbed & English Subbed HD 1080p Free';

    // ── Richer, unique description that uses every anime field ──
    const desc = anime
        ? (() => {
            const genres  = (anime.genres || []).join(', ');
            const eps     = anime.episodes ? `${anime.episodes} episodes` : '';
            const rating  = anime.rating   ? ` · Rated ${anime.rating}/10` : '';
            const season  = anime.season   ? `Season ${anime.season}` : '';
            const year    = anime.releaseYear ? ` (${anime.releaseYear})` : '';
            const parts   = [season, eps].filter(Boolean).join(', ');
            const snippet = (anime.description || '').slice(0, 120).trimEnd();
            return `Download ${anime.name}${year} in ${anime.language} HD 1080p on Anime Bloom. ${parts}${rating}. Genre: ${genres}. ${snippet}…`;
        })()
        : 'Anime Bloom is your #1 destination for Hindi and English dubbed anime downloads. Stream and download HD 1080p episodes for free.';

    // ── Keywords: anime name variations + genres + language ──
    const keywords = anime
        ? [
            anime.name,
            `${anime.name} ${anime.language}`,
            `${anime.name} download`,
            `${anime.name} HD`,
            `${anime.name} Season ${anime.season || '1'}`,
            ...(anime.genres || []).map(g => `${g} anime`),
            `${anime.language} anime`,
            'anime bloom',
            'hindi dubbed anime',
            'english dubbed anime',
          ].join(', ')
        : 'anime bloom, hindi dubbed anime, english dubbed anime, download anime HD 1080p free';

    const image   = anime ? anime.thumbnail : 'https://anime-bloom.vercel.app/favicon.png';
    const pageUrl = `https://anime-bloom.vercel.app/details?id=${encodeURIComponent(id)}`;
    const today   = new Date().toISOString().split('T')[0];

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- ── Primary SEO ── -->
    <title>${title}</title>
    <meta name="description" content="${desc}">
    <meta name="keywords"    content="${keywords}">
    <meta name="robots"      content="index, follow">
    <link rel="canonical"    href="${pageUrl}">

    <!-- ── Open Graph (WhatsApp, Facebook, Telegram previews) ── -->
    <meta property="og:type"         content="video.tv_show">
    <meta property="og:title"        content="${title}">
    <meta property="og:description"  content="${desc}">
    <meta property="og:image"        content="${image}">
    <meta property="og:image:width"  content="1280">
    <meta property="og:image:height" content="720">
    <meta property="og:url"          content="${pageUrl}">
    <meta property="og:site_name"    content="Anime Bloom">
    <meta property="og:updated_time" content="${today}">
    ${anime ? `<meta property="video:series"      content="${anime.name}">` : ''}

    <!-- ── Twitter Card ── -->
    <meta name="twitter:card"        content="summary_large_image">
    <meta name="twitter:title"       content="${title}">
    <meta name="twitter:description" content="${desc}">
    <meta name="twitter:image"       content="${image}">

    <link rel="icon" type="image/png" href="/favicon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/style.css">
    <script async src="/gtag.js"></script>

    ${anime ? `
    <!-- ── Structured Data: TV Series ── -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "TVSeries",
      "name": "${anime.name.replace(/"/g, '\\"')}",
      "description": "${desc.replace(/"/g, '\\"')}",
      "image": "${image}",
      "url": "${pageUrl}",
      "genre": ${JSON.stringify(anime.genres || [])},
      "numberOfEpisodes": ${anime.episodes || 0},
      "inLanguage": "${anime.language || ''}",
      "author": { "@type": "Organization", "name": "Anime Bloom" }
    }
    </script>

    <!-- ── Structured Data: VideoObject ── -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": "Watch ${anime.name.replace(/"/g, '\\"')} ${anime.language || ''} Online Free",
      "description": "Stream and download ${anime.name.replace(/"/g, '\\"')} in ${anime.language || ''} HD 1080p on Anime Bloom.",
      "thumbnailUrl": "${image}",
      "uploadDate": "${today}",
      "contentUrl": "${pageUrl}",
      "embedUrl": "${pageUrl}",
      "author": { "@type": "Organization", "name": "Anime Bloom", "url": "https://anime-bloom.vercel.app" }
    }
    </script>

    <!-- ── Structured Data: BreadcrumbList ── -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home",    "item": "https://anime-bloom.vercel.app/" },
        { "@type": "ListItem", "position": 2, "name": "Library", "item": "https://anime-bloom.vercel.app/library" },
        { "@type": "ListItem", "position": 3, "name": "${anime.name.replace(/"/g, '\\"')}", "item": "${pageUrl}" }
      ]
    }
    </script>
    ` : ''}
</head>
    <header>
        <nav>
            <div class="nav-container">
                <a href="/" class="logo">
                    <img src="/favicon.png" alt="Anime Bloom Logo" class="header-logo">
                    Anime<span>Bloom</span>
                </a>
                <div class="menu-container">
                    <button class="menu-btn" id="menu-btn" aria-label="Menu">&#8942;</button>
                    <ul class="nav-links" id="nav-links">
                        <li><a href="/">Home</a></li>
                        <li><a href="/library">Library</a></li>
                        <li><a href="/schedule">Schedule</a></li>
                        <li><a href="/about">About</a></li>
                        <li><a href="/about#contact">Contact</a></li>
                    </ul>
                </div>
            </div>
        </nav>
    </header>

    <main id="details-container">
        <div class="loading">Loading anime details...</div>
    </main>

    <footer>
        <div class="footer-container">
            <div class="footer-logo">
                <a href="/" class="logo"><img src="/favicon.png" alt="Anime Bloom" class="header-logo">Anime<span>Bloom</span></a>
                <p>Your ultimate destination for anime discovery. Explore, watch and download your favorite series in high quality.</p>
            </div>
            <div class="footer-links">
                <h3>Quick Links</h3>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/about">About</a></li>
                    <li><a href="/about#contact">Contact</a></li>
                    <li><a href="/privacy">Privacy Policy</a></li>
                </ul>
            </div>
            <div class="footer-social">
                <h3>Follow Us</h3>
                <div class="social-icons">
                    <a href="https://t.me/Anime_Bloom" target="_blank" title="Telegram">
                        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="social-logo" style="fill:#26A5E4"><title>Telegram</title><path fill="#26A5E4" d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                    </a>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2026 Anime Bloom. All rights reserved.</p>
        </div>
    </footer>

    <button id="back-to-top" title="Go to top">&#8679;</button>

    <script src="/data.js"></script>
    <script src="/config.js"></script>
    <script src="/main.js"></script>
</body>
</html>`);
};
