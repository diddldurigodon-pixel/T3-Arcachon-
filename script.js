(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => innerWidth <= 760;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const src = (name, w) => `assets/img/${name}-${w}.webp`;
  // Écart entre le scroll réel et le scroll amorti suivi par les animations
  let lag = 0;
  const box = (el) => { const b = el.getBoundingClientRect(); return { top: b.top + lag, bottom: b.bottom + lag, height: b.height }; };
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
    lenis = new window.Lenis({ lerp: 0, duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
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
    const r = box(hero);
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
    const r = box(stText);
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
      const r = box(t);
      if (r.bottom < 0 || r.top > vh) return;
      const p = clamp((vh - r.top) / (vh + r.height));
      t.style.setProperty('--s', (1.14 - 0.14 * p).toFixed(4));
    });
    const r = box(finale);
    if (r.top < vh && r.bottom > 0) {
      finale.style.setProperty('--fz', (1.18 - 0.18 * clamp((vh - r.top) / vh)).toFixed(4));
    }
  }

  /* ---------- Carte 3D pilotée par le scroll ---------- */
  // Le survol est pré-calculé en 120 images (vraie carte OpenStreetMap en 3D) :
  // le scroll choisit l'image, avec un fondu entre deux images voisines.
  const mapSection = $('#emplacement');
  const mapHead = $('#mapHead');
  const mapFrame = $('#mapFrame');
  const canvas = $('#mapCanvas');
  const ctx = canvas.getContext('2d');
  const caps = $$('.cap', mapFrame).map((el) => ({ el, range: el.dataset.range.split(',').map(Number) }));
  const badges = $('#mapBadges');
  const mapBar = $('#mapProgress');
  const FRAMES = 120;
  let seq = null;
  let frames = [];
  let mapC = 0;
  let drawnKey = '';

  const pickSeq = () => (innerWidth / innerHeight < 0.85 ? 'm' : 'd');
  function loadSeq() {
    seq = pickSeq();
    frames = new Array(FRAMES).fill(null);
    drawnKey = '';
    // d'abord quelques images réparties sur tout le trajet, puis on remplit les trous
    const order = [];
    const seen = new Set();
    [24, 8, 4, 2, 1].forEach((st) => { for (let i = 0; i < FRAMES; i += st) if (!seen.has(i)) { seen.add(i); order.push(i); } });
    if (!seen.has(FRAMES - 1)) order.splice(1, 0, FRAMES - 1);
    const mine = seq;
    let next = 0;
    const pump = () => {
      if (mine !== seq || next >= order.length) return;
      const i = order[next++];
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => { if (mine === seq) { frames[i] = img; drawSeq(true); } pump(); };
      img.onerror = pump;
      img.src = `assets/map/${seq}/${String(i).padStart(3, '0')}.webp`;
    };
    for (let k = 0; k < 6; k++) pump();
  }
  function nearestFrame(i) {
    for (let d = 0; d < FRAMES; d++) {
      if (frames[i - d]) return frames[i - d];
      if (frames[i + d]) return frames[i + d];
    }
    return null;
  }
  function sizeCanvas() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; drawnKey = ''; }
  }
  function cover(img, alpha) {
    const s = Math.max(canvas.width / img.width, canvas.height / img.height);
    const w = img.width * s, h = img.height * s;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
  }
  function drawSeq(force) {
    if (!seq) return;
    const f = mapC * (FRAMES - 1);
    const i0 = Math.floor(f);
    const t = f - i0;
    const a = frames[i0] || nearestFrame(i0);
    const b = t > 0.01 ? frames[Math.min(FRAMES - 1, i0 + 1)] : null;
    const key = `${f.toFixed(3)}|${a && a.src}|${b && b.src}|${canvas.width}`;
    if (!a || (!force && key === drawnKey)) return;
    drawnKey = key;
    cover(a, 1);
    if (b && b !== a) cover(b, t);
    ctx.globalAlpha = 1;
  }

  let mapHeadBottom = 0;
  const measureMap = () => { mapHeadBottom = mapHead.offsetTop + mapHead.offsetHeight; sizeCanvas(); if (seq && seq !== pickSeq()) loadSeq(); };

  function updateMap(vh) {
    const r = box(mapSection);
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
    // 2. la caméra tourne et zoome (image correspondante)
    const c = clamp((P - 0.06) / 0.88);
    mapBar.style.transform = `scaleX(${c.toFixed(4)})`;
    caps.forEach(({ el, range: [a, b] }) => {
      const o = Math.min(clamp((c - a) / 0.05), clamp((b - c) / 0.05));
      el.style.opacity = o.toFixed(3);
      el.style.transform = `translateY(${((1 - o) * (c < a + 0.05 ? 30 : -30)).toFixed(1)}px)`;
    });
    badges.classList.toggle('show', c > 0.86);
    mapC = c;
    drawSeq(false);
  }

  measureMap();
  new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting && !seq) { sizeCanvas(); loadSeq(); } });
  }, { rootMargin: '1500px 0px' }).observe(mapSection);

  /* ---------- Boucle principale ---------- */
  const bar = $('#navProgress');
  let sy = scrollY;
  let running = false;
  function update() {
    const vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    bar.style.transform = `scaleX(${max > 0 ? clamp(sy / max).toFixed(4) : 0})`;
    updateHero(vh);
    updateStatement(vh);
    updateParallax(vh);
    updateMap(vh);
  }
  // Inertie : les animations rattrapent le scroll en douceur au lieu de s'arrêter net
  function frame() {
    const target = scrollY;
    sy = reduced ? target : sy + (target - sy) * 0.085;
    if (Math.abs(target - sy) < 0.3) sy = target;
    lag = target - sy;
    update();
    if (sy !== target) requestAnimationFrame(frame); else running = false;
  }
  const request = () => { if (!running) { running = true; requestAnimationFrame(frame); } };
  if (lenis) lenis.on('scroll', request);
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', () => { measure(); measureMap(); request(); });
  measure();
  update();
  document.fonts && document.fonts.ready.then(() => { measure(); measureMap(); update(); });

  /* ---------- Micro-animations ---------- */
  // Titres : chaque mot devient un bloc qui monte à son tour
  $$('.section-title, .finale-title, .small-title').forEach((title) => {
    if (title.closest('.map-head')) return;
    let w = 0;
    [...title.childNodes].forEach((node) => {
      if (node.nodeType === 3) {
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const span = document.createElement('span');
          span.className = 'wd';
          span.style.setProperty('--w', w++);
          span.textContent = part;
          frag.appendChild(span);
        });
        title.replaceChild(frag, node);
      } else if (node.nodeType === 1 && node.tagName !== 'BR') {
        node.classList.add('wd');
        node.style.setProperty('--w', w++);
      }
    });
    title.classList.add('reveal');
  });

  // Cascades : un petit décalage pour chaque élément d'un groupe
  $$('.stagger').forEach((g) => [...g.children].forEach((c, i) => c.style.setProperty('--i', i)));

  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer && !reduced) {
    // Tuiles : inclinaison 3D et reflet qui suit la souris
    $$('.tile').forEach((t) => {
      t.addEventListener('pointermove', (e) => {
        const r = t.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        t.classList.add('tilting');
        t.style.setProperty('--ry', `${((x - 0.5) * 7).toFixed(2)}deg`);
        t.style.setProperty('--rx', `${((0.5 - y) * 7).toFixed(2)}deg`);
        t.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`);
        t.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
      });
      t.addEventListener('pointerleave', () => {
        t.classList.remove('tilting');
        t.style.setProperty('--rx', '0deg');
        t.style.setProperty('--ry', '0deg');
      });
    });
    // Boutons : légèrement attirés par la souris
    $$('.pill').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        b.style.setProperty('--mx', `${((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1)}px`);
        b.style.setProperty('--my', `${((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1)}px`);
      });
      b.addEventListener('pointerleave', () => { b.style.setProperty('--mx', '0px'); b.style.setProperty('--my', '0px'); });
    });
  }

  // Barre de navigation : se cache quand on descend, revient quand on remonte
  const navEl = $('#nav');
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    if (Math.abs(y - lastY) < 6) return;
    navEl.classList.toggle('hide', y > lastY && y > innerHeight * 0.8);
    lastY = y;
  }, { passive: true });

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
    fig.className = 'shot reveal';
    fig.style.setProperty('--i', i);
    fig.innerHTML = `<button type="button" class="shot-img" aria-label="Agrandir : ${p.alt}" style="aspect-ratio:${p.portrait ? '3 / 4' : '4 / 3'}"><img src="${src(p.name, 800)}" srcset="${srcset(p.name)}" sizes="(max-width: 760px) 90vw, 60vw" alt="${p.alt}" loading="lazy" decoding="async"></button><figcaption>${p.alt}<span>${p.note}</span></figcaption>`;
    $('button', fig).addEventListener('click', () => openLightbox(i));
    carousel.appendChild(fig);
    io.observe(fig);
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
