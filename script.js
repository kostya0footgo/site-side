/* =========================================================
   HELPERS
========================================================= */
const isPhone = () => window.innerWidth <= 980;

/* =========================================================
   GSAP SMOOTH SCROLL INIT
========================================================= */
let smoother;

window.addEventListener('load', () => {
  if (!isPhone() && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    
    // Smooth scroll для всей страницы
    document.body.style.overflow = 'auto';
    gsap.to(window, {
      scrollBehavior: 'smooth',
      ease: 'power2.out'
    });
    
    // Parallax эффекты через GSAP
    gsap.utils.toArray('.parallax[data-speed]').forEach(el => {
      const speed = parseFloat(el.dataset.speed) || 0;
      gsap.to(el, {
        yPercent: speed * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5
        }
      });
    });
  }
});

/* =========================================================
   ANIMATED MORPHING DROPLETS for Process Section
========================================================= */
window.addEventListener('load', function() {
  const processSection = document.querySelector('.process');
  if (!processSection || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const canvas = document.getElementById('dropletsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = processSection.offsetWidth;
    canvas.height = Math.max(900, processSection.offsetHeight);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const COLORS = [
    { fill: '#B8A4FF', stroke: null },
    { fill: '#7ECBFF', stroke: null },
    { fill: '#FF9CEE', stroke: null },
    { fill: null, stroke: '#B8A4FF' },
    { fill: null, stroke: '#7ECBFF' },
    { fill: '#C8FF9E', stroke: null },
    { fill: null, stroke: '#FF9CEE' },
    { fill: '#FFD97D', stroke: null },
  ];

  const SHAPES = ['pill', 'circle', 'triangle', 'pill', 'triangle', 'circle', 'pill', 'triangle'];

  const shapes = [];
  const count = 100;
  const cols = 2;

  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const color = COLORS[i % COLORS.length];
    const shapeType = SHAPES[i % SHAPES.length];
    const isMobileShape = window.innerWidth <= 720;
    const sizeVariants = isMobileShape 
      ? [14, 20, 30, 38, 16, 32, 24, 42, 18, 26, 14, 35]
      : [28, 42, 65, 80, 35, 70, 50, 90, 38, 55, 30, 75];
    const w = sizeVariants[i % sizeVariants.length];
    const h = shapeType === 'pill' ? w * (2.4 + Math.random() * 1.8) : w;
    const colWidth = 1.0 / cols;
    const startXRatio = colWidth * col + colWidth * (0.15 + Math.random() * 0.7);
    const rowBaseY = 0.60 + row * 0.10;
    const startYRatio = rowBaseY + Math.random() * 0.10;
    const endYRatio = -0.05 + (col / cols) * 0.20 + Math.random() * 0.10;
    const delay = (col / cols) * 0.25 + Math.random() * 0.10;
    const startRot = (Math.random() - 0.5) * 60;
    const endRot = startRot + (Math.random() < 0.5 ? 1 : -1) * (200 + Math.random() * 160);

    shapes.push({
      startXRatio, startYRatio, endYRatio,
      delay, w, h, shapeType, color, startRot, endRot,
      opacity: 0.70 + Math.random() * 0.30,
    });
  }

  let progress = 0;
  let prevProgress = 0;

  ScrollTrigger.create({
    trigger: document.getElementById('process'),
    start: 'top 800%',
    end: 'bottom -100%',
    scrub: 20,
    onUpdate: (self) => {
      progress = self.progress;
    }
  });

  function drawPill(c, w, h, fill, stroke) {
    const r = w / 2;
    c.beginPath();
    c.moveTo(-r, -h / 2 + r);
    c.arc(0, -h / 2 + r, r, Math.PI, 0);
    c.lineTo(r, h / 2 - r);
    c.arc(0, h / 2 - r, r, 0, Math.PI);
    c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = 2.5; c.stroke(); }
  }

  function drawCircle(c, r, fill, stroke) {
    c.beginPath();
    c.arc(0, 0, r, 0, Math.PI * 2);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = 2.5; c.stroke(); }
  }

  function drawTriangle(c, size, fill, stroke) {
    const h = size * 0.866;
    c.beginPath();
    c.moveTo(0, -h * 0.67);
    c.lineTo(size * 0.5, h * 0.33);
    c.lineTo(-size * 0.5, h * 0.33);
    c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = 2.5; c.stroke(); }
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const velocity = (progress - prevProgress) * 60;
    prevProgress = progress;

    const W = canvas.width;
    const H = canvas.height;

    shapes.forEach(p => {
      const localP = Math.max(0, Math.min(1, (progress - p.delay) / (1 - p.delay)));
      const startY = H * p.startYRatio;
      const endY = H * p.endYRatio;
      const currentY = startY + (endY - startY) * localP;
      const currentX = W * p.startXRatio;
      const currentRot = p.startRot + (p.endRot - p.startRot) * localP;
      const rotRad = (currentRot * Math.PI) / 180;
      const fadeIn = Math.min(1, localP * 6);
      const fadeOut = 1 - Math.max(0, (localP - 0.85) * 6.5);
      const alpha = p.opacity * fadeIn * fadeOut;

      if (alpha <= 0.01) return;

      ctx.save();
      ctx.translate(currentX, currentY);
      ctx.rotate(rotRad);
      ctx.globalAlpha = alpha;

      if (p.shapeType === 'pill') {
        drawPill(ctx, p.w, p.h, p.color.fill, p.color.stroke);
      } else if (p.shapeType === 'triangle') {
        drawTriangle(ctx, p.w * 1.8, p.color.fill, p.color.stroke);
      } else {
        drawCircle(ctx, p.w / 2, p.color.fill, p.color.stroke);
      }

      ctx.restore();
    });

    requestAnimationFrame(render);
  }

  render();
});

/* =========================================================
   PAGE TRANSITION
========================================================= */
var pageTransition = document.getElementById('pageTransition');

function fadeToSection(targetId, callback) {
  if (!pageTransition) { callback && callback(); return; }
  pageTransition.classList.add('fade-in');
  setTimeout(function() {
    callback && callback();
    setTimeout(function() {
      pageTransition.classList.remove('fade-in');
    }, 350);
  }, 350);
}

/* =========================================================
   WAVE TEXT ANIMATION
========================================================= */
function initWaveText(el, delay) {
  delay = delay || 0;
  var rawText = el.dataset.wave || '';
  var lines = rawText.split('\n');
  
  if (lines.length > 1) {
    var charIndex = 0;
    var html = lines.map(function(line, lineIdx) {
      var lineClass = 'title-line title-line-' + (lineIdx + 1);
      var chars = line.split('').map(function(ch) {
        var delay_ms = delay + charIndex * 38;
        charIndex++;
        return '<span class="wave-char" style="transition-delay:' + delay_ms + 'ms">' + 
          (ch === ' ' ? '&nbsp;' : ch) + '</span>';
      }).join('');
      return '<span class="' + lineClass + '">' + chars + '</span>';
    }).join('');
    el.innerHTML = html;
  } else {
    el.innerHTML = rawText.split('').map(function(ch, i) {
      return '<span class="wave-char" style="transition-delay:' + (delay + i * 38) + 'ms">' + 
        (ch === ' ' ? '&nbsp;' : ch) + '</span>';
    }).join('');
  }

  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        el.querySelectorAll('.wave-char').forEach(function(s) { 
          s.classList.add('wave-in'); 
        });
        io.disconnect();
      }
    });
  }, { threshold: 0.2 });
  io.observe(el);
}

/* =========================================================
   GSAP-STYLE ABOUT CARDS — УЛУЧШЕННАЯ ВЕРСИЯ
========================================================= */
(function() {
  const cards = document.querySelectorAll('.gsap-card');
  const stack = document.querySelector('.gsap-card-stack');
  if (!cards.length || typeof gsap === 'undefined' || !stack) return;
  
  // Появление карточек при скролле
  gsap.fromTo('.gsap-card', 
    {
      y: 120,
      rotation: (i) => [20, -25, 15][i] || 0,
      opacity: 0,
      scale: 0.7
    },
    {
      y: (i) => [-12, 8, 20][i] || 0,
      rotation: (i) => [-3, 2.5, -1][i] || 0,
      opacity: (i) => [0.75, 0.88, 1][i] || 1,
      scale: (i) => [0.94, 0.97, 1][i] || 1,
      stagger: 0.15,
      duration: 1.4,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.gsap-card-stack',
        start: 'top 75%',
        toggleActions: 'play none none none'
      }
    }
  );
  
  // 3D эффект при движении мыши
  if (window.innerWidth > 980) {
    stack.addEventListener('mousemove', (e) => {
      const rect = stack.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      
      cards.forEach((card, i) => {
        const depth = [1.5, 1.2, 0.8][i] || 1;
        gsap.to(card, {
          rotateY: x * 12 * depth,
          rotateX: -y * 12 * depth,
          duration: 0.5,
          ease: 'power2.out'
        });
      });
    });
    
    stack.addEventListener('mouseleave', () => {
      cards.forEach((card, i) => {
        gsap.to(card, {
          rotateY: 0,
          rotateX: 0,
          duration: 0.6,
          ease: 'power2.out'
        });
      });
    });
  }
  
  // Hover эффекты
  cards.forEach((card, i) => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        y: -25,
        rotation: 0,
        scale: 1.04,
        zIndex: 10,
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out'
      });
    });
    
    card.addEventListener('mouseleave', () => {
      const originalY = [-12, 8, 20][i] || 0;
      const originalRotation = [-3, 2.5, -1][i] || 0;
      const originalScale = [0.94, 0.97, 1][i] || 1;
      const originalOpacity = [0.75, 0.88, 1][i] || 1;
      
      gsap.to(card, {
        y: originalY,
        rotation: originalRotation,
        scale: originalScale,
        zIndex: i + 1,
        opacity: originalOpacity,
        duration: 0.5,
        ease: 'power2.out'
      });
    });
  });
})();

/* =========================================================
   PARALLAX (Fallback for non-GSAP)
========================================================= */
if (typeof gsap === 'undefined') {
  var parallaxItems = document.querySelectorAll('.parallax[data-speed]');
  var mouseX = 0, mouseY = 0, currentX = 0, currentY = 0;
  if (!isPhone()) {
    window.addEventListener('mousemove', function(e) {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    (function animate() {
      currentX += (mouseX - currentX) * 0.50;
      currentY += (mouseY - currentY) * 0.50;
      parallaxItems.forEach(function(el) {
        var speed = Number(el.dataset.speed || 0);
        el.style.transform = 'translate(' + (currentX * 600 * speed) + 'px,' + (currentY * 600 * speed) + 'px)';
      });
      requestAnimationFrame(animate);
    })();
  }
}

/* =========================================================
   MENU
========================================================= */
var menuWrap = document.querySelector('.menu');
var menuBtn  = document.querySelector('.menu-btn');

function closeMenu() {
  menuWrap && menuWrap.classList.remove('open');
  menuBtn  && menuBtn.setAttribute('aria-expanded', 'false');
}
function openMenu() {
  menuWrap && menuWrap.classList.add('open');
  menuBtn  && menuBtn.setAttribute('aria-expanded', 'true');
}
function toggleMenu() {
  menuWrap && menuWrap.classList.contains('open') ? closeMenu() : openMenu();
}

menuBtn && menuBtn.addEventListener('click', function(e) {
  e.stopPropagation(); e.preventDefault(); toggleMenu();
});
document.addEventListener('click', function(e) {
  if (!menuWrap || !menuWrap.contains(e.target)) closeMenu();
});
if (!isPhone()) {
  menuWrap && menuWrap.addEventListener('mouseleave', closeMenu);
}
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeMenu(); });

/* =========================================================
   MENU ITEMS → NAVIGATION
========================================================= */
document.querySelectorAll('.menu-item').forEach(function(btn) {
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Handle contact button separately
    if (btn.hasAttribute('data-open-contact')) {
      // Close policy/terms if open
      if (document.body.classList.contains('policy-open')) {
        closePolicyOverlay();
      }
      if (document.body.classList.contains('terms-open')) {
        closeTermsOverlay();
      }
      
      closeMenu();
      
      // Check if it's a back button
      if (btn.dataset.isBackBtn === 'true') {
        closeContactOverlay();
        return;
      }
      
      // Open contact overlay
      openContactOverlay();
      return;
    }
    
    // Regular navigation
    var target = btn.dataset.target || 'home';
    
    if (document.body.classList.contains('contact-open')) {
      closeContactOverlay();
    }
    
    // Close policy overlay if open
    if (document.body.classList.contains('policy-open')) {
      closePolicyOverlay();
    }
    
    // Close terms overlay if open
    if (document.body.classList.contains('terms-open')) {
      closeTermsOverlay();
    }
    
    closeMenu();
    
    fadeToSection(target, function() {
      scrollToTarget(target);
    });
  });
});
/* =========================================================
   FOOTER LINKS
========================================================= */
document.querySelectorAll('.footer-col a[data-target]').forEach(function(link) {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Close policy overlay if open
    if (document.body.classList.contains('policy-open')) {
      closePolicyOverlay();
    }
    
    fadeToSection(link.dataset.target, function() {
      scrollToTarget(link.dataset.target);
    });
  });
});

/* =========================================================
   BRAND LOGO → HOME
========================================================= */
document.getElementById('brandLogo') && document.getElementById('brandLogo').addEventListener('click', function() {
  if (document.body.classList.contains('contact-open')) {
    closeContactOverlay();
  }
  
  // Close policy overlay if open
  if (document.body.classList.contains('policy-open')) {
    closePolicyOverlay();
  }
  
  fadeToSection('home', function() { scrollToTarget('home'); });
});

/* =========================================================
   SCROLL HELPER
========================================================= */
function scrollToTarget(id) {
  if (!id || id === 'home') { 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
    return; 
  }
  var el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* =========================================================
   VIENNA TIME
========================================================= */
var viennaEl = document.getElementById('viennaTime');
function tickVienna() {
  if (!viennaEl) return;
  viennaEl.textContent = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Vienna', hour: '2-digit', minute: '2-digit'
  }).format(new Date());
}
tickVienna();
setInterval(tickVienna, 30000);

/* =========================================================
   CONTACT OVERLAY
========================================================= */
var contactOverlay = document.getElementById('contactOverlay');

var backBtn = document.createElement('button');
backBtn.className = 'contact-back-btn';
backBtn.innerHTML = '← Back';
backBtn.setAttribute('aria-label', 'Back to intro');
contactOverlay && contactOverlay.appendChild(backBtn);

var contactMenuBtn = document.querySelector('.menu-item[data-open-contact]');
var contactRightBtn = document.getElementById('rightContactBtn');
var originalContactText = 'Contact';

function updateMenuButton() {
  if (document.body.classList.contains('contact-open')) {
    if (contactMenuBtn) {
      contactMenuBtn.textContent = 'Back';
      contactMenuBtn.dataset.isBackBtn = 'true';
    }
    if (contactRightBtn) {
      contactRightBtn.querySelector('span').textContent = 'Back';
      contactRightBtn.dataset.isBackBtn = 'true';
    }
  } else {
    if (contactMenuBtn) {
      contactMenuBtn.textContent = originalContactText;
      contactMenuBtn.dataset.isBackBtn = 'false';
    }
    if (contactRightBtn) {
      contactRightBtn.querySelector('span').textContent = originalContactText;
      contactRightBtn.dataset.isBackBtn = 'false';
    }
  }
}

function openContactOverlay() {
  document.body.classList.add('contact-open');
  closeMenu();
  updateMenuButton();
  if (contactOverlay) {
    contactOverlay.classList.remove('is-form');
    contactOverlay.setAttribute('aria-hidden', 'false');
  }
}
function closeContactOverlay() {
  document.body.classList.remove('contact-open');
  updateMenuButton();
  if (contactOverlay) {
    contactOverlay.classList.remove('is-form');
    contactOverlay.setAttribute('aria-hidden', 'true');
  }
}
function goContactForm() {
  contactOverlay && contactOverlay.classList.add('is-form');
}
function goContactIntro() {
  contactOverlay && contactOverlay.classList.remove('is-form');
}

document.getElementById('contactCloseBtn') && document.getElementById('contactCloseBtn').addEventListener('click', closeContactOverlay);
backBtn.addEventListener('click', goContactIntro);
contactOverlay && contactOverlay.addEventListener('click', function(e) {
  if (e.target === contactOverlay && !menuWrap.classList.contains('open')) {
    closeContactOverlay();
  }
});
document.addEventListener('keydown', function(e) {
  if (e.key !== 'Escape') return;
  if (!document.body.classList.contains('contact-open')) return;
  if (contactOverlay && contactOverlay.classList.contains('is-form')) {
    goContactIntro();
  } else {
    closeContactOverlay();
  }
});
document.getElementById('contactStartBtn') && document.getElementById('contactStartBtn').addEventListener('click', goContactForm);

document.querySelectorAll('[data-open-contact]').forEach(function(el) {
  el.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    closeMenu();
    
    if (el.dataset.isBackBtn === 'true') {
      closeContactOverlay();
      return;
    }
    
    var plan = el.dataset.plan;
    openContactOverlay();
    if (plan) {
      var planSelect = document.querySelector('[name="plan"]');
      if (planSelect) planSelect.value = plan;
      setTimeout(function() {
        contactOverlay && contactOverlay.classList.add('is-form');
      }, 350);
    }
  });
});

/* =========================================================
   FAQ ACCORDION
========================================================= */
document.querySelectorAll('.faq-clean-item').forEach(function(item) {
  item.addEventListener('click', function() {
    var active = item.classList.contains('active');
    document.querySelectorAll('.faq-clean-item').forEach(function(el) { el.classList.remove('active'); });
    if (!active) item.classList.add('active');
  });
});

/* =========================================================
   PRICING HOVER
========================================================= */
var pCards = document.querySelectorAll('.pricing-card');
var pCont  = document.querySelector('.pricing__container');
if (pCards.length && !isPhone()) {
  pCards.forEach(function(c) {
    c.addEventListener('mouseenter', function() {
      pCards.forEach(function(x) { x.classList.remove('active'); });
      c.classList.add('active');
    });
  });
  pCont && pCont.addEventListener('mouseleave', function() {
    pCards.forEach(function(x) { x.classList.remove('active'); });
    if (pCards[1]) pCards[1].classList.add('active');
  });
}

// Pricing карусель на мобиле — бесконечная прокрутка
(function() {
  var cont = document.querySelector('.pricing__container');
  if (!cont || window.innerWidth > 720) return;
  var cards = Array.from(cont.querySelectorAll('.pricing-card'));
  if (cards.length < 2) return;

  var firstClone = cards[0].cloneNode(true);
  var lastClone  = cards[cards.length - 1].cloneNode(true);
  firstClone.dataset.clone = 'true';
  lastClone.dataset.clone  = 'true';
  cont.appendChild(firstClone);
  cont.insertBefore(lastClone, cards[0]);

  var cardWidth = function() {
    return cont.querySelector('.pricing-card').offsetWidth + 16;
  };

  cont.style.scrollSnapType = 'none';
  cont.scrollLeft = cardWidth();

  var jumping = false;

  cont.addEventListener('scroll', function() {
    if (jumping) return;
    var cw = cardWidth();
    var total = cards.length * cw;

    if (cont.scrollLeft >= cw * (cards.length + 1) - 10) {
      jumping = true;
      cont.style.scrollBehavior = 'auto';
      cont.scrollLeft = cw;
      setTimeout(function() {
        cont.style.scrollBehavior = '';
        jumping = false;
      }, 50);
    }
    if (cont.scrollLeft <= 5) {
      jumping = true;
      cont.style.scrollBehavior = 'auto';
      cont.scrollLeft = cw * cards.length;
      setTimeout(function() {
        cont.style.scrollBehavior = '';
        jumping = false;
      }, 50);
    }
  }, { passive: true });

  setTimeout(function() {
    cont.style.scrollSnapType = 'x mandatory';
  }, 100);
})();

/* =========================================================
   NEW WORK SLIDER — SMOOTH GSAP ANIMATIONS
========================================================= */
(function() {
  const slides = document.querySelectorAll('.slide');
  const btnPrev = document.getElementById('sliderPrev');
  const btnNext = document.getElementById('sliderNext');
  const currEl = document.getElementById('sliderCurrent');
  const totalEl = document.getElementById('sliderTotal');
  const progressFill = document.getElementById('progressFill');
  
  if (!slides.length) return;
  
  let current = 0;
  let isAnimating = false;
  
  function updateSlider() {
    if (isAnimating) return;
    isAnimating = true;
    
    slides.forEach((slide, i) => {
      slide.classList.remove('active', 'prev');
      
      if (i === current) {
        slide.classList.add('active');
      } else if (i < current) {
        slide.classList.add('prev');
      }
    });
    
    if (currEl) currEl.textContent = String(current + 1).padStart(2, '0');
    if (totalEl) totalEl.textContent = String(slides.length).padStart(2, '0');
    
    if (progressFill) {
      progressFill.style.width = ((current + 1) / slides.length * 100) + '%';
    }
    
    setTimeout(() => {
      isAnimating = false;
    }, 900);
  }
  
  function nextSlide() {
    if (isAnimating) return;
    current = (current + 1) % slides.length;
    updateSlider();
  }
  
  function prevSlide() {
    if (isAnimating) return;
    current = (current - 1 + slides.length) % slides.length;
    updateSlider();
  }
  
  btnNext && btnNext.addEventListener('click', nextSlide);
  btnPrev && btnPrev.addEventListener('click', prevSlide);

  // Touch swipe
  (function() {
    var container = document.querySelector('.slider-container');
    if (!container) return;
    var startX = 0, startY = 0;
    container.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    container.addEventListener('touchend', function(e) {
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        dx < 0 ? nextSlide() : prevSlide();
      }
    }, { passive: true });
  })();

  setInterval(nextSlide, 6000);
  
  updateSlider();
})();

/* =========================================================
   SCROLL REVEAL
========================================================= */
var revObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) { if (e.isIntersecting) e.target.classList.add('show'); });
}, { threshold: 0.15 });
document.querySelectorAll('[data-anim]').forEach(function(el) { revObserver.observe(el); });

/* =========================================================
   PROCESS BOARD
========================================================= */
(function processBoard() {
  var notes   = Array.from(document.querySelectorAll('.note'));
  var ropeIds = ['rt12','rt23','rt34','rt45'];
  var shadIds = ['rs12','rs23','rs34','rs45'];
  var drawn   = 0;
  var isMobile = function() { return window.innerWidth <= 720; };

  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (!e.isIntersecting) return;
      var card = e.target;
      var idx  = +card.dataset.idx;
      setTimeout(function() {
        card.classList.add('in');
        updateRopes();
        showKnot(idx);
        if (drawn < ropeIds.length) {
          setTimeout(function() { drawRope(ropeIds[drawn], shadIds[drawn]); drawn++; }, 350);
        }
      }, idx === 4 ? 50 : idx * 120);
      io.unobserve(card);
    });
  }, { threshold: 0.1 });
  notes.forEach(function(n) { io.observe(n); });

  function drawRope(tid, sid) {
    [tid, sid].forEach(function(id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('drawn');
      void el.offsetWidth;
      el.classList.add('drawn');
    });
  }

  function showKnot(idx) {
    var k = document.getElementById('k' + idx);
    if (k) setTimeout(function() { k.classList.add('shown'); }, 500);
  }

  function getPinPos(card) {
    var svg = document.getElementById('ropeCanvas');
    if (!svg) return { x: 0, y: 0 };
    var sRect = svg.getBoundingClientRect();
    var pin   = card.querySelector('.note__pin-knot');
    if (pin) {
      var pRect = pin.getBoundingClientRect();
      return { x: pRect.left - sRect.left + pRect.width / 2, y: pRect.top - sRect.top + pRect.height / 2 };
    }
    var cRect = card.getBoundingClientRect();
    return { x: cRect.left - sRect.left + cRect.width / 2, y: cRect.top - sRect.top };
  }

  function updateRopes() {
    var svg   = document.getElementById('ropeCanvas');
    var board = document.getElementById('board');
    if (!svg || !board) return;
    var bRect = board.getBoundingClientRect();
    svg.style.width  = bRect.width + 'px';
    svg.style.height = (bRect.height + 80) + 'px';
    svg.setAttribute('viewBox', '0 0 ' + bRect.width + ' ' + (bRect.height + 80));
    var pins = notes.map(getPinPos);
    if (pins.length < 5) return;
    notes.forEach(function(_, i) {
      var k = document.getElementById('k' + i);
      if (k) { k.setAttribute('cx', pins[i].x); k.setAttribute('cy', pins[i].y); }
    });
    function set(id, d) { var el = document.getElementById(id); if (el) el.setAttribute('d', d); }
    if (isMobile()) {
      var W = bRect.width;
      function wavePath(x1, y1, x2, y2, i) {
        var bulge = (i % 2 === 0) ? W * 0.28 : -W * 0.28;
        return 'M' + x1 + ' ' + y1 + ' C' + (x1 + bulge * 0.6) + ' ' + (y1 + 60) + ', ' + (x2 + bulge * 0.4) + ' ' + (y2 - 60) + ', ' + x2 + ' ' + y2;
      }
      set('rt12', wavePath(pins[0].x,pins[0].y,pins[1].x,pins[1].y,0)); set('rs12', wavePath(pins[0].x,pins[0].y,pins[1].x,pins[1].y,0));
      set('rt23', wavePath(pins[1].x,pins[1].y,pins[2].x,pins[2].y,1)); set('rs23', wavePath(pins[1].x,pins[1].y,pins[2].x,pins[2].y,1));
      set('rt34', wavePath(pins[2].x,pins[2].y,pins[3].x,pins[3].y,2)); set('rs34', wavePath(pins[2].x,pins[2].y,pins[3].x,pins[3].y,2));
      set('rt45', wavePath(pins[3].x,pins[3].y,pins[4].x,pins[4].y,3)); set('rs45', wavePath(pins[3].x,pins[3].y,pins[4].x,pins[4].y,3));
    } else {
      var sag = 55;
      var mx12 = (pins[0].x + pins[1].x) / 2;
      var d12  = 'M' + pins[0].x + ' ' + pins[0].y + ' Q' + mx12 + ' ' + (Math.min(pins[0].y, pins[1].y) - sag) + ' ' + pins[1].x + ' ' + pins[1].y;
      set('rt12', d12); set('rs12', d12);
      var d23 = 'M' + pins[1].x + ' ' + pins[1].y + ' C' + (pins[1].x+60) + ' ' + (pins[1].y+110) + ', ' + (pins[2].x-60) + ' ' + (pins[2].y-80) + ', ' + pins[2].x + ' ' + pins[2].y;
      set('rt23', d23); set('rs23', d23);
      var mx34 = (pins[2].x + pins[3].x) / 2;
      var d34  = 'M' + pins[2].x + ' ' + pins[2].y + ' Q' + mx34 + ' ' + (Math.min(pins[2].y, pins[3].y) - sag * 0.8) + ' ' + pins[3].x + ' ' + pins[3].y;
      set('rt34', d34); set('rs34', d34);
      var d45 = 'M' + pins[3].x + ' ' + pins[3].y + ' C' + (pins[3].x+80) + ' ' + (pins[3].y+100) + ', ' + (pins[4].x+60) + ' ' + (pins[4].y-80) + ', ' + pins[4].x + ' ' + pins[4].y;
      set('rt45', d45); set('rs45', d45);
    }
  }

  window.addEventListener('scroll', updateRopes, { passive: true });
  window.addEventListener('resize', updateRopes);
  window.addEventListener('load', updateRopes);
  [100, 300, 600, 1000].forEach(function(t) { setTimeout(updateRopes, t); });
})();

/* =========================================================
   LOADER
========================================================= */
(function() {
  var loader = document.getElementById('loader');
  function hideLoader() {
    if (!loader) return;
    loader.classList.add('done');
    window.scrollTo(0, 0);
    setTimeout(function() { loader.remove(); }, 500);
  }
  if (document.readyState === 'complete') { hideLoader(); }
  else { window.addEventListener('load', hideLoader, { once: true }); }
})();

/* =========================================================
   INIT WAVE TEXT
========================================================= */
document.querySelectorAll('.wave-title[data-wave]').forEach(function(el) {
  initWaveText(el, parseInt(el.dataset.waveDelay || '0'));
});

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener('load', function() { window.scrollTo(0, 0); });

// Form submit — Web3Forms
document.getElementById('contactForm') && document.getElementById('contactForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  var form = e.target;
  var submitBtn = form.querySelector('.contact-send-btn');
  var originalText = submitBtn.textContent;
  
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  var formData = new FormData(form);
  var object = Object.fromEntries(formData);
  var json = JSON.stringify(object);

  try {
    var response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: json
    });
    var result = await response.json();
    if (response.ok && result.success) {
      document.querySelector('.contact-overlay__wrap1').innerHTML = `
        <div style="text-align:center; padding: 120px 20px;">
          <div style="font-size:5rem; margin-bottom:24px;">✓</div>
          <h1 style="font-size:4rem; color:#fff; letter-spacing:-0.02em; margin-bottom:20px;">Signal received!</h1>
          <p style="font-size:1.2rem; color:rgba(255,255,255,0.6);">We'll get back to you within 24 hours.</p>
        </div>
      `;
      form.reset();
    } else {
      alert('Error: ' + (result.message || 'Something went wrong'));
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  } catch(err) {
    alert('Network error: ' + err.message);
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

/* =========================================================
   PRIVACY POLICY OVERLAY - FIXED VERSION
========================================================= */

const policyOverlay = document.getElementById('policyOverlay');
const policyCloseBtn = document.getElementById('policyCloseBtn');
const rightContactBtn = document.getElementById('rightContactBtn');

function openPolicyOverlay() {
  document.body.classList.add('policy-open');
  closeMenu();
  
  // Hide right contact button
  if (rightContactBtn) {
    rightContactBtn.style.display = 'none';
  }
  
  if (policyOverlay) {
    policyOverlay.setAttribute('aria-hidden', 'false');
  }
}

function closePolicyOverlay() {
  document.body.classList.remove('policy-open');
  
  // Show right contact button again
  if (rightContactBtn) {
    rightContactBtn.style.display = 'flex';
  }
  
  if (policyOverlay) {
    policyOverlay.setAttribute('aria-hidden', 'true');
  }
}

// Close button - DIRECT CLICK EVENT with proper handling
if (policyCloseBtn) {
  policyCloseBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Policy close button clicked');
    closePolicyOverlay();
  });
}

// Policy links
document.querySelectorAll('[data-open-policy]').forEach(function(el) {
  el.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    closeMenu();
    openPolicyOverlay();
  });
});

/* =========================================================
   LOGO COLOR CHANGE ON POLICY OVERLAY
========================================================= */

const brandLogo = document.getElementById('brandLogo');

// Watch for policy-open class
const logoObserver = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.attributeName === 'class') {
      if (document.body.classList.contains('policy-open') || document.body.classList.contains('terms-open')) {
        if (brandLogo) {
          brandLogo.style.color = '#000000';
        }
      } else {
        if (brandLogo) {
          brandLogo.style.color = '';
        }
      }
    }
  });
});

logoObserver.observe(document.body, { attributes: true });

/* =========================================================
   TERMS OF USE OVERLAY - FIXED VERSION
========================================================= */

const termsOverlay = document.getElementById('termsOverlay');
const termsCloseBtn = document.getElementById('termsCloseBtn');

function openTermsOverlay() {
  document.body.classList.add('terms-open');
  closeMenu();
  
  // Hide right contact button
  if (rightContactBtn) {
    rightContactBtn.style.display = 'none';
  }
  
  if (termsOverlay) {
    termsOverlay.setAttribute('aria-hidden', 'false');
  }
}

function closeTermsOverlay() {
  document.body.classList.remove('terms-open');
  
  // Show right contact button again
  if (rightContactBtn) {
    rightContactBtn.style.display = 'flex';
  }
  
  if (termsOverlay) {
    termsOverlay.setAttribute('aria-hidden', 'true');
  }
}

// Close button - DIRECT CLICK EVENT with proper handling
if (termsCloseBtn) {
  termsCloseBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Terms close button clicked');
    closeTermsOverlay();
  });
}

// Terms links
document.querySelectorAll('[data-open-terms]').forEach(function(el) {
  el.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    closeMenu();
    openTermsOverlay();
  });
});

// Close overlay when clicking outside (on the overlay itself)
if (policyOverlay) {
  policyOverlay.addEventListener('click', function(e) {
    if (e.target === policyOverlay) {
      closePolicyOverlay();
    }
  });
}

if (termsOverlay) {
  termsOverlay.addEventListener('click', function(e) {
    if (e.target === termsOverlay) {
      closeTermsOverlay();
    }
  });
}

// Close with Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    if (document.body.classList.contains('policy-open')) {
      closePolicyOverlay();
    }
    if (document.body.classList.contains('terms-open')) {
      closeTermsOverlay();
    }
  }
});