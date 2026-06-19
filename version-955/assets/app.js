import { H as Hls } from './hls.js';

const menuButton = document.querySelector('.menu-toggle');
const mobilePanel = document.querySelector('.mobile-panel');

if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', () => {
        mobilePanel.classList.toggle('open');
    });
}

const slides = Array.from(document.querySelectorAll('.hero-slide'));
const dots = Array.from(document.querySelectorAll('.hero-dots button'));
let activeSlide = 0;

function showSlide(index) {
    if (!slides.length) {
        return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('active', slideIndex === activeSlide);
    });
    dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === activeSlide);
    });
}

if (slides.length) {
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });
    showSlide(0);
    window.setInterval(() => showSlide(activeSlide + 1), 5200);
}

function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
}

function applyFilter() {
    const input = document.querySelector('[data-search-input]');
    const year = document.querySelector('[data-year-filter]');
    const cards = Array.from(document.querySelectorAll('.movie-card'));
    const empty = document.querySelector('.empty-state');
    const query = normalize(input ? input.value : '');
    const yearValue = year ? year.value : '';
    let visible = 0;

    cards.forEach(card => {
        const haystack = normalize([
            card.dataset.title,
            card.dataset.genre,
            card.dataset.tags,
            card.dataset.year
        ].join(' '));
        const matchesQuery = !query || haystack.includes(query);
        const matchesYear = !yearValue || card.dataset.year === yearValue;
        const show = matchesQuery && matchesYear;
        card.style.display = show ? '' : 'none';
        if (show) {
            visible += 1;
        }
    });

    if (empty) {
        empty.style.display = visible ? 'none' : 'block';
    }
}

const searchInput = document.querySelector('[data-search-input]');
const yearFilter = document.querySelector('[data-year-filter]');

if (searchInput || yearFilter) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    if (query && searchInput) {
        searchInput.value = query;
    }
    if (searchInput) {
        searchInput.addEventListener('input', applyFilter);
    }
    if (yearFilter) {
        yearFilter.addEventListener('change', applyFilter);
    }
    applyFilter();
}

function setupPlayer(shell) {
    const video = shell.querySelector('video');
    const cover = shell.querySelector('.play-cover');
    if (!video) {
        return;
    }

    const source = video.dataset.src;
    let loaded = false;

    function loadVideo() {
        if (loaded || !source) {
            return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (Hls && Hls.isSupported()) {
            const hls = new Hls({ enableWorker: true });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    async function playVideo() {
        loadVideo();
        video.controls = true;
        if (cover) {
            cover.classList.add('hidden');
        }
        try {
            await video.play();
        } catch (error) {
            video.controls = true;
        }
    }

    if (cover) {
        cover.addEventListener('click', playVideo);
    }

    video.addEventListener('click', () => {
        if (!loaded) {
            playVideo();
        }
    });
}

Array.from(document.querySelectorAll('.player-shell')).forEach(setupPlayer);
