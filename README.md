# T3 neuf · Port de plaisance d'Arcachon

Site one-page avec visite interactive au scroll de l'appartement ([annonce Airbnb](https://www.airbnb.fr/rooms/50252958)).

- `index.html` : contenu (textes de la visite, équipements, avis, carte)
- `style.css` : mise en page, responsive PC / mobile
- `script.js` : visite au scroll, zoom des photos, galerie plein écran (swipe + clavier)
- `assets/img/` : photos retouchées (recadrage, contraste, couleurs), en WebP 800 et 1600 px

Pour modifier la visite : chaque pièce est un bloc `<article class="step" data-img="..." data-label="...">` dans `index.html`.

## Mettre en ligne gratuitement
GitHub → Settings → Pages → Source : `Deploy from a branch`, branche choisie, dossier `/ (root)`.
