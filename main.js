// main.js

// --- Configuration Fallbacks ---
// (Actual configuration is in config.js)
const finalHeroSliderIds = typeof heroSliderIds !== 'undefined' ? heroSliderIds : [];
const finalNewlyAddedIds = typeof newlyAddedIds !== 'undefined' ? newlyAddedIds : [];
const finalRecommendedIds = typeof recommendedIds !== 'undefined' ? recommendedIds : [];
const finalTrendingIds = typeof trendingIds !== 'undefined' ? trendingIds : [];
const finalMovieIds = typeof movieIds !== 'undefined' ? movieIds : [];
const finalActionIds = typeof actionIds !== 'undefined' ? actionIds : [];
const finalComedyIds = typeof comedyIds !== 'undefined' ? comedyIds : [];
const finalIsekaiIds = typeof isekaiIds !== 'undefined' ? isekaiIds : [];
const finalFantasyIds = typeof fantasyIds !== 'undefined' ? fantasyIds : [];
const finalAdventureIds = typeof adventureIds !== 'undefined' ? adventureIds : [];
const finalRomanceIds = typeof romanceIds !== 'undefined' ? romanceIds : [];

// --- Splash Screen Logic ---
function hideSplashScreen() {
    const splash = document.getElementById('splash-screen');
    if (!splash) return;

    // Only show the splash once per browser session —
    // skip it on subsequent page visits / navigations
    if (sessionStorage.getItem('splashShown')) {
        splash.remove();
        return;
    }

    sessionStorage.setItem('splashShown', '1');

    // Wait for all assets (images, scripts) to finish loading
    // before fading out so the page content is actually ready
    const doFade = () => {
        setTimeout(() => {
            splash.classList.add('fade-out');
            setTimeout(() => splash.remove(), 500);
        }, 600);
    };

    if (document.readyState === 'complete') {
        doFade();
    } else {
        window.addEventListener('load', doFade, { once: true });
    }
}

// --- Helper Functions ---
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function createSkeletonCard() {
    const card = document.createElement('div');
    card.className = 'skeleton-card';
    card.innerHTML = `
        <div class="skeleton-img"></div>
        <div class="skeleton-info">
            <div class="skeleton-title"></div>
        </div>
    `;
    return card;
}

function createAnimeCard(anime) {
    const card = document.createElement('div');
    card.className = 'anime-card';

    const ratingBadge = anime.rating
        ? '<span class="rating-badge">&#9733; ' + anime.rating + '</span>'
        : '';

    const qualityText = (anime.quality || 'HD 1080p').replace('HD 1080p', 'HD').replace('HD ', 'HD');

    card.innerHTML = [
        '<div class="card-img-container">',
        '  <img src="' + (anime.thumbnail || '') + '" alt="' + (anime.name || '') + '" loading="lazy">',
        '  <div class="card-overlay">',
        '    <div class="quick-info">',
        '      <span class="quality-badge">' + qualityText + '</span>',
             ratingBadge,
        '      <span>' + (anime.episodes || 0) + ' Ep</span>',
        '      <span>' + (anime.releaseYear || '') + '</span>',
        '    </div>',
        '  </div>',
        '</div>',
        '<div class="card-info">',
        '  <h3>' + (anime.name || '') + '</h3>',
        '</div>'
    ].join('\n');

    card.onclick = function() {
        window.location.href = '/details?id=' + anime.id;
    };
    return card;
}
// --- Home Page Logic ---
function createAnimeRow(title, animes, genre = null) {
    if (animes.length === 0) return null;

    const row = document.createElement('section');
    row.className = 'anime-row';
    row.innerHTML = `
        <h2 class="section-title">${title}</h2>
        <div class="row-container"></div>
    `;

    const container = row.querySelector('.row-container');
    animes.forEach(anime => {
        container.appendChild(createAnimeCard(anime));
    });

    if (genre) {
        const viewAllCard = document.createElement('div');
        viewAllCard.className = 'view-all-card';
        viewAllCard.innerHTML = `<h3>View All</h3>`;
        viewAllCard.onclick = () => {
            window.location.href = `/genre.html?type=${genre.toLowerCase()}`;
        };
        container.appendChild(viewAllCard);
    }

    return row;
}

// Helper to get genre data with fallback and 15-item limit
const getGenreData = (manualIds, categoryName) => {
    if (manualIds && manualIds.length > 0) {
        return manualIds
            .map(id => animeData.find(a => a.id === id))
            .filter(a => a !== undefined);
    }
    // Fallback: Filter by category or genre, shuffle, and limit to 15
    const filtered = animeData.filter(a => {
        const lowerCat = categoryName.toLowerCase();
        return (a.category && a.category === lowerCat) || 
               (a.genres && a.genres.some(g => g.toLowerCase() === lowerCat));
    });
    return shuffleArray(filtered).slice(0, 15);
};

function displayAnime(animes, showLoadMore = false, isCategoryFiltered = false) {
    const container = document.getElementById('anime-container');
    const resultInfo = document.getElementById('result-info');
    const loadMoreContainer = document.getElementById('load-more-container');
    if (!container) return;

    // Fade out existing content, then swap
    container.style.transition = 'opacity 0.18s ease';
    container.style.opacity = '0';

    setTimeout(() => {
        container.innerHTML = '';

    if (resultInfo) {
        if (animes.length === animeData.length) {
            resultInfo.innerHTML = `Showing all <span class="result-count">${animes.length}</span> animes`;
        } else if (showLoadMore) {
            resultInfo.innerHTML = `Showing latest <span class="result-count">${animes.length}</span> animes`;
        } else {
            resultInfo.innerHTML = `Found <span class="result-count">${animes.length}</span> animes`;
        }
    }

    if (loadMoreContainer) {
        if (showLoadMore && animes.length < animeData.length) {
            loadMoreContainer.style.display = 'flex';
        } else {
            loadMoreContainer.style.display = 'none';
        }
    }

    if (animes.length === 0) {
        container.innerHTML = `
            <div class="no-results-container">
                <p class="no-results">Sorry, this anime is not available on our website.</p>
                <button class="reset-btn" onclick="resetFilters()">Reset All Filters</button>
            </div>
        `;
        return;
    }

    if (isCategoryFiltered) {
        const row = createAnimeRow('Results', animes);
        if (row) container.appendChild(row);
    } else if (animes.length < animeData.length) {
        // Search results or partial list
        const grid = document.createElement('div');
        grid.className = 'anime-grid';
        animes.forEach(anime => grid.appendChild(createAnimeCard(anime)));
        container.appendChild(grid);
    } else {
        // Initial state or "All" - Show Rows

        // Use manually configured IDs for Newly Added
        const newlyAdded = finalNewlyAddedIds
            .map(id => animeData.find(a => a.id === id))
            .filter(a => a !== undefined);

        // Use manually configured IDs for Recommended, or fallback to data.js flags
        let recommended = finalRecommendedIds
            .map(id => animeData.find(a => a.id === id))
            .filter(a => a !== undefined);

        if (recommended.length === 0 && finalRecommendedIds.length === 0) {
            recommended = shuffleArray(animeData.filter(a => a.recommended)).slice(0, 15);
        }

        const movies = getGenreData(finalMovieIds, 'Movie');
        const action = getGenreData(finalActionIds, 'Action');
        const comedy = getGenreData(finalComedyIds, 'Comedy');
        const isekai = getGenreData(finalIsekaiIds, 'Isekai');
        const fantasy = getGenreData(finalFantasyIds, 'Fantasy');
        const adventure = getGenreData(finalAdventureIds, 'Adventure');
        const romance = getGenreData(finalRomanceIds, 'Romance');

        const sections = [
            { title: 'Newly Added', data: newlyAdded },
            { title: 'Recommended For You', data: recommended },
            { title: 'Movie Section', data: movies, genre: 'Movie' },
            { title: 'Action Packed', data: action, genre: 'Action' },
            { title: 'Comedy Central', data: comedy, genre: 'Comedy' },
            { title: 'Isekai Adventures', data: isekai, genre: 'Isekai' },
            { title: 'Fantasy Worlds', data: fantasy, genre: 'Fantasy' },
            { title: 'Adventure Awaits', data: adventure, genre: 'Adventure' },
            { title: 'Romantic Stories', data: romance, genre: 'Romance' }
        ];

        sections.forEach(section => {
            const row = createAnimeRow(section.title, section.data, section.genre);
            if (row) container.appendChild(row);
        });

        // Always show Explore button after rows on home page
        if (loadMoreContainer) {
            loadMoreContainer.style.display = 'flex';
        }
    }

    // Refresh animations for newly rendered rows/cards
    if (typeof markRevealElements === 'function') {
        markRevealElements();
        requestAnimationFrame(() => {
            if (typeof observeNewReveals === 'function') observeNewReveals();
            container.querySelectorAll('.anime-grid, .row-container').forEach(staggerCards);
        });
    }

        // Fade back in
        container.style.opacity = '1';
    }, 180);
}

let currentDisplayedAnimes = [];

function resetFilters() {
    const searchBox = document.getElementById('search-box');
    const categoryBtns = document.querySelectorAll('.category-btn');

    if (searchBox) searchBox.value = '';
    categoryBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-category') === 'all') {
            btn.classList.add('active');
        }
    });

    currentDisplayedAnimes = shuffleArray(animeData).slice(0, 4);
    displayAnime(currentDisplayedAnimes, true);
}

function initHeroSlider() {
    const heroSlider = document.getElementById('hero-slider');
    if (!heroSlider) return;

    // Use manually configured IDs for the slider
    let featuredAnime = finalHeroSliderIds
        .map(id => animeData.find(a => a.id === id))
        .filter(a => a !== undefined);

    const totalSlides = featuredAnime.length;

    // Clear existing content
    heroSlider.innerHTML = '';

    // Setup Progress Bar Container
    const progressContainer = document.createElement('div');
    progressContainer.className = 'slider-progress-container';
    heroSlider.appendChild(progressContainer);

    // Create segments
    for (let i = 0; i < totalSlides; i++) {
        const segment = document.createElement('div');
        segment.className = 'slider-progress-segment';
        segment.innerHTML = '<div class="slider-progress-fill"></div>';
        progressContainer.appendChild(segment);
    }
    const progressFills = progressContainer.querySelectorAll('.slider-progress-fill');

    const slides = [];
    featuredAnime.forEach((anime, index) => {
        const slide = document.createElement('div');
        slide.className = `hero-slide ${index === 0 ? 'active' : ''}`;
        if (index === 0) {
            slide.style.backgroundImage = `url('${anime.thumbnail}')`;
        } else {
            slide.dataset.bg = anime.thumbnail;
        }

        let shortDesc = anime.description;
        if (shortDesc.length > 150) {
            shortDesc = shortDesc.substring(0, 150);
            const lastSpace = shortDesc.lastIndexOf(' ');
            if (lastSpace > 0) {
                shortDesc = shortDesc.substring(0, lastSpace);
            }
            shortDesc += "...";
        }

        slide.innerHTML = `
            <div class="hero-content">
                <h1>${anime.name}</h1>
                <p>${shortDesc}</p>
                <div class="hero-actions">
                    <a href="/details?id=${anime.id}" class="watch-btn">Watch Now</a>
                </div>
            </div>
        `;

        slide.onclick = (e) => {
            if (!e.target.classList.contains('watch-btn')) {
                window.location.href = `/details?id=${anime.id}`;
            }
        };

        heroSlider.appendChild(slide);
        slides.push(slide);
    });

    let currentSlide = 0;
    let progressStartTime;
    const duration = 4000;
    let animationFrameId;

    function animateProgress() {
        if (!progressStartTime) progressStartTime = Date.now();
        const elapsed = Date.now() - progressStartTime;
        const percentage = Math.min((elapsed / duration) * 100, 100);

        progressFills.forEach((fill, index) => {
            if (index < currentSlide) {
                fill.style.width = '100%';
            } else if (index === currentSlide) {
                fill.style.width = `${percentage}%`;
            } else {
                fill.style.width = '0%';
            }
        });

        if (percentage < 100) {
            animationFrameId = requestAnimationFrame(animateProgress);
        } else {
            nextSlide();
        }
    }

    function showSlide(index) {
        cancelAnimationFrame(animationFrameId);
        slides[currentSlide].classList.remove('active');
        currentSlide = (index + totalSlides) % totalSlides;
        const activeSlide = slides[currentSlide];
        if (activeSlide.dataset.bg) {
            activeSlide.style.backgroundImage = `url('${activeSlide.dataset.bg}')`;
            delete activeSlide.dataset.bg;
        }
        activeSlide.classList.add('active');

        progressStartTime = Date.now();
        animateProgress();
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    // Swipe Support
    let touchStartX = 0;
    let touchEndX = 0;

    heroSlider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    heroSlider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const threshold = 50;
        if (touchStartX - touchEndX > threshold) {
            nextSlide();
        } else if (touchEndX - touchStartX > threshold) {
            prevSlide();
        }
    }


    // Initial setup
    if (totalSlides > 0) {
        progressStartTime = Date.now();
        animateProgress();
    }
}

function initHome() {
    initHeroSlider();
    const searchBtn = document.getElementById('search-btn');
    const searchBox = document.getElementById('search-box');
    const categoryBtns = document.querySelectorAll('.category-btn');
    const exploreBtn = document.getElementById('explore-btn');

    if (searchBtn && searchBox) {
    const searchIcon = `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
    const clearIcon = `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

    let searchTimeout = null;

    const handleSearch = async () => {
        const query = searchBox.value.trim();

        // Toggle icon
        if (query.length > 0) {
            searchBtn.innerHTML = clearIcon;
            searchBtn.dataset.mode = 'clear';
        } else {
            searchBtn.innerHTML = searchIcon;
            searchBtn.dataset.mode = 'search';
            // Update URL back to clean home
            window.history.pushState({}, '', '/');
            displayAnime(animeData, false);
            return;
        }

        // Update URL so it looks like a real search
        window.history.pushState({ query }, '', `/?q=${encodeURIComponent(query)}`);

        // Debounce — wait 300ms after user stops typing
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=50`);
                const data = await res.json();
                displayAnime(data.results, false);

                // Show result count or did you mean
                const resultInfo = document.getElementById('result-info');
                if (resultInfo) {
                    if (data.total === 0 && data.didYouMean) {
                        const safeSuggest = data.didYouMean.replace(/"/g, '&quot;').replace(/</g, '&lt;');
                        resultInfo.innerHTML = `No results for "<strong>${query}</strong>". Did you mean: <a href="#" class="did-you-mean" data-suggest="${safeSuggest}"><strong>${safeSuggest}</strong></a>?`;
                        resultInfo.querySelector('.did-you-mean')?.addEventListener('click', (e) => {
                            e.preventDefault();
                            const sb = document.getElementById('search-box');
                            if (sb) { sb.value = e.currentTarget.dataset.suggest; sb.dispatchEvent(new Event('input')); }
                        });
                    } else {
                        resultInfo.innerHTML = `Found <span class="result-count">${data.total}</span> result${data.total !== 1 ? 's' : ''} for "<strong>${query}</strong>"`;
                    }
                }
            } catch (err) {
                // Fallback to local search if API fails
                const filtered = animeData.filter(anime =>
                    anime.name.toLowerCase().includes(query.toLowerCase())
                );
                displayAnime(filtered, false);
            }
        }, 300);
    };

    searchBtn.onclick = () => {
        if (searchBtn.dataset.mode === 'clear') {
            searchBox.value = '';
            searchBtn.innerHTML = searchIcon;
            searchBtn.dataset.mode = 'search';
            window.history.pushState({}, '', '/');
            displayAnime(animeData, false);
            const resultInfo = document.getElementById('result-info');
            if (resultInfo) resultInfo.innerHTML = '';
        } else {
            handleSearch();
        }
    };

    searchBox.oninput = handleSearch;
    searchBox.onkeyup = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    // Animated placeholder cycling
    initAnimatedPlaceholder('search-box');
    // Search suggestions dropdown
    initSearchSuggestions('search-box');
}

    categoryBtns.forEach(btn => {
        btn.onclick = () => {
            // Update active state
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.getAttribute('data-category');
            if (category === 'all') {
                displayAnime(shuffleArray(animeData), false);
            } else {
                const filtered = animeData.filter(anime => {
                    const matchesCategory = anime.category === category;
                    const matchesGenre = anime.genres && anime.genres.some(g => g.toLowerCase() === category.toLowerCase());
                    return matchesCategory || matchesGenre;
                });
                displayAnime(shuffleArray(filtered), false, true);
            }
        };
    });

    if (exploreBtn) {
        exploreBtn.onclick = () => {
            window.location.href = '/library';
        };
    }

    // Initial display: All (will show rows)
    displayAnime(animeData, false);
}

// --- Library Page Logic ---
function initLibrary() {
    const searchInput = document.getElementById('library-search-input');
    const searchBtn = document.getElementById('library-search-btn');
    const container = document.getElementById('anime-container-library');
    const resultInfo = document.getElementById('result-info');
    const categoryBtns = document.querySelectorAll('.library-category-btn');
    const loadingSplash = document.getElementById('loading-splash');

    if (!container) return;

    let displayedCount = 0;
    const initialLoad = 12;
    const loadAmount = 8;
    const shuffledAnimeData = shuffleArray(animeData);
    let currentFilteredAnimes = [...shuffledAnimeData];
    let currentCategory = 'all';
    let isTransitioning = false;

    function updateResultInfo(isDiscovery = false) {
        if (!resultInfo) return;
        if (isDiscovery) {
            resultInfo.innerHTML = `Exploring <span class="result-count">Discovery Mode</span>`;
        } else {
            resultInfo.innerHTML = `Showing <span class="result-count">${displayedCount}</span> of <span class="result-count">${currentFilteredAnimes.length}</span> animes`;
        }
    }

    function showLoading(show) {
        if (loadingSplash) {
            loadingSplash.style.display = show ? 'flex' : 'none';
        }
        if (show) {
            container.style.opacity = '0.3';
        } else {
            container.style.opacity = '1';
        }
    }

    function renderDiscovery() {
        container.innerHTML = '';
        container.className = 'discovery-mode';
        showLoading(true);

        // Artificial delay for premium feel
        setTimeout(() => {
            const trending = finalTrendingIds
                .map(id => animeData.find(a => a.id === id))
                .filter(a => a !== undefined);

            const movies = getGenreData(finalMovieIds, 'Movie');
            const action = getGenreData(finalActionIds, 'Action');
            const comedy = getGenreData(finalComedyIds, 'Comedy');
            const isekai = getGenreData(finalIsekaiIds, 'Isekai');
            const fantasy = getGenreData(finalFantasyIds, 'Fantasy');
            const adventure = getGenreData(finalAdventureIds, 'Adventure');
            const romance = getGenreData(finalRomanceIds, 'Romance');

            const librarySections = [
                { title: 'Trending Now', data: trending },
                { title: 'Movie Section', data: movies, genre: 'Movie' },
                { title: 'Action Packed', data: action, genre: 'Action' },
                { title: 'Comedy Central', data: comedy, genre: 'Comedy' },
                { title: 'Isekai Adventures', data: isekai, genre: 'Isekai' },
                { title: 'Fantasy Worlds', data: fantasy, genre: 'Fantasy' },
                { title: 'Adventure Awaits', data: adventure, genre: 'Adventure' },
                { title: 'Romantic Stories', data: romance, genre: 'Romance' }
            ];

            librarySections.forEach(section => {
                const row = createAnimeRow(section.title, section.data, section.genre);
                if (row) container.appendChild(row);
            });

            showLoading(false);
            updateResultInfo(true);
        }, 1000);
    }

    function renderGrid(animes) {
        container.style.transition = 'opacity 0.18s ease';
        container.style.opacity = '0';

        setTimeout(() => {
            container.innerHTML = '';
            container.className = 'grid-mode';
            currentFilteredAnimes = animes;

            const firstBatch = currentFilteredAnimes.slice(0, initialLoad);
            firstBatch.forEach(anime => {
                container.appendChild(createAnimeCard(anime));
            });

            displayedCount = firstBatch.length;
            updateResultInfo(false);

            if (animes.length === 0) {
                container.innerHTML = `
                    <div class="no-results-container">
                        <p class="no-results">Sorry, no anime found matching your criteria.</p>
                    </div>
                `;
            }

            // Stagger card animations
            requestAnimationFrame(() => staggerCards(container));

            container.style.opacity = '1';
        }, 180);
    }

    function loadMore() {
        if (container.className !== 'grid-mode' || displayedCount >= currentFilteredAnimes.length || isTransitioning) return;

        isTransitioning = true;
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) loadingIndicator.style.display = 'block';

        // Show Skeletons
        const skeletonBatch = document.createElement('div');
        skeletonBatch.className = 'skeleton-grid';
        for (let i = 0; i < loadAmount; i++) {
            if (displayedCount + i < currentFilteredAnimes.length) {
                skeletonBatch.appendChild(createSkeletonCard());
            }
        }
        container.appendChild(skeletonBatch);

        setTimeout(() => {
            skeletonBatch.remove();
            const nextBatch = currentFilteredAnimes.slice(displayedCount, displayedCount + loadAmount);
            nextBatch.forEach(anime => {
                container.appendChild(createAnimeCard(anime));
            });
            displayedCount += nextBatch.length;
            updateResultInfo(false);
            if (loadingIndicator) loadingIndicator.style.display = 'none';
            isTransitioning = false;
        }, 800);
    }

    let searchTimeout = null;

    async function handleFilter() {
        const query = searchInput.value.trim();

        if (query === '' && currentCategory === 'all') {
            window.history.pushState({}, '', '/library');
            renderDiscovery();
            return;
        }

        // Update URL
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (currentCategory !== 'all') params.set('genre', currentCategory);
        window.history.pushState({ query }, '', `/library?${params.toString()}`);

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            try {
                const url = `/api/search?${params}&limit=50`;
                const res = await fetch(url);
                const data = await res.json();
                renderGrid(data.results);
            } catch (err) {
                // Fallback to local search
                const filtered = shuffledAnimeData.filter(anime => {
                    const matchesSearch = !query ||
                        anime.name.toLowerCase().includes(query.toLowerCase()) ||
                        (anime.genres && anime.genres.some(g => g.toLowerCase().includes(query.toLowerCase())));
                    const matchesCategory = currentCategory === 'all' ||
                        anime.category === currentCategory ||
                        (anime.genres && anime.genres.some(g => g.toLowerCase() === currentCategory.toLowerCase()));
                    return matchesSearch && matchesCategory;
                });
                renderGrid(filtered);
            }
        }, 300);
    }

    if (searchInput) {
        searchInput.oninput = handleFilter;
        // Animated placeholder cycling
        initAnimatedPlaceholder('library-search-input');
        // Search suggestions dropdown
        initSearchSuggestions('library-search-input');
    }

    if (searchBtn) {
        searchBtn.onclick = handleFilter;
    }

    categoryBtns.forEach(btn => {
        btn.onclick = () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.getAttribute('data-category');
            handleFilter();
        };
    });

    // Infinite Scroll (Only in Grid Mode)
    window.addEventListener('scroll', () => {
        if (container.className === 'grid-mode' && (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
            loadMore();
        }
    });

    // Initial State: Discovery Mode
    renderDiscovery();
}

// --- Genre Page Logic ---
function initGenre() {
    const container = document.getElementById('genre-container');
    const genreTitle = document.getElementById('genre-title');
    const resultInfo = document.getElementById('result-info');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const genreType = urlParams.get('type');

    if (!genreType) {
        window.location.href = '/';
        return;
    }

    // Capitalize for display
    const displayGenre = genreType.charAt(0).toUpperCase() + genreType.slice(1);
    if (genreTitle) {
        genreTitle.innerHTML = '<span></span> Anime';
        genreTitle.querySelector('span').textContent = displayGenre;
    }

    const filtered = animeData.filter(anime => {
        const matchesCategory = anime.category === genreType.toLowerCase();
        const matchesGenre = anime.genres && anime.genres.some(g => g.toLowerCase() === genreType.toLowerCase());
        return matchesCategory || matchesGenre;
    });

    if (resultInfo) {
        resultInfo.innerHTML = 'Found <span class="result-count"></span> anime';
        const countSpan = resultInfo.querySelector('.result-count');
        countSpan.textContent = filtered.length;
        resultInfo.appendChild(document.createTextNode(` ${displayGenre} anime`));
    }

    if (filtered.length === 0) {
        container.innerHTML = `<p class="no-results">No anime found in this category.</p>`;
        return;
    }

    filtered.forEach(anime => {
        container.appendChild(createAnimeCard(anime));
    });
}

// --- Details Page Logic ---
function loadAnimeDetails() {
    const container = document.getElementById('details-container');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    let animeId = urlParams.get('id');

    if (!animeId) {
        // Try to get it from pathname for clean URLs (Keep this for robustness, though navigation now uses query params)
        const path = window.location.pathname.replace(/^\/|\/$/g, '');
        // Reserved paths that should not be treated as anime IDs
        const reservedPaths = ['about', 'privacy', 'index', 'details', 'index.html', 'details.html', 'about.html', 'privacy.html'];
        if (path && !reservedPaths.includes(path)) {
            animeId = path;
        }
    }

    if (!animeId) {
        container.innerHTML = '<p>No anime selected.</p>';
        return;
    }

    const anime = animeData.find(a => a.id === animeId);

    if (!anime) {
        container.innerHTML = '<p>Anime not found.</p>';
        return;
    }

    // Update page title
    document.title = `${anime.name} - Anime Bloom`;

    // Download buttons logic with "Coming Soon" fallback
    let downloadButtonsHtml = '';
    if (anime.downloadLinks && anime.downloadLinks.length > 0) {
        downloadButtonsHtml = anime.downloadLinks.map(dl => `
            <a href="${dl.link}" class="download-btn" target="_blank">Episode ${dl.episode}</a>
        `).join('');
    } else {
        // Center the button for empty download links
        downloadButtonsHtml = `
            <div style="width: 100%; display: flex; justify-content: center;">
                <a href="https://t.me/Anime_Bloom" class="download-btn" target="_blank">Episode Adding Soon</a>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="details-backdrop" style="background-image: url('${anime.thumbnail}')"></div>
        <div class="details-layout">
            <div class="details-thumbnail">
                <img src="${anime.thumbnail}" alt="${anime.name}" loading="lazy">
            </div>
            <div class="details-info">
                <h1>${anime.name}</h1>
                <div class="info-item"><strong>Season:</strong> ${anime.season}</div>
                <div class="info-item"><strong>Quality:</strong> ${anime.quality}</div>
                <div class="info-item"><strong>Release Year:</strong> ${anime.releaseYear}</div>
                ${anime.rating ? `<div class="info-item"><strong>Rating:</strong> <span style="color:#f5c518;font-weight:600;">&#9733; ${anime.rating}</span></div>` : ''}
                <div class="info-item"><strong>Duration:</strong> ${anime.duration}</div>
                <div class="info-item"><strong>Episodes:</strong> ${anime.episodes}</div>
                <div class="info-item"><strong>Genres:</strong> ${anime.genres.join(', ')}</div>
                <div class="info-item"><strong>Language:</strong> ${anime.language}</div>

                <div class="description">
                    <h3>Description</h3>
                    <p>${anime.description}</p>
                </div>
            </div>
            <div class="download-section">
                <h3>Download Episodes</h3>
                <div class="download-buttons">
                    ${downloadButtonsHtml}
                </div>
            </div>
        </div>

        <section class="recommended-section anime-row">
            <h2 class="section-title">Recommended For You</h2>
            <div id="recommended-row" class="row-container"></div>
        </section>
    `;

    // Populate recommendations
    const recRow = document.getElementById('recommended-row');
    if (recRow) {
        const recommended = animeData
            .filter(a => a.id !== anime.id && (a.category === anime.category || a.genres.some(g => anime.genres.includes(g))))
            .sort(() => 0.5 - Math.random())
            .slice(0, 10);

        recommended.forEach(recAnime => {
            recRow.appendChild(createAnimeCard(recAnime));
        });

        if (recommended.length === 0) {
            document.querySelector('.recommended-section').style.display = 'none';
        }
    }
}

// --- Schedule Page Logic ---
function initSchedule() {
    const newsContainer = document.getElementById('news-container');
    const scheduleContainer = document.getElementById('schedule-container');
    const dayTabs = document.querySelectorAll('.day-tab');

    if (!newsContainer || !scheduleContainer) return;

    // Render News
    const newsData = window.newsData || [];
    newsContainer.innerHTML = newsData.map(news => `
        <div class="news-card reveal">
            <img src="${news.thumbnail}" alt="${news.title}" class="news-img" loading="lazy">
            <div class="news-content">
                <span class="news-date">${new Date(news.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <h3>${news.title}</h3>
                <p>${news.description}</p>
            </div>
        </div>
    `).join('');

    // Render Schedule
    const scheduleData = window.scheduleData || [];
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = days[new Date().getDay()];

    function renderScheduleForDay(day) {
        const filtered = scheduleData.filter(item => item.day === day);

        if (filtered.length === 0) {
            scheduleContainer.innerHTML = `<p class="no-results">No releases scheduled for ${day}.</p>`;
            return;
        }

        scheduleContainer.innerHTML = filtered.map(item => {
            const anime = animeData.find(a => a.id === item.animeId);
            if (!anime) return '';

            // Format date manually provided in data
            const releaseDate = new Date(item.releaseDate);
            const formattedDate = releaseDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
            });

            return `
                <div class="schedule-card reveal" onclick="window.location.href='/details?id=${anime.id}'">
                    <div class="schedule-img-wrapper">
                        <img src="${anime.thumbnail}" alt="${anime.name}" loading="lazy">
                    </div>
                    <div class="schedule-info">
                        <span class="news-date" style="margin-bottom: 0.5rem; display: block;">${formattedDate}</span>
                        <h3>${anime.name}</h3>
                        <span class="episode-info">Episode ${item.episode}</span>
                        <div class="release-meta">
                            <span>🕙 ${item.airTimeDisplay || item.airTime + ' IST'}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Trigger animations
        if (typeof observeNewReveals === 'function') observeNewReveals();
    }

    // Tab Logic
    dayTabs.forEach(tab => {
        tab.onclick = () => {
            dayTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderScheduleForDay(tab.dataset.day);
        };
    });

    // Set initial tab to today
    const todayTab = Array.from(dayTabs).find(tab => tab.dataset.day === today);
    if (todayTab) {
        todayTab.click();
    } else {
        dayTabs[0].click();
    }
}

// --- About Page Logic ---
function initAbout() {
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm && formStatus) {
        contactForm.onsubmit = async (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;

            // Disable button during submission
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            const formData = new FormData(contactForm);

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // Show success message
                    formStatus.textContent = 'Thank you for your message! We will get back to you soon.';
                    formStatus.className = 'form-status success';
                    formStatus.style.display = 'block';
                    contactForm.reset();
                } else {
                    const data = await response.json();
                    if (Object.hasOwn(data, 'errors')) {
                        formStatus.textContent = data["errors"].map(error => error["message"]).join(", ");
                    } else {
                        formStatus.textContent = 'Oops! There was a problem submitting your form.';
                    }
                    formStatus.className = 'form-status error';
                    formStatus.style.display = 'block';
                }
            } catch (error) {
                formStatus.textContent = 'Oops! There was a problem submitting your form.';
                formStatus.className = 'form-status error';
                formStatus.style.display = 'block';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;

                // Clear message after 5 seconds if it was success
                if (formStatus.classList.contains('success')) {
                    setTimeout(() => {
                        formStatus.style.display = 'none';
                    }, 5000);
                }
            }
        };
    }
}

// =============================================
// ANIMATED PLACEHOLDER CYCLING
// =============================================
// ── Search Suggestions ──────────────────────────────────────────────────────
function initSearchSuggestions(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const wrapper = input.closest('.search-section') || input.closest('.library-search-wrapper');
    if (!wrapper) return;

    let dropdown = null;
    let activeIndex = -1;
    let suggestions = [];

    const searchIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;

    function highlightMatch(text, query) {
        if (!query) return text;
        const idx = text.toLowerCase().indexOf(query.toLowerCase());
        if (idx === -1) return text;
        return text.slice(0, idx)
            + '<mark>' + text.slice(idx, idx + query.length) + '</mark>'
            + text.slice(idx + query.length);
    }

    function showDropdown(items, query) {
        removeDropdown(false);

        dropdown = document.createElement('div');
        dropdown.className = 'search-suggestions';

        if (items.length === 0 && query.length >= 1) {
            dropdown.innerHTML = `<div class="suggestion-no-results">No results for "<strong>${query}</strong>"</div>`;
        } else {
            suggestions = items;
            const label = document.createElement('div');
            label.className = 'suggestion-label';
            label.textContent = query.length === 0 ? 'Trending' : `Results for "${query}"`;
            dropdown.appendChild(label);

            items.forEach((anime, i) => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                const isTyping = query.length > 0;
                item.innerHTML = `
                    ${isTyping
                        ? `<img class="suggestion-thumb" src="${anime.thumbnail}" alt="${anime.name}" loading="lazy">`
                        : `<div class="suggestion-icon">${searchIcon}</div>`
                    }
                    <div class="suggestion-info">
                        <div class="suggestion-name">${highlightMatch(anime.name, query)}</div>
                        <div class="suggestion-meta">
                            <span>${anime.language}</span>
                            <span class="suggestion-meta-dot"></span>
                            <span>${anime.genres ? anime.genres[0] : ''}</span>
                            ${anime.releaseYear ? `<span class="suggestion-meta-dot"></span><span>${anime.releaseYear}</span>` : ''}
                        </div>
                    </div>
                    <span class="suggestion-arrow">↗</span>
                `;
                item.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    window.location.href = `/details?id=${anime.id}`;
                });
                item.addEventListener('mouseover', () => {
                    activeIndex = i;
                    updateActive();
                });
                dropdown.appendChild(item);
            });
        }

        wrapper.appendChild(dropdown);
        activeIndex = -1;
    }

    function removeDropdown(removeWrapperClass = true) {
        if (dropdown) { dropdown.remove(); dropdown = null; }
        if (removeWrapperClass) {
            wrapper.classList.remove('is-focused');
        }
        activeIndex = -1;
        suggestions = [];
    }

    function updateActive() {
        if (!dropdown) return;
        dropdown.querySelectorAll('.suggestion-item').forEach((el, i) => {
            el.classList.toggle('active', i === activeIndex);
        });
    }

    input.addEventListener('focus', () => {
        wrapper.classList.add('is-focused');
        const query = input.value.trim();
        if (query.length === 0) {
            const trending = finalTrendingIds
                .map(id => animeData.find(a => a.id === id))
                .filter(Boolean)
                .slice(0, 6);
            if (trending.length > 0) showDropdown(trending, '');
        } else {
            input.dispatchEvent(new Event('input'));
        }
    });

    input.addEventListener('input', () => {
        const query = input.value.trim();
        if (query.length === 0) {
            removeDropdown(false);
            const trending = finalTrendingIds
                .map(id => animeData.find(a => a.id === id))
                .filter(Boolean)
                .slice(0, 6);
            if (trending.length > 0) showDropdown(trending, '');
            return;
        }
        const matches = animeData
            .filter(a => a.name.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 7);
        showDropdown(matches, query);
    });

    input.addEventListener('keydown', (e) => {
        if (!dropdown) return;
        const items = dropdown.querySelectorAll('.suggestion-item');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIndex = Math.min(activeIndex + 1, items.length - 1);
            updateActive();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = Math.max(activeIndex - 1, -1);
            updateActive();
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            if (suggestions[activeIndex]) {
                window.location.href = `/details?id=${suggestions[activeIndex].id}`;
            }
        } else if (e.key === 'Escape') {
            removeDropdown();
            input.blur();
        }
    });

    input.addEventListener('blur', () => {
        setTimeout(() => removeDropdown(), 150);
    });
}
// ── End Search Suggestions ───────────────────────────────────────────────────


function initAnimatedPlaceholder(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    // Build placeholder list from animeData if available, else fallback
    const names = typeof animeData !== 'undefined' && animeData.length
        ? shuffleArray(animeData).slice(0, 18).map(a => a.name)
        : ['Naruto', 'Attack on Titan', 'Demon Slayer', 'One Piece', 'Jujutsu Kaisen'];

    let currentIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timeoutId;
    const prefix = 'Search ';

    const TYPE_SPEED   = 72;   // ms per character typed
    const DELETE_SPEED = 35;   // ms per character deleted
    const HOLD_PAUSE   = 1600; // ms to hold full word before deleting
    const NEXT_PAUSE   = 320;  // ms pause before typing next word

    function tick() {
        // Don't animate if user is typing
        if (input.value.length > 0 || document.activeElement === input) {
            timeoutId = setTimeout(tick, 500);
            return;
        }

        const currentName = names[currentIndex];

        if (!isDeleting) {
            // Typing
            charIndex++;
            input.placeholder = prefix + currentName.slice(0, charIndex) + '|';

            if (charIndex === currentName.length) {
                // Finished typing — hold then start deleting
                isDeleting = true;
                timeoutId = setTimeout(tick, HOLD_PAUSE);
                return;
            }
        } else {
            // Deleting
            charIndex--;
            input.placeholder = charIndex > 0
                ? prefix + currentName.slice(0, charIndex) + '|'
                : 'Search...';

            if (charIndex === 0) {
                // Move to next name
                isDeleting = false;
                currentIndex = (currentIndex + 1) % names.length;
                timeoutId = setTimeout(tick, NEXT_PAUSE);
                return;
            }
        }

        timeoutId = setTimeout(tick, isDeleting ? DELETE_SPEED : TYPE_SPEED);
    }

    // Remove cursor blink when user focuses
    input.addEventListener('focus', () => {
        clearTimeout(timeoutId);
        input.placeholder = 'Search...';
    });

    // Restart cycling when user blurs and input is empty
    input.addEventListener('blur', () => {
        if (input.value.length === 0) {
            charIndex = 0;
            isDeleting = false;
            timeoutId = setTimeout(tick, 600);
        }
    });

    // Kick off
    timeoutId = setTimeout(tick, 800);
}
// =============================================
// END ANIMATED PLACEHOLDER
// =============================================

/** Attach scroll-reveal observer to any element with class "reveal" */
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // fire once
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/** Re-run observer for dynamically added elements */
function observeNewReveals() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
}

/** Mark section titles and rows as reveal elements */
function markRevealElements() {
    document.querySelectorAll('.section-title, .anime-row, .library-control-hub, .about-section, .contact-section, .footer-container, .news-section, .schedule-section').forEach(el => {
        el.classList.add('reveal');
    });
}

/** Stagger anime card entrance animations inside a container */
function staggerCards(container) {
    const cards = container.querySelectorAll('.anime-card');
    cards.forEach((card, i) => {
        // Force reflow to restart animation on re-render
        card.style.animation = 'none';
        card.offsetHeight; // trigger reflow
        card.style.animation = '';
        card.style.animationDelay = `${i * 0.06}s`;
        card.style.animationFillMode = 'both';
    });
}

/** Stagger .info-item elements on details page */
function staggerInfoItems() {
    document.querySelectorAll('.info-item').forEach((el, i) => {
        el.style.animationDelay = `${0.5 + i * 0.08}s`;
    });
}

/** Animate footer links when footer scrolls into view */
function initFooterAnimation() {
    const footerLinks = document.querySelectorAll('.footer-links li');
    if (!footerLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                footerLinks.forEach((li, i) => {
                    setTimeout(() => li.classList.add('footer-visible'), i * 70);
                });
                observer.disconnect();
            }
        });
    }, { threshold: 0.2 });

    const footer = document.querySelector('footer');
    if (footer) observer.observe(footer);
}

// =============================================
// END ANIMATION SYSTEM
// =============================================

// Initialization based on page
document.addEventListener('DOMContentLoaded', () => {
    hideSplashScreen();
    if (document.getElementById('anime-container')) {
        initHome();
        initTelegramModal();
    }
    if (document.getElementById('anime-container-library')) {
        initLibrary();
    }
    if (document.getElementById('genre-container')) {
        initGenre();
    }
    if (document.getElementById('details-container')) {
        loadAnimeDetails();
        setTimeout(staggerInfoItems, 100);
    }
    if (document.getElementById('contact-form')) {
        initAbout();
    }
    if (document.getElementById('schedule-container')) {
        initSchedule();
    }

    // Bootstrap animations
    markRevealElements();
    initScrollReveal();
    initFooterAnimation();

    // Stagger cards already in the DOM on load
    document.querySelectorAll('.anime-grid, .row-container').forEach(staggerCards);

    // Handle browser back/forward — restore search instead of showing raw JSON
    window.addEventListener('popstate', () => {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q') || '';
        const searchBox = document.getElementById('search-box') ||
                          document.getElementById('library-search-input');
        if (searchBox) {
            searchBox.value = q;
            searchBox.dispatchEvent(new Event('input'));
        }
        // If back to homepage with no query, fully reset UI
        if (!q) {
            const resultInfo = document.getElementById('result-info');
            if (resultInfo) resultInfo.innerHTML = '';
            const searchBtn = document.getElementById('search-btn');
            if (searchBtn) {
                searchBtn.dataset.mode = 'search';
                searchBtn.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
            }
        }
    });

    // Header scroll effect
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Header Menu Toggle
    const menuBtn = document.getElementById('menu-btn');
    const navLinks = document.getElementById('nav-links');

    if (menuBtn && navLinks) {
        menuBtn.onclick = (e) => {
            e.stopPropagation();
            const isOpen = navLinks.classList.toggle('active');
            menuBtn.classList.toggle('open', isOpen);
        };

        document.addEventListener('click', (e) => {
            if (!menuBtn.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
                menuBtn.classList.remove('open');
            }
        });
    }

    // Back to Top functionality
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        backToTopBtn.onclick = () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        };
    }
});

// --- Telegram Modal Logic ---
function initTelegramModal() {
    const modal = document.getElementById('telegram-modal');
    const closeBtn = document.getElementById('modal-close');
    const joinBtn = document.getElementById('modal-join-btn');

    if (!modal) return;

    // Check if modal has been shown in this session
    const hasBeenShown = sessionStorage.getItem('telegramModalShown');

    if (!hasBeenShown) {
        // Show modal immediately
        modal.classList.add('active');

        // Prevent scrolling when modal is open
        document.body.style.overflow = 'hidden';
    }

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        sessionStorage.setItem('telegramModalShown', 'true');
    };

    if (closeBtn) {
        closeBtn.onclick = closeModal;
    }

    if (joinBtn) {
        joinBtn.onclick = closeModal;
    }

    // Close on click outside content
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal();
        }
    };
}

// =============================================
// RED LIQUID RIPPLE — fires on every click
// =============================================
(function initRipple() {
    // Inject ripple keyframe + style once
    const style = document.createElement('style');
    style.textContent = `
        .ripple-wave {
            position: fixed;
            border-radius: 50%;
            pointer-events: none;
            z-index: 99999;
            transform: translate(-50%, -50%) scale(0);
            animation: rippleExpand var(--ripple-dur, 700ms) cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        }
        @keyframes rippleExpand {
            0%   { transform: translate(-50%, -50%) scale(0);   opacity: 0.55; }
            40%  { opacity: 0.35; }
            100% { transform: translate(-50%, -50%) scale(1);   opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    document.addEventListener('click', function spawnRipple(e) {
        // Skip plain text / non-visual areas
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;

        const x = e.clientX;
        const y = e.clientY;

        // Size: big enough to feel "liquid" but varies slightly for life
        const size = 22 + Math.random() * 14;
        const dur  = 420 + Math.random() * 130;

        const ripple = document.createElement('span');
        ripple.className = 'ripple-wave';

        // Red liquid gradient — inner bright core fading to transparent red
        ripple.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            width: ${size * 2}px;
            height: ${size * 2}px;
            --ripple-dur: ${dur}ms;
            background: radial-gradient(
                circle,
                rgba(255, 80,  60,  0.75) 0%,
                rgba(255, 46,  46,  0.50) 25%,
                rgba(200, 20,  20,  0.25) 55%,
                rgba(180,  0,   0,  0.08) 75%,
                transparent 100%
            );
            box-shadow:
                0 0 ${size * 0.4}px rgba(255, 46, 46, 0.4),
                0 0 ${size * 0.15}px rgba(255, 100, 60, 0.6);
            filter: blur(1.5px);
        `;

        document.body.appendChild(ripple);

        // Occasionally spawn a smaller trailing droplet for liquid feel
        if (Math.random() > 0.45) {
            const drop = document.createElement('span');
            drop.className = 'ripple-wave';
            const dSize = size * 0.38;
            const offsetX = (Math.random() - 0.5) * 18;
            const offsetY = (Math.random() - 0.5) * 18;
            drop.style.cssText = `
                left: ${x + offsetX}px;
                top: ${y + offsetY}px;
                width: ${dSize * 2}px;
                height: ${dSize * 2}px;
                --ripple-dur: ${dur * 0.75}ms;
                background: radial-gradient(
                    circle,
                    rgba(255, 90, 60, 0.85) 0%,
                    rgba(255, 46, 46, 0.45) 40%,
                    transparent 100%
                );
                filter: blur(1px);
            `;
            document.body.appendChild(drop);
            drop.addEventListener('animationend', () => drop.remove());
        }

        ripple.addEventListener('animationend', () => ripple.remove());
    });
})();
// =============================================
// END RIPPLE
// =============================================
