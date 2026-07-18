# PROMPT MAÎTRE — Intégration hero + finalisation du site AIRCOMORES existant
# (Projet Vite déjà en place → intégration → GitHub → Vercel)

Tu travailles dans un projet Vite EXISTANT. Ta mission : intégrer le hero vidéo
scrubbé au scroll, compléter les sections manquantes du site vitrine, puis le
mettre en ligne. Le projet contient déjà (déposés pour toi) :
- `reference/hero-reference.html` : hero fonctionnel de référence (à convertir en modules)
- `public/videos/` : les 3 vidéos du vol 1, optimisées pour le scrub (ne pas
  les déplacer ni les réencoder)

RÈGLE ABSOLUE : ce projet contient du travail existant. Tu ne supprimes ni
n'écrases rien sans l'avoir listé et fait valider à l'ÉTAPE 1. Tu adaptes le
plan à ce qui existe déjà : ce qui est bien reste, ce qui manque est créé, ce
qui fait doublon avec le hero est remplacé après validation.

Travaille par ÉTAPES. À la fin de chaque étape : STOP, présente le résultat et
attends ma validation explicite avant de continuer.

---

## IDENTITÉ & DIRECTION ARTISTIQUE

- Marque : « Air Comores » — compagnie aérienne comorienne assurant des vols
  réguliers reliant les 3 îles (pas de jets privés ni de charter : ne jamais
  utiliser ce vocabulaire sur le site). Site vitrine destiné à impressionner
  des clients.
- Ton : chaleureux, accueillant, fier de l'héritage comorien, premium sans être
  froid. « Bienvenue à bord », « Karibu », îles nommées aussi en shikomori
  (Ngazidja, Ndzuwani, Mwali). Tout le site en français.
- Palette (variables CSS) : `--nuit #0A0F0C` (fond), `--ivoire #F4F0E6` (texte),
  `--vert #0E4D34` (vert ancien drapeau comorien), `--or #C9A24B` (filets,
  accents). Si le projet a déjà une palette différente, signale-le à l'ÉTAPE 1
  et propose l'harmonisation.
- Typos Google Fonts : Marcellus (titres), Space Grotesk (données de vol,
  étiquettes), Outfit (corps)
- Logo : croissant blanc + 4 étoiles blanches sur rond vert (ancien drapeau
  comorien), SVG inline — présent dans le hero de référence

---

## DONNÉES DE VOL — SOURCE UNIQUE DE VÉRITÉ

Crée `src/data/vols.js` (ou adapte s'il existe), utilisé par le hero ET la
section tarifs. Chaque vol a 3 phases avec ses affichages obligatoires :

**VOL 1 (actif, vidéos disponibles) — Ngazidja → Ndzuwani :**
- Phase décollage (`/videos/01-decollage-moroni.mp4`) →
  AFFICHER : lieu de départ « Moroni — Hahaya (HAH) » + heure de départ « 06h30 »
- Phase en vol (`/videos/02-envol-anjouan.mp4`) →
  AFFICHER : destination « Anjouan, l'île aux parfums » + prix « à partir de
  45 000 KMF / aller simple »
- Phase atterrissage (`/videos/03-atterrissage-anjouan.mp4`) →
  AFFICHER : lieu d'arrivée « Ouani — Anjouan (AJN) » + durée du vol « 30 min »

**VOL 2 (préparé, commenté, vidéos à venir) — Ndzuwani → Mwali :**
départ Ouani (AJN) 12h15 · à partir de 40 000 KMF · arrivée Bandar Es Eslam
(NWA) · durée 25 min

**VOL 3 (préparé, commenté) — Mwali → Ngazidja :**
départ Bandar Es Eslam (NWA) 17h45 · à partir de 45 000 KMF · arrivée Moroni
Hahaya (HAH) · durée 35 min

Règle d'or : décommenter un vol dans `vols.js` + déposer ses 3 vidéos dans
`public/videos/` doit suffire à l'ajouter au hero, sans toucher au code.

---

## SECTIONS CIBLES DU SITE (dans l'ordre)

Pour chaque section : si elle existe déjà dans le projet, améliore-la vers ces
specs ; sinon crée-la.

1. **HERO** (plein écran, pinné, scrubbé au scroll) — convertis
   `reference/hero-reference.html` en modules ; il REMPLACE le hero actuel :
   - 3 vidéos lues séquentiellement au scroll (scrub), crossfade, ~150 % de
     hauteur de scroll par clip
   - Overlays par phase dans le TIERS GAUCHE (l'avion est à droite dans les
     vidéos), style « carte d'embarquement » : étiquette dorée letterspaced +
     grand titre Marcellus + filet doré qui se déploie + données
   - Les textes des overlays viennent de `vols.js` (AFFICHER ci-dessus)
   - Reveal par masque, entrée à 6 % de la phase, sortie fondu montant à 80 %
   - Signature : arc SVG de trajectoire (HAH → AJN) en bas, petit avion qui
     progresse le long de l'arc au scroll, arc qui se dore
   - Loader « Préparation du vol » avec timeout 8 s ; currentTime lissé en rAF ;
     vidéos muted/playsinline/preload auto
2. **NOS DESTINATIONS** : 3 cartes (Ngazidja, Ndzuwani, Mwali), description
   évocatrice 2 lignes (Karthala, ylang-ylang, parc marin de Nioumachoua),
   reveal en stagger au scroll. Dégradés/illustrations CSS sobres si pas de
   vraies photos (aucune image externe hotlinkée).
3. **HORAIRES & TARIFS** : tableau généré depuis `vols.js` — liaison, départ
   (lieu + heure), arrivée (lieu), durée, prix à partir de. Vols 2 et 3 avec
   badge « Bientôt ». Style boarding pass, filets or.
4. **NOS SERVICES** : 4 blocs (Vol à la demande — votre horaire, votre île ;
   Navette privée aéroport ; Assistance dédiée PMR/enfants/aînés ; Fret &
   colis express inter-îles), icônes SVG simples.
5. **RÉSERVATION** : formulaire (départ, destination, date, passagers,
   téléphone) SANS backend — au submit, ouvrir un lien WhatsApp pré-rempli
   (wa.me) avec le récapitulatif. Titre « Je réserve mon vol ». Demande-moi
   mon numéro WhatsApp avant d'implémenter.
6. **FOOTER** : logo, contact placeholder, liens îles, devise « Fiers de nos
   îles, heureux de vous y emmener ».

---

## CONTRAINTES TECHNIQUES

- Vite vanilla JS ; dépendances npm : `gsap` et `lenis` (installe-les si
  absentes ; si le projet charge GSAP/Lenis par CDN, migre vers npm)
- Une SEULE instance Lenis + un seul `gsap.registerPlugin(ScrollTrigger)` pour
  tout le site, initialisés dans `src/main.js` et partagés — fusionne avec les
  éventuelles instances existantes, jamais deux en parallèle
- Code modulaire et maintenable : `src/hero/`, `src/sections/`, `src/data/`,
  un CSS par module, variables CSS globales dans `src/styles/tokens.css` —
  adapte-toi à l'organisation existante si elle est propre
- SEO : title, meta description, Open Graph, lang="fr", favicon SVG (logo)
- Responsive : mobile → overlays hero en bas, object-position 70 %, tableau
  tarifs scrollable ; `prefers-reduced-motion` → pas de pin ni scrub
- Accessibilité : contrastes, focus visibles, aria-labels sur le formulaire
- Performance : viser Lighthouse ≥ 90 partout

---

## ÉTAPE 1 — AUDIT DE L'EXISTANT & PLAN (puis STOP)

- Analyse le projet existant : arborescence, point d'entrée, sections déjà
  présentes, comment GSAP/ScrollTrigger/Lenis sont éventuellement déjà chargés,
  état de git (dépôt initialisé ? remote existant ?)
- Lis `reference/hero-reference.html` en entier
- Présente : (a) ce qui existe et sera conservé, (b) ce qui sera remplacé —
  notamment le hero actuel, (c) ce qui sera créé, (d) tout conflit potentiel
  (double Lenis, palettes différentes, CSS global agressif)
- NE MODIFIE RIEN à cette étape

## ÉTAPE 2 — INTÉGRATION DU HERO (puis STOP)

- Implémente le hero branché sur `vols.js`, avec les affichages exacts (heure
  de départ / destination + prix / arrivée + durée), la trajectoire, le loader
- L'ancien hero est retiré proprement (fichiers morts supprimés après
  validation)
- Je dois pouvoir tester le scrub en local avant la suite

## ÉTAPE 3 — SECTIONS 2 À 6 (puis STOP)

- Complète/harmonise destinations, tarifs (généré depuis vols.js), services,
  réservation WhatsApp (demande-moi le numéro), footer, avec reveals au scroll

## ÉTAPE 4 — QA EN BOUCLE (max 4 itérations, puis STOP)

BOUCLE : lance `npm run dev` puis `npm run build && npm run preview` et
vérifie : scrub fluide dans les deux sens, overlays synchronisés aux bonnes
phases, aucune erreur console, responsive mobile, chemins vidéo OK en build,
pas de régression sur les parties conservées, Lighthouse. Corrige et re-teste
jusqu'à ce que tout passe (maximum 4 itérations). Liste ce qui a été vérifié.

## ÉTAPE 5 — MISE EN LIGNE GITHUB + VERCEL (puis STOP)

- Vérifie l'état git : si un dépôt/remote existe déjà, utilise-le ; sinon
  `.gitignore` propre (node_modules, dist, .vercel), `git init`, commit
  « feat: hero vidéo scrubbé + site vitrine complet »
- Dépôt GitHub **aircomores** (via `gh repo create aircomores --public
  --source=. --push` ou le MCP GitHub) — demande-moi l'authentification si
  nécessaire
- Déploiement Vercel (MCP Vercel si disponible, sinon `npx vercel`) : projet
  **aircomores**, framework Vite, build `npm run build`, output `dist` — si un
  projet Vercel est déjà lié, réutilise-le
- Vérifie l'URL de production (vidéos comprises) et donne-la-moi
- Propose la configuration du sous-domaine `aircomores.info-experts.fr`
  (CNAME vers Vercel) mais NE modifie PAS le DNS toi-même
