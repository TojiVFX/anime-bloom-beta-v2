const animeData = require('../anime-meta.json');

module.exports = (req, res) => {
    const id = req.query.id || '';
    const anime = animeData.find(a => a.id === id);

    const title    = anime ? `${anime.name} - Anime Bloom` : 'Anime Bloom';
    const desc     = anime
        ? `Watch and download ${anime.name} ${anime.language} on Anime Bloom. Season ${anime.season}. Genres: ${anime.genres.join(', ')}.`
        : 'Your ultimate destination for anime discovery. Search and download anime in Hindi and English dubbed.';
    const image    = anime ? anime.thumbnail : 'https://anime-bloom.vercel.app/favicon.png';
    const pageUrl  = `https://anime-bloom.vercel.app/details?id=${encodeURIComponent(id)}`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${desc}">
    <meta name="robots" content="index, follow">

    <!-- Open Graph (WhatsApp, Facebook, Telegram previews) -->
    <meta property="og:type"        content="video.tv_show">
    <meta property="og:title"       content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:image"       content="${image}">
    <meta property="og:image:width"  content="1280">
    <meta property="og:image:height" content="720">
    <meta property="og:url"         content="${pageUrl}">
    <meta property="og:site_name"   content="Anime Bloom">

    <!-- Twitter Card -->
    <meta name="twitter:card"        content="summary_large_image">
    <meta name="twitter:title"       content="${title}">
    <meta name="twitter:description" content="${desc}">
    <meta name="twitter:image"       content="${image}">

    <link rel="icon" type="image/png" href="/favicon.png">
    <link rel="stylesheet" href="/style.css">
    <script async src="/gtag.js"></script>
</head>
<body class="dark-theme">
    <div id="splash-screen">
        <img src="/favicon.png" alt="Anime Bloom Logo" class="splash-logo">
    </div>
    <header>
        <nav>
            <div class="nav-container">
                <a href="/" class="logo">
                    <img src="/favicon.png" alt="Logo" class="header-logo">
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
                <a href="/" class="logo"><img src="/favicon.png" alt="Logo" class="header-logo">Anime<span>Bloom</span></a>
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
