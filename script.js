/* =========================================================
   UTILS
========================================================= */
const isPhone = () => window.innerWidth <= 980;

/* =========================================================
   PARALLAX (mouse) — только десктоп
========================================================= */
const parallaxItems = document.querySelectorAll('.parallax');
let mouseX = 0, mouseY = 0, currentX = 0, currentY = 0;

if (!isPhone()) {
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  (function animate() {
    currentX += (mouseX - currentX) * 0.50;
    currentY += (mouseY - currentY) * 0.50;
    parallaxItems.forEach(el => {
      const speed = Number(el.dataset.speed || 0);
      el.style.transform = `translate(${currentX * 600 * speed}px, ${currentY * 600 * speed}px)`;
    });
    requestAnimationFrame(animate);
  })();
}

/* =========================================================
   MENU — переделано для тача
   На мобиле: только click/touchend, без hover-логики
========================================================= */
const menuWrap  = document.querySelector('.menu');
const menuBtn   = document.querySelector('.menu-btn');
const menuItems = document.querySelectorAll('.menu-item');

function closeMenu() {
  menuWrap?.classList.remove('open');
  menuBtn?.setAttribute('aria-expanded', 'false');
}

function openMenu() {
  menuWrap?.classList.add('open');
  menuBtn?.setAttribute('aria-expanded', 'true');
}

function toggleMenu() {
  if (menuWrap?.classList.contains('open')) {
    closeMenu();
  } else {
    openMenu();
  }
}

// Кнопка меню — click (работает и на тач и на мышке)
menuBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  e.preventDefault();
  toggleMenu();
});

// Пункты меню
menuItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.stopPropagation();
    menuItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    closeMenu();
  });
});

// Закрыть при клике вне меню
document.addEventListener('click', (e) => {
  if (!menuWrap?.contains(e.target)) closeMenu();
});

// На десктопе — закрывать при уходе курсора
if (!isPhone()) {
  menuWrap?.addEventListener('mouseleave', closeMenu);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});

/* =========================================================
   FOOTER VIENNA TIME
========================================================= */
const viennaEl = document.getElementById('viennaTime');
function tickVienna() {
  if (!viennaEl) return;
  viennaEl.textContent = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Vienna', hour: '2-digit', minute: '2-digit'
  }).format(new Date());
}
tickVienna();
setInterval(tickVienna, 30000);

/* =========================================================
   HORIZONTAL SCROLL — только десктоп
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const hscroll = document.querySelector('.hscroll');
  const track   = document.querySelector('.hscroll-track');
  if (!hscroll || !track) return;

  const SPEED = 0.6, ENTER = 270, EXIT = 270;

  function setHeight() {
    if (isPhone()) { hscroll.style.height = ''; return; }
    const dist = track.scrollWidth - window.innerWidth;
    hscroll.style.height = (dist / SPEED) + window.innerHeight + ENTER + EXIT + 'px';
  }
  function updateScroll() {
    if (isPhone()) { track.style.transform = ''; return; }
    const raw = (window.scrollY - hscroll.offsetTop - ENTER) * SPEED;
    const clamped = Math.max(0, Math.min(raw, track.scrollWidth - window.innerWidth));
    track.style.transform = `translateX(-${clamped}px)`;
  }

  setHeight(); updateScroll();
  window.addEventListener('resize', () => { setHeight(); updateScroll(); });
  window.addEventListener('scroll', updateScroll);
});

/* =========================================================
   PROCESS CARDS — flip on click/tap
========================================================= */
document.querySelectorAll('.process-item').forEach(item => {
  item.addEventListener('click', () => {
    item.querySelector('.card')?.classList.toggle('flipped');
  });
});

/* =========================================================
   ICONS
========================================================= */
lucide.createIcons();

/* =========================================================
   OUR WORK MONITOR
========================================================= */
(() => {
  const monitor = document.getElementById('workMonitor');
  if (!monitor) return;

  const dockBtns = monitor.querySelectorAll('.dock-btn[data-view]');
  const views    = monitor.querySelectorAll('.screen-view');

  function showView(name) {
    views.forEach(v => v.classList.toggle('is-active', v.dataset.view === name));
    dockBtns.forEach(b => b.classList.toggle('is-active', b.dataset.view === name));
  }

  dockBtns.forEach(b => b.addEventListener('click', e => { e.stopPropagation(); showView(b.dataset.view); }));
  monitor.querySelector('.desktop-arrow')?.addEventListener('click', e => { e.stopPropagation(); showView('work'); });
  monitor.querySelector('.work-back')?.addEventListener('click', e => {
    e.stopPropagation();
    showView(e.currentTarget.dataset.view || 'desktop');
  });

  const carousel = document.getElementById('workCarousel');
  const scrollPage = dir => carousel?.scrollBy({ left: dir * carousel.clientWidth * 0.85, behavior: 'smooth' });
  monitor.querySelector('.work-nav.prev')?.addEventListener('click', e => { e.stopPropagation(); scrollPage(-1); });
  monitor.querySelector('.work-nav.next')?.addEventListener('click', e => { e.stopPropagation(); scrollPage(1); });

  window.setWorkMonitorBg = url => {
    const dv = monitor.querySelector('.screen-view[data-view="desktop"]');
    if (dv) dv.style.setProperty('--desktop-bg-image', url ? `url("${url}")` : 'none');
  };
  window.setWorkMonitorBg('images/1.jpg');
})();

/* =========================================================
   FAQ ACCORDION
========================================================= */
document.querySelectorAll('.faq-clean-item').forEach(item => {
  item.addEventListener('click', () => {
    const active = item.classList.contains('active');
    document.querySelectorAll('.faq-clean-item').forEach(el => el.classList.remove('active'));
    if (!active) item.classList.add('active');
  });
});

/* =========================================================
   GARAGE DOOR + CONTACT OVERLAY
========================================================= */
const door           = document.getElementById('garageDoor');
const doorTitle      = document.getElementById('doorTitle');
const contactOverlay = document.getElementById('contactOverlay');
const contactForm    = document.getElementById('contactForm');

let garageBusy = false;

function scrollToTarget(targetId) {
  if (!targetId || targetId === 'home') {
    window.scrollTo({ top: 0, behavior: 'instant' });
    return;
  }
  // "work" находится внутри hscroll — на мобиле скроллим к hscroll секции
  let el = document.getElementById(targetId);
  if (!el && targetId === 'work') el = document.getElementById('hscroll');
  if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
}

function setGarageTitle(label) {
  if (!doorTitle) return;
  doorTitle.textContent = label.replace('-', '\n');
}

/* Contact overlay */
function openContactOverlay() {
  if (!contactOverlay) return;
  document.body.classList.add('contact-open');
  contactOverlay.classList.remove('is-form');
  contactOverlay.setAttribute('aria-hidden', 'false');
}
function closeContactOverlay() {
  if (!contactOverlay) return;
  document.body.classList.remove('contact-open');
  contactOverlay.classList.remove('is-form');
  contactOverlay.setAttribute('aria-hidden', 'true');
}
function goContactForm() {
  contactOverlay?.classList.add('is-form');
  setTimeout(() => contactOverlay?.querySelector('input[name="firstName"]')?.focus(), 450);
}

/* Garage transition — десктоп с анимацией, мобил без */
function garageTransition(targetId, label) {
  closeMenu();

  if (isPhone()) {
    if (document.body.classList.contains('contact-open')) closeContactOverlay();
    scrollToTarget(targetId);
    return;
  }

  if (!door || garageBusy) { scrollToTarget(targetId); return; }
  garageBusy = true;
  setGarageTitle(label.toUpperCase());
  door.classList.add('is-closing');

  door.addEventListener('animationend', function closeH(e) {
    if (e.animationName !== 'garageDown') return;
    door.removeEventListener('animationend', closeH);
    if (document.body.classList.contains('contact-open')) closeContactOverlay();
    scrollToTarget(targetId);
    // Пауза — браузер перерисовывает страницу под завесой
    requestAnimationFrame(() => requestAnimationFrame(() => {
      door.classList.add('is-opening');
      door.addEventListener('animationend', function openH(ev) {
        if (ev.animationName !== 'garageUp') return;
        door.removeEventListener('animationend', openH);
        door.classList.remove('is-opening', 'is-closing');
        garageBusy = false;
      });
    }));
  });
}

/* Открыть contact — десктоп с гаражом, мобил сразу */
function garageOpenContact(label) {
  closeMenu();

  if (document.body.classList.contains('contact-open')) {
    closeContactOverlay();
    return;
  }

  if (isPhone()) {
    openContactOverlay();
    return;
  }

  if (!door || garageBusy) { openContactOverlay(); return; }
  garageBusy = true;
  setGarageTitle((label || 'Contact').toUpperCase());
  door.classList.add('is-closing');

  door.addEventListener('animationend', function closeH(e) {
    if (e.animationName !== 'garageDown') return;
    door.removeEventListener('animationend', closeH);
    openContactOverlay();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      door.classList.add('is-opening');
      door.addEventListener('animationend', function openH(ev) {
        if (ev.animationName !== 'garageUp') return;
        door.removeEventListener('animationend', openH);
        door.classList.remove('is-opening', 'is-closing');
        garageBusy = false;
      });
    }));
  });
}

/* =========================================================
   MENU NAV → секции
========================================================= */
document.querySelectorAll('.menu-item').forEach(btn => {
  if (btn.hasAttribute('data-open-contact')) return;
  btn.addEventListener('click', () => {
    const map = { 'Home':'home', 'Services':'stack', 'Our work':'work', 'About us':'about', 'FAQ':'faq' };
    garageTransition(map[btn.textContent.trim()] || 'home', btn.textContent.trim());
  });
});

document.querySelectorAll('[data-open-contact]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    closeMenu();
    const label = el.getAttribute('data-contact-label') || el.textContent?.trim() || 'Contact';
    garageOpenContact(label);
  });
});

/* =========================================================
   CONTACT OVERLAY: шаги
========================================================= */
document.getElementById('contactStartBtn')?.addEventListener('click', goContactForm);

// Закрыть по Escape
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!document.body.classList.contains('contact-open')) return;
  if (contactOverlay?.classList.contains('is-form')) {
    contactOverlay.classList.remove('is-form');
  } else {
    closeContactOverlay();
  }
});

// Закрыть по клику на фон
contactOverlay?.addEventListener('click', e => {
  if (e.target === contactOverlay) closeContactOverlay();
});

// Форма submit
contactForm?.addEventListener('submit', e => {
  e.preventDefault();
  if (window.grecaptcha && !window.grecaptcha.getResponse()) {
    alert('Please confirm you are not a robot.');
    return;
  }
  alert('Sent! Connect this form to your backend.');
  contactForm.reset();
  window.grecaptcha?.reset();
  contactOverlay?.classList.remove('is-form');
  closeContactOverlay();
});

// Кнопка Start a project (второй шаг)
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.contact-start-btn')?.addEventListener('click', () => {
    contactOverlay?.classList.add('is-form');
  });
});

/* =========================================================
   CONTACT ACTION BTN (стрелка в "Let's build")
   + PRICING Get Started
   Уже покрыты через [data-open-contact], но на всякий случай явно:
========================================================= */
document.getElementById('contactActionBtn')?.addEventListener('click', () => garageOpenContact('Contact'));
document.getElementById('learnMoreBtn')?.addEventListener('click', () => garageTransition('stack', 'Services'));

/* =========================================================
   FOOTER — ссылки работают как кнопки скролла
========================================================= */
document.querySelectorAll('.footer-col a[data-target]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    garageTransition(link.dataset.target, link.textContent.trim());
  });
});

// Ссылка Contact в футере
document.querySelectorAll('.footer-col a[data-open-contact]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    garageOpenContact('Contact');
  });
});

/* =========================================================
   PRICING ACTIVE CARD (hover — только десктоп)
========================================================= */
const pCards = document.querySelectorAll('.pricing-card');
const pCont  = document.querySelector('.pricing__container');
if (pCards.length) {
  const def = Math.floor(pCards.length / 2);
  pCards[def].classList.add('active');
  if (!isPhone()) {
    pCards.forEach(c => {
      c.addEventListener('mouseenter', () => { pCards.forEach(x => x.classList.remove('active')); c.classList.add('active'); });
    });
    pCont?.addEventListener('mouseleave', () => {
      pCards.forEach(x => x.classList.remove('active'));
      pCards[def].classList.add('active');
    });
  }
}

/* =========================================================
   PAGE LOADER
========================================================= */
document.body.classList.add('loading');
window.addEventListener('load', () => {
  setTimeout(() => {
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
  }, 600);
});

/* =========================================================
   SCROLL REVEAL
========================================================= */
const revObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); });
}, { threshold: 0.15 });
document.querySelectorAll('[data-anim]').forEach(el => revObserver.observe(el));
