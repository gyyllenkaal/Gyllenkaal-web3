/* ════════════════════════════════════════════════════════
   PORTFOLIO — SCRIPT.JS
   Features:
     • Smooth scroll (native CSS + enhanced for links)
     • Navbar scroll style change
     • Scroll reveal (IntersectionObserver)
     • Skill bar animation on reveal
     • Mobile hamburger menu
     • Contact form validation + success message
     • Staggered reveal delays for grouped elements
   ════════════════════════════════════════════════════════ */

'use strict';

/* ─── DOM READY ─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initSmoothScroll();
  initContactForm();
});


/* ════════════════════════════════════════════════════════
   NAVBAR — add .scrolled class after first scroll
   ════════════════════════════════════════════════════════ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };

  // Set initial state
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}


/* ════════════════════════════════════════════════════════
   MOBILE HAMBURGER MENU
   ════════════════════════════════════════════════════════ */
function initMobileMenu() {
  const btn     = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const links   = document.querySelectorAll('.mobile-link');

  if (!btn || !mobileNav) return;

  const toggleMenu = (force) => {
    const isOpen = force !== undefined ? force : !btn.classList.contains('open');
    btn.classList.toggle('open', isOpen);
    mobileNav.classList.toggle('open', isOpen);
    mobileNav.setAttribute('aria-hidden', String(!isOpen));
    btn.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  btn.addEventListener('click', () => toggleMenu());

  // Close on link click
  links.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleMenu(false);
  });
}


/* ════════════════════════════════════════════════════════
   SMOOTH SCROLL — enhanced for all anchor links
   ════════════════════════════════════════════════════════ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navHeight = document.getElementById('navbar')?.offsetHeight ?? 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}


/* ════════════════════════════════════════════════════════
   SCROLL REVEAL — IntersectionObserver
   Observes elements with class .reveal
   Adds .visible when they enter the viewport
   Also triggers skill bars and stagger delays
   ════════════════════════════════════════════════════════ */
function initScrollReveal() {
  // Apply stagger delays to groups
  applyStaggerDelays('.stat-chips .chip',    0.08);
  applyStaggerDelays('.skills-grid .reveal', 0.12);
  applyStaggerDelays('.projects-grid .reveal', 0.1);
  applyStaggerDelays('.about-list li',        0.06);
  applyStaggerDelays('.tech-tags .tag',       0.04);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');

        // Trigger skill bars if this reveal contains them
        const bars = entry.target.querySelectorAll('.bar-fill[data-width]');
        bars.forEach(bar => animateBar(bar));

        // Also animate bars inside .skill-card that just became visible
        if (entry.target.classList.contains('skill-card')) {
          entry.target.querySelectorAll('.bar-fill[data-width]').forEach(animateBar);
        }

        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: '0px 0px -80px 0px',
      threshold: 0.12,
    }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/**
 * Animate a skill progress bar to its target width.
 * @param {HTMLElement} bar - Element with data-width attribute
 */
function animateBar(bar) {
  const target = parseInt(bar.dataset.width, 10);
  if (!target || bar.dataset.animated) return;
  bar.dataset.animated = 'true';

  // Slight delay so CSS transition fires after paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      bar.style.width = `${target}%`;
    });
  });
}

/**
 * Apply staggered transition-delay to a NodeList.
 * @param {string} selector
 * @param {number} step - seconds between each item
 */
function applyStaggerDelays(selector, step) {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.style.transitionDelay = `${(i * step).toFixed(2)}s`;
  });
}


/* ════════════════════════════════════════════════════════
   CONTACT FORM — validation + simulated submission
   ════════════════════════════════════════════════════════ */
function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const message = form.message.value.trim();
    const btn     = form.querySelector('.form-submit');

    // Simple validation
    if (!name || !email || !message) {
      showFormMsg(success, '⚠ Please fill in name, email, and message.', '#f87171');
      return;
    }
    if (!isValidEmail(email)) {
      showFormMsg(success, '⚠ Please enter a valid email address.', '#f87171');
      return;
    }

    // Simulated async send
    btn.disabled = true;
    btn.textContent = 'Sending…';

    await simulateSend(1200);

    btn.disabled = false;
    btn.innerHTML = 'Send Message <span class="btn-arrow">→</span>';
    showFormMsg(success, '✓ Message sent! I\'ll be in touch soon.', '#22c55e');
    form.reset();
  });
}

/** Show a coloured message in the form feedback area */
function showFormMsg(el, text, color) {
  if (!el) return;
  el.textContent = text;
  el.style.color = color;
  // Clear after 5s
  clearTimeout(el._timeout);
  el._timeout = setTimeout(() => { el.textContent = ''; }, 5000);
}

/** Basic email regex check */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Simulate network request */
function simulateSend(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


/* ════════════════════════════════════════════════════════
   ACTIVE NAV LINK — highlight as user scrolls
   ════════════════════════════════════════════════════════ */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          const isActive = link.getAttribute('href') === `#${id}`;
          link.style.color = isActive ? 'var(--accent)' : '';
        });
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );

  sections.forEach(sec => observer.observe(sec));
})();


/* ════════════════════════════════════════════════════════
   CURSOR GLOW — subtle accent follow effect (desktop only)
   ════════════════════════════════════════════════════════ */
(function initCursorGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip touch

  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 9999;
    width: 380px;
    height: 380px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(59,130,246,.06) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: opacity .4s;
    left: -500px; top: -500px;
  `;
  document.body.appendChild(glow);

  let mx = -500, my = -500;
  let cx = -500, cy = -500;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  });
  document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { glow.style.opacity = '1'; });

  // Smooth follow with lerp
  function animate() {
    cx += (mx - cx) * 0.1;
    cy += (my - cy) * 0.1;
    glow.style.left = `${cx}px`;
    glow.style.top  = `${cy}px`;
    requestAnimationFrame(animate);
  }
  animate();
})();
