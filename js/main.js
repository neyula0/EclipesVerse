// ============================================
// ECLIPSVERSE - MAIN.JS
// ============================================

// ===== THEME VARIABLES =====
const THEME_COLORS = {
  '--primary': '#7c3aed',
  '--accent': '#7c3aed',
  '--accent-gradient': 'linear-gradient(135deg, #7c3aed, #a78bfa)',
  '--bg-primary': '#0a0a0f',
  '--bg-secondary': '#12101f',
  '--bg-card': '#1a1730',
  '--text-primary': '#e2e1ff',
  '--text-secondary': '#a0a0b8',
  '--text-muted': '#6a6a8a',
  '--border-color': '#2a2740',
  '--success': '#4ade80',
  '--warning': '#facc15',
  '--danger': '#ef4444',
  '--info': '#38bdf8'
};

// ===== API FUNCTIONS =====
async function fetchAnimekompi(endpoint, params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `https://api.animekompi.id/${endpoint}${queryString ? '?' + queryString : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'EclipesVerse/1.0'
      }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`❌ API Error (${endpoint}):`, error);
    throw error;
  }
}

// ===== UTILITY FUNCTIONS =====
function getPlaceholder(title = 'Anime') {
  return `https://via.placeholder.com/300x450/1a1730/7c3aed?text=${encodeURIComponent(title.substring(0, 20))}`;
}

function getStarsHtml(rating) {
  const stars = Math.round(rating / 2);
  return '★'.repeat(stars) + '☆'.repeat(5 - stars);
}

function getRatingColor(rating) {
  if (rating >= 8) return 'score-high';
  if (rating >= 6) return 'score-mid';
  if (rating >= 4) return 'score-low';
  return 'score-bad';
}

function showToast(message, icon = 'fa-check-circle', duration = 3000, type = 'default') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fas ${icon}"></i>
    <span>${message}</span>
  `;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: var(--bg-card);
    color: var(--text-primary);
    padding: 12px 20px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 9999;
    animation: slideIn 0.3s ease;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function searchAnime() {
  const input = document.getElementById('searchInput');
  if (!input || !input.value.trim()) {
    showToast('Masukkan kata kunci pencarian', 'fa-search');
    return;
  }
  window.location.href = `search.html?q=${encodeURIComponent(input.value.trim())}`;
}

function toggleMenu() {
  const menu = document.getElementById('navMenu');
  if (menu) menu.classList.toggle('open');
}

// ===== RENDER FUNCTIONS =====
function renderAnimeGrid(container, items, type = '') {
  if (!items || items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>Tidak ada anime</p>
      </div>
    `;
    return;
  }

  let html = '<div class="anime-grid">';

  items.forEach((item, idx) => {
    const title = item.title || 'Unknown';
    const path = item.path || item.id || title;
    const img = item.cover_url || getPlaceholder(title);
    const episode = item.episode || item.status || item.status_or_episode || '';
    const rating = parseFloat(item.rating) || 0;
    const type_val = item.type || '';
    const isHot = idx < 3;
    const isNew = idx < 5 && type === 'new';

    html += `
      <div class="anime-card" onclick="window.location.href='detail.html?path=${encodeURIComponent(path)}'">
        <div class="card-img">
          <img src="${img}" alt="${title}" loading="lazy" 
               onerror="this.src='${getPlaceholder(title)}'" />
          <div class="play-overlay">
            <i class="fas fa-play"></i>
          </div>
          ${episode ? `<span class="ep-badge">${episode}</span>` : ''}
          ${isHot ? `<span class="badge-hot">🔥 HOT</span>` : ''}
          ${isNew ? `<span class="badge-new">✨ NEW</span>` : ''}
        </div>
        <div class="card-body">
          <div class="title">${title}</div>
          ${rating ? `<div class="rating"><span class="stars">${getStarsHtml(rating)}</span> <span class="score ${getRatingColor(rating)}">${rating.toFixed(1)}</span></div>` : ''}
          <div class="meta">
            ${type_val ? `<span class="type">${type_val}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
}

function renderSliders(container, sliders) {
  if (!sliders || sliders.length === 0) {
    container.innerHTML = '';
    return;
  }

  let html = '';
  sliders.forEach((slider, idx) => {
    const img = slider.cover_url || slider.image || getPlaceholder(slider.title);
    const title = slider.title || 'Unknown';
    const path = slider.path || slider.id || title;

    html += `
      <div class="slider-card" onclick="window.location.href='detail.html?path=${encodeURIComponent(path)}'" style="background-image: url('${img}')">
        <div class="slider-overlay"></div>
        <div class="slider-content">
          <h3>${title}</h3>
          <button class="btn-play"><i class="fas fa-play"></i> Tonton</button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function renderFeatured(anime) {
  const title = anime.title || 'Featured Anime';
  const img = anime.cover_url || getPlaceholder(title);
  const path = anime.path || anime.id || title;
  const status = anime.status || 'Unknown';
  const type = anime.type || '';
  const rating = parseFloat(anime.rating) || 0;
  const synopsis = (anime.synopsis || anime.description || 'Tidak ada sinopsis.').substring(0, 200);

  const featuredCard = document.getElementById('featuredCard');
  if (!featuredCard) return;

  const starsHtml = getStarsHtml(rating);
  const ratingHtml = rating ? `<div class="featured-rating"><span class="stars">${starsHtml}</span> <strong>${rating.toFixed(1)}</strong></div>` : '';

  featuredCard.innerHTML = `
    <div class="featured-poster">
      <img id="featuredImage" src="${img}" alt="${title}" onerror="this.src='${getPlaceholder(title)}'" />
    </div>
    <div class="featured-info">
      <span class="featured-badge"><i class="fas fa-star"></i> Featured</span>
      <h3 id="featuredTitle">${title}</h3>
      <div class="featured-meta" id="featuredMeta">
        ${type ? `<span>${type}</span>` : ''}
        <span>${status}</span>
      </div>
      ${ratingHtml}
      <div class="featured-desc" id="featuredDesc">${synopsis}</div>
      <div class="featured-actions">
        <a href="detail.html?path=${encodeURIComponent(path)}" class="watch-btn" id="featuredWatchBtn">
          <i class="fas fa-play"></i> Tonton Sekarang
        </a>
      </div>
    </div>
  `;
}

// ===== INITIALIZE STYLES =====
function initializeStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(400px); opacity: 0; }
    }
    @keyframes shimmer {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.8; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-12px); }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

// ===== REGISTER SERVICE WORKER =====
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {
    console.log('Service Worker registration skipped');
  });
}

// ===== HIDE LOADING SCREEN =====
document.addEventListener('DOMContentLoaded', () => {
  initializeStyles();
  const loadingScreen = document.getElementById('loadingScreen');
  if (loadingScreen) {
    setTimeout(() => loadingScreen.classList.add('hide'), 800);
  }
});

// ===== GLOBAL EXPORTS =====
window.fetchAnimekompi = fetchAnimekompi;
window.getPlaceholder = getPlaceholder;
window.getStarsHtml = getStarsHtml;
window.getRatingColor = getRatingColor;
window.showToast = showToast;
window.searchAnime = searchAnime;
window.toggleMenu = toggleMenu;
window.renderAnimeGrid = renderAnimeGrid;
window.renderSliders = renderSliders;
window.renderFeatured = renderFeatured;

console.log('🚀 EclipesVerse Main.js loaded');
