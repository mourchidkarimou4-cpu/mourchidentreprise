/* ═══════════════════════════════════════════════════════════════════
   MOURCHID ENTREPRISE — app.js
   Fonctionnalités : Preloader, Dark/Light Mode, Slideshow, Particles,
   Scroll Reveal, Compteurs, Filtre Boutique, Panier, Formulaires, Modal
═══════════════════════════════════════════════════════════════════ */

"use strict";

/* ── PRELOADER ────────────────────────────────────────────────────── */
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  setTimeout(() => {
    preloader.classList.add('hidden');
    setTimeout(() => preloader.remove(), 600);
    initScrollReveal();
    initCounters();
  }, 2200);
});

/* ── THEME TOGGLE (Dark / Light) ──────────────────────────────────── */
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Load saved theme
const savedTheme = localStorage.getItem('me-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('me-theme', next);
});

/* ── NAVBAR ───────────────────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  updateActiveLink();
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navMenu.classList.toggle('open');
});

// Close menu on nav link click
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
  });
});

// Active link highlighting
function updateActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 100) current = s.id;
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
  });
}

/* ── HERO SLIDESHOW ───────────────────────────────────────────────── */
const slides = document.querySelectorAll('.slide');
const indicators = document.querySelectorAll('.indicator');
let currentSlide = 0;
let slideshowTimer;

function goToSlide(idx) {
  slides[currentSlide].classList.remove('active');
  indicators[currentSlide].classList.remove('active');
  currentSlide = idx;
  slides[currentSlide].classList.add('active');
  indicators[currentSlide].classList.add('active');
}

function nextSlide() {
  goToSlide((currentSlide + 1) % slides.length);
}

function startSlideshow() {
  slideshowTimer = setInterval(nextSlide, 5000);
}

indicators.forEach((ind, idx) => {
  ind.addEventListener('click', () => {
    clearInterval(slideshowTimer);
    goToSlide(idx);
    startSlideshow();
  });
});

startSlideshow();

/* ── PARTICLES ────────────────────────────────────────────────────── */
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const colors = ['rgba(247,148,29,0.6)', 'rgba(26,53,160,0.5)', 'rgba(255,255,255,0.3)'];
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 6 + 2;
    p.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${Math.random() * 15 + 10}s;
      animation-delay: ${Math.random() * 10}s;
    `;
    container.appendChild(p);
  }
}
initParticles();

/* ── SCROLL REVEAL ────────────────────────────────────────────────── */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ── COUNTERS ─────────────────────────────────────────────────────── */
function initCounters() {
  const counters = document.querySelectorAll('.stat-num');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !e.target.dataset.counted) {
        e.target.dataset.counted = '1';
        const target = +e.target.dataset.target;
        animateCount(e.target, 0, target, 1500);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

function animateCount(el, start, end, duration) {
  const range = end - start;
  const startTime = performance.now();
  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + range * eased);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ── SHOP FILTERS ─────────────────────────────────────────────────── */
const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    productCards.forEach(card => {
      if (filter === 'all' || card.dataset.cat === filter) {
        card.classList.remove('hidden');
        card.style.animation = 'fadeIn 0.35s ease';
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

/* ── CART ─────────────────────────────────────────────────────────── */
let cart = [];

const cartFloat = document.getElementById('cartFloat');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartFooter = document.getElementById('cartFooter');
const cartTotalEl = document.getElementById('cartTotal');
const closeCart = document.getElementById('closeCart');
const checkoutBtn = document.getElementById('checkoutBtn');

function openCart() {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeCartFn() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

cartFloat.addEventListener('click', openCart);
closeCart.addEventListener('click', closeCartFn);
cartOverlay.addEventListener('click', closeCartFn);

function addToCart(name, price) {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, qty: 1, id: Date.now() });
  }
  renderCart();
  openCart();
  showToast(`✓ "${name}" ajouté au panier`);
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  renderCart();
}

function renderCart() {
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  cartCount.textContent = cart.reduce((sum, i) => sum + i.qty, 0);
  cartTotalEl.textContent = total.toLocaleString('fr-FR');

  if (cart.length === 0) {
    cartItems.innerHTML = `<div class="cart-empty"><i class="fa-solid fa-bag-shopping"></i><p>Votre panier est vide</p></div>`;
    cartFooter.style.display = 'none';
  } else {
    cartItems.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${(item.price * item.qty).toLocaleString('fr-FR')} FCFA${item.qty > 1 ? ` (×${item.qty})` : ''}</div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `).join('');
    cartFooter.style.display = 'block';
  }
}

// Checkout
checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) return;
  closeCartFn();
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  document.getElementById('modalTotal').textContent = total.toLocaleString('fr-FR') + ' FCFA';
  openModal();
});

/* ── PAYMENT MODAL ────────────────────────────────────────────────── */
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');

function openModal() {
  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modalOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

function selectPayment(method) {
  const names = { stripe: 'Stripe (Carte bancaire)', paypal: 'PayPal', fedapay: 'Mobile Money / FedaPay' };
  showToast(`💳 Redirection vers ${names[method]}...`);
  setTimeout(() => {
    closeModal();
    showToast('ℹ️ Système de paiement en cours d\'intégration. Contactez-nous !');
  }, 1500);
}

/* ── FORMS ────────────────────────────────────────────────────────── */
document.getElementById('rdvForm').addEventListener('submit', e => {
  e.preventDefault();
  showToast('📅 Demande de RDV envoyée ! Nous vous contactons sous 24h.');
  e.target.reset();
});

document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  showToast('✉️ Message envoyé ! Nous vous répondons très bientôt.');
  e.target.reset();
});

// Smooth scroll for nav CTA
document.querySelectorAll('a[href="#reservation"], .nav-cta').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('reservation').scrollIntoView({ behavior: 'smooth' });
  });
});

/* ── TOAST ────────────────────────────────────────────────────────── */
let toastTimer;
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ── PORTFOLIO hover enhancement ─────────────────────────────────── */
document.querySelectorAll('.portfolio-item').forEach(item => {
  item.addEventListener('click', () => {
    document.getElementById('reservation').scrollIntoView({ behavior: 'smooth' });
  });
});

/* ── HERO scroll hint ─────────────────────────────────────────────── */
document.querySelector('.hero-scroll-hint')?.addEventListener('click', () => {
  document.getElementById('poles').scrollIntoView({ behavior: 'smooth' });
});

/* ── Initial reveal check ─────────────────────────────────────────── */
// Elements already in view on load
setTimeout(() => {
  document.querySelectorAll('.hero .reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 180 + 300);
  });
}, 2300);

/* ── Expose globals ───────────────────────────────────────────────── */
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.selectPayment = selectPayment;
