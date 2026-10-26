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

  /* ---------- Carte 3D pilotée par le scroll ---------- */
  const mapSection = $('#emplacement');
  const mapHead = $('#mapHead');
  const mapFrame = $('#mapFrame');
  const mapEl = $('#map');
  const caps = $$('.cap', mapFrame).map((el) => ({ el, range: el.dataset.range.split(',').map(Number) }));
  const badges = $('#mapBadges');
  const mapBar = $('#mapProgress');
  let map = null;
  let mapReady = false;
  let mapData = null;
  let fades = [];

  function mapFail() { $('#mapFallback').hidden = false; badges.classList.add('show'); }

  function marker(cls, label) {
    // MapLibre gère l'opacité du conteneur : l'apparition se fait sur l'élément intérieur
    const el = document.createElement('div');
    el.innerHTML = `<div class="mk mk-fade ${cls}"><span class="mk-label">${label}</span><span class="mk-stem"></span>${cls.includes('mk-home') ? '<span class="mk-dot"></span>' : ''}</div>`;
    return el;
  }

  // Trajet de la caméra : du ciel au-dessus du bassin jusqu'à l'appartement, en tournant
  let keys = [];
  const lerp = (a, b, t) => a + (b - a) * t;
  function camera(c) {
    let k = 0;
    while (k < keys.length - 2 && c > keys[k + 1].c) k++;
    const A = keys[k], B = keys[k + 1];
    const t = ease(clamp((c - A.c) / (B.c - A.c)));
    return {
      center: [lerp(A.center[0], B.center[0], t), lerp(A.center[1], B.center[1], t)],
      zoom: lerp(A.zoom, B.zoom, t),
      pitch: lerp(A.pitch, B.pitch, t),
      bearing: lerp(keys[0].bearing, keys[keys.length - 1].bearing, c),
    };
  }

  let lineK = -1;
  function setLine(k) {
    if (!map || Math.abs(k - lineK) < 0.002) return;
    lineK = k;
    const [a, b] = mapData.meta.beach_line;
    map.getSource('dist').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: [a, [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]] } });
  }

  let mapHeadBottom = 0;
  const measureMap = () => { mapHeadBottom = mapHead.offsetTop + mapHead.offsetHeight; };

  function updateMap(vh) {
    const r = mapSection.getBoundingClientRect();
    if (r.bottom < -vh || r.top > vh * 2) return;
    const P = reduced ? 1 : clamp(-r.top / (r.height - vh));
    // 1. la carte s'agrandit jusqu'au plein écran
    const e = ease(clamp(P / 0.14));
    const t0 = Math.min(mapHeadBottom + (isMobile() ? 24 : 40), vh * 0.6);
    const s0 = isMobile() ? 16 : Math.max(32, innerWidth * 0.09);
    const b0 = isMobile() ? 20 : vh * 0.05;
    if (!reduced) {
      mapFrame.style.clipPath = `inset(${(t0 * (1 - e)).toFixed(1)}px ${(s0 * (1 - e)).toFixed(1)}px ${(b0 * (1 - e)).toFixed(1)}px ${(s0 * (1 - e)).toFixed(1)}px round ${(28 * (1 - e)).toFixed(1)}px)`;
      mapHead.style.opacity = (1 - clamp(e * 1.8)).toFixed(3);
      mapHead.style.transform = `translateY(${(-e * 60).toFixed(1)}px)`;
    }
    // 2. la caméra tourne et zoome
    const c = clamp((P - 0.06) / 0.88);
    mapBar.style.transform = `scaleX(${c.toFixed(4)})`;
    caps.forEach(({ el, range: [a, b] }) => {
      const o = Math.min(clamp((c - a) / 0.05), clamp((b - c) / 0.05));
      el.style.opacity = o.toFixed(3);
      el.style.transform = `translateY(${((1 - o) * (c < a + 0.05 ? 30 : -30)).toFixed(1)}px)`;
    });
    badges.classList.toggle('show', c > 0.86);
    if (!mapReady) return;
    map.jumpTo(camera(c));
    fades.forEach(([el, from]) => el.classList.toggle('show', c >= from));
    setLine(ease(clamp((c - 0.5) / 0.2)));
  }

  function initMap(data) {
    mapData = data;
    const m = data.meta;
    $$('[data-dist]', mapSection).forEach((el) => { if (m[el.dataset.dist] != null) el.textContent = m[el.dataset.dist]; });
    const mob = isMobile();
    keys = [
      { c: 0, center: [-1.1470, 44.6590], zoom: mob ? 13.7 : 14.1, pitch: 25, bearing: -40 },
      { c: 0.3, center: m.marina || m.house, zoom: mob ? 14.9 : 15.4, pitch: 48 },
      { c: 0.62, center: [lerp(m.house[0], m.beach_line[1][0], 0.5), lerp(m.house[1], m.beach_line[1][1], 0.5)], zoom: mob ? 16.2 : 16.5, pitch: 58 },
      { c: 0.9, center: m.house, zoom: mob ? 17.2 : 17.5, pitch: 66 },
      { c: 1, center: m.house, zoom: mob ? 17.3 : 17.6, pitch: 66, bearing: 200 },
    ];

    map = new window.maplibregl.Map({
      container: mapEl,
      style: { version: 8, sources: {}, layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#1a1a1c' } }] },
      ...camera(0),
      maxPitch: 75,
      interactive: false,
      attributionControl: false,
      fadeDuration: 0,
    });
    map.addControl(new window.maplibregl.AttributionControl({ compact: true, customAttribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>' }));

    map.on('load', () => {
      ['sea', 'water', 'beach', 'green', 'piers', 'roads', 'paths', 'buildings'].forEach((k) => map.addSource(k, { type: 'geojson', data: data[k] }));
      map.addSource('dist', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [m.beach_line[0], m.beach_line[0]] } } });
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
      map.addLayer({ id: 'home-glow', type: 'circle', source: 'home', paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 13, 10, 17, 70, 18, 120], 'circle-color': '#2997ff', 'circle-opacity': 0.25, 'circle-blur': 1 } });
      map.addLayer({ id: 'dist', type: 'line', source: 'dist', layout: { 'line-cap': 'round' }, paint: { 'line-color': '#f5d48a', 'line-width': 4, 'line-dasharray': [0.1, 2] } });
      map.addLayer({ id: 'buildings', type: 'fill-extrusion', source: 'buildings', paint: {
        'fill-extrusion-color': ['case', ['==', ['get', 'me'], 1], '#2997ff', ['interpolate', ['linear'], ['get', 'h'], 3, '#2b2b2f', 10, '#3a3a40', 20, '#4d4d55']],
        'fill-extrusion-height': ['get', 'h'],
        'fill-extrusion-base': ['get', 'mh'],
        'fill-extrusion-opacity': 0.96,
        'fill-extrusion-vertical-gradient': true,
      } });
      map.setLight({ anchor: 'map', color: '#ffffff', intensity: 0.42, position: [1.4, 210, 35] });

      const add = (el, ll, from) => {
        new window.maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat(ll).addTo(map);
        fades.push([el.firstChild, from]);
      };
      if (m.marina) add(marker('', 'Port de plaisance'), m.marina, 0.27);
      add(marker('mk-beach', `Plage · ${m.beach_m} m`), m.beach_line[1], 0.6);
      add(marker('mk-home', "L'appartement"), m.house, 0.12);

      mapReady = true;
      request();
    });
  }

  measureMap();
  new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting || map) return;
      if (!window.maplibregl) { mapFail(); return; }
      fetch('assets/geo/arcachon.json')
        .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(initMap)
        .catch(mapFail);
    });
  }, { rootMargin: '1200px 0px' }).observe(mapSection);

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
    updateMap(vh);
  }
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  if (lenis) lenis.on('scroll', request);
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', () => { measure(); measureMap(); request(); });
  measure();
  update();
  document.fonts && document.fonts.ready.then(() => { measure(); measureMap(); update(); });

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
