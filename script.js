
const isPhone = () => window.innerWidth <= 980;

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
   PROCESS CARDS — авто-флип по очереди + блок скролла
========================================================= */
(() => {
  const section = document.getElementById('process');
  const items   = document.querySelectorAll('.process-item');
  const cards   = document.querySelectorAll('.process-item .card');
  let unlocked  = false;
  let triggered = false;

  function lockScroll()   { document.body.style.overflow = 'hidden'; }
  function unlockScroll() { document.body.style.overflow = ''; unlocked = true; }

  // Флип всех карточек по очереди, потом разблокировать скролл
  function flipAllSequentially() {
    cards.forEach((card, i) => {
      setTimeout(() => {
        card.classList.add('flipped');
        if (i === cards.length - 1) {
          setTimeout(unlockScroll, 400);
        }
      }, i * 400); 
    });
  }


  items.forEach(item => {
    item.addEventListener('click', () => {
      item.querySelector('.card')?.classList.toggle('flipped');
      if (!unlocked) unlockScroll();
    });
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !triggered) {
        triggered = true;
        lockScroll();
        setTimeout(flipAllSequentially, 600);
      }
    });
  }, { threshold: 1.0 });

  if (section) observer.observe(section);
})();
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




/* =========================================================
  ПРОВЕРКА КАРТОЧЕК ПОКА НА НИХ НЕ КЛИКНУТ
========================================================= */


(() => {
  const darkLayer = document.querySelector('.brand-layer--black');
  const about = document.getElementById('about');
  if (!darkLayer || !about) return;

  function update() {
    const brandEl = document.querySelector('.brand');
    const bRect = brandEl.getBoundingClientRect();
    const aRect = about.getBoundingClientRect();

    // Граница секции относительно логотипа
    const overlapTop    = Math.max(bRect.top, aRect.top);
    const overlapBottom = Math.min(bRect.bottom, aRect.bottom);

    if (overlapBottom > overlapTop) {
      // Есть пересечение — обрезаем чёрный слой
      const clipTop    = overlapTop - bRect.top;
      const clipBottom = bRect.bottom - overlapBottom;
      darkLayer.style.clipPath = `inset(${clipTop}px 0px ${clipBottom}px 0px)`;
    } else {
      // Нет пересечения — прячем чёрный слой
      darkLayer.style.clipPath = 'inset(0 100% 0 0)';
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();



/* =========================================================
   OUR WORK — VERTICAL PEEK GALLERY
========================================================= */
(() => {
  const section = document.querySelector('.our-work');
  const cards   = document.querySelectorAll('.ow-card');
  const btnPrev = document.querySelector('.ow-btn--prev');
  const btnNext = document.querySelector('.ow-btn--next');
  const elCurr  = document.getElementById('owCurrent');
  const elTotal = document.getElementById('owTotal');
  if (!cards.length || !section) return;

  const bgColors = ['#1a1410', '#10141a', '#141a10'];
  let current    = 0;
  let isAnimating = false;

  // Инициализация
  cards.forEach((c, i) => {
    c.style.transition = 'none';
    c.style.transform  = i === 0 ? 'translateY(0)'  : 'translateY(40px)';
    c.style.opacity    = i === 0 ? '1' : '0';
    c.style.zIndex     = i === 0 ? '2' : '1';
  });
  section.style.background = bgColors[0];
  if (elCurr)  elCurr.textContent  = 1;
  if (elTotal) elTotal.textContent = cards.length;

  function update(dir = 1) {
    if (isAnimating) return;
    isAnimating = true;

    const oldIndex = current;
    current = (current + dir + cards.length) % cards.length;

    const oldCard  = cards[oldIndex];
    const nextCard = cards[current];

    // Ставим новую карточку снизу невидимой
    nextCard.style.transition = 'none';
    nextCard.style.transform  = 'translateY(40px)';
    nextCard.style.opacity    = '0';
    nextCard.style.zIndex     = '3';
    oldCard.style.zIndex      = '2';

    // Reflow
    nextCard.getBoundingClientRect();

    requestAnimationFrame(() => {
      // Новая едет вверх и появляется
      nextCard.style.transition = 'transform 0.5s cubic-bezier(.4,0,.2,1), opacity 0.5s ease';
      nextCard.style.transform  = 'translateY(0)';
      nextCard.style.opacity    = '1';

      // Старая уходит вверх и исчезает
      oldCard.style.transition = 'transform 0.5s cubic-bezier(.4,0,.2,1), opacity 0.4s ease';
      oldCard.style.transform  = 'translateY(-40px)';
      oldCard.style.opacity    = '0';

      section.style.transition = 'background 0.5s ease';
      section.style.background = bgColors[current % bgColors.length];
      if (elCurr) elCurr.textContent = current + 1;

      setTimeout(() => {
        oldCard.style.transition = 'none';
        oldCard.style.transform  = 'translateY(40px)';
        oldCard.style.zIndex     = '1';
        nextCard.style.zIndex    = '2';
        isAnimating = false;
      }, 520);
    });
  }

  btnPrev?.addEventListener('click', () => update(-1));
  btnNext?.addEventListener('click', () => update(1));

  // Tilt + клик
  cards.forEach(card => {
  const inner = card.querySelector('.ow-card-inner');

  card.addEventListener('mousemove', e => {
    if (isAnimating || cards[current] !== card) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    inner.style.transform = `perspective(1000px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
    inner.style.boxShadow = `${-x * 6}px ${y * 6}px 16px rgba(0,0,0,0.2)`;
  });

  card.addEventListener('mouseleave', () => {
    if (cards[current] !== card) return;
    inner.style.transition = 'transform 0.4s ease, box-shadow 0.4s ease';
    inner.style.transform  = '';
    inner.style.boxShadow  = '';
    setTimeout(() => { inner.style.transition = ''; }, 400);
  });

  card.addEventListener('click', () => update(1));
});
})();


if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.onload = function() {
    window.scrollTo(0, 0);
};

/* =========================================================
   LOADER — вставить В НАЧАЛО script.js
   (заменяет существующий window.onload внизу файла —
    тот блок можно удалить)
========================================================= */

(function() {
  const loader  = document.getElementById('loader');
  const bar     = document.getElementById('screenBar');
  const pct     = document.getElementById('screenPercent');

  /* -- Фоновые линии -- */
  const bg = document.getElementById('codeBg');
  for (let i = 0; i < 18; i++) {
    const el = document.createElement('div');
    el.className = 'code-line';
    el.style.cssText = `
      top:${Math.random()*100}%;
      width:${80+Math.random()*220}px;
      animation-duration:${2.5+Math.random()*4}s;
      animation-delay:-${Math.random()*5}s;
      opacity:${0.4+Math.random()*0.6};
    `;
    bg.appendChild(el);
  }

  /* -- Линии на экране -- */
  const sc = document.getElementById('screenCode');
  for (let i = 0; i < 8; i++) {
    const el = document.createElement('div');
    el.className = 'screen-line';
    el.style.cssText = `
      top:${10+Math.random()*80}%;
      width:${30+Math.random()*80}px;
      animation-duration:${1.2+Math.random()*2}s;
      animation-delay:-${Math.random()*3}s;
    `;
    sc.appendChild(el);
  }

  /* -- Прогресс -- */
  function update(val) {
    bar.style.width   = val + '%';
    pct.textContent   = Math.round(val) + '%';
  }

  let progress = 0;
  const iv = setInterval(() => {
    if (progress < 85) {
      progress += Math.random() * 7;
      progress  = Math.min(progress, 85);
      update(progress);
    }
  }, 120);

  /* -- Скрыть лоадер с zoom -- */
  function hideLoader() {
    clearInterval(iv);
    update(100);

    /* небольшая пауза на 100% */
    setTimeout(() => {

      /* 1. Добавляем zoom — ноутбук улетает внутрь экрана */
      loader.classList.add('zoom');

      /* 2. После анимации зума скрываем лоадер */
      setTimeout(() => {
        loader.classList.add('done');
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
        window.scrollTo(0, 0);

        /* 3. Через 500ms убираем из DOM совсем */
        setTimeout(() => loader.remove(), 600);
      }, 700); /* длина zoom-анимации */

    }, 400);
  }

  /* -- Запуск -- */
  if (document.readyState === 'complete') {
    hideLoader();
  } else {
    window.addEventListener('load', hideLoader, { once: true });
  }
})();

/* =========================================================
   FIXES — вставить ПОСЛЕ всего кода в script.js
========================================================= */

/* =========================================================
   1. ТЕКУЩАЯ СЕКЦИЯ — трекер
   Следит какая секция сейчас видна,
   блокирует навигацию если уже там
========================================================= */
const SECTION_MAP = {
  'Home':     'home',
  'Services': 'stack',
  'Our work': 'work',
  'About us': 'about',
  'FAQ':      'faq',
};

// Все секции которые отслеживаем
const trackedSections = ['home', 'about', 'stack', 'hscroll', 'work', 'faq'];
let currentSectionId = 'home';

function updateCurrentSection() {
  // Определяем какая секция занимает больше всего viewport
  let best = 'home', bestArea = 0;

  trackedSections.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const r   = el.getBoundingClientRect();
    const top = Math.max(r.top, 0);
    const bot = Math.min(r.bottom, window.innerHeight);
    const area = Math.max(0, bot - top);
    if (area > bestArea) { bestArea = area; best = id; }
  });

  currentSectionId = best;
  syncMenuHighlight();
  syncBrandLink();
}

// Подсвечиваем пункт меню текущей секции
function syncMenuHighlight() {
  document.querySelectorAll('.menu-item').forEach(btn => {
    const target = SECTION_MAP[btn.textContent.trim()];
    // work находится внутри hscroll
    const match  = target === currentSectionId ||
                   (target === 'work' && currentSectionId === 'hscroll');
    btn.classList.toggle('is-current-section', !!match);
  });
}

// Логотип: блокируем если на home
function syncBrandLink() {
  const link = document.querySelector('a.brand-link');
  if (!link) return;
  link.classList.toggle('is-current', currentSectionId === 'home');
}

window.addEventListener('scroll', updateCurrentSection, { passive: true });
updateCurrentSection();

/* =========================================================
   2. BRAND LOGO — клик через garage + блокировка на home
========================================================= */
// Оборачиваем .brand в <a class="brand-link"> если ещё не обёрнут
(function wrapBrand() {
  const brand = document.querySelector('.brand');
  if (!brand || brand.closest('a.brand-link')) return;

  const a = document.createElement('a');
  a.className  = 'brand-link';
  a.setAttribute('aria-label', 'Go to top');
  a.href = '#';

  brand.parentNode.insertBefore(a, brand);
  a.appendChild(brand);

  a.addEventListener('click', e => {
    e.preventDefault();
    if (currentSectionId === 'home') return; // уже дома — ничего
    garageTransition('home', 'Home');
  });
})();

/* =========================================================
   3. MENU — блокировка клика если уже на секции
========================================================= */
// Перехватываем ДО старых обработчиков через capture
document.querySelectorAll('.menu-item').forEach(btn => {
  if (btn.hasAttribute('data-open-contact')) return;

  btn.addEventListener('click', e => {
    const target = SECTION_MAP[btn.textContent.trim()];
    const onWork = target === 'work' && currentSectionId === 'hscroll';
    if (target === currentSectionId || onWork) {
      // Уже здесь — просто закрываем меню
      e.stopImmediatePropagation();
      closeMenu();
    }
  }, true); // capture: true — срабатывает раньше остальных
});

/* =========================================================
   4. FIX: Contact overlay — убираем лаг
   Проблема: display:none→block сбрасывает opacity-transition.
   Решение: display всегда block, управляем через visibility.
========================================================= */
(function fixContactOverlay() {
  const overlay = document.getElementById('contactOverlay');
  if (!overlay) return;

  // Заменяем openContactOverlay чтобы дать браузеру кадр
  const _open = window.openContactOverlay || openContactOverlay;

  // Патчим глобальную функцию
  window._openContactOverlayFixed = function() {
    document.body.classList.add('contact-open');
    overlay.classList.remove('is-form');
    overlay.setAttribute('aria-hidden', 'false');
    // visibility меняется в CSS через body.contact-open
    // opacity тоже — но теперь display:block постоянно,
    // поэтому transition не сбрасывается
  };
})();