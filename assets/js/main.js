/* Cor42 — main.js
   - Header elevation on scroll
   - Mobile nav toggle
   - Scroll-reveal animations (Intersection Observer)
   - Card hover spotlight (mouse coords -> CSS vars)
   - Hero terminal typewriter
   - Contact form (mailto fallback so it works statically)
   - Privacy TOC active link
   - Footer year
*/

(function () {
  'use strict';

  /* ---- Footer year (locked to 2026; static span already renders correctly) ---- */
  // Year is hardcoded in markup as 2026 per brand request; no auto-update.

  /* ---- Header elevation on scroll ---- */
  const header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 12) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Mobile nav ---- */
  const navToggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        mobileNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      })
    );
  }

  /* ---- Scroll reveal ---- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---- 3D card tilt + spotlight (mouse coords -> CSS vars + transform) ---- */
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Cards (services, FAQ): full tilt + spotlight (max +/- 8deg)
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', (x * 100) + '%');
      card.style.setProperty('--my', (y * 100) + '%');
      if (!reducedMotion) {
        const rx = (0.5 - y) * 8;
        const ry = (x - 0.5) * 10;
        card.style.transform =
          `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-3px)`;
      }
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  // Softer tilt (max +/- 4deg) for page elements site-wide
  const softSel = '.pillar, .step, .segment, .region, .channel, .stat, .meaning .item';
  document.querySelectorAll(softSel).forEach(el => {
    el.addEventListener('mousemove', (e) => {
      if (reducedMotion) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const rx = (0.5 - y) * 4;
      const ry = (x - 0.5) * 6;
      el.style.transform =
        `perspective(1100px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-2px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });

  /* ---- Contact form: open mailto with composed body
        (static-site safe; falls back gracefully) ---- */
  const form = document.querySelector('[data-contact-form]');
  if (form) {
    const result = form.querySelector('.form-result');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const org = (data.get('organisation') || '').toString().trim();
      const role = (data.get('role') || '').toString().trim();
      const region = (data.get('region') || '').toString().trim();
      const interest = (data.get('interest') || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();

      const subject = `Cor42 enquiry — ${interest || 'General'} — ${org || name}`;
      const body =
`Name: ${name}
Email: ${email}
Organisation: ${org}
Role: ${role}
Region: ${region}
Area of interest: ${interest}

Message:
${message}

— Sent from cor42.com contact form`;

      const href = `mailto:admin@cor42.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = href;

      if (result) {
        result.classList.add('show');
        result.textContent = "Thanks — opening your email client. If nothing happens, write to admin@cor42.com directly.";
      }
    });
  }

  /* ---- Privacy TOC active link ---- */
  const tocLinks = document.querySelectorAll('.toc a[href^="#"]');
  if (tocLinks.length) {
    const sections = Array.from(tocLinks)
      .map(a => document.getElementById(a.getAttribute('href').slice(1)))
      .filter(Boolean);
    const setActive = () => {
      const y = window.scrollY + 120;
      let active = sections[0]?.id;
      for (const s of sections) {
        if (s.offsetTop <= y) active = s.id;
      }
      tocLinks.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + active));
    };
    setActive();
    window.addEventListener('scroll', setActive, { passive: true });
  }
})();
