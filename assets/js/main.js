/**
 * KateringKing — main.js
 * Handles: nav scroll behavior, mobile menu, scroll reveal,
 *          smooth anchor scrolling, menu tabs, footer year.
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   1. NAVIGATION — transparent → dark on scroll
═══════════════════════════════════════════════════════════════ */
(function initNav() {
  const nav     = document.getElementById('site-nav');
  const heroEl  = document.getElementById('hero');
  if (!nav) return;

  // Threshold: switch style once scrolled past 80% of hero height
  function updateNav() {
    const threshold = heroEl ? heroEl.offsetHeight * 0.15 : 100;
    if (window.scrollY > threshold) {
      nav.classList.add('nav-scrolled');
      nav.classList.remove('nav-hero');
    } else {
      nav.classList.add('nav-hero');
      nav.classList.remove('nav-scrolled');
    }
  }

  // Set initial state
  nav.classList.add('nav-hero');
  updateNav();

  // Throttled scroll listener
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateNav();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();


/* ═══════════════════════════════════════════════════════════════
   2. MOBILE MENU
═══════════════════════════════════════════════════════════════ */
(function initMobileMenu() {
  const toggle      = document.getElementById('nav-toggle');
  const mobileMenu  = document.getElementById('mobile-menu');
  const closeBtn    = document.getElementById('mobile-close');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (!toggle || !mobileMenu) return;

  function openMenu() {
    mobileMenu.classList.add('open');
    mobileMenu.removeAttribute('hidden');
    mobileMenu.setAttribute('aria-hidden', 'false');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  if (closeBtn) closeBtn.addEventListener('click', closeMenu);

  // Close on link click
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMenu();
      toggle.focus();
    }
  });
})();


/* ═══════════════════════════════════════════════════════════════
   3. SMOOTH SCROLL — all anchor links
═══════════════════════════════════════════════════════════════ */
(function initSmoothScroll() {
  const navHeight = () => {
    const nav = document.getElementById('site-nav');
    return nav ? nav.offsetHeight : 80;
  };

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const top = target.getBoundingClientRect().top
                + window.scrollY
                - navHeight()
                - 16; // small breathing room

      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
  });
})();


/* ═══════════════════════════════════════════════════════════════
   4. SCROLL REVEAL — IntersectionObserver
═══════════════════════════════════════════════════════════════ */
(function initScrollReveal() {
  // If user prefers reduced motion, just show everything immediately
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right')
      .forEach(el => el.classList.add('is-visible'));
    return;
  }

  const revealItems = document.querySelectorAll(
    '.reveal-up, .reveal-left, .reveal-right'
  );

  if (!revealItems.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Unobserve after reveal so it doesn't re-trigger
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px'
    }
  );

  revealItems.forEach(el => observer.observe(el));
})();


/* ═══════════════════════════════════════════════════════════════
   5. MENU TABS
═══════════════════════════════════════════════════════════════ */
(function initMenuTabs() {
  const tabs   = document.querySelectorAll('.menu-tab');
  const panels = document.querySelectorAll('.menu-tab-panel');

  if (!tabs.length) return;

  function activateTab(selectedTab) {
    const targetId = selectedTab.dataset.tab;

    tabs.forEach(tab => {
      const isSelected = tab === selectedTab;
      tab.classList.toggle('active', isSelected);
      tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    });

    panels.forEach(panel => {
      const match = panel.id === `tab-${targetId}`;
      panel.classList.toggle('active', match);
      if (match) {
        panel.removeAttribute('hidden');
        // Re-trigger reveal animations for newly shown content
        panel.querySelectorAll('.reveal-up, .reveal-left, .reveal-right')
          .forEach(el => {
            // Small delay so browser can paint before observing
            setTimeout(() => {
              el.classList.remove('is-visible');
              // Give IntersectionObserver a moment
              setTimeout(() => {
                if (isInViewport(el)) {
                  el.classList.add('is-visible');
                }
              }, 50);
            }, 10);
          });
      } else {
        panel.setAttribute('hidden', '');
      }
    });
  }

  function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top < window.innerHeight * 0.92 &&
      rect.bottom >= 0
    );
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activateTab(tab));

    // Keyboard navigation for tab list (arrow keys)
    tab.addEventListener('keydown', (e) => {
      const tabArr  = Array.from(tabs);
      const current = tabArr.indexOf(tab);
      let next = -1;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        next = (current + 1) % tabArr.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        next = (current - 1 + tabArr.length) % tabArr.length;
      } else if (e.key === 'Home') {
        next = 0;
      } else if (e.key === 'End') {
        next = tabArr.length - 1;
      }

      if (next >= 0) {
        e.preventDefault();
        tabArr[next].focus();
        activateTab(tabArr[next]);
      }
    });
  });
})();


/* ═══════════════════════════════════════════════════════════════
   6. HERO VIDEO FALLBACK
      If video can't load / autoplay is blocked, keep poster visible
═══════════════════════════════════════════════════════════════ */
(function initVideoFallback() {
  const video = document.querySelector('.hero-video');
  if (!video) return;

  // Autoplay policy: try play(), if rejected just let poster show
  const playPromise = video.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      // Autoplay blocked — poster image remains visible, that's fine
      video.style.display = 'none';
    });
  }

  video.addEventListener('error', () => {
    video.style.display = 'none';
  });
})();


/* ═══════════════════════════════════════════════════════════════
   7. FOOTER YEAR
═══════════════════════════════════════════════════════════════ */
(function setFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();


/* ═══════════════════════════════════════════════════════════════
   8. ACTIVE NAV LINK on scroll (highlight current section)
═══════════════════════════════════════════════════════════════ */
(function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id], main > section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.style.color = href === `#${id}`
              ? 'var(--gold-light)'
              : '';
          });
        }
      });
    },
    {
      rootMargin: '-40% 0px -55% 0px',
      threshold: 0
    }
  );

  sections.forEach(section => observer.observe(section));
})();
