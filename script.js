(function () {
  /* ─────────────────────────────────────────────────────────────
     ORIGINAL SITE LOGIC (unchanged)
  ───────────────────────────────────────────────────────────── */
  const header  = document.getElementById('siteHeader');
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');
  const year    = document.getElementById('year');

  year.textContent = new Date().getFullYear();

  function setHeaderState() {
    header.classList.toggle('scrolled', window.scrollY > 12);
  }
  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  function closeMenu() {
    header.classList.remove('menu-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
  }
  function toggleMenu() {
    const open = header.classList.toggle('menu-open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', toggleMenu);
  navLinks.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('click', e => {
    if (header.classList.contains('menu-open') && !e.target.closest('header')) closeMenu();
  });
  window.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* IntersectionObserver fallback */
  const fadeEls = Array.from(document.querySelectorAll('.fade-in'));
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('in'); });
  }, { threshold: 0.12 });
  fadeEls.forEach(el => io.observe(el));

  /* Active nav link */
  const sections = ['home','about','clients','services','posts','contact']
    .map(id => document.getElementById(id)).filter(Boolean);
  const navAnchors = Array.from(document.querySelectorAll('[data-link]'));
  function updateActiveLink() {
    let best = { id: 'home', top: -Infinity };
    const y = window.scrollY + 110;
    sections.forEach(sec => {
      const top = sec.getBoundingClientRect().top + window.scrollY;
      if (top <= y && top > best.top) best = { id: sec.id, top };
    });
    navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + best.id));
  }
  updateActiveLink();
  window.addEventListener('scroll', updateActiveLink, { passive: true });

  /* Modal */
  const overlay   = document.getElementById('modalOverlay');
  const modal     = overlay.querySelector('.modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc  = document.getElementById('modalDesc');
  const modalBody  = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');
  let lastFocus = null;

  const modalMap = {
    clientsModal:  { title: 'Our Clients',       desc: 'Open a client profile on Instagram.',                         templateId: 'clientsModal'  },
    servicesModal: { title: 'Our Services',       desc: 'Premium services designed to grow your brand on Instagram.', templateId: 'servicesModal' },
    postsModal:    { title: 'Our Posts & Reels',  desc: 'Preview reel concepts and open Instagram for more.',         templateId: 'postsModal'    },
    aboutModal:    { title: 'About Us',           desc: 'A deeper look into how Profylift works.',                    templateId: 'aboutModal'    }
  };

  function openModal(key) {
    const cfg = modalMap[key]; if (!cfg) return;
    lastFocus = document.activeElement;
    modalTitle.textContent = cfg.title;
    modalDesc.textContent  = cfg.desc;
    modalBody.innerHTML    = '';
    const tpl  = document.getElementById(cfg.templateId);
    modalBody.appendChild(tpl.content.cloneNode(true));
    overlay.classList.add('open');
    requestAnimationFrame(() => overlay.classList.add('visible'));
    overlay.setAttribute('aria-hidden', 'false');
    bindOpenButtons(modalBody);
    bindReelCards(modalBody);
    setTimeout(() => modal.focus(), 50);
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    overlay.classList.remove('visible');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => {
      overlay.classList.remove('open');
      modalBody.innerHTML = '';
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    }, 180);
  }
  function bindOpenButtons(root) {
    root.querySelectorAll('[data-open]').forEach(btn => {
      btn.addEventListener('click', () => { const u = btn.getAttribute('data-open'); if (u) window.open(u,'_blank','noopener'); });
    });
  }
  function bindReelCards(root) {
    root.querySelectorAll('.reel[data-open]').forEach(card => {
      card.addEventListener('click', () => { const u = card.getAttribute('data-open'); if (u) window.open(u,'_blank','noopener'); });
      card.addEventListener('keydown', e => {
        if (e.key==='Enter'||e.key===' ') { e.preventDefault(); const u = card.getAttribute('data-open'); if (u) window.open(u,'_blank','noopener'); }
      });
    });
  }
  document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-modal]');
    if (trigger) openModal(trigger.getAttribute('data-modal'));
  });
  modalClose.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key === 'Tab') {
      const items = Array.from(overlay.querySelectorAll('button,[href],input,textarea,[tabindex]:not([tabindex="-1"])'))
        .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
      if (!items.length) return;
      if (e.shiftKey && document.activeElement === items[0]) { e.preventDefault(); items[items.length-1].focus(); }
      else if (!e.shiftKey && document.activeElement === items[items.length-1]) { e.preventDefault(); items[0].focus(); }
    }
  });
  document.getElementById('contactForm').addEventListener('submit', closeMenu);


  /* ─────────────────────────────────────────────────────────────
     GSAP PREMIUM ANIMATIONS + CINEMATIC INTRO
  ───────────────────────────────────────────────────────────── */
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ══════════════════════════════════════════
     INTRO SEQUENCE
  ══════════════════════════════════════════ */
  if (!reducedMotion) {
    const intro      = document.getElementById('introScreen');
    const introPhone = document.getElementById('introPhone');
    const wordmark   = document.getElementById('introWordmark');
    const barFill    = document.getElementById('screenBarFill');
    const letters    = wordmark ? wordmark.querySelectorAll('span') : [];

    document.body.classList.add('intro-active');

    const introTl = gsap.timeline({
      onComplete: () => { document.body.classList.remove('intro-active'); }
    });

    introTl
      .set(intro, { opacity: 1 })
      .from(introPhone, {
        y: 120, opacity: 0, rotateX: -30,
        duration: 1.2, ease: 'power3.out'
      })
      .to(introPhone, {
        y: -14, duration: 1.8, ease: 'sine.inOut',
        yoyo: true, repeat: 2
      }, '-=0.2')
      .to(barFill, {
        width: '100%', duration: 1.4, ease: 'power2.inOut'
      }, '<')
      .to(wordmark, { opacity: 1, duration: 0.01 }, '-=0.9')
      .to(letters, {
        opacity: 1, y: 0,
        duration: 0.06, stagger: 0.055, ease: 'power2.out'
      }, '<')
      .to(introPhone, {
        scale: 10, rotateY: 0, rotateX: 0, opacity: 0,
        duration: 1.4, ease: 'power3.inOut'
      }, '+=0.3')
      .to(wordmark, {
        opacity: 0, scale: 1.4, duration: 0.6, ease: 'power2.in'
      }, '<+0.3')
      .to(intro, {
        opacity: 0, duration: 0.7, ease: 'power2.inOut',
        onComplete: () => { intro.style.display = 'none'; }
      }, '-=0.5')
      .add(() => { fireHeroEntrance(); }, '-=0.4');

  } else {
    const intro = document.getElementById('introScreen');
    if (intro) intro.style.display = 'none';
    document.body.classList.remove('intro-active');
    fireHeroEntrance();
  }

  function fireHeroEntrance() {
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      // Kicker badge: from left with slight tilt
      .from('#heroKicker',  { opacity: 0, x: -50, rotation: -3, scale: 0.92, duration: 0.9 }, 0.1)
      // Main headline: up from below, bold rotation
      .from('#heroH1',      { opacity: 0, y: 55, rotation: -2, scale: 0.93, duration: 1.1 }, 0.3)
      // Subhead: up, lighter rotation
      .from('#heroSub',     { opacity: 0, y: 38, rotation: -1, scale: 0.96, duration: 0.95 }, 0.52)
      // Action buttons: from left, snappy
      .from('#heroActions', { opacity: 0, x: -40, rotation: -2, scale: 0.95, duration: 0.85 }, 0.70)
      // Trust pills: cascade up with stagger
      .from('#heroTrust .pill', { opacity: 0, y: 28, scale: 0.90, rotation: 2, duration: 0.75, stagger: 0.10 }, 0.88)
      // Hero card: from right, with rotation — feels like it slides onto screen
      .from('#heroCard', { opacity: 0, x: 80, y: 20, rotation: 4, scale: 0.92, duration: 1.15, ease: 'power2.out' }, 0.42);
  }

  if (reducedMotion) return;

  /* ══════════════════════════════════════════════════════════════
     PREMIUM DIRECTIONAL SCROLL ANIMATIONS
     Each element flows in from a purposeful direction with
     rotation + scale for genuine 3D depth feel.
  ══════════════════════════════════════════════════════════════ */

  // Shorthand: create a scroll-triggered fromTo with direction presets
  function revealFrom(targets, fromVars, extraTo, triggerEl, startPos, stagger) {
    const toVars = Object.assign(
      { opacity: 1, x: 0, y: 0, rotation: 0, scale: 1,
        duration: 1.0, ease: 'power3.out',
        scrollTrigger: {
          trigger: triggerEl || (typeof targets === 'string' ? document.querySelector(targets) : targets),
          start: startPos || 'top 87%',
          toggleActions: 'play none none none'
        }
      },
      extraTo || {}
    );
    if (stagger) toVars.stagger = stagger;
    gsap.fromTo(targets, Object.assign({ opacity: 0 }, fromVars), toVars);
  }

  /* ── ABOUT SECTION ───────────────────────────────────────── */
  // Section heading: slides up from below with slight rotation
  revealFrom('#about .section-head h2',
    { y: 60, rotation: -2, scale: 0.95 },
    { duration: 1.0 },
    '#about .section-head'
  );
  revealFrom('#about .section-head p',
    { y: 40, rotation: -1, scale: 0.97 },
    { duration: 0.9, delay: 0.12 },
    '#about .section-head'
  );
  // About card text: slides up, mild skew for richness
  revealFrom('#about .about-card p',
    { y: 50, rotation: 1, scale: 0.96 },
    { duration: 1.1 },
    '#about .about-card',
    'top 85%'
  );

  /* ── CLIENTS — Instagram Showcase ──────────────────────────── */
  // Section heading
  revealFrom('#clientsHead h2',
    { y: 60, scale: 0.94, rotation: -2 },
    { duration: 1.0 },
    '#clientsHead'
  );
  revealFrom('#clientsHead p',
    { y: 35, scale: 0.97, rotation: -1 },
    { duration: 0.85, delay: 0.1 },
    '#clientsHead'
  );

  // Instagram logo: scale + rotate entrance, then float forever
  gsap.fromTo('#instaLogo, #instaFallback svg',
    { opacity: 0, scale: 0.4, rotation: -12, y: 20 },
    {
      opacity: 1, scale: 1, rotation: 0, y: 0,
      duration: 1.1, ease: 'back.out(1.6)',
      scrollTrigger: {
        trigger: '#instaIntro',
        start: 'top 88%',
        toggleActions: 'play none none none',
        onComplete: () => {
          // Continuous floating after entrance
          gsap.to('#instaLogo, #instaFallback svg', {
            y: -12, repeat: -1, yoyo: true, duration: 2.2, ease: 'sine.inOut'
          });
        }
      }
    }
  );

  // Client logo cards: alternating directional cascade
  const logoCards = document.querySelectorAll('.logo');
  const logoDirections = [
    { x: -80, rotation: -4 },  // Albeck: from left
    { y:  70, rotation:  2 },  // Halal Living: from below center
    { x:  80, rotation:  4 },  // Sportz: from right
  ];
  logoCards.forEach((card, i) => {
    const dir = logoDirections[i] || { y: 60, rotation: 2 };
    gsap.fromTo(card,
      { opacity: 0, x: dir.x || 0, y: dir.y || 30, rotation: dir.rotation, scale: 0.88 },
      {
        opacity: 1, x: 0, y: 0, rotation: 0, scale: 1,
        duration: 1.0, ease: 'power3.out',
        delay: i * 0.14,
        scrollTrigger: {
          trigger: '#clientLogos',
          start: 'top 87%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // Logo 3D tilt — same lerp system as big-cards
  logoCards.forEach(card => {
    let rafId = null, targetRX = 0, targetRY = 0, currentRX = 0, currentRY = 0, isHovered = false;
    const lerp = (a, b, t) => a + (b - a) * t;
    function onMove(e) {
      const rect = card.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
      const dy = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
      targetRY =  dx * 9; targetRX = -dy * 9;
      const sheen = card.querySelector('.logo-sheen');
      if (sheen) {
        const sx = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
        const sy = ((e.clientY - rect.top ) / rect.height * 100).toFixed(1);
        sheen.style.background = `radial-gradient(ellipse at ${sx}% ${sy}%, rgba(255,255,255,.09), transparent 58%)`;
      }
    }
    function tick() {
      currentRX = lerp(currentRX, isHovered ? targetRX : 0, 0.10);
      currentRY = lerp(currentRY, isHovered ? targetRY : 0, 0.10);
      gsap.set(card, {
        rotateX: currentRX, rotateY: currentRY,
        scale: isHovered ? 1.04 : 1,
        y: isHovered ? -8 : 0,
        transformPerspective: 900,
        boxShadow: isHovered
          ? '0 32px 80px rgba(0,0,0,.65), 0 0 40px rgba(216,177,91,.10)'
          : '0 18px 55px rgba(0,0,0,.40)',
        force3D: true
      });
      if (Math.abs(currentRX) > 0.02 || Math.abs(currentRY) > 0.02 || isHovered) {
        rafId = requestAnimationFrame(tick);
      } else {
        gsap.set(card, { clearProps: 'rotateX,rotateY,y,scale,boxShadow' }); rafId = null;
      }
    }
    card.addEventListener('mouseenter', () => { isHovered = true; if (!rafId) rafId = requestAnimationFrame(tick); });
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', () => { isHovered = false; targetRX = 0; targetRY = 0; if (!rafId) rafId = requestAnimationFrame(tick); });

    // keyboard + click navigation
    card.addEventListener('click', () => { const u = card.getAttribute('data-link'); if (u) window.open(u, '_blank', 'noopener'); });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const u = card.getAttribute('data-link'); if (u) window.open(u, '_blank', 'noopener'); }
    });
  });

  // Explore divider fades in from center
  gsap.fromTo('.explore-divider',
    { opacity: 0, scaleX: 0.6 },
    {
      opacity: 1, scaleX: 1,
      duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: '.explore-divider', start: 'top 90%', toggleActions: 'play none none none' }
    }
  );

  // Explore big cards (Services / Posts / About) — 3 cards, left/center/right
  const bigCards = document.querySelectorAll('.big-card');
  const bigCardDirs = [
    { x: -80, rotation: -3 },  // Services: from left
    { y:  60, rotation:  2 },  // Posts: from below
    { x:  80, rotation:  3 },  // About: from right
  ];
  bigCards.forEach((card, i) => {
    const dir = bigCardDirs[i] || { y: 50, rotation: 2 };
    gsap.fromTo(card,
      { opacity: 0, x: dir.x || 0, y: dir.y || 30, rotation: dir.rotation, scale: 0.95 },
      {
        opacity: 1, x: 0, y: 0, rotation: 0, scale: 1,
        duration: 1.05, ease: 'power3.out',
        delay: i * 0.12,
        scrollTrigger: {
          trigger: '#bigCardGrid',
          start: 'top 86%',
          toggleActions: 'play none none none'
        }
      }
    );
  });
  /* ── SERVICES / CONTACT SECTION ─────────────────────────── */
  revealFrom('#services .section-head h2',
    { y: 60, scale: 0.94, rotation: -2 },
    { duration: 1.0 },
    '#services .section-head'
  );
  revealFrom('#services .section-head p',
    { y: 35, scale: 0.97, rotation: -1 },
    { duration: 0.85, delay: 0.1 },
    '#services .section-head'
  );

  // Left contact panel → slides in from left
  gsap.fromTo('.contact-wrap .contact-panel:first-child',
    { opacity: 0, x: -80, y: 20, rotation: -3, scale: 0.95 },
    {
      opacity: 1, x: 0, y: 0, rotation: 0, scale: 1,
      duration: 1.05, ease: 'power3.out',
      scrollTrigger: { trigger: '.contact-wrap', start: 'top 87%', toggleActions: 'play none none none' }
    }
  );
  // Right contact panel → slides in from right
  gsap.fromTo('.contact-wrap .contact-panel:last-child',
    { opacity: 0, x: 80, y: 20, rotation: 3, scale: 0.95 },
    {
      opacity: 1, x: 0, y: 0, rotation: 0, scale: 1,
      duration: 1.05, ease: 'power3.out', delay: 0.12,
      scrollTrigger: { trigger: '.contact-wrap', start: 'top 87%', toggleActions: 'play none none none' }
    }
  );

  // Contact items inside left panel: cascade from left
  gsap.fromTo('.contact-item',
    { opacity: 0, x: -60, rotation: -2, scale: 0.96 },
    {
      opacity: 1, x: 0, rotation: 0, scale: 1,
      duration: 0.85, ease: 'power3.out', stagger: 0.14,
      scrollTrigger: { trigger: '.contact-list', start: 'top 88%', toggleActions: 'play none none none' }
    }
  );

  // Form fields: cascade up from below with stagger
  gsap.fromTo('#contactForm .field',
    { opacity: 0, y: 35, scale: 0.96, rotation: 1 },
    {
      opacity: 1, y: 0, scale: 1, rotation: 0,
      duration: 0.85, ease: 'power3.out', stagger: 0.11,
      scrollTrigger: { trigger: '#contactForm', start: 'top 88%', toggleActions: 'play none none none' }
    }
  );
  gsap.fromTo('#contactForm .form-actions',
    { opacity: 0, y: 25, scale: 0.97 },
    {
      opacity: 1, y: 0, scale: 1,
      duration: 0.75, ease: 'power3.out', delay: 0.4,
      scrollTrigger: { trigger: '#contactForm', start: 'top 88%', toggleActions: 'play none none none' }
    }
  );

  /* ── FINAL CTA ───────────────────────────────────────────── */
  // CTA box: scale + drift up, slightly dramatic
  gsap.fromTo('.cta-box',
    { opacity: 0, y: 60, scale: 0.93, rotation: -1 },
    {
      opacity: 1, y: 0, scale: 1, rotation: 0,
      duration: 1.15, ease: 'power3.out',
      scrollTrigger: { trigger: '.cta-box', start: 'top 88%', toggleActions: 'play none none none' }
    }
  );
  // CTA title: slides up with bold rotation
  gsap.fromTo('.cta-title',
    { opacity: 0, y: 50, rotation: -3, scale: 0.94 },
    {
      opacity: 1, y: 0, rotation: 0, scale: 1,
      duration: 1.0, ease: 'power3.out', delay: 0.2,
      scrollTrigger: { trigger: '.cta-box', start: 'top 88%', toggleActions: 'play none none none' }
    }
  );
  // CTA sub: slides up, lighter
  gsap.fromTo('.cta-sub',
    { opacity: 0, y: 35, scale: 0.97 },
    {
      opacity: 1, y: 0, scale: 1,
      duration: 0.9, ease: 'power3.out', delay: 0.35,
      scrollTrigger: { trigger: '.cta-box', start: 'top 88%', toggleActions: 'play none none none' }
    }
  );
  // CTA action buttons: from right, staggered
  gsap.fromTo('.cta-actions .btn-wide, .cta-actions .phone',
    { opacity: 0, x: 60, rotation: 2, scale: 0.96 },
    {
      opacity: 1, x: 0, rotation: 0, scale: 1,
      duration: 0.9, ease: 'power3.out', stagger: 0.12, delay: 0.25,
      scrollTrigger: { trigger: '.cta-actions', start: 'top 90%', toggleActions: 'play none none none' }
    }
  );

  /* ── FOOTER ─────────────────────────────────────────────── */
  gsap.fromTo('footer .footer-row > div:first-child',
    { opacity: 0, x: -40, rotation: -1 },
    {
      opacity: 1, x: 0, rotation: 0,
      duration: 0.85, ease: 'power3.out',
      scrollTrigger: { trigger: 'footer', start: 'top 95%', toggleActions: 'play none none none' }
    }
  );
  gsap.fromTo('footer .footer-row > div:last-child',
    { opacity: 0, x: 40, rotation: 1 },
    {
      opacity: 1, x: 0, rotation: 0,
      duration: 0.85, ease: 'power3.out', delay: 0.1,
      scrollTrigger: { trigger: 'footer', start: 'top 95%', toggleActions: 'play none none none' }
    }
  );

  /* ── METRIC / MINI cards inside hero card (on scroll after load) ── */
  gsap.fromTo('.metric',
    { opacity: 0, y: 30, scale: 0.94, rotation: 2 },
    {
      opacity: 1, y: 0, scale: 1, rotation: 0,
      duration: 0.8, ease: 'power3.out', stagger: 0.1, delay: 0.2,
      scrollTrigger: { trigger: '.metric-grid', start: 'top 90%', toggleActions: 'play none none none' }
    }
  );
  gsap.fromTo('.mini',
    { opacity: 0, y: 25, scale: 0.95 },
    {
      opacity: 1, y: 0, scale: 1,
      duration: 0.75, ease: 'power3.out', stagger: 0.1, delay: 0.3,
      scrollTrigger: { trigger: '.mini-row', start: 'top 90%', toggleActions: 'play none none none' }
    }
  );

  /* ── TRUST PILLS (hero section, after load) ── */
  gsap.fromTo('.trust-badges .pill',
    { opacity: 0, y: 20, scale: 0.92, rotation: -1 },
    {
      opacity: 1, y: 0, scale: 1, rotation: 0,
      duration: 0.7, ease: 'power3.out', stagger: 0.1
    }
  );

  /* ══ PARALLAX ══ */
  gsap.to('#topGlow', {
    yPercent: 35, ease: 'none',
    scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 1.5 }
  });
  gsap.to('#parallaxGlow1', {
    yPercent: 20, ease: 'none',
    scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 2 }
  });
  gsap.to('#parallaxGlow2', {
    yPercent: -18, ease: 'none',
    scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 1.8 }
  });

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const glow = document.querySelector('.top-glow');
    if (glow) glow.style.transform = `translateY(${scrollY * 0.2}px)`;
  }, { passive: true });

  /* ══ 3D TILT — hero-card ══ */
  (function setupHeroTilt() {
    const card = document.getElementById('heroCard');
    if (!card) return;
    const MAX_TILT = 10;
    let rafId = null, targetRX = 0, targetRY = 0, currentRX = 0, currentRY = 0, isHovered = false;
    const lerp = (a, b, t) => a + (b - a) * t;
    function onMove(e) {
      const rect = card.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
      const dy = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
      targetRY =  dx * MAX_TILT; targetRX = -dy * MAX_TILT;
      const sheen = card.querySelector('.tilt-sheen');
      if (sheen) {
        const sx = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
        const sy = ((e.clientY - rect.top ) / rect.height * 100).toFixed(1);
        sheen.style.background = `radial-gradient(ellipse at ${sx}% ${sy}%, rgba(255,255,255,.10), transparent 65%)`;
      }
    }
    function tick() {
      currentRX = lerp(currentRX, isHovered ? targetRX : 0, 0.09);
      currentRY = lerp(currentRY, isHovered ? targetRY : 0, 0.09);
      const shadowX = (currentRY / MAX_TILT) * 18;
      const shadowY = (-currentRX / MAX_TILT) * 18 + 24;
      gsap.set(card, {
        rotateX: currentRX, rotateY: currentRY, scale: isHovered ? 1.025 : 1,
        transformPerspective: 900,
        boxShadow: `${shadowX}px ${shadowY}px 60px rgba(0,0,0,.60), 0 4px 20px rgba(216,177,91,.08)`,
        force3D: true
      });
      if (Math.abs(currentRX) > 0.02 || Math.abs(currentRY) > 0.02 || isHovered) {
        rafId = requestAnimationFrame(tick);
      } else {
        gsap.set(card, { clearProps: 'rotateX,rotateY,boxShadow' }); rafId = null;
      }
    }
    card.addEventListener('mouseenter', () => { isHovered = true; card.classList.add('tilt-active'); if (!rafId) rafId = requestAnimationFrame(tick); });
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', () => { isHovered = false; targetRX = 0; targetRY = 0; card.classList.remove('tilt-active'); if (!rafId) rafId = requestAnimationFrame(tick); });
  })();

  /* ══ 3D TILT — big-cards ══ */
  (function setupCardTilt() {
    const MAX_TILT = 8;
    document.querySelectorAll('.big-card').forEach(card => {
      let rafId = null, targetRX = 0, targetRY = 0, currentRX = 0, currentRY = 0, isHovered = false;
      const lerp = (a, b, t) => a + (b - a) * t;
      function onMove(e) {
        const rect = card.getBoundingClientRect();
        const dx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
        const dy = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
        targetRY =  dx * MAX_TILT; targetRX = -dy * MAX_TILT;
        const sheen = card.querySelector('.card-sheen');
        if (sheen) {
          const sx = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
          const sy = ((e.clientY - rect.top ) / rect.height * 100).toFixed(1);
          sheen.style.background = `radial-gradient(ellipse at ${sx}% ${sy}%, rgba(255,255,255,.07), transparent 60%)`;
        }
      }
      function tick() {
        currentRX = lerp(currentRX, isHovered ? targetRX : 0, 0.10);
        currentRY = lerp(currentRY, isHovered ? targetRY : 0, 0.10);
        gsap.set(card, {
          rotateX: currentRX, rotateY: currentRY,
          scale: isHovered ? 1.02 : 1, y: isHovered ? -6 : 0,
          transformPerspective: 800,
          boxShadow: `0 ${14 + (isHovered ? 12 : 0)}px ${isHovered ? 80 : 40}px rgba(0,0,0,${isHovered ? .65 : .45})`,
          force3D: true
        });
        if (Math.abs(currentRX) > 0.02 || Math.abs(currentRY) > 0.02 || isHovered) {
          rafId = requestAnimationFrame(tick);
        } else {
          gsap.set(card, { clearProps: 'rotateX,rotateY,y,scale,boxShadow' }); rafId = null;
        }
      }
      card.addEventListener('mouseenter', () => { isHovered = true; if (!rafId) rafId = requestAnimationFrame(tick); });
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', () => { isHovered = false; targetRX = 0; targetRY = 0; if (!rafId) rafId = requestAnimationFrame(tick); });
    });
  })();

  /* ══ MAGNETIC BUTTONS ══ */
  document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width  / 2) * 0.18;
      const dy = (e.clientY - rect.top  - rect.height / 2) * 0.18;
      gsap.to(btn, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.4)' });
    });
  });

})();
