document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  // Header-Schatten & mobile Navigation
  const header = document.querySelector('.header');
  const nav = document.querySelector('.nav');
  const burger = document.querySelector('.burger');
  const onScroll = () => header.classList.toggle('stuck', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  nav.addEventListener('click', e => { if (e.target.tagName === 'A') nav.classList.remove('open'); });

  // Aktiver Menüpunkt je nach Abschnitt
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(l => { const s = document.querySelector(l.getAttribute('href')); if (s) spy.observe(s); });

  // Hero-Slider
  const slides = [...document.querySelectorAll('.slide')];
  const tabs = [...document.querySelectorAll('.hero .tabs button')];
  let cur = 0, timer;
  const go = n => {
    cur = (n + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('on', i === cur));
    tabs.forEach((t, i) => { t.classList.toggle('on', i === cur); t.setAttribute('aria-selected', i === cur); });
    clearInterval(timer);
    timer = setInterval(() => go(cur + 1), 7000);
  };
  document.querySelector('.hero-next').addEventListener('click', () => go(cur + 1));
  document.querySelector('.hero-prev').addEventListener('click', () => go(cur - 1));
  tabs.forEach((t, i) => t.addEventListener('click', () => go(i)));
  go(0);

  // Einblenden beim Scrollen
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Kleinteile gestaffelt einblenden
  ['.stat', '.checks li', '.faq details', '.quick-trust li', '.contact-info li', '.footer-top > div'].forEach(sel => {
    const groups = new Map();
    document.querySelectorAll(sel).forEach(el => {
      const n = groups.get(el.parentNode) || 0;
      groups.set(el.parentNode, n + 1);
      el.classList.add('rv');
      el.style.transitionDelay = n * 90 + 'ms';
    });
  });

  // Überschriften in Wörter zerlegen
  if (!calm) {
    document.querySelectorAll('.h2, .cta h2, .contact-info h2, .form h2').forEach(h => {
      h.innerHTML = h.textContent.trim().split(/\s+/).map((w, i) => `<span class="w"><span style="--i:${i}">${w}</span></span>`).join(' ');
      h.classList.add('split', 'rv-h');
    });
  }

  // Zahlen hochzählen
  const countUp = el => {
    const m = el.textContent.match(/^([\d.]+)(.*)$/);
    if (!m || calm) return;
    const end = +m[1].replace(/\./g, ''), t0 = performance.now(), dur = 1600;
    const tick = t => {
      const k = Math.min((t - t0) / dur, 1), v = Math.round(end * (1 - Math.pow(1 - k, 3)));
      el.textContent = v.toLocaleString('de-DE') + m[2];
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const rv = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add('in');
      rv.unobserve(el);
      if (el.classList.contains('stat')) countUp(el.querySelector('b'));
      if (el.style.transitionDelay) setTimeout(() => { el.style.transitionDelay = ''; }, 1400);
    });
  }, { threshold: .12 });
  document.querySelectorAll('.rv, .rv-h').forEach(el => rv.observe(el));

  // Scroll-Fortschritt & Parallax im Videobild
  const bar = document.createElement('div');
  bar.className = 'progress';
  document.body.append(bar);
  const vid = document.querySelector('.video'), vidImg = vid.querySelector('img');
  let ticking = false;
  const onMove = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    if (calm) return;
    const r = vid.getBoundingClientRect();
    if (r.bottom > 0 && r.top < innerHeight) {
      const k = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      vidImg.style.transform = `translateY(${(k * -8).toFixed(2)}%)`;
    }
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onMove); } }, { passive: true });
  onMove();

  // Video-Dialog (URL im data-video-Attribut des Play-Buttons hinterlegen)
  const modal = document.querySelector('.modal');
  const play = document.querySelector('.play');
  play.addEventListener('click', () => {
    const box = modal.querySelector('.modal-in');
    const url = play.dataset.video;
    box.innerHTML = url
      ? `<iframe src="${url}" allow="autoplay; fullscreen" allowfullscreen></iframe>`
      : 'Hier erscheint Ihr Imagefilm.<br>Video-URL im Attribut <code>data-video</code> des Play-Buttons eintragen.';
    modal.showModal();
  });
  const closeModal = () => { modal.close(); modal.querySelector('.modal-in').innerHTML = ''; };
  modal.querySelector('.modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  // Formulare (Demo – hier später den Versand anbinden)
  // Die dataLayer-Events lassen sich im Google Tag Manager als Google-Ads-Conversions nutzen.
  window.dataLayer = window.dataLayer || [];
  document.querySelectorAll('.js-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      window.dataLayer.push({ event: 'lead_form_submit', form: form.dataset.form });
      form.reset();
      form.querySelector('.form-ok').classList.add('show');
    });
  });
  document.querySelectorAll('a[href^="tel:"]').forEach(a => {
    a.addEventListener('click', () => window.dataLayer.push({ event: 'phone_click' }));
  });

  document.querySelector('#jahr').textContent = new Date().getFullYear();
});
