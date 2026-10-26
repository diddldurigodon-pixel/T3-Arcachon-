(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => innerWidth <= 760;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const src = (name, w) => `assets/img/${name}-${w}.webp`;
  const srcset = (name) => `${src(name, 800)} 800w, ${src(name, 1600)} 1600w, ${src(name, 2400)} 2400w`;

  /* ---------- Photos ---------- */
  const photos = [
    { name: 'plage', alt: 'La plage', note: 'À 100 m' },
    { name: 'jardin-1', alt: 'Le jardin', note: '20 m² plein sud' },
    { name: 'jardin-2', alt: 'La baie vitrée', note: 'Du jardin au séjour' },
    { name: 'sejour-mezzanine', alt: 'Le séjour', note: 'Avec mezzanine', portrait: true },
    { name: 'sejour', alt: 'La cuisine', note: 'Ouverte et équipée' },
    { name: 'salon', alt: 'Le salon', note: 'TV, wifi, bureau' },
    { name: 'chambre', alt: 'La chambre', note: 'Lits superposés', portrait: true },
    { name: 'mezzanine', alt: 'La mezzanine', note: 'Sous le velux' },
    { name: 'mezzanine-lit', alt: 'Le lit 140', note: 'Stores occultants' },
    { name: 'salle-eau', alt: "La salle d'eau", note: 'Douche vitrée' },
    { name: 'wc', alt: 'Les WC', note: 'Séparés', portrait: true },
    { name: 'port', alt: 'Le port de plaisance', note: 'À 100 m' },
    { name: 'port-quai', alt: 'Le quai', note: 'Au bout de la rue' },
  ];
  const indexOf = (name) => photos.findIndex((p) => p.name === name);

  /* ---------- Défilement fluide ---------- */
  let lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.085, smoothWheel: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  const scrollToY = (y) => {
    if (lenis) lenis.scrollTo(y, { duration: 1.4 });
    else scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
  };
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const target = id === '#top' ? null : $(id);
    if (id !== '#top' && !target) return;
    e.preventDefault();
    scrollToY(target ? target.getBoundingClientRect().top + scrollY - 52 : 0);
  }));

  /* ---------- Accueil : la photo s'ouvre ---------- */
  const hero = $('#hero');
  const head = $('#heroHead');
  const media = $('#heroMedia');
  const heroImg = $('img', media);
  const cap = $('#heroCaption');
  let headBottom = 0;
  const measure = () => { headBottom = head.offsetTop + head.offsetHeight; };

  function updateHero(vh) {
    const r = hero.getBoundingClientRect();
    if (r.bottom < 0 || reduced) return;
    const p = clamp(-r.top / (hero.offsetHeight - vh));
    const e = ease(clamp(p / 0.7));
    const vw = innerWidth;
    const t0 = Math.min(headBottom + (isMobile() ? 28 : 44), vh * 0.72);
    const s0 = isMobile() ? 16 : Math.max(32, vw * 0.09);
    const b0 = isMobile() ? 20 : vh * 0.05;
    const t = t0 * (1 - e), s = s0 * (1 - e), b = b0 * (1 - e);
    media.style.clipPath = `inset(${t}px ${s}px ${b}px ${s}px round ${28 * (1 - e)}px)`;
    heroImg.style.setProperty('--ty', `${((t - b) / 2).toFixed(1)}px`);
    heroImg.style.setProperty('--z', (1.18 - 0.18 * e).toFixed(4));
    head.style.opacity = (1 - clamp(e * 1.7)).toFixed(3);
    head.style.transform = `translateY(${(-e * 70).toFixed(1)}px) scale(${(1 - e * 0.05).toFixed(4)})`;
    cap.style.opacity = clamp((p - 0.72) / 0.18).toFixed(3);
    cap.style.transform = `translateY(${(20 * (1 - clamp((p - 0.72) / 0.18))).toFixed(1)}px)`;
  }

  /* ---------- Manifeste : mot par mot ---------- */
  const statement = $('#statement');
  const stText = $('#statementText');
  stText.innerHTML = stText.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
  const words = $$('.w', stText);
  if (reduced) words.forEach((w) => w.classList.add('on'));
  let litCount = -1;
  function updateStatement(vh) {
    if (reduced) return;
    const r = stText.getBoundingClientRect();
    if (r.top > vh || r.bottom < 0) return;
    const p = clamp((vh * 0.78 - r.top) / (r.height + vh * 0.2));
    const n = Math.round(p * words.length);
    if (n === litCount) return;
    litCount = n;
    words.forEach((w, i) => w.classList.toggle('on', i < n));
  }

  /* ---------- Visite plein écran ---------- */
  const tour = $('#tour');
  const slides = $$('.slide', tour);
  const framesEl = $('#tourFrames');
  const nav = $('#tourNav');
  const count = $('#tourCount');
  tour.style.setProperty('--n', slides.length);

  slides.forEach((s, i) => {
    const name = s.dataset.img;
    const f = document.createElement('div');
    f.className = 'frame';
    f.innerHTML = `<img src="${src(name, 1600)}" srcset="${srcset(name)}" sizes="100vw" alt="${photos[indexOf(name)].alt}" ${i > 1 ? 'loading="lazy"' : ''} decoding="async">`;
    if (s.dataset.pos) f.firstChild.style.objectPosition = s.dataset.pos;
    framesEl.appendChild(f);

    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = s.dataset.label;
    b.addEventListener('click', () => {
      const top = tour.getBoundingClientRect().top + scrollY;
      scrollToY(top + ((i + 0.35) / slides.length) * (tour.offsetHeight - innerHeight));
    });
    nav.appendChild(b);
  });
  const frames = $$('.frame', framesEl);
  const navBtns = $$('button', nav);
  let current = -1;

  function setSlide(i) {
    if (i === current) return;
    current = i;
    frames.forEach((f, k) => f.classList.toggle('active', k === i));
    slides.forEach((s, k) => s.classList.toggle('active', k === i));
    navBtns.forEach((b, k) => {
      b.classList.toggle('active', k === i);
      if (k === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    count.textContent = `${String(i + 1).padStart(2, '0')} / ${slides.length}`;
    const b = navBtns[i];
    if (nav.scrollWidth > nav.clientWidth) {
      nav.scrollTo({ left: b.offsetLeft - nav.clientWidth / 2 + b.offsetWidth / 2, behavior: reduced ? 'auto' : 'smooth' });
    }
  }

  function updateTour(vh) {
    const r = tour.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - vh));
    const x = p * slides.length;
    const i = Math.min(slides.length - 1, Math.floor(x));
    setSlide(i);
    if (!reduced && r.top < vh && r.bottom > 0) frames[i].style.setProperty('--p', clamp(x - i).toFixed(3));
  }

  /* ---------- Parallaxe douce des photos ---------- */
  const tilePhotos = $$('.tile-photo');
  const finale = $('#finale');
  function updateParallax(vh) {
    if (reduced) return;
    tilePhotos.forEach((t) => {
      const r = t.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const p = clamp((vh - r.top) / (vh + r.height));
      t.style.setProperty('--s', (1.14 - 0.14 * p).toFixed(4));
    });
    const r = finale.getBoundingClientRect();
    if (r.top < vh && r.bottom > 0) {
      finale.style.setProperty('--fz', (1.18 - 0.18 * clamp((vh - r.top) / vh)).toFixed(4));
    }
  }

  /* ---------- Boucle principale ---------- */
  const bar = $('#navProgress');
  let ticking = false;
  function update() {
    ticking = false;
    const vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    bar.style.transform = `scaleX(${max > 0 ? (scrollY / max).toFixed(4) : 0})`;
    updateHero(vh);
    updateStatement(vh);
    updateTour(vh);
    updateParallax(vh);
  }
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  if (lenis) lenis.on('scroll', request);
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', () => { measure(); request(); });
  measure();
  update();
  document.fonts && document.fonts.ready.then(() => { measure(); update(); });

  /* ---------- Apparitions et compteurs ---------- */
  const countUp = (el) => {
    const end = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const fmt = (v) => v.toFixed(dec).replace('.', ',');
    if (reduced) { el.textContent = fmt(end); return; }
    const t0 = performance.now();
    const tick = (t) => {
      const k = clamp((t - t0) / 1600);
      el.textContent = fmt(end * (1 - Math.pow(1 - k, 4)));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      $$('[data-count]', e.target).forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach((el) => io.observe(el));

  /* ---------- Galerie horizontale ---------- */
  const carousel = $('#carousel');
  photos.forEach((p, i) => {
    const fig = document.createElement('figure');
    fig.className = 'shot';
    fig.innerHTML = `<button type="button" class="shot-img" aria-label="Agrandir : ${p.alt}" style="aspect-ratio:${p.portrait ? '3 / 4' : '4 / 3'}"><img src="${src(p.name, 800)}" srcset="${srcset(p.name)}" sizes="(max-width: 760px) 90vw, 60vw" alt="${p.alt}" loading="lazy" decoding="async"></button><figcaption>${p.alt}<span>${p.note}</span></figcaption>`;
    $('button', fig).addEventListener('click', () => openLightbox(i));
    carousel.appendChild(fig);
  });
  const prev = $('#carPrev');
  const next = $('#carNext');
  const step = () => Math.max(280, carousel.clientWidth * 0.7);
  prev.addEventListener('click', () => carousel.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => carousel.scrollBy({ left: step(), behavior: 'smooth' }));
  const updateArrows = () => {
    prev.disabled = carousel.scrollLeft < 8;
    next.disabled = carousel.scrollLeft + carousel.clientWidth > carousel.scrollWidth - 8;
  };
  carousel.addEventListener('scroll', updateArrows, { passive: true });
  updateArrows();

  /* ---------- Plein écran ---------- */
  const lb = $('#lightbox');
  const lbImg = $('#lbImg');
  const lbCap = $('#lbCaption');
  let lbIndex = 0;
  function show(i) {
    lbIndex = (i + photos.length) % photos.length;
    const p = photos[lbIndex];
    lbImg.srcset = srcset(p.name);
    lbImg.sizes = '94vw';
    lbImg.src = src(p.name, 1600);
    lbImg.alt = p.alt;
    lbCap.textContent = `${p.alt} · ${lbIndex + 1} sur ${photos.length}`;
  }
  function openLightbox(i) {
    show(i);
    if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
    if (lenis) lenis.stop();
  }
  const closeLightbox = () => { if (typeof lb.close === 'function') lb.close(); else lb.removeAttribute('open'); };
  lb.addEventListener('close', () => { if (lenis) lenis.start(); });
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
  $('#tourZoom').addEventListener('click', () => openLightbox(indexOf(slides[Math.max(0, current)].dataset.img)));
})();
