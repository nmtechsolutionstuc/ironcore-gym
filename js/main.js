/* ===================================================================
   IRONCORE PERFORMANCE — main.js
   1. Navbar scroll state + progress bar
   2. Mobile nav toggle
   3. Hero entrance timeline (GSAP)
   4. Scroll reveal (IntersectionObserver)
   5. Animated counters
   6. Parallax (GSAP ScrollTrigger)
   7. Program cards touch support
   8. Newsletter form
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. NAVBAR SCROLL STATE + PROGRESS BAR ---------- */
  const navbar = document.getElementById('navbar');
  const progressBar = document.getElementById('progressBar');

  const onScroll = () => {
    const scrollY = window.scrollY;
    navbar.classList.toggle('is-scrolled', scrollY > 40);

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 2. MOBILE NAV TOGGLE ---------- */
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileNav = document.getElementById('mobileNav');

  const closeMobileNav = () => {
    document.body.classList.remove('nav-open');
    burgerBtn.setAttribute('aria-expanded', 'false');
    burgerBtn.setAttribute('aria-label', 'Abrir menú');
  };

  burgerBtn.addEventListener('click', () => {
    const isOpen = document.body.classList.toggle('nav-open');
    burgerBtn.setAttribute('aria-expanded', String(isOpen));
    burgerBtn.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileNav();
  });

  /* ---------- 3. HERO ENTRANCE TIMELINE ---------- */
  const hasGSAP = typeof gsap !== 'undefined';

  if (hasGSAP && !prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to('#heroImg', { scale: 1, duration: 1.8, ease: 'power2.out' }, 0)
      .to('.hero__headline .word', {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.09
      }, 0.25)
      .to('.hero__subtext', { y: 0, opacity: 1, duration: 0.8 }, 0.65)
      .to('.hero__ctas', { y: 0, opacity: 1, duration: 0.8 }, 0.78)
      .to('.hero__stats', { y: 0, opacity: 1, duration: 0.8 }, 0.9);

    /* Parallax on background images */
    gsap.utils.toArray('.performance__bg, .final-cta__media img').forEach((img) => {
      gsap.fromTo(img,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: img.closest('section'),
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        }
      );
    });

    /* Subtle hero image drift while in view */
    gsap.to('#heroImg', {
      yPercent: 6,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

  } else {
    /* Fallback: show hero content instantly */
    document.querySelectorAll('.hero__headline .word').forEach(w => {
      w.style.transform = 'none';
      w.style.opacity = '1';
    });
    document.querySelectorAll('.hero__subtext, .hero__ctas, .hero__stats').forEach(el => {
      el.style.transform = 'none';
      el.style.opacity = '1';
    });
  }

  /* ---------- 4. SCROLL REVEAL ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');

  if (prefersReducedMotion) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));

    /* stagger index for performance stats */
    document.querySelectorAll('.performance__stats .stat').forEach((el, i) => {
      el.style.setProperty('--stat-i', i);
    });
  }

  /* ---------- 5. ANIMATED COUNTERS ---------- */
  const counters = document.querySelectorAll('[data-count]');

  const animateCounter = (el) => {
    const target = parseFloat(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1600;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (prefersReducedMotion) {
    counters.forEach(el => {
      el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');
    });
  } else {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));
  }

  /* ---------- 7. PROGRAM CARDS — TOUCH SUPPORT ---------- */
  const isTouch = window.matchMedia('(hover: none)').matches;
  if (isTouch) {
    document.querySelectorAll('.program').forEach(card => {
      card.addEventListener('click', (e) => {
        const alreadyActive = card.classList.contains('is-active');
        if (!alreadyActive) {
          e.preventDefault();
          document.querySelectorAll('.program.is-active').forEach(c => c.classList.remove('is-active'));
          card.classList.add('is-active');
        }
      });
    });
  }

  /* ---------- 8. NEWSLETTER FORM ---------- */
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterMsg = document.getElementById('newsletterMsg');

  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('newsletterEmail');
    if (emailInput.checkValidity()) {
      newsletterMsg.textContent = 'Listo. Bienvenido al equipo.';
      emailInput.value = '';
    } else {
      newsletterMsg.textContent = 'Ingresá un correo electrónico válido.';
    }
  });

  /* ---------- FOOTER YEAR ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
