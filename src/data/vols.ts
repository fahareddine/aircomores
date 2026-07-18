export interface FlightPhase {
  video: string;
  label: string;
  title: string;
  data: [string, string][];
}

export interface FlightLeg {
  id: string;
  active: boolean;
  route: { from: string; to: string };
  departure: { place: string; code: string; time: string };
  arrival: { place: string; code: string };
  duration: string;
  priceFrom: string;
  phases?: [FlightPhase, FlightPhase, FlightPhase];
}

/**
 * Source unique de vérité : hero ET tarifs lisent ce fichier.
 * Pour activer un vol : passer `active` à true, renseigner `phases`
 * (3 vidéos) et déposer les fichiers dans public/videos/ — rien
 * d'autre à toucher, ni dans le hero ni dans les tarifs.
 */
export const VOLS: FlightLeg[] = [
  {
    id: "vol-1",
    active: true,
    route: { from: "Ngazidja", to: "Ndzuwani" },
    departure: { place: "Moroni — Hahaya", code: "HAH", time: "06h30" },
    arrival: { place: "Ouani — Anjouan", code: "AJN" },
    duration: "30 min",
    priceFrom: "45 000 KMF",
    phases: [
      {
        // Fichier nommé "atterrissage" mais son contenu (roulage → décollage,
        // fumée des pneus sur la piste) est la vraie séquence de décollage.
        video: "/videos/03-atterrissage-anjouan.mp4",
        label: "Bienvenue à bord · Décollage",
        title: "Moroni s'éveille, le ciel vous attend",
        data: [
          ["Départ", "06h30"],
          ["Aéroport", "Hahaya · HAH"],
        ],
      },
      {
        video: "/videos/02-envol-anjouan.mp4",
        label: "En vol · Au-dessus de l'archipel",
        title: "Cap sur Anjouan, l'île aux parfums",
        data: [
          ["À partir de", "45 000 KMF"],
          ["Aller simple", "par passager"],
        ],
      },
      {
        // Fichier nommé "decollage" mais son contenu (déjà en vol,
        // s'éloigne de la piste) est utilisé ici pour l'atterrissage.
        video: "/videos/01-decollage-moroni.mp4",
        label: "Atterrissage · Karibu Ndzuwani",
        title: "Ouani vous accueille, bon séjour à Anjouan",
        data: [
          ["Durée du vol", "30 min"],
          ["Aéroport", "Ouani · AJN"],
        ],
      },
    ],
  },
  {
    id: "vol-2",
    active: false,
    route: { from: "Ndzuwani", to: "Mwali" },
    departure: { place: "Ouani", code: "AJN", time: "12h15" },
    arrival: { place: "Bandar Es Eslam", code: "NWA" },
    duration: "25 min",
    priceFrom: "40 000 KMF",
  },
  {
    id: "vol-3",
    active: false,
    route: { from: "Mwali", to: "Ngazidja" },
    departure: { place: "Bandar Es Eslam", code: "NWA", time: "17h45" },
    arrival: { place: "Moroni — Hahaya", code: "HAH" },
    duration: "35 min",
    priceFrom: "45 000 KMF",
  },
];
