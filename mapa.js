/* ==========================================================================
   MAPA DEL PUEBLO
   Cada letra es una casilla de 32×32 px:
     g = pasto      . = camino      f = flores        (se puede caminar)
     T = árbol      B = edificio    w = fuente        (no se puede pasar)
     b = banca      l = farol       k = arbusto       r = roca
     p = tablero de convocatorias   m = buzón
   La puerta de cada edificio es la casilla de camino justo debajo de él.
   ========================================================================== */

const MAPA = {
  tam: 32,

  filas: [
    "TTTTTTTTTTTTTTTTTTTT", // 0
    "TggfggggggggggggfggT", // 1
    "TgBBBBBBggggBBBBBBgT", // 2
    "TgBBBBBBgffgBBBBBBgT", // 3
    "TgBBBBBBggggBBBBBBgT", // 4
    "TgBBBBBBpgggBBBBBBgT", // 5  tablero de convocatorias junto a la Secretaría
    "Tgggl.gggggggg.lgggT", // 6  puertas de arriba, con faroles
    "Tbggg..........gggbT", // 7
    "TgTgggggk..kgggggTgT", // 8
    "Tgggggl......lgggggT", // 9  plaza
    "Tgggggg..ww..ggggggT", // 10 fuente
    "Tgggggb..ww..bgggggT", // 11 bancas
    "Tgggggf......fgggggT", // 12
    "TgTgggggg..ggggggTgT", // 13
    "Tgrgggggg..ggggggkgT", // 14
    "TgBBBBBBg..gBBBBBBgT", // 15
    "TgBBBBBBg..gBBBBBBgT", // 16
    "TgBBBBBBg..gBBBBBBgT", // 17
    "TgBBBBBBg..gBBBBBBgT", // 18
    "Tgggl.ggg..ggl.mgggT", // 19 puertas de abajo, faroles y buzón
    "Tgggg..........ggggT", // 20
    "Tggfggggg..ggggfgggT", // 21
    "TggggggTg..gTggggggT", // 22
    "Tggggkggg..gggkggggT", // 23 aquí empieza el jugador
    "TTTTTTTTTTTTTTTTTTTT"  // 24
  ],

  inicio: { x: 9, y: 22 },

  // Orden en que se deben visitar los edificios
  orden: ["secretaria", "colegio", "universidad", "rectoria"],

  edificios: [
    { id: "secretaria",  etiqueta: "Secretaría",  x: 2,  y: 2,  w: 6, h: 4, puerta: { x: 5,  y: 6 },  techo: "#3b6fb6", pared: "#efe6d4" },
    { id: "colegio",     etiqueta: "Colegio",     x: 12, y: 2,  w: 6, h: 4, puerta: { x: 14, y: 6 },  techo: "#c8553d", pared: "#f3e3c3" },
    { id: "universidad", etiqueta: "Universidad", x: 2,  y: 15, w: 6, h: 4, puerta: { x: 5,  y: 19 }, techo: "#7b4fa0", pared: "#ece7f2" },
    { id: "rectoria",    etiqueta: "Rectoría",    x: 12, y: 15, w: 6, h: 4, puerta: { x: 14, y: 19 }, techo: "#2f8f6f", pared: "#e6f0e8" }
  ]
};
