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
  const rv = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); rv.unobserve(en.target); } });
  }, { threshold: .12 });
  document.querySelectorAll('.rv').forEach(el => rv.observe(el));

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
