/* ============================================
   ECLIPESVERSE - MAIN JAVASCRIPT
   Premium UI/UX - Version 2.1
   ============================================ */

// ============================================
// PWA - SERVICE WORKER REGISTRATION
// ============================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('✅ SW Registered successfully:', registration);
            })
            .catch((error) => {
                console.log('❌ SW Registration failed:', error);
            });
    });
}

// ============================================
// NOTIFICATION PERMISSION
// ============================================
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
            console.log('🔔 Notification permission:', permission);
        });
    }
}

document.addEventListener('click', requestNotificationPermission, { once: true });

// ============================================
// API CONFIG - TANPA API KEY!
// ============================================
// 🔥 URL BACKEND (SUDAH SETTING UNTUK TERMUX)
const API_BASE = 'http://localhost:5000/api/animekompi';

console.log(`🔧 API_BASE: ${API_BASE}`);

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================
document.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

// ============================================
// FETCH ANIMEKOMPI - TANPA API KEY!
// ============================================
async function fetchAnimekompi(endpoint, params = {}) {
    try {
        const query = new URLSearchParams(params).toString();
        const url = query ? `${API_BASE}/${endpoint}?${query}` : `${API_BASE}/${endpoint}`;
        console.log('➡️ Fetching:', url);

        const res = await fetch(url, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            console.warn(`⚠️ HTTP ${res.status}: ${res.statusText}`);
            return getFallbackData(endpoint);
        }

        const data = await res.json();
        console.log('✅ Data received:', data);

        if (data.code === 0 || data.status === 'success') {
            return data.data || data;
        } else if (Array.isArray(data)) {
            return data;
        } else if (data.animes || data.groups || data.latest_updates) {
            return data;
        } else {
            console.warn('⚠️ Unexpected response format:', data);
            return getFallbackData(endpoint);
        }
    } catch (error) {
        console.error('❌ Error:', error);
        return getFallbackData(endpoint);
    }
}

// ============================================
// FALLBACK DATA (Untuk offline / error)
// ============================================
function getFallbackData(endpoint) {
    console.log('📦 Using fallback data for:', endpoint);
    const fallback = {
        sliders: [
            { title: 'Zom 100: Zombie ni Naru made ni Shitai 100 no Koto', path: 'zom-100', cover_url: '', rating: 7.9, type: 'TV', status: 'Ongoing' },
            { title: 'Zombieland Saga', path: 'zombieland-saga', cover_url: '', rating: 7.8, type: 'TV', status: 'Completed' },
            { title: 'Yahari Ore no Seishun Love Comedy wa Machigatteiru', path: 'oregairu', cover_url: '', rating: 8.5, type: 'TV', status: 'Completed' }
        ],
        trending_today: [
            { title: 'Zom 100: Zombie ni Naru made ni Shitai 100 no Koto', path: 'zom-100', rating: 7.9, type: 'TV', episode: 'Episode 12' },
            { title: 'Zombieland Saga', path: 'zombieland-saga', rating: 7.8, type: 'TV', episode: 'Selesai' },
            { title: 'Yahari Ore no Seishun Love Comedy wa Machigatteiru. Kan', path: 'oregairu-kan', rating: 8.7, type: 'TV', episode: 'Selesai' }
        ],
        latest_updates: [
            { title: 'Yahari Ore no Seishun Love Comedy wa Machigatteiru.', path: 'oregairu', rating: 8.5, type: 'TV', episode: 'Selesai' },
            { title: 'Yahari Ore no Seishun Love Comedy wa Machigatteiru. Kan', path: 'oregairu-kan', rating: 8.7, type: 'TV', episode: 'Selesai' },
            { title: 'Zom 100: Zombie ni Naru made ni Shitai 100 no Koto', path: 'zom-100', rating: 7.9, type: 'TV', episode: 'Episode 12' }
        ]
    };
    return fallback[endpoint] || [];
}

// ============================================
// PLACEHOLDER GENERATOR
// ============================================
function getPlaceholder(title, size = '300x450') {
    const colors = ['7c3aed', 'ec4899', 'f59e0b', '10b981', '3b82f6', '8b5cf6', 'ef4444', '06b6d4'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const initial = title?.charAt(0)?.toUpperCase() || '?';
    const [w, h] = size.split('x');
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'%3E%3Crect width='${w}' height='${h}' fill='%23${color}'/%3E%3Ctext x='${parseInt(w)/2}' y='${parseInt(h)/2 + 10}' font-size='${parseInt(w)/3}' text-anchor='middle' fill='white' font-weight='bold' opacity='0.9'%3E${initial}%3C/text%3E%3Ctext x='${parseInt(w)/2}' y='${parseInt(h)/2 + 45}' font-size='${parseInt(w)/15}' text-anchor='middle' fill='rgba(255,255,255,0.7)'%3E${title?.substring(0, 15) || 'Anime'}%3C/text%3E%3C/svg%3E`;
}

// ============================================
// RATING HELPERS
// ============================================
function getStarsHtml(rating) {
    const num = parseFloat(rating) || 0;
    const full = Math.floor(num);
    const half = num - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    let html = '';
    for (let i = 0; i < full; i++) html += '★';
    if (half) html += '☆';
    for (let i = 0; i < empty; i++) html += '☆';
    return html;
}

function getRatingColor(rating) {
    const num = parseFloat(rating) || 0;
    if (num >= 8) return 'score-high';
    if (num >= 6) return 'score-mid';
    if (num >= 4) return 'score-low';
    return 'score-bad';
}

// ============================================
// RENDER ANIME GRID
// ============================================
function renderAnimeGrid(container, animeList, statusType = null) {
    if (!container) {
        console.error('❌ Container tidak ditemukan');
        return;
    }
    
    if (!animeList || animeList.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>Tidak ada anime</h3>
                <p>Belum ada data untuk kategori ini</p>
            </div>
        `;
        return;
    }

    const statusMap = {
        'ongoing': { label: 'Ongoing', cls: 'ongoing' },
        'populer': { label: 'Populer', cls: 'populer' },
        'completed': { label: 'Completed', cls: 'completed' },
        'jadwal': { label: 'Jadwal', cls: 'jadwal' },
        'az': { label: 'A-Z', cls: 'az' }
    };
    const badge = statusMap[statusType] || { label: '', cls: '' };

    let html = '';
    animeList.forEach(anime => {
        const title = anime.title || 'Unknown';
        const path = anime.path || anime.id || title;
        const img = anime.cover_url || getPlaceholder(title);
        const episode = anime.episode || anime.status || anime.status_or_episode || '';
        const rating = parseFloat(anime.rating) || 0;
        const type = anime.type || '';

        // Badge HOT untuk rating tinggi
        const isHot = rating >= 8;

        html += `
            <div class="anime-card" onclick="window.location.href='detail.html?path=${encodeURIComponent(path)}'">
                <div class="card-img">
                    <img src="${img}" alt="${title}" loading="lazy" 
                         onerror="this.src='${getPlaceholder(title)}'" />
                    <div class="play-overlay">
                        <i class="fas fa-play"></i>
                    </div>
                    ${isHot ? `<span class="badge-hot">🔥 HOT</span>` : ''}
                    ${episode ? `<span class="ep-badge">${episode}</span>` : ''}
                    ${badge.label ? `<span class="status-badge ${badge.cls}">${badge.label}</span>` : ''}
                </div>
                <div class="card-body">
                    <div class="title">${title}</div>
                    ${rating ? `<div class="rating"><span class="stars">${getStarsHtml(rating)}</span> <span class="score ${getRatingColor(rating)}">${rating.toFixed(1)}</span></div>` : ''}
                    <div class="meta">
                        ${type ? `<span class="type">${type}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ============================================
// RENDER SLIDER
// ============================================
function renderSliders(container, sliders) {
    if (!container || !sliders || sliders.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-image"></i><h3>Tidak ada slider</h3></div>`;
        return;
    }

    let html = '';
    sliders.forEach(item => {
        const title = item.title || 'Unknown';
        const path = item.path || item.id || title;
        const img = item.cover_url || getPlaceholder(title, '400x225');
        const episode = item.episode || item.status || '';
        const rating = parseFloat(item.rating) || 0;

        html += `
            <div class="slider-item" onclick="window.location.href='detail.html?path=${encodeURIComponent(path)}'">
                <div class="slider-img">
                    <img src="${img}" alt="${title}" loading="lazy" 
                         onerror="this.src='${getPlaceholder(title, '400x225')}'" />
                    <div class="slider-overlay">
                        ${episode ? `<span class="slider-ep">${episode}</span>` : ''}
                    </div>
                </div>
                <div class="slider-info">
                    <h4>${title}</h4>
                    ${rating ? `<div class="rating"><span class="stars">${getStarsHtml(rating)}</span> <span class="score ${getRatingColor(rating)}">${rating.toFixed(1)}</span></div>` : ''}
                    <div class="slider-meta">
                        ${item.genres?.slice(0, 3).map(g => `<span class="genre-tag">${g}</span>`).join('') || ''}
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// ============================================
// RENDER FEATURED
// ============================================
function renderFeatured(anime) {
    if (!anime) return;

    const img = document.getElementById('featuredImage');
    const title = document.getElementById('featuredTitle');
    const meta = document.getElementById('featuredMeta');
    const rating = document.getElementById('featuredRating');
    const desc = document.getElementById('featuredDesc');
    const watchBtn = document.getElementById('featuredWatchBtn');
    const card = document.getElementById('featuredCard');

    if (img) img.src = anime.cover_url || getPlaceholder(anime.title || 'Featured');
    if (title) title.textContent = anime.title || 'Unknown';
    if (meta) meta.textContent = `${anime.type || 'TV'} • ${anime.status || anime.status_or_episode || 'Ongoing'}`;

    const ratingVal = parseFloat(anime.rating) || 0;
    if (rating && ratingVal > 0) {
        rating.innerHTML = `
            <div class="rating">
                <span class="stars">${getStarsHtml(ratingVal)}</span>
                <span class="score ${getRatingColor(ratingVal)}">${ratingVal.toFixed(1)}</span>
            </div>
        `;
    }

    if (desc) desc.textContent = anime.deskripsi || anime.synopsis || 'Sinopsis tidak tersedia.';
    if (watchBtn) {
        watchBtn.href = `detail.html?path=${encodeURIComponent(anime.path || anime.id || '')}`;
    }
    if (card) {
        card.onclick = () => {
            window.location.href = `detail.html?path=${encodeURIComponent(anime.path || anime.id || '')}`;
        };
    }
}

// ============================================
// SLIDER SCROLL
// ============================================
function scrollSlider(direction) {
    const container = document.getElementById('sliderContainer');
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
}

// ============================================
// SEARCH
// ============================================
function searchAnime() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    const q = searchInput.value.trim();
    if (q) {
        window.location.href = `search.html?q=${encodeURIComponent(q)}`;
    }
}

// ============================================
// TOGGLE MENU
// ============================================
function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    if (navMenu) navMenu.classList.toggle('open');
}

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(message, icon = 'fa-info-circle', duration = 3000) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    if (duration > 0) {
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, duration);
    }
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', (e) => {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        searchInput.focus();
    }
    if (e.key === 'Escape') searchInput.blur();
});

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchAnime();
        });
    }
    console.log('🚀 EclipesVerse v2.1 loaded');
});

// ============================================
// EXPOSE GLOBAL
// ============================================
window.fetchAnimekompi = fetchAnimekompi;
window.getStarsHtml = getStarsHtml;
window.getRatingColor = getRatingColor;
window.renderAnimeGrid = renderAnimeGrid;
window.renderSliders = renderSliders;
window.renderFeatured = renderFeatured;
window.scrollSlider = scrollSlider;
window.searchAnime = searchAnime;
window.toggleMenu = toggleMenu;
window.showToast = showToast;
window.getPlaceholder = getPlaceholder;
window.requestNotificationPermission = requestNotificationPermission;
