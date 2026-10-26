(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => innerWidth <= 820;
  const src = (name, w) => `assets/img/${name}-${w}.webp`;
  const srcset = (name) => `${src(name, 800)} 800w, ${src(name, 1600)} 1600w`;

  /* ---------- Photos (ordre de la galerie) ---------- */
  const photos = [
    { name: 'plage', alt: 'La plage, à 100 m' },
    { name: 'port', alt: 'Le port de plaisance, à 100 m' },
    { name: 'port-quai', alt: 'Le quai, au bout de la rue' },
    { name: 'jardin-1', alt: 'Jardin privatif plein sud' },
    { name: 'jardin-2', alt: 'Jardin et baie vitrée' },
    { name: 'sejour-mezzanine', alt: 'Séjour et mezzanine' },
    { name: 'sejour', alt: 'Cuisine ouverte et salon' },
    { name: 'salon', alt: 'Coin TV' },
    { name: 'chambre', alt: 'Chambre avec lits superposés' },
    { name: 'mezzanine', alt: 'Mezzanine' },
    { name: 'mezzanine-lit', alt: 'Lit 140 en mezzanine' },
    { name: 'salle-eau', alt: "Salle d'eau" },
    { name: 'wc', alt: 'WC séparés' },
  ];
  const altOf = (name) => (photos.find((p) => p.name === name) || {}).alt || '';

  /* ---------- Visite : construit la scène depuis les étapes ---------- */
  const steps = $$('.step');
  const frames = $('#frames');
  const rail = $('#rail');
  const stage = $('#stage');

  steps.forEach((step, i) => {
    const name = step.dataset.img;
    const f = document.createElement('div');
    f.className = 'frame';
    f.innerHTML = `<img src="${src(name, 1600)}" srcset="${srcset(name)}" sizes="(max-width: 820px) 100vw, 60vw" alt="${altOf(name)}" ${i > 1 ? 'loading="lazy"' : ''} decoding="async">`;
    if (step.dataset.pos) f.firstChild.style.objectPosition = step.dataset.pos;
    frames.appendChild(f);

    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = `<span>${step.dataset.label}</span>`;
    b.setAttribute('aria-label', `Aller à : ${step.dataset.label}`);
    b.addEventListener('click', () => goToStep(i));
    rail.appendChild(b);
  });
  const frameEls = $$('.frame', frames);
  const railBtns = $$('button', rail);
  $('#stageTotal').textContent = String(steps.length).padStart(2, '0');

  function goToStep(i) {
    const top = steps[i].getBoundingClientRect().top + scrollY;
    // mobile : le haut de l'étape juste sous la photo ; desktop : carte centrée
    const y = isMobile() ? top - stage.offsetHeight + 2 : top;
    scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
  }

  let current = -1;
  function setActive(i) {
    if (i === current) return;
    current = i;
    frameEls.forEach((f, k) => f.classList.toggle('active', k === i));
    steps.forEach((s, k) => s.classList.toggle('active', k === i));
    railBtns.forEach((b, k) => {
      b.classList.toggle('active', k === i);
      if (k === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    $('#stageNum').textContent = String(i + 1).padStart(2, '0');
    // Mobile : garde la pastille active visible dans la barre horizontale
    if (isMobile()) {
      const b = railBtns[i];
      rail.scrollLeft = b.offsetLeft - rail.clientWidth / 2 + b.offsetWidth / 2;
    }
  }

  /* ---------- Boucle de scroll (une seule, en rAF) ---------- */
  const topbar = $('#topbar');
  const bar = $('#scrollbar');
  const hero = $('#hero');
  const cta = $('.cta');
  let ticking = false;

  function onScroll() {
    const vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;

    const heroP = Math.min(1, Math.max(0, scrollY / hero.offsetHeight));
    if (!reduced) hero.style.setProperty('--hero', heroP.toFixed(3));
    topbar.classList.toggle('solid', scrollY > hero.offsetHeight - 80);

    // Étape active = celle qui croise la ligne de lecture
    const line = isMobile() ? stage.offsetHeight + vh * 0.1 : vh * 0.6;
    let active = 0;
    steps.forEach((s, i) => { if (s.getBoundingClientRect().top <= line) active = i; });
    setActive(active);

    // Zoom lent de la photo active selon la progression dans l'étape
    if (!reduced) {
      const r = steps[active].getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (line - r.top) / r.height));
      frameEls[active].style.setProperty('--p', p.toFixed(3));
    }

    const cr = cta.getBoundingClientRect();
    if (!reduced && cr.top < vh && cr.bottom > 0) {
      cta.style.setProperty('--cta', ((vh - cr.top) / (vh + cr.height) - 0.5).toFixed(3));
    }
    ticking = false;
  }
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Léger effet de profondeur à la souris (desktop) ---------- */
  if (!reduced && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    stage.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      stage.style.setProperty('--mx', `${(-x * 18).toFixed(1)}px`);
      stage.style.setProperty('--my', `${(-y * 12).toFixed(1)}px`);
    });
    stage.addEventListener('pointerleave', () => {
      stage.style.setProperty('--mx', '0px');
      stage.style.setProperty('--my', '0px');
    });
  }

  /* ---------- Apparitions + compteurs ---------- */
  const countUp = (el) => {
    const end = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const fmt = (v) => v.toFixed(dec).replace('.', ',');
    if (reduced) { el.textContent = fmt(end); return; }
    const t0 = performance.now();
    const dur = 1400;
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      el.textContent = fmt(end * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      $$('[data-count]', e.target).forEach(countUp);
      if (e.target.matches('[data-count]')) countUp(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach((el) => io.observe(el));

  /* ---------- Galerie ---------- */
  const gallery = $('#gallery');
  photos.forEach((p, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'reveal';
    b.setAttribute('aria-label', `Agrandir : ${p.alt}`);
    b.innerHTML = `<img src="${src(p.name, 800)}" srcset="${srcset(p.name)}" sizes="(max-width: 600px) 100vw, 33vw" alt="${p.alt}" loading="lazy" decoding="async">`;
    b.addEventListener('click', () => openLightbox(i));
    gallery.appendChild(b);
    io.observe(b);
  });

  /* ---------- Lightbox (clavier + swipe) ---------- */
  const lb = $('#lightbox');
  const lbImg = $('#lbImg');
  const lbCap = $('#lbCaption');
  let lbIndex = 0;

  function show(i) {
    lbIndex = (i + photos.length) % photos.length;
    const p = photos[lbIndex];
    lbImg.src = src(p.name, 1600);
    lbImg.alt = p.alt;
    lbCap.textContent = `${p.alt} · ${lbIndex + 1}/${photos.length}`;
  }
  function openLightbox(i) {
    show(i);
    if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    if (typeof lb.close === 'function') lb.close(); else lb.removeAttribute('open');
  }
  lb.addEventListener('close', () => { document.body.style.overflow = ''; });
  $('#lbClose').addEventListener('click', closeLightbox);
  $('#lbPrev').addEventListener('click', () => show(lbIndex - 1));
  $('#lbNext').addEventListener('click', () => show(lbIndex + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
  addEventListener('keydown', (e) => {
    if (!lb.open) return;
    if (e.key === 'ArrowLeft') show(lbIndex - 1);
    if (e.key === 'ArrowRight') show(lbIndex + 1);
  });
  let sx = null;
  lb.addEventListener('pointerdown', (e) => { sx = e.clientX; });
  lb.addEventListener('pointerup', (e) => {
    if (sx === null) return;
    const dx = e.clientX - sx;
    sx = null;
    if (Math.abs(dx) > 50) show(lbIndex + (dx < 0 ? 1 : -1));
  });

  $('#stageZoom').addEventListener('click', () => {
    const name = steps[Math.max(0, current)].dataset.img;
    openLightbox(photos.findIndex((p) => p.name === name));
  });
})();
