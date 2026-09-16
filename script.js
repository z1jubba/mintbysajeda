const body = document.body;

// Page transition: a simple warm paper-like wipe using the actual Mint logo.
requestAnimationFrame(() => requestAnimationFrame(() => body.classList.add('page-loaded')));

document.querySelectorAll('a[href]').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank') return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !/\.html(?:$|#|\?)/.test(url.href)) return;
    if (url.href === location.href) return;
    e.preventDefault();
    body.classList.remove('page-loaded');
    body.classList.add('page-leaving');
    setTimeout(() => { location.href = link.href; }, 500);
  });
});

// Mobile menu.
const menu = document.querySelector('.menu-toggle');
const mobile = document.querySelector('.mobile-nav');
if (menu) {
  menu.addEventListener('click', () => {
    const open = body.classList.toggle('menu-open');
    menu.setAttribute('aria-expanded', String(open));
    mobile?.setAttribute('aria-hidden', String(!open));
  });
}

document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

// Scroll reveals.
const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) {
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  }
}), { threshold: .12, rootMargin: '0px 0px -7% 0px' });

document.querySelectorAll('.reveal, .reveal-image').forEach(el => observer.observe(el));

// Automatically give large editorial images a gentle reveal.
document.querySelectorAll('.story-image, .service-journal > img, .wide-photo, .about-photo, .info-photo, .film-image').forEach(el => {
  el.classList.add('reveal-image');
  observer.observe(el);
});

// Very subtle image movement while scrolling on larger screens.
const parallaxItems = [...document.querySelectorAll('.hero-main img, .wide-photo img, .final-photo img, .about-photo img')];
parallaxItems.forEach(el => el.classList.add('parallax-img'));
let ticking = false;
function updateParallax() {
  if (window.innerWidth < 761 || matchMedia('(prefers-reduced-motion: reduce)').matches) { ticking = false; return; }
  const vh = innerHeight;
  parallaxItems.forEach(el => {
    const r = el.getBoundingClientRect();
    const progress = (r.top + r.height / 2 - vh / 2) / vh;
    const y = Math.max(-10, Math.min(10, progress * -12));
    el.style.transform = `translate3d(0,${y}px,0) scale(1.025)`;
  });
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; } }, { passive: true });
addEventListener('resize', updateParallax);
updateParallax();

// Tiny view cursor on editorial image links (desktop only).
const cursor = document.createElement('div');
cursor.className = 'view-cursor';
cursor.textContent = 'View';
document.body.appendChild(cursor);
document.addEventListener('pointermove', e => {
  cursor.style.left = `${e.clientX}px`;
  cursor.style.top = `${e.clientY}px`;
});
document.querySelectorAll('.photo-link, .story-image, .album-preview').forEach(el => {
  el.addEventListener('pointerenter', () => cursor.classList.add('show'));
  el.addEventListener('pointerleave', () => cursor.classList.remove('show'));
});

// Album interaction.
const overlay = document.querySelector('.album-overlay');
const openers = [...document.querySelectorAll('[data-album-open], .album-open')];
const closer = document.querySelector('.album-close');
function openAlbum() {
  if (!overlay) return;
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  body.style.overflow = 'hidden';
}
function closeAlbum() {
  if (!overlay) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  body.style.overflow = '';
}
openers.forEach(b => b.addEventListener('click', openAlbum));
closer?.addEventListener('click', closeAlbum);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAlbum(); });

// If a remote Mint image ever fails, use real stock wedding photography rather than a blank tile.
const stockFallbacks = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=86',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1800&q=86',
  'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1800&q=86',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1800&q=86'
];
let fallbackIndex = 0;
document.querySelectorAll('img:not(.brand-logo):not(.footer-logo)').forEach(img => {
  img.addEventListener('error', function onError() {
    img.removeEventListener('error', onError);
    img.src = stockFallbacks[fallbackIndex++ % stockFallbacks.length];
    img.classList.add('img-fallback');
  });
});

// Demo form behaviour.
const form = document.querySelector('.contact-form');
form?.addEventListener('submit', e => {
  e.preventDefault();
  form.classList.add('sent');
});
