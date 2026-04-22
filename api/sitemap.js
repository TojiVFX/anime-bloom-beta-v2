const animeData = require('../anime-meta.json');

const BASE_URL = 'https://anime-bloom.vercel.app';

module.exports = (req, res) => {
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 's-maxage=86400'); // cache for 24 hours

    const staticPages = [
        { url: '/',         priority: '1.0', changefreq: 'daily'   },
        { url: '/library',  priority: '0.9', changefreq: 'daily'   },
        { url: '/schedule', priority: '0.8', changefreq: 'weekly'  },
        { url: '/about',    priority: '0.6', changefreq: 'monthly' },
        { url: '/privacy',  priority: '0.4', changefreq: 'monthly' },
    ];

    const today = new Date().toISOString().split('T')[0];

    const staticUrls = staticPages.map(page => `
  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('');

    const animeUrls = animeData.map(anime => `
  <url>
    <loc>${BASE_URL}/details?id=${encodeURIComponent(anime.id)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${animeUrls}
</urlset>`;

    res.status(200).send(sitemap);
};
