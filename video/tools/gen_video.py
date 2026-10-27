import json, os
V = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = """
    #root { position: absolute; inset: 0; background: #000; overflow: hidden; font-family: Inter, sans-serif; color: #f5f5f7; }
    .ph { position: absolute; inset: 0; overflow: hidden; }
    .kb { position: absolute; inset: 0; }
    .kb img { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; object-fit: cover; }
    .shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 45%, rgba(0,0,0,.85) 100%); }
    .cap { position: absolute; left: 150px; bottom: 140px; }
    .cap .k { font-size: 30px; font-weight: 600; color: #2997ff; letter-spacing: -.01em; margin-bottom: 10px; }
    .cap .t { font-size: 86px; font-weight: 700; letter-spacing: -.045em; line-height: 1.02; }
    .w { display: inline-block; }
    .grad { background: linear-gradient(92deg, #8fd3ff 0%, #2997ff 45%, #7ad7c7 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
"""

def scene(sid, dur, css, body, js):
    return f"""<template>
  <style>{BASE}{css}
  </style>
  <div id="root" data-composition-id="{sid}" data-width="1920" data-height="1080">
{body}
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
{js}
    window.__timelines["{sid}"] = tl;
  </script>
</template>
"""

def words(text, cls='w'):
    return ' '.join(f'<span class="{cls}">{w}</span>' for w in text.split())

def wordsin(sel, t, gap=0.07):
    return f'    tl.fromTo("{sel}", {{ opacity: 0, filter: "blur(6px)" }}, {{ opacity: 1, filter: "blur(0px)", duration: 0.25, ease: "power3.out", stagger: {gap} }}, {t});\n'

def blurout(sel, t, d=0.22):
    return f'    tl.to("{sel}", {{ opacity: 0, filter: "blur(8px)", duration: {d}, ease: "power3.in" }}, {t});\n'

def photo(pid, src, start, dur, kicker, title, push=(1.0, 1.08), x=(0, 0), pos='50% 50%', capdelay=0.35, fade=0.3, last=False):
    body = f"""    <div id="{pid}" class="ph clip" data-start="{start}" data-duration="{dur}">
      <div class="kb" id="{pid}-kb"><img src="{src}" alt="" style="object-position:{pos}"></div>
      <div class="shade"></div>
      <div class="cap" id="{pid}-cap"><div class="k">{kicker}</div><div class="t">{words(title)}</div></div>
    </div>
"""
    js = f'    tl.fromTo("#{pid}-kb", {{ scale: {push[0]}, x: {x[0]} }}, {{ scale: {push[1]}, x: {x[1]}, duration: {dur}, ease: "none" }}, {start});\n'
    js += f'    tl.fromTo("#{pid}-kb", {{ opacity: 0 }}, {{ opacity: 1, duration: {fade}, ease: "power2.inOut" }}, {start});\n'
    if not title:
        return body, js
    js += f'    tl.fromTo("#{pid}-cap .k", {{ opacity: 0, filter: "blur(6px)" }}, {{ opacity: 1, filter: "blur(0px)", duration: 0.25, ease: "power3.out" }}, {start + capdelay});\n'
    js += wordsin(f'#{pid}-cap .w', round(start + capdelay + 0.12, 2))
    if not last:
        js += blurout(f'#{pid}-cap', round(start + dur - 0.3, 2), 0.2)
    return body, js

scenes = []

# 1. Intro
letters = ''.join(f'<span class="l">{c}</span>' for c in 'Arcachon')
scenes.append(('intro', 0, 5, scene('intro', 5, """
    #intro-title { position: absolute; left: 0; right: 0; top: 380px; text-align: center; font-size: 230px; font-weight: 900; letter-spacing: -.055em; }
    #intro-title .l { display: inline-block; }
    #intro-sub { position: absolute; left: 0; right: 0; top: 680px; text-align: center; font-size: 40px; font-weight: 400; color: #a1a1a6; letter-spacing: .01em; }
""", f"""    <div id="intro-title">{letters}</div>
    <div id="intro-sub">Bassin d'Arcachon · Gironde</div>""",
    """    tl.fromTo("#intro-title .l", { opacity: 0.25, filter: "blur(10px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "power3.out", stagger: 0.09 }, 0);
    tl.fromTo("#intro-sub", { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.4, ease: "power3.out" }, 1.4);
    tl.to(["#intro-title", "#intro-sub"], { opacity: 0, filter: "blur(10px)", duration: 0.3, ease: "power3.in" }, 4.55);
""")))

# 2. Le bassin
b, j = photo('bas-ph', 'assets/img/bassin-2400.webp', 0, 6.5, '', '', push=(1.0, 1.1), pos='50% 60%')
scenes.append(('bassin', 0, 6.5, scene('bassin', 6.5, """
    #bas-title { position: absolute; left: 150px; bottom: 150px; font-size: 120px; font-weight: 700; letter-spacing: -.05em; line-height: 1.0; }
    #bas-ph .cap { display: none; }
""", b + """    <div id="bas-title"><div id="bas-l1">""" + words('Le bassin.') + """</div><div id="bas-l2" class="grad">Au bout de la rue.</div></div>""",
    j + wordsin('#bas-l1 .w', 0.6, 0.08) +
    '    tl.fromTo("#bas-l2", { opacity: 0, filter: "blur(10px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.3, ease: "power3.out" }, 1.3);\n' +
    blurout('#bas-title', 6.2, 0.25))))

# 3. Arcachon
cred = json.load(open(f'{V}/assets/img/credits.json'))
shots = [('arc-dune', 'dune', 'Vu de la dune du Pilat', (1.04, 1.12), (0, -40)),
         ('arc-jet', 'jetee', 'La plage et la jetée', (1.04, 1.12), (0, 30)),
         ('arc-sun', 'coucher', 'Les couchers de soleil', (1.06, 1.14), (-30, 0))]
body = js = ''
d = 3.5
for i, (pid, img, t, push, x) in enumerate(shots):
    bb, jj = photo(pid, f'assets/img/{img}.jpg', round(i * d, 3), d + (0.0 if i == 2 else 0.12), 'Arcachon', t, push=push, x=x, pos=('50% 85%' if img == 'dune' else '50% 50%'), capdelay=0.25, fade=0.25, last=(i == 2))
    body += bb; js += jj
js += blurout('#arc-sun-cap', 10.2, 0.25)
scenes.append(('arcachon', 0, 10.5, scene('arcachon', 10.5, '', body, js)))

# 4. Carte (survol 3D)
scenes.append(('carte', 0, 10.6, scene('carte', 10.6, """
    #car-vid { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; object-fit: cover; }
    .ccap { position: absolute; left: 150px; bottom: 150px; }
    .ccap .k { font-size: 30px; font-weight: 600; color: #2997ff; margin-bottom: 10px; }
    .ccap .t { font-size: 96px; font-weight: 700; letter-spacing: -.045em; line-height: 1.02; }
    #car-osm { position: absolute; right: 40px; bottom: 30px; font-size: 18px; color: #c7c7cc; padding: 6px 12px; border-radius: 8px; background: rgba(0,0,0,.55); }
    #car-vig { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 75% at 50% 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,.6) 100%), linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,.65) 100%); }
""", """    <video id="car-vid" class="clip" data-start="0" data-duration="10.6" data-playback-rate="0.75" src="assets/video/survol.mp4" muted playsinline></video>
    <div id="car-vig"></div>
    <div id="car-c1" class="ccap"><div class="k">À 128 m</div><div class="t">""" + words('Le port de plaisance.') + """</div></div>
    <div id="car-c2" class="ccap"><div class="k">À 181 m</div><div class="t">""" + words('La plage.') + """</div></div>
    <div id="car-c3" class="ccap"><div class="k">Boulevard Chanzy</div><div class="t">""" + words('Et au milieu, votre T3.') + """</div></div>
    <div id="car-osm" data-layout-ignore>© OpenStreetMap</div>""",
    '    tl.fromTo("#car-vid", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0);\n' +
    '    tl.set(["#car-c1", "#car-c2", "#car-c3"], { opacity: 0 }, 0);\n' +
    ''.join(f'    tl.set("#car-c{i}", {{ opacity: 1 }}, {a});\n    tl.fromTo("#car-c{i} .k", {{ opacity: 0, filter: "blur(6px)" }}, {{ opacity: 1, filter: "blur(0px)", duration: 0.25, ease: "power3.out" }}, {a});\n' + wordsin(f'#car-c{i} .w', round(a + 0.12, 2)) + (blurout(f'#car-c{i}', b, 0.22) if b else '')
            for i, (a, b) in enumerate([(1.3, 4.8), (5.2, 7.3), (7.7, None)], 1)) +
    blurout('#car-c3', 10.3, 0.25))))

# 5. Le T3
t3 = [('t3-jar', 'jardin-1-1600', 'Extérieur', 'Jardin privé. Plein sud.', '50% 55%'),
      ('t3-sej', 'sejour-mezzanine-1600', 'Intérieur', 'Du volume. De la lumière.', '50% 40%'),
      ('t3-cui', 'sejour-1600', 'Pièce de vie', 'Cuisine ouverte, équipée.', '50% 50%'),
      ('t3-ch', 'chambre-1600', 'Chambre', 'Deux lits superposés.', '50% 65%'),
      ('t3-mez', 'mezzanine-lit-1600', 'Mezzanine', 'Un grand lit en 140.', '50% 50%'),
      ('t3-sde', 'salle-eau-1600', "Salle d'eau", 'Neuve. WC séparés.', '50% 50%')]
body = """    <div id="t3-intro" class="clip" data-start="0" data-duration="3.5">
      <div id="t3-k">Le T3</div>
      <div id="t3-t">""" + words('Neuf. Lumineux.') + """</div>
      <div id="t3-s">50 m² · 2 chambres · 4 voyageurs</div>
    </div>
"""
js = wordsin('#t3-k', 0.2) + wordsin('#t3-t .w', 0.45, 0.1) + wordsin('#t3-s', 1.0) + blurout('#t3-intro > div', 3.2, 0.22)
d = 3.2
pushes = [((1.0, 1.08), (0, 0)), ((1.08, 1.0), (0, 0)), ((1.02, 1.08), (-30, 30)), ((1.0, 1.07), (0, 0)), ((1.02, 1.08), (30, -30)), ((1.08, 1.0), (0, 0))]
for i, (pid, img, k, t, pos) in enumerate(t3):
    st = round(3.5 + i * d, 3)
    bb, jj = photo(pid, f'assets/img/{img}.webp', st, round(d + (0.15 if i < len(t3) - 1 else 0), 3), k, t, push=pushes[i][0], x=pushes[i][1], pos=pos, capdelay=0.25, fade=0.25, last=(i == len(t3) - 1))
    body += bb; js += jj
js += blurout('#t3-sde-cap', 22.4, 0.25)
scenes.append(('t3', 0, 22.7, scene('t3', 22.7, """
    #t3-intro { position: absolute; inset: 0; text-align: center; }
    #t3-k { position: absolute; left: 0; right: 0; top: 330px; font-size: 40px; font-weight: 600; color: #2997ff; }
    #t3-t { position: absolute; left: 0; right: 0; top: 400px; font-size: 170px; font-weight: 700; letter-spacing: -.05em; }
    #t3-s { position: absolute; left: 0; right: 0; top: 640px; font-size: 44px; color: #a1a1a6; }
""", body, js)))

# 6. Avis
scenes.append(('avis', 0, 5, scene('avis', 5, """
    #av-k { position: absolute; left: 0; right: 0; top: 230px; text-align: center; font-size: 40px; font-weight: 600; color: #a1a1a6; }
    #av-n { position: absolute; left: 0; right: 0; top: 300px; text-align: center; font-size: 330px; font-weight: 700; letter-spacing: -.06em; line-height: 1; font-variant-numeric: tabular-nums; }
    #av-stars { position: absolute; left: 0; right: 0; top: 660px; text-align: center; font-size: 64px; color: #f5d48a; letter-spacing: 14px; }
    #av-stars span { display: inline-block; }
    #av-s { position: absolute; left: 0; right: 0; top: 770px; text-align: center; font-size: 48px; font-weight: 700; letter-spacing: -.02em; }
""", """    <div id="av-k">Ils y ont séjourné</div>
    <div id="av-n" class="grad">4,86</div>
    <div id="av-stars"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
    <div id="av-s">188 avis · Superhôtes</div>""",
    wordsin('#av-k', 0.15) +
    """    const n = { v: 0 };
    tl.fromTo("#av-n", { opacity: 0, filter: "blur(10px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.3, ease: "power3.out" }, 0.3);
    tl.fromTo(n, { v: 0 }, { v: 4.86, duration: 1.4, ease: "power3.out", onUpdate: () => { document.querySelector("#av-n").textContent = n.v.toFixed(2).replace(".", ","); } }, 0.3);
    tl.fromTo("#av-stars span", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)", stagger: 0.08 }, 1.5);
""" + wordsin('#av-s', 2.0) + blurout('#av-k, #av-n, #av-stars, #av-s', 4.7, 0.25))))

# 7. Fin
credit_line = ' · '.join(sorted(set(f"{v['artist']} ({v['license']})" for v in cred.values()))) if cred else ''
scenes.append(('fin', 0, 6, scene('fin', 6, """
    #fin-kb { position: absolute; inset: 0; }
    #fin-kb img { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; object-fit: cover; }
    #fin-dim { position: absolute; inset: 0; background: radial-gradient(ellipse at center, rgba(0,0,0,.35) 0%, rgba(0,0,0,.85) 100%); }
    #fin-t { position: absolute; left: 0; right: 0; top: 270px; text-align: center; font-size: 150px; font-weight: 700; letter-spacing: -.05em; line-height: 1.0; }
    #fin-bw { position: absolute; left: 0; right: 0; top: 640px; display: flex; justify-content: center; }
    #fin-b { padding: 22px 46px; border-radius: 999px; background: #0071e3; color: #fff; font-size: 40px; font-weight: 400; white-space: nowrap; }
    #fin-u { position: absolute; left: 0; right: 0; top: 800px; text-align: center; font-size: 34px; color: #a1a1a6; }
    #fin-c { position: absolute; left: 0; right: 0; bottom: 36px; text-align: center; font-size: 16px; color: #8e8e93; padding: 0 120px; }
""", """    <div id="fin-kb"><img src="assets/img/port-2400.webp" alt=""></div>
    <div id="fin-dim"></div>
    <div id="fin-t"><div id="fin-l1">Arcachon</div><div id="fin-l2" class="grad">vous attend.</div></div>
    <div id="fin-bw"><div id="fin-b">Réservez sur Airbnb</div></div>
    <div id="fin-u">t3-arcachon.vercel.app</div>
    <div id="fin-c" data-layout-ignore>Photos d'Arcachon : """ + credit_line + """ — Wikimedia Commons · Carte © OpenStreetMap</div>""",
    """    tl.fromTo("#fin-kb", { scale: 1.12, opacity: 0 }, { scale: 1.0, opacity: 1, duration: 6, ease: "power2.out" }, 0);
    tl.fromTo("#fin-l1", { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.35, ease: "power3.out" }, 0.3);
    tl.fromTo("#fin-l2", { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.35, ease: "power3.out" }, 0.8);
    tl.fromTo("#fin-b", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.6)" }, 1.6);
    tl.fromTo("#fin-u", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 2.1);
    tl.fromTo("#fin-c", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 2.3);
""")))

t = 0
fixed = []
for sid, _, du, html in scenes:
    fixed.append((sid, round(t, 3), du, html)); t += du
scenes = fixed
for sid, st, du, html in scenes:
    open(f'{V}/compositions/{sid}.html', 'w').write(html)

total = round(t, 3)
hosts = '\n'.join(f'      <div id="{sid}" data-composition-id="{sid}" data-composition-src="compositions/{sid}.html" data-start="{st}" data-duration="{du}" data-track-index="{i+1}" data-track-kind="graphics" data-width="1920" data-height="1080"></div>' for i, (sid, st, du, _) in enumerate(scenes))
open(f'{V}/index.html', 'w').write(f"""<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: #000; }}
      #bg {{ position: absolute; inset: 0; background: #000; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{total}" data-width="1920" data-height="1080">
      <div id="bg"></div>
{hosts}
    </div>
    <script>
      window.__timelines = window.__timelines || {{}};
      window.__timelines["main"] = gsap.timeline({{ paused: true }});
    </script>
  </body>
</html>
""")
print('ok', [s[0] for s in scenes])
