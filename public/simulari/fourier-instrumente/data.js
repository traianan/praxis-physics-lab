export const FAMILIES = {
  strings: {
    label: "Corzi",
    shortLabel: "corzi",
    accent: "#b75b2c",
    soft: "#f7e9df",
    description: "Vioară și violoncel: aceeași notă, amprente armonice diferite."
  },
  winds: {
    label: "Suflat",
    shortLabel: "suflat",
    accent: "#147a80",
    soft: "#e0f1f1",
    description: "Flaut: armonice selective și un sunet aproape sinusoidal."
  }
};

export const PIECES = [
  {
    id: "bach-air",
    family: "strings",
    title: "Air pe coarda G",
    composer: "Johann Sebastian Bach",
    instrument: "Vioară",
    file: "audio/corzi/bach-air.wav",
    defaultStart: 2.45,
    defaultDuration: 0.6,
    description: "Un fragment didactic inspirat de melodia celebrei arii, redat cu un timbru de vioară sintetizat."
  },
  {
    id: "saint-saens-cygne",
    family: "strings",
    title: "Le cygne",
    composer: "Camille Saint-Saëns",
    instrument: "Violoncel",
    file: "audio/corzi/saint-saens-cygne.wav",
    defaultStart: 2.6,
    defaultDuration: 0.8,
    description: "O linie melodică lentă, potrivită pentru observarea armonicelor puternice de la registru grav."
  },
  {
    id: "mozart-k313",
    family: "winds",
    title: "Concert pentru flaut K. 313 — Allegro",
    composer: "Wolfgang Amadeus Mozart",
    instrument: "Flaut",
    file: "audio/suflat/mozart-k313.wav",
    defaultStart: 1.55,
    defaultDuration: 0.25,
    description: "Un extras de demonstrație cu atacuri clare și armonice moderate, specifice timbrului de flaut."
  },
  {
    id: "bach-partita",
    family: "winds",
    title: "Partita pentru flaut — Allemande",
    composer: "Johann Sebastian Bach",
    instrument: "Flaut",
    file: "audio/suflat/bach-partita.wav",
    defaultStart: 0.74,
    defaultDuration: 0.25,
    description: "Un fragment cu succesiuni de note mai rapide, util pentru compararea spectrelor pe segmente diferite."
  }
];

export function piecesForFamily(family) {
  return PIECES.filter((piece) => piece.family === family);
}
