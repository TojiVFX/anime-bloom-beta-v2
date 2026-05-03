
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
          "Add a 'Dark Mode' toggle for better night viewing.",
          "Improve the visibility of the 'Search' bar on mobile devices.",
          "Use higher resolution thumbnails for the Hero Slider."
        ],
        content_strategy: [
          "Create a 'Trending This Week' category based on views.",
          "Add user reviews or comments to increase engagement."
        ],
        seo: [
          "Add meta tags for each individual episode page.",
          "Improve image alt text for better accessibility and ranking."
        ],
        features: [
          "Implement a 'Watchlist' feature for registered users.",
          "Add a 'Random Anime' button for discovery."
        ],
        performance: [
          "Lazy load images below the fold to speed up initial load.",
          "Minimize CSS and JS files for production."
        ],
        user_experience: [
          "Add a breadcrumb navigation for easier browsing.",
          "Implement a faster 'Jump to Episode' dropdown."
        ],
        recommended_ids: (animeData || []).slice(0, 8).map(a => a.id)
      }
    });
  }

  const prompt = `
    You are an expert web consultant for an anime streaming and download site called "AnimeBloom".
    Analyze the following site data and provide strategic improvements.

    Site Data Summary:
    - Total Anime: ${animeData?.length || 0}
    - Recommended IDs: ${JSON.stringify(config?.r || [])}
    - Latest News: ${news?.[0]?.title || 'None'}
    - Schedule Entries: ${schedule?.length || 0}

    Current Anime List (Sample):
    ${JSON.stringify((animeData || []).slice(0, 20).map(a => ({ id: a.id, name: a.name, status: a.status, releaseYear: a.releaseYear, genres: a.genres })))}

    Please provide your response in valid JSON format with the following keys:
    1. "ui_ux": 3-4 specific design/user interface improvement ideas.
    2. "content_strategy": 2-3 ideas for better content engagement.
    3. "seo": 2-3 technical or content SEO tips.
    4. "features": 2-3 new feature ideas for the site.
    5. "performance": 2-3 tips to improve site speed and efficiency.
    6. "user_experience": 2-3 ideas to make navigation easier for fans.
    7. "recommended_ids": An array of exactly 8 anime IDs from the list above that should be in the "Recommended" section. Prioritize newest editions (highest releaseYear) and popular/high-quality looking titles. Return ONLY the IDs.

    Respond ONLY with the JSON object.
  `;

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
          { role: 'system', content: 'You are a helpful assistant that provides site improvement ideas in JSON format.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API Error');
    }

    const insights = JSON.parse(data.choices[0].message.content);

    return res.status(200).json({
      success: true,
      insights
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
