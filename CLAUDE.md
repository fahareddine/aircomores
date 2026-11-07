# aircomores

Site vitrine + réservation (Air Comores). React 19 + TypeScript + Vite, animations GSAP + Lenis, données via Supabase (`@supabase/supabase-js`, dossier `supabase/`).

## Commandes
- `npm run dev` — serveur local
- `npm run lint` — oxlint
- `npm run build` — `tsc -b` puis build Vite (sert aussi de vérification des types)

## Structure
- `src/sections/`, `src/hero/` — blocs de la page (le hero contient le module de réservation)
- `src/components/`, `src/hooks/`, `src/lib/`, `src/data/`
- `reference/`, `PROMPT.md` — maquettes et brief d'origine

## Pièges
- Le hero mobile est piloté par des séquences qui priment sur le scroll : tester en 375 px après toute modif du hero.
- Variables `VITE_*` dans `.env.local` (voir `.env.example`).

## Règles communes
- Répondre et commenter en français.
- `main` = production (Vercel déploie automatiquement). Travailler sur une branche, vérifier l'aperçu Vercel de la PR, puis fusionner.
- Auteur Git : `fahareddine <179648486+fahareddine@users.noreply.github.com>`, sinon Vercel bloque le déploiement en production.
- Ne jamais commiter `.env*` (sauf `.env.example`). Les secrets vivent dans Vercel (`vercel env pull`).
- Avant de dire « fini » : la CI GitHub (`.github/workflows/ci.yml`) doit être verte.
