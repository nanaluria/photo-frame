const fallbackFanarts = [
  {
    src: 'assets/fanart/2026-07-06__Sample Artist A__nolink__morning.svg',
    artist: 'Sample Artist A',
    date: '2026.07.06',
    title: 'morning',
    alt: 'Sample Artist Aさんのファンアート',
    url: ''
  },
  {
    src: 'assets/fanart/2026-07-07__Sample Artist B__xpost__sample_artist__1812345678901234567__night.svg',
    artist: 'Sample Artist B',
    date: '2026.07.07',
    title: 'night',
    alt: 'Sample Artist Bさんのファンアート',
    url: 'https://x.com/sample_artist/status/1812345678901234567'
  },
  {
    src: 'assets/fanart/2026-07-08__Sample Artist C__pixivart__123456789__teatime.svg',
    artist: 'Sample Artist C',
    date: '2026.07.08',
    title: 'teatime',
    alt: 'Sample Artist Cさんのファンアート',
    url: 'https://www.pixiv.net/artworks/123456789'
  }
];

function loadFanarts() {
  const dataEl = document.querySelector('#fanart-data');
  const rawData = dataEl?.textContent?.trim();

  if (rawData && !rawData.includes('{%')) {
    try {
      const parsed = JSON.parse(rawData);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (error) {
      console.warn('ファンアート一覧を読み込めませんでした。サンプル画像を表示します。', error);
    }
  }

  return fallbackFanarts;
}

const fanarts = loadFanarts();
const body = document.body;
const photoShell = document.querySelector('[data-photo-shell]');
const photo = document.querySelector('[data-photo]');
const wallpaper = document.querySelector('[data-wallpaper]');
const artTitle = document.querySelector('[data-art-title]');
const artistLink = document.querySelector('[data-artist-link]');
const artistText = document.querySelector('[data-artist-text]');
const artistName = document.querySelector('[data-artist]');
const artDate = document.querySelector('[data-art-date]');
const artPanel = document.querySelector('.art-panel');
const artLinkButton = document.querySelector('[data-art-link]');
const dateEl = document.querySelector('[data-date]');
const timeEl = document.querySelector('[data-time]');
const nextButton = document.querySelector('[data-next]');
const modeToggleButton = document.querySelector('[data-mode-toggle]');
const modeIcon = document.querySelector('[data-mode-icon]');

let currentIndex = -1;
let currentArt = null;

function getRandomIndex() {
  if (fanarts.length <= 1) return 0;
  let index = currentIndex;
  while (index === currentIndex) {
    index = Math.floor(Math.random() * fanarts.length);
  }
  return index;
}

function normalizeText(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function renderArt(index = getRandomIndex()) {
  if (!photo || !wallpaper || fanarts.length === 0) {
    if (photoShell) photoShell.classList.add('is-empty');
    return;
  }

  currentIndex = (index + fanarts.length) % fanarts.length;
  currentArt = fanarts[currentIndex];

  photoShell?.classList.add('is-changing');

  const nextImage = new Image();
  nextImage.onload = () => {
    const src = currentArt.src;
    photo.src = src;
    photo.alt = normalizeText(currentArt.alt, 'ファンアート');
    wallpaper.style.backgroundImage = `url("${src}")`;

    const title = normalizeText(currentArt.title, 'Fan Art');
    const artist = normalizeText(currentArt.artist, '作者不明');
    const date = normalizeText(currentArt.date, '----');

    if (artTitle) artTitle.textContent = title;
    if (artistName) artistName.textContent = artist;
    if (artistText) artistText.textContent = artist;
    if (artDate) artDate.textContent = date;

    if (currentArt.url) {
      artPanel?.classList.remove('no-url');
      artLinkButton?.removeAttribute('disabled');
      if (artistLink) artistLink.href = currentArt.url;
    } else {
      artPanel?.classList.add('no-url');
      artLinkButton?.setAttribute('disabled', '');
      if (artistLink) artistLink.removeAttribute('href');
    }

    setTimeout(() => photoShell?.classList.remove('is-changing'), 120);
  };
  nextImage.src = currentArt.src;
}

function updateClock() {
  const now = new Date();
  const dateFormatter = new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  const timeFormatter = new Intl.DateTimeFormat('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  if (dateEl) dateEl.textContent = dateFormatter.format(now);
  if (timeEl) timeEl.textContent = timeFormatter.format(now);
}

function setMode(mode) {
  const nextMode = mode === 'portrait' ? 'portrait' : 'landscape';
  body.classList.toggle('mode-portrait', nextMode === 'portrait');
  body.classList.toggle('mode-landscape', nextMode === 'landscape');

  if (modeIcon) modeIcon.textContent = nextMode === 'portrait' ? '▭' : '▯';
  if (modeToggleButton) {
    modeToggleButton.setAttribute(
      'aria-label',
      nextMode === 'portrait' ? '横長表示に切り替え' : '縦長表示に切り替え'
    );
    modeToggleButton.title = nextMode === 'portrait' ? '横長表示に切り替え' : '縦長表示に切り替え';
  }

  try {
    localStorage.setItem('photoClockMode', nextMode);
  } catch (error) {
    // localStorageが使えない環境でも表示自体は続行します。
  }
}

function restoreMode() {
  try {
    const savedMode = localStorage.getItem('photoClockMode');
    setMode(savedMode || 'landscape');
  } catch (error) {
    setMode('landscape');
  }
}

artLinkButton?.addEventListener('click', () => {
  if (!currentArt?.url) return;
  window.open(currentArt.url, '_blank', 'noopener,noreferrer');
});

nextButton?.addEventListener('click', () => renderArt());

modeToggleButton?.addEventListener('click', () => {
  const nextMode = body.classList.contains('mode-portrait') ? 'landscape' : 'portrait';
  setMode(nextMode);
});

restoreMode();
updateClock();
renderArt();
setInterval(updateClock, 1000);
setInterval(() => renderArt(), 1000 * 60 * 5);
