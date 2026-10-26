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

  /* ---------- Parallaxe douce  /* ---------- Parallaxe douce des photos ---------- */
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
    updateParallax(vh);
  }
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  if (lenis) lenis.on('scroll', request);
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', () => { measure(); request(); });
  measure();
  update();
  document.fonts && document.fonts.ready.then(() => { measure(); update(); });

  /* ---------- Carte 3D ---------- */
  const mapStage = $('#mapStage');
  const mapEl = $('#map');
  const spinBtn = $('#mapSpin');
  const viewBtns = $$('[data-view]', mapStage);
  let map = null;
  let mapReady = false;
  let introDone = false;
  let stageVisible = false;
  let spinning = false;
  let userStopped = false;
  let spinRaf = null;
  let lastT = 0;
  const views = {};

  function mapFail() {
    $('#mapFallback').hidden = false;
    mapStage.classList.add('ready');
  }

  function marker(cls, label) {
    const el = document.createElement('div');
    el.className = `mk ${cls}`;
    el.innerHTML = `<span class="mk-label">${label}</span><span class="mk-stem"></span>${cls.includes('mk-home') ? '<span class="mk-dot"></span>' : ''}`;
    return el;
  }

  function spinStep(t) {
    if (!spinning || !map) { spinRaf = null; return; }
    const dt = lastT ? Math.min(64, t - lastT) : 16;
    lastT = t;
    map.setBearing(map.getBearing() + dt * 0.0045);
    spinRaf = requestAnimationFrame(spinStep);
  }
  function setSpin(on) {
    spinning = on && !reduced;
    spinBtn.setAttribute('aria-pressed', String(spinning));
    if (spinning && !spinRaf) { lastT = 0; spinRaf = requestAnimationFrame(spinStep); }
  }

  function goTo(name) {
    viewBtns.forEach((b) => b.classList.toggle('active', b.dataset.view === name));
    const wasSpinning = spinning;
    setSpin(false);
    map.flyTo({ ...views[name], duration: reduced ? 0 : 2600, curve: 1.3, essential: true });
    map.once('moveend', () => { if (wasSpinning || !userStopped) setSpin(stageVisible && !userStopped); });
  }

  function intro() {
    if (introDone || !mapReady || !stageVisible) return;
    introDone = true;
    const reveal = () => {
      mapStage.classList.add('ready');
      $$('.mk-fade', mapStage).forEach((m) => m.classList.add('show'));
      growLine();
      viewBtns.forEach((b) => b.classList.toggle('active', b.dataset.view === 'home'));
      setSpin(!userStopped);
    };
    if (reduced) { map.jumpTo(views.home); reveal(); return; }
    map.flyTo({ ...views.home, duration: 6500, curve: 1.5, essential: true });
    map.once('moveend', reveal);
  }

  let line = null;
  function growLine() {
    if (!line) return;
    const [a, b] = line;
    const src = map.getSource('dist');
    const t0 = performance.now();
    const step = (t) => {
      const k = reduced ? 1 : ease(clamp((t - t0) / 1400));
      src.setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: [a, [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]] } });
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function initMap(data) {
    const m = data.meta;
    views.home = { center: m.house, zoom: 16.9, pitch: isMobile() ? 56 : 62, bearing: 32 };
    views.overview = { center: [-1.1455, 44.6578], zoom: isMobile() ? 14.1 : 14.7, pitch: 50, bearing: -18 };
    line = m.beach_line;
    $$('[data-dist]', mapStage).forEach((el) => { if (m[el.dataset.dist] != null) el.textContent = m[el.dataset.dist]; });

    map = new window.maplibregl.Map({
      container: mapEl,
      style: { version: 8, sources: {}, layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#1a1a1c' } }] },
      center: [-1.1468, 44.6585],
      zoom: isMobile() ? 13.2 : 13.6,
      pitch: 0,
      bearing: -25,
      maxPitch: 72,
      minZoom: 12.8,
      maxZoom: 18.5,
      maxBounds: [[-1.19, 44.63], [-1.10, 44.68]],
      attributionControl: false,
      fadeDuration: 0,
    });
    map.addControl(new window.maplibregl.AttributionControl({ compact: true, customAttribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>' }));
    map.scrollZoom.disable();
    if (matchMedia('(pointer: coarse)').matches) map.dragPan.disable();

    map.on('load', () => {
      ['sea', 'water', 'beach', 'green', 'piers', 'roads', 'paths', 'buildings'].forEach((k) => map.addSource(k, { type: 'geojson', data: data[k] }));
      map.addSource('dist', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [line[0], line[0]] } } });
      map.addSource('home', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Point', coordinates: m.house } } });

      map.addLayer({ id: 'sea', type: 'fill', source: 'sea', paint: { 'fill-color': '#0d2f52' } });
      map.addLayer({ id: 'water', type: 'fill', source: 'water', paint: { 'fill-color': '#0d2f52' } });
      map.addLayer({ id: 'green', type: 'fill', source: 'green', paint: { 'fill-color': '#1d3324' } });
      map.addLayer({ id: 'beach', type: 'fill', source: 'beach', paint: { 'fill-color': '#d9bf8c', 'fill-opacity': 0.92 } });
      map.addLayer({ id: 'piers', type: 'fill', source: 'piers', paint: { 'fill-color': '#6b5e4c' } });
      map.addLayer({ id: 'paths', type: 'line', source: 'paths', paint: { 'line-color': '#2c2c30', 'line-width': ['interpolate', ['linear'], ['zoom'], 13, 0.4, 17, 2.2] } });
      map.addLayer({ id: 'roads', type: 'line', source: 'roads', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: {
        'line-color': ['case', ['==', ['get', 'c'], 1], '#4a4a50', '#36363b'],
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 13, ['case', ['==', ['get', 'c'], 1], 1.4, 0.7], 17, ['case', ['==', ['get', 'c'], 1], 12, 7], 18.5, ['case', ['==', ['get', 'c'], 1], 26, 15]],
      } });
      map.addLayer({ id: 'home-glow', type: 'circle', source: 'home', paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 13, 10, 17, 70], 'circle-color': '#2997ff', 'circle-opacity': 0.22, 'circle-blur': 1 } });
      map.addLayer({ id: 'dist', type: 'line', source: 'dist', layout: { 'line-cap': 'round' }, paint: { 'line-color': '#f5d48a', 'line-width': 3.5, 'line-dasharray': [0.1, 2] } });
      map.addLayer({ id: 'buildings', type: 'fill-extrusion', source: 'buildings', paint: {
        'fill-extrusion-color': ['case', ['==', ['get', 'me'], 1], '#2997ff', ['interpolate', ['linear'], ['get', 'h'], 3, '#2b2b2f', 10, '#3a3a40', 20, '#4d4d55']],
        'fill-extrusion-height': ['get', 'h'],
        'fill-extrusion-base': ['get', 'mh'],
        'fill-extrusion-opacity': 0.96,
        'fill-extrusion-vertical-gradient': true,
      } });
      map.setLight({ anchor: 'map', color: '#ffffff', intensity: 0.42, position: [1.4, 210, 35] });

      new window.maplibregl.Marker({ element: marker('mk-home', "L'appartement"), anchor: 'bottom', offset: [0, 8] }).setLngLat(m.house).addTo(map);
      new window.maplibregl.Marker({ element: marker('mk-beach mk-fade', `Plage · ${m.beach_m} m`), anchor: 'bottom' }).setLngLat(line[1]).addTo(map);
      if (m.marina) new window.maplibregl.Marker({ element: marker('mk-fade', 'Port de plaisance'), anchor: 'bottom' }).setLngLat(m.marina).addTo(map);

      mapReady = true;
      intro();
    });

    const stopByUser = (e) => { if (e.originalEvent) { userStopped = true; setSpin(false); viewBtns.forEach((b) => b.classList.remove('active')); } };
    map.on('dragstart', stopByUser);
    map.on('rotatestart', stopByUser);
    map.on('pitchstart', stopByUser);
    map.on('zoomstart', stopByUser);
  }

  spinBtn.addEventListener('click', () => {
    userStopped = spinning;
    setSpin(!spinning);
  });
  viewBtns.forEach((b) => b.addEventListener('click', () => { if (map && mapReady) goTo(b.dataset.view); }));

  new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting || map) return;
      if (!window.maplibregl) { mapFail(); return; }
      fetch('assets/geo/arcachon.json')
        .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(initMap)
        .catch(mapFail);
    });
  }, { rootMargin: '600px 0px' }).observe(mapStage);

  new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      stageVisible = e.isIntersecting;
      if (stageVisible) { intro(); if (introDone && !userStopped) setSpin(true); }
      else setSpin(false);
    });
  }, { threshold: 0.45 }).observe(mapStage);

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
})();
