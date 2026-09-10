# Construction Plan

Application React + TypeScript + Vite, entièrement statique, pour consulter le plan interprété du trottoir et ses 19 photos.

**Site :** https://favreau84.github.io/construction-plan/

## Développement

Prérequis : Node.js 22.13 ou version ultérieure.

```sh
npm ci
npm run dev
```

## Vérification et compilation

```sh
npm run build
npm run preview
```

La compilation vérifie les types et génère `dist/`. L’application et les photos utilisent la base `/construction-plan/`, compatible avec l’URL du dépôt sur GitHub Pages. Aucun serveur applicatif, compte utilisateur, service OpenAI ou secret n’est nécessaire.

## Déploiement GitHub Pages

Le workflow `.github/workflows/deploy.yml` compile et déploie à chaque push sur `main` ; il peut aussi être lancé manuellement dans Actions.

Dans **Settings → Pages → Build and deployment**, sélectionner **GitHub Actions** comme source. Le workflow utilise les actions officielles décrites dans la [documentation GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

Si le dépôt est renommé, adapter `base` dans `vite.config.ts`.

## Fichiers utiles

- `src/App.tsx` : plan, cadres des photos, projections et dialogue de consultation.
- `src/geometry.ts` : positions estimées, homographies et contours recalés d’A2.
- `src/styles.css` : présentation responsive.
- `src/photos.json` : noms, heures et incertitudes GPS des prises de vue.
- `public/photos/` : 19 prévisualisations et 19 copies JPEG en pleine résolution.

Les PNG originaux ne sont pas inclus. Les JPEG sont des copies orientées selon les EXIF et recompressées, sans retouche du contenu. Les photos en pleine résolution ne sont chargées qu’à l’ouverture du dialogue.

## Lecture et limites

La marche va de gauche à droite à l’écran. La chaussée est en haut (à gauche du marcheur), le trottoir en bas (à droite). Le passage piéton traverse perpendiculairement à la bordure. L’œil affiche une projection et l’icône image ouvre la photo sans redressement.

Le tracé est une interprétation manuelle, pas un relevé topographique. Les stations, dimensions et l’arrondi final restent estimés ; la largeur de travail supposée est d’environ 3 m. Le GPS des photos est insuffisant pour une implantation précise et la première position est aberrante.

Les projections utilisent des homographies distinctes pour le trottoir, le dessus de bordure et la chaussée. La face verticale est omise de la texture. Les éléments verticaux, les zones hors champ et les espacements non mesurés ne sont pas reconstruits fidèlement.

A2 est ancré sur les contours de la grille et du tampon de la photo 10 (IMG_6596), avec les mêmes transformations que la texture. Ce recalage local n’est pas un ajustement photogrammétrique des 19 vues.
