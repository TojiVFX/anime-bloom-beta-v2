import { useState } from "react";

type Priority = "high" | "medium" | "low";
type Category = "all" | "search" | "navigation" | "engagement" | "performance" | "mobile" | "content";

interface Improvement {
  id: number;
  title: string;
  category: Category;
  priority: Priority;
  effort: "easy" | "medium" | "hard";
  impact: number;
  description: string;
  problem: string;
  solution: string;
  codeHint?: string;
  tags: string[];
}

const improvements: Improvement[] = [
  {
    id: 1,
    title: "Watchlist / Bookmarks",
    category: "engagement",
    priority: "high",
    effort: "easy",
    impact: 5,
    description: "Let users save anime to a personal watchlist stored in localStorage.",
    problem: "Users have no way to save or track anime they want to watch. They must rely on memory or external tools.",
    solution: "Add a heart/bookmark button on each anime card and detail page. Persist to localStorage. Add a dedicated 'My List' section on the homepage and library.",
    codeHint: `// In main.js — add to createAnimeCard()
function toggleWatchlist(id) {
  const list = JSON.parse(localStorage.getItem('watchlist') || '[]');
  const idx = list.indexOf(id);
  if (idx > -1) list.splice(idx, 1);
  else list.push(id);
  localStorage.setItem('watchlist', JSON.stringify(list));
  renderWatchlistBtn(id);
}`,
    tags: ["localStorage", "UX", "Retention"],
  },
  {
    id: 2,
    title: "Recently Viewed History",
    category: "navigation",
    priority: "high",
    effort: "easy",
    impact: 4,
    description: "Track and display the last 8–10 anime the user visited as a row on the homepage.",
    problem: "When users navigate away from an anime page, they have no quick way to return to recently browsed titles.",
    solution: "Save visited anime IDs to localStorage on detail page load. Display a 'Continue Browsing' row on the homepage above the main sections. Clear-able by the user.",
    codeHint: `// In loadAnimeDetails() — main.js
const history = JSON.parse(localStorage.getItem('viewHistory') || '[]');
if (!history.includes(animeId)) {
  history.unshift(animeId);
  localStorage.setItem('viewHistory', JSON.stringify(history.slice(0, 10)));
}`,
    tags: ["localStorage", "Homepage", "Quick Win"],
  },
  {
    id: 3,
    title: "Advanced Library Filters",
    category: "search",
    priority: "high",
    effort: "medium",
    impact: 5,
    description: "Add sort & filter controls: by rating, release year, episode count, status, language.",
    problem: "Users can only filter by genre or search by name. There's no way to find 'completed Hindi-dubbed action anime from 2024 with high ratings'.",
    solution: "Add a filter panel in the library with dropdowns for Language, Status, Year range, Sort by (rating/year/episodes/name). Chain with the existing /api/search endpoint.",
    codeHint: `// In api/search.js — add sort param
const sort = req.query.sort || 'score';
const status = req.query.status || '';
if (sort === 'rating')
  scored.sort((a,b) => parseFloat(b.anime.rating||0) - parseFloat(a.anime.rating||0));
if (sort === 'year')
  scored.sort((a,b) => (b.anime.releaseYear||0) - (a.anime.releaseYear||0));
if (status) scored = scored.filter(s => s.anime.status === status);`,
    tags: ["Search API", "Filter", "Discovery"],
  },
  {
    id: 4,
    title: "Episode Progress Tracker",
    category: "engagement",
    priority: "high",
    effort: "medium",
    impact: 5,
    description: "Track which episodes the user has already downloaded, shown on the detail page with a progress bar.",
    problem: "Users who download episodes across multiple sessions have no way to know where they left off.",
    solution: "Add a 'Mark as Downloaded' toggle per episode button. Store in localStorage keyed by anime ID. Show a progress bar on anime cards and in the details header.",
    codeHint: `// localStorage key: ep_{animeId} = [1,2,3,...]
function markEpisode(animeId, ep) {
  const key = 'ep_' + animeId;
  const done = JSON.parse(localStorage.getItem(key) || '[]');
  done.includes(ep) ? done.splice(done.indexOf(ep),1) : done.push(ep);
  localStorage.setItem(key, JSON.stringify(done));
  updateProgressBar(animeId, done.length);
}`,
    tags: ["localStorage", "Detail Page", "Progress"],
  },
  {
    id: 5,
    title: "Keyboard Navigation & Shortcuts",
    category: "navigation",
    priority: "medium",
    effort: "easy",
    impact: 3,
    description: "Add keyboard shortcuts: '/' to focus search, Escape to clear, Arrow keys for hero slider.",
    problem: "Power users on desktop have no keyboard shortcuts. Navigation requires constant mouse use.",
    solution: "Bind '/' to open/focus search globally. Arrow keys control the hero slider. Escape clears search. Add a small shortcut hint badge near the search bar.",
    codeHint: `// In main.js DOMContentLoaded
document.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
    e.preventDefault();
    document.getElementById('search-box')?.focus();
  }
  if (e.key === 'Escape') {
    searchBox.value = '';
    searchBox.dispatchEvent(new Event('input'));
  }
});`,
    tags: ["Accessibility", "Desktop", "Quick Win"],
  },
  {
    id: 6,
    title: "Share Anime Links",
    category: "engagement",
    priority: "medium",
    effort: "easy",
    impact: 3,
    description: "Add a share button on each anime detail page using Web Share API with copy-to-clipboard fallback.",
    problem: "Users who want to share anime with friends must manually copy the URL. There is no built-in sharing.",
    solution: "Add a share icon button near the anime title. Use navigator.share() on mobile and copy-to-clipboard on desktop. Pre-fills the anime title + URL.",
    codeHint: `async function shareAnime(name, url) {
  if (navigator.share) {
    await navigator.share({
      title: name + ' - AnimeBloom',
      url: window.location.href
    });
  } else {
    await navigator.clipboard.writeText(window.location.href);
    toast('Link copied!');
  }
}`,
    tags: ["Web Share API", "Mobile", "Viral"],
  },
  {
    id: 7,
    title: "Episode Countdown Timer",
    category: "content",
    priority: "medium",
    effort: "medium",
    impact: 4,
    description: "Show a live countdown to the next episode release on the schedule page and airing anime detail pages.",
    problem: "The schedule page shows release dates but users must mentally calculate how long until the next episode.",
    solution: "Add a live countdown (days/hours/minutes) next to schedule entries. On detail pages for airing anime, show 'Next episode in X days Y hours' based on schedule data.",
    codeHint: `function getCountdown(releaseDateStr) {
  const diff = new Date(releaseDateStr) - new Date();
  if (diff <= 0) return 'Out now!';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return d > 0 ? d + 'd ' + h + 'h' : h + 'h ' + m + 'm';
}
setInterval(() => updateAllCountdowns(), 30000);`,
    tags: ["Schedule", "Real-time", "Engagement"],
  },
  {
    id: 8,
    title: "Global Sticky Search Overlay",
    category: "search",
    priority: "high",
    effort: "medium",
    impact: 4,
    description: "Make search accessible from all pages via a search icon in the nav header that opens a full overlay.",
    problem: "Search only exists on the homepage. Users on the library, details, or schedule page must navigate back just to search.",
    solution: "Add a search icon to the nav header on all HTML pages. Clicking opens a fullscreen search overlay with the same fuzzy-search logic, powered by /api/search.",
    codeHint: `// Add to header on all pages (home, library, details, schedule, about)
<button id="global-search-btn" class="nav-search-trigger" 
  onclick="openSearchOverlay()">
  <svg><!-- search icon --></svg>
</button>
// Overlay reuses same search dropdown + API logic from main.js`,
    tags: ["Navigation", "All Pages", "Search"],
  },
  {
    id: 9,
    title: "Genre Tags on Anime Cards",
    category: "content",
    priority: "low",
    effort: "easy",
    impact: 3,
    description: "Show 1–2 genre tags on each anime card so users can discover similar content at a glance.",
    problem: "Anime cards only show rating, episode count, and year. Genre info requires clicking through to the detail page.",
    solution: "Add the first 2 genres as small pill badges inside the card overlay or below the title. Make them clickable to instantly filter by that genre.",
    codeHint: `// In createAnimeCard() — main.js
const genrePills = (anime.genres || []).slice(0, 2)
  .map(g => \`<span class="genre-pill" 
    onclick="event.stopPropagation();filterByGenre('\${g}')">\${g}</span>\`)
  .join('');
// Add genrePills inside card-info div`,
    tags: ["Cards", "Discovery", "Quick Win"],
  },
  {
    id: 10,
    title: "Telegram Notification CTA",
    category: "engagement",
    priority: "high",
    effort: "easy",
    impact: 5,
    description: "Add a 'Get notified on Telegram' CTA button on each airing anime's detail page.",
    problem: "Users interested in upcoming episodes have no easy way to subscribe for updates beyond following the channel.",
    solution: "On detail pages for airing anime, show a 'Notify me when EP X drops' button that deep-links to your Telegram channel. Also add on schedule card entries.",
    codeHint: `// In loadAnimeDetails() for airing anime
const nextEp = (anime.downloadLinks?.length || 0) + 1;
const tgMsg = encodeURIComponent('Notify me: ' + anime.name + ' EP' + nextEp);
const tgUrl = 'https://t.me/Anime_Bloom?text=' + tgMsg;
// Render a button linking to tgUrl near the download section`,
    tags: ["Telegram", "Retention", "Airing Anime"],
  },
  {
    id: 11,
    title: "Sepia / Warm Mode Toggle",
    category: "performance",
    priority: "low",
    effort: "easy",
    impact: 2,
    description: "Add an eye-comfort warm/sepia mode for late-night viewing alongside the existing dark theme.",
    problem: "The site has only one dark theme. Heavy late-night viewers may want a warmer, less eye-straining color temperature.",
    solution: "Add a small toggle in the header switching between 'Dark' and 'Sepia'. Store preference in localStorage. Implement via CSS custom property overrides using data-theme on body.",
    codeHint: `:root[data-theme="sepia"] {
  --bg-color: #1a1510;
  --text-color: #e8d5b7;
  --accent-color: #e05a1a;
  --card-bg: #1f1a14;
  --nav-bg: rgba(26,21,16,0.85);
}
// Toggle: document.documentElement.dataset.theme = 'sepia'`,
    tags: ["Accessibility", "CSS", "Theme"],
  },
  {
    id: 12,
    title: "Status Ribbons on Anime Cards",
    category: "content",
    priority: "low",
    effort: "easy",
    impact: 3,
    description: "Show 'COMPLETE', 'AIRING', or 'NEW' ribbon badges on cards to help users identify series at a glance.",
    problem: "Users cannot tell from the card grid whether an anime is fully uploaded or still being updated without clicking through.",
    solution: "Add a small colored corner ribbon: green 'COMPLETE' for finished series, amber 'AIRING' for ongoing, and red 'NEW' for the most recently added anime.",
    codeHint: `// In createAnimeCard() — main.js
const ribbonMap = {
  completed: '<span class="card-ribbon complete">COMPLETE</span>',
  airing: '<span class="card-ribbon airing">AIRING</span>',
  upcoming: '<span class="card-ribbon upcoming">SOON</span>',
};
const ribbon = ribbonMap[anime.status] || '';
// Add ribbon inside card-img-container, position: absolute top-right`,
    tags: ["Cards", "Status", "Quick Win"],
  },
  {
    id: 13,
    title: "Smarter 'More Like This' Algorithm",
    category: "content",
    priority: "medium",
    effort: "easy",
    impact: 4,
    description: "Improve the recommended row on detail pages to score by multiple genre matches, language, and rating.",
    problem: "The current recommended row only scores on one genre match. Results can feel irrelevant or repetitive.",
    solution: "Score candidates by: number of overlapping genres (×3 weight), same language (+2), same franchise/season first, similar rating bracket (+1). Sort descending.",
    codeHint: `// In loadAnimeDetails() — replace the recommended logic
const scored = animeData
  .filter(a => a.id !== anime.id)
  .map(a => ({
    anime: a,
    score: a.genres.filter(g => anime.genres.includes(g)).length * 3
          + (a.language === anime.language ? 2 : 0)
          + (Math.abs((+a.rating||0) - (+anime.rating||0)) < 1 ? 1 : 0)
  }))
  .sort((a, b) => b.score - a.score)
  .slice(0, 10).map(s => s.anime);`,
    tags: ["Detail Page", "Discovery", "Algorithm"],
  },
  {
    id: 14,
    title: "Skeleton Loading on Details & Schedule",
    category: "performance",
    priority: "medium",
    effort: "easy",
    impact: 3,
    description: "Extend the existing skeleton shimmer system to the details page and schedule page loading states.",
    problem: "The details page shows plain 'Loading...' text while the schedule page has no loading state, causing layout shift.",
    solution: "Your shimmer CSS already exists in style.css. Build an HTML skeleton for the details layout (cover + info block) and schedule card grid. Swap on data load.",
    codeHint: `// Details skeleton — mirrors .details-layout structure
function buildDetailSkeleton() {
  return \`<div class="details-layout">
    <div class="sk-card" style="width:300px;height:420px;flex-shrink:0"></div>
    <div class="sk-card" style="flex:1;height:420px"></div>
  </div>\`;
}
container.innerHTML = buildDetailSkeleton();`,
    tags: ["Performance", "Details Page", "Schedule", "Quick Win"],
  },
  {
    id: 15,
    title: "Search History in Dropdown",
    category: "search",
    priority: "medium",
    effort: "easy",
    impact: 3,
    description: "Show the user's last 5 searches in the dropdown when the search box is focused with an empty value.",
    problem: "Users who repeatedly search for the same anime have to retype the full query every single time.",
    solution: "Save recent searches to localStorage on each search execution. Show a 'Recent' section above 'Trending' in the existing suggestions dropdown. Make them clickable.",
    codeHint: `// In initSearchSuggestions() — main.js
// On search execute:
const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
if (query && !recent.includes(query)) {
  recent.unshift(query);
  localStorage.setItem('recentSearches', JSON.stringify(recent.slice(0, 5)));
}
// On focus with empty input, show recent before trending`,
    tags: ["Search", "localStorage", "Quick Win"],
  },
  {
    id: 16,
    title: "PWA 'Add to Home Screen' Prompt",
    category: "mobile",
    priority: "medium",
    effort: "medium",
    impact: 4,
    description: "Trigger the browser 'Add to Home Screen' prompt after a user visits 3+ times.",
    problem: "You have a service worker (sw.js) registered but there is no prompt encouraging users to install the PWA for app-like access.",
    solution: "Listen for 'beforeinstallprompt'. After 3 visits (tracked in localStorage) show a subtle non-blocking banner. Dismissing saves the choice and never shows again.",
    codeHint: `let deferredPrompt;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  const visits = (+localStorage.getItem('pwa_visits') || 0) + 1;
  localStorage.setItem('pwa_visits', visits);
  if (visits >= 3 && !localStorage.getItem('pwa_dismissed')) {
    showInstallBanner(deferredPrompt);
  }
});`,
    tags: ["PWA", "Mobile", "Retention"],
  },
];

const categoryLabels: Record<Category, string> = {
  all: "All",
  search: "Search & Discovery",
  navigation: "Navigation",
  engagement: "User Engagement",
  performance: "Performance & Loading",
  mobile: "Mobile & PWA",
  content: "Content & Cards",
};

const categoryColors: Record<Category, string> = {
  all: "#888",
  search: "#4da6ff",
  navigation: "#a78bfa",
  engagement: "#f43f5e",
  performance: "#22d3ee",
  mobile: "#34d399",
  content: "#fbbf24",
};

const priorityColors: Record<Priority, string> = {
  high: "#f43f5e",
  medium: "#fbbf24",
  low: "#22d3ee",
};

const effortColors = { easy: "#22d3ee", medium: "#fbbf24", hard: "#f43f5e" };

export default function App() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [activePriority, setActivePriority] = useState<"all" | Priority>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchQ, setSearchQ] = useState("");

  const filtered = improvements.filter((item) => {
    const matchCat = activeCategory === "all" || item.category === activeCategory;
    const matchPri = activePriority === "all" || item.priority === activePriority;
    const matchQ =
      !searchQ ||
      item.title.toLowerCase().includes(searchQ.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQ.toLowerCase()));
    return matchCat && matchPri && matchQ;
  });

  const totalHigh = improvements.filter((i) => i.priority === "high").length;
  const totalEasy = improvements.filter((i) => i.effort === "easy").length;
  const avgImpact = (improvements.reduce((s, i) => s + i.impact, 0) / improvements.length).toFixed(1);

  const quickWins = ["Watchlist / Bookmarks","Recently Viewed History","Status Ribbons on Anime Cards","Genre Tags on Anime Cards","Search History in Dropdown"];

  return (
    <div style={{ fontFamily: "'Outfit','Segoe UI',sans-serif", background: "#09090e", minHeight: "100vh", color: "#e2e4f0", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: "#0f1018", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "16px 22px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,46,46,0.15)", border: "1px solid rgba(255,46,46,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>🌸</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>AnimeBloom — UX Improvement Guide</div>
          <div style={{ fontSize: 11.5, color: "#6b6f8a", marginTop: 2 }}>{improvements.length} actionable improvements analysed from your source code</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[{ label: "High Priority", val: totalHigh, color: "#f43f5e" }, { label: "Easy Wins", val: totalEasy, color: "#22d3ee" }, { label: "Avg Impact", val: avgImpact + "/5", color: "#fbbf24" }].map((s) => (
            <div key={s.label} style={{ background: "#1a1b27", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 9, padding: "6px 13px", textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 9.5, color: "#6b6f8a", textTransform: "uppercase", letterSpacing: "0.8px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0, flexWrap: "wrap" }}>
        {/* Sidebar */}
        <div style={{ width: 210, minWidth: 180, background: "#0f1018", borderRight: "1px solid rgba(255,255,255,0.07)", padding: "14px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
          <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Filter..." style={{ background: "#1a1b27", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 7, color: "#e2e4f0", fontFamily: "inherit", fontSize: 12, padding: "7px 10px", outline: "none", marginBottom: 8, width: "100%", boxSizing: "border-box" }} />
          <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", color: "#6b6f8a", padding: "2px 6px 4px" }}>Category</div>
          {(Object.keys(categoryLabels) as Category[]).map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 9px", borderRadius: 7, background: activeCategory === cat ? "rgba(255,46,46,0.1)" : "transparent", border: activeCategory === cat ? "1px solid rgba(255,46,46,0.28)" : "1px solid transparent", color: activeCategory === cat ? "#ff5555" : "#8888aa", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 500, textAlign: "left", transition: "all 0.13s" }}>
              {cat !== "all" && <span style={{ width: 7, height: 7, borderRadius: "50%", background: categoryColors[cat], flexShrink: 0 }} />}
              <span style={{ flex: 1 }}>{categoryLabels[cat]}</span>
              <span style={{ background: "#1e2030", borderRadius: 9, padding: "1px 5px", fontSize: 9.5, color: "#6b6f8a" }}>{cat === "all" ? improvements.length : improvements.filter((i) => i.category === cat).length}</span>
            </button>
          ))}
          <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", color: "#6b6f8a", padding: "10px 6px 4px" }}>Priority</div>
          {(["all", "high", "medium", "low"] as const).map((p) => (
            <button key={p} onClick={() => setActivePriority(p)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 9px", borderRadius: 7, background: activePriority === p ? "rgba(255,255,255,0.04)" : "transparent", border: "1px solid transparent", color: p === "all" ? (activePriority === p ? "#e2e4f0" : "#8888aa") : (priorityColors as any)[p], cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 500, opacity: activePriority === p ? 1 : 0.55 }}>
              {p === "all" ? "All Priorities" : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* Main grid */}
        <div style={{ flex: 1, overflow: "auto", padding: 18, minWidth: 0 }}>
          <div style={{ marginBottom: 10, fontSize: 12, color: "#6b6f8a" }}>Showing {filtered.length} improvement{filtered.length !== 1 ? "s" : ""}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 12 }}>
            {filtered.map((item) => (
              <div key={item.id} onClick={() => setSelectedId(selectedId === item.id ? null : item.id)} style={{ background: selectedId === item.id ? "#161724" : "#0f1018", border: `1px solid ${selectedId === item.id ? "rgba(255,46,46,0.32)" : "rgba(255,255,255,0.07)"}`, borderRadius: 11, padding: "15px 16px", cursor: "pointer", transition: "all 0.16s", borderLeft: `3px solid ${priorityColors[item.priority]}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 9, marginBottom: 9 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5, lineHeight: 1.3, marginBottom: 6 }}>{item.title}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      <span style={{ background: "rgba(255,255,255,0.04)", borderRadius: 5, padding: "2px 7px", fontSize: 10.5, color: categoryColors[item.category], border: `1px solid ${categoryColors[item.category]}30` }}>{categoryLabels[item.category]}</span>
                      <span style={{ background: `${priorityColors[item.priority]}16`, borderRadius: 5, padding: "2px 7px", fontSize: 10.5, color: priorityColors[item.priority], border: `1px solid ${priorityColors[item.priority]}40`, textTransform: "capitalize" }}>{item.priority} priority</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0 }}>
                    <div style={{ display: "flex", gap: 2 }}>{[1,2,3,4,5].map((n) => (<div key={n} style={{ width: 6, height: 6, borderRadius: "50%", background: n <= item.impact ? "#ff3b3b" : "#252838" }} />))}</div>
                    <div style={{ fontSize: 8.5, color: "#6b6f8a", textTransform: "uppercase", letterSpacing: "0.5px" }}>Impact</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#8e93aa", lineHeight: 1.65, marginBottom: 11 }}>{item.description}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                  <span style={{ background: `${(effortColors as any)[item.effort]}16`, color: (effortColors as any)[item.effort], border: `1px solid ${(effortColors as any)[item.effort]}30`, borderRadius: 5, padding: "2px 7px", fontSize: 10.5, textTransform: "capitalize" }}>{item.effort} effort</span>
                  {item.tags.map((tag) => (<span key={tag} style={{ background: "#1c1e2d", borderRadius: 4, padding: "2px 6px", fontSize: 10, color: "#6b6f8a" }}>{tag}</span>))}
                </div>
                {selectedId === item.id && (
                  <div style={{ marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#f43f5e", marginBottom: 5 }}>⚠ The Problem</div>
                      <div style={{ fontSize: 12, color: "#abb0c8", lineHeight: 1.7 }}>{item.problem}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#22d3ee", marginBottom: 5 }}>✦ The Solution</div>
                      <div style={{ fontSize: 12, color: "#abb0c8", lineHeight: 1.7 }}>{item.solution}</div>
                    </div>
                    {item.codeHint && (
                      <div>
                        <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#fbbf24", marginBottom: 5 }}>⟨/⟩ Code Hint</div>
                        <pre style={{ background: "#080910", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 7, padding: 12, fontSize: 11, color: "#7ecfff", overflowX: "auto", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>{item.codeHint}</pre>
                      </div>
                    )}
                  </div>
                )}
                <div style={{ marginTop: 8, fontSize: 10.5, color: "#6b6f8a", textAlign: "right" }}>{selectedId === item.id ? "▲ Collapse" : "▼ Details & code"}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer quick wins */}
      <div style={{ background: "#0f1018", borderTop: "1px solid rgba(255,255,255,0.07)", padding: "11px 22px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11.5, color: "#6b6f8a" }}>🚀 Best starting order:</span>
        {quickWins.map((t, i) => (
          <span key={t} onClick={() => { const found = improvements.find((x) => x.title === t); if (found) { setSelectedId(found.id); setActiveCategory("all"); setActivePriority("all"); setSearchQ(""); } }} style={{ background: "rgba(34,211,238,0.07)", border: "1px solid rgba(34,211,238,0.2)", borderRadius: 6, padding: "3px 9px", fontSize: 10.5, color: "#22d3ee", cursor: "pointer" }}>{i + 1}. {t}</span>
        ))}
      </div>
    </div>
  );
}
