/* ==========================================================================
   GRÁFICOS DEL MAPA — pixel art dibujado por código (usa pixel.js).
   Cada "píxel lógico" se ve como 2×2 píxeles reales (casillas de 16 → 32).
   ========================================================================== */

const Graficos = (function () {
  const T = MAPA.tam;          // 32 px por casilla en pantalla
  const E = 2;                 // escala del pixel art
  const { lienzo, escalar, contorno, azar, oscuro, claro, CONTORNO } = Pixel;

  const COL = {
    pasto: "#6cb24f", pastoClaro: "#7dc05c", pastoOscuro: "#55963f", pastoBrillo: "#9ad86f",
    tierra: "#dcb880", tierraOscura: "#c49a62", tierraClara: "#ecd3a3", piedrita: "#a98450",
    piedra: "#a7b0ba", piedraOscura: "#7f8994", piedraClara: "#d3d9de",
    agua: "#3f9fd6", aguaOscura: "#2f7fb5", aguaClara: "#7fd0f0", espuma: "#d8f4ff",
    madera: "#a8703f", maderaOscura: "#7a4b2a", maderaClara: "#c48a52",
    hojas: "#3f7d3a", hojasOscuras: "#2f5e2c", hojasMedias: "#4f9a45", hojasClaras: "#6cbf5a", hojasBrillo: "#8fd96d",
    vidrio: "#9fd2ee", vidrioOscuro: "#6aa6cc", vidrioBrillo: "#e6f7ff", marco: "#f6f0e2"
  };
  const FLORES = ["#e85d75", "#f2c14e", "#ffffff", "#9b6ad6", "#ff8f3f"];

  function textura(scene, clave, l, escala) {
    if (scene.textures.exists(clave)) return clave;
    scene.textures.addCanvas(clave, escalar(l.c, escala || E));
    return clave;
  }

  /* =============================== suelo =============================== */

  function pasto(l, semilla, flores) {
    const r = azar(semilla);
    l.r(0, 0, 16, 16, COL.pasto);
    for (let i = 0; i < 5; i++) l.r(Math.floor(r() * 15), Math.floor(r() * 15), 2 + Math.floor(r() * 2), 1, COL.pastoClaro);
    for (let i = 0; i < 7; i++) {
      const x = 1 + Math.floor(r() * 13), y = 2 + Math.floor(r() * 13);
      l.p(x, y, COL.pastoOscuro); l.p(x + 2, y, COL.pastoOscuro); l.p(x + 1, y - 1, COL.pastoBrillo);
    }
    if (flores) {
      const n = 2 + Math.floor(r() * 2);
      for (let i = 0; i < n; i++) {
        const x = 2 + Math.floor(r() * 12), y = 2 + Math.floor(r() * 11);
        const c = FLORES[Math.floor(r() * FLORES.length)];
        l.p(x, y + 2, COL.pastoOscuro);
        l.p(x, y, c); l.p(x - 1, y + 1, c); l.p(x + 1, y + 1, c); l.p(x, y + 1, "#ffe9a8");
      }
    }
  }

  function flores(l, semilla) {
    const r = azar(semilla);
    pasto(l, semilla + 3, false);
    for (let i = 0; i < 6; i++) {
      const x = 2 + Math.floor(r() * 12), y = 2 + Math.floor(r() * 11);
      const c = FLORES[Math.floor(r() * FLORES.length)];
      l.v(x, y + 2, 2, COL.pastoOscuro);
      l.p(x, y, c); l.p(x - 1, y + 1, c); l.p(x + 1, y + 1, c); l.p(x, y + 2, c);
      l.p(x, y + 1, c === "#f2c14e" ? "#fff4c2" : "#ffe082");
    }
  }

  // Camino de tierra con bordes de pasto según las casillas vecinas (máscara de 8 bits)
  function camino(l, mascara, semilla) {
    const r = azar(semilla);
    l.r(0, 0, 16, 16, COL.tierra);
    for (let i = 0; i < 10; i++) l.p(Math.floor(r() * 16), Math.floor(r() * 16), r() < 0.5 ? COL.tierraOscura : COL.tierraClara);
    for (let i = 0; i < 2; i++) { const x = 2 + Math.floor(r() * 12), y = 2 + Math.floor(r() * 12); l.r(x, y, 2, 1, COL.piedrita); l.p(x, y - 1, COL.tierraClara); }
    const borde = (lado) => {
      for (let i = 0; i < 16; i++) {
        const alto = 1 + ((i * 7 + semilla) % 5 === 0 ? 1 : 0) + ((i * 3 + semilla) % 7 === 0 ? 1 : 0);
        for (let k = 0; k < alto; k++) {
          if (lado === "N") l.p(i, k, COL.pasto);
          if (lado === "S") l.p(i, 15 - k, COL.pasto);
          if (lado === "O") l.p(k, i, COL.pasto);
          if (lado === "E") l.p(15 - k, i, COL.pasto);
        }
        if (lado === "N") { l.p(i, alto, COL.tierraOscura); if (i % 5 === 2) l.p(i, alto - 1, COL.pastoOscuro); }
        if (lado === "S") { l.p(i, 15 - alto, COL.tierraClara); if (i % 6 === 1) l.p(i, 15 - alto + 1, COL.pastoOscuro); }
        if (lado === "O") { l.p(alto, i, COL.tierraOscura); }
        if (lado === "E") { l.p(15 - alto, i, COL.tierraOscura); }
      }
    };
    if (mascara & 1) borde("N");
    if (mascara & 2) borde("E");
    if (mascara & 4) borde("S");
    if (mascara & 8) borde("O");
    const esquina = (x, y) => { l.r(x, y, 2, 2, COL.pasto); };
    if (mascara & 16) esquina(14, 0);
    if (mascara & 32) esquina(14, 14);
    if (mascara & 64) esquina(0, 14);
    if (mascara & 128) esquina(0, 0);
  }

  /* ============================ vegetación ============================ */

  function arbol(variante) {
    const l = lienzo(26, 32);
    const r = azar(variante * 97 + 5);
    l.elipse(13, 29, 9, 2, "rgba(20,30,20,.28)");
    // tronco
    l.r(11, 19, 4, 10, COL.maderaOscura); l.r(12, 19, 2, 10, COL.madera); l.v(12, 20, 7, COL.maderaClara);
    l.r(10, 27, 6, 2, COL.maderaOscura);
    if (variante % 3 === 2) {
      // pino
      const capas = [[13, 3, 4], [13, 7, 7], [13, 11, 9], [13, 15, 11], [13, 19, 12]];
      capas.forEach(([cx, cy, rx], i) => {
        for (let y = 0; y < 5; y++) l.r(cx - Math.round(rx * (y + 1) / 5), cy + y, Math.round(rx * (y + 1) / 5) * 2 + 1, 1, i % 2 ? COL.hojasOscuras : COL.hojas);
        l.r(cx - Math.round(rx * 0.6), cy + 3, Math.round(rx * 0.6), 1, COL.hojasMedias);
      });
      l.p(13, 3, COL.hojasClaras);
    } else {
      l.circulo(13, 12, 10, COL.hojasOscuras);
      l.circulo(13, 11, 9, COL.hojas);
      l.circulo(10, 9, 6, COL.hojasMedias);
      l.circulo(16, 8, 5, COL.hojasMedias);
      l.circulo(9, 7, 3, COL.hojasClaras);
      l.circulo(15, 6, 2, COL.hojasClaras);
      l.r(5, 17, 16, 2, COL.hojasOscuras);
      for (let i = 0; i < 18; i++) {
        const x = 5 + Math.floor(r() * 16), y = 4 + Math.floor(r() * 14);
        l.p(x, y, r() < 0.5 ? COL.hojasOscuras : COL.hojasBrillo);
      }
      if (variante % 3 === 1) for (let i = 0; i < 5; i++) l.p(6 + Math.floor(r() * 14), 6 + Math.floor(r() * 10), "#e8504a");
    }
    return contorno(l);
  }

  // Textura repetible de copas de árboles para el bosque que rodea el pueblo
  function bosque() {
    const l = lienzo(32, 32);
    const r = azar(77);
    l.r(0, 0, 32, 32, "#2a5426");
    const copas = [];
    for (let i = 0; i < 9; i++) copas.push([Math.floor(r() * 32), Math.floor(r() * 32), 6 + Math.floor(r() * 3)]);
    const conVuelta = (fn) => { for (const dx of [-32, 0, 32]) for (const dy of [-32, 0, 32]) fn(dx, dy); };
    copas.forEach(([x, y, rad]) => conVuelta((dx, dy) => l.circulo(x + dx, y + dy, rad + 1, "#1f4020")));
    copas.forEach(([x, y, rad]) => conVuelta((dx, dy) => l.circulo(x + dx, y + dy, rad, COL.hojas)));
    copas.forEach(([x, y, rad]) => conVuelta((dx, dy) => l.circulo(x + dx - 2, y + dy - 2, rad - 3, COL.hojasMedias)));
    copas.forEach(([x, y]) => conVuelta((dx, dy) => { l.p(x + dx - 3, y + dy - 3, COL.hojasClaras); l.p(x + dx - 2, y + dy - 4, COL.hojasClaras); }));
    return l;
  }

  function arbusto(conFlores) {
    const l = lienzo(18, 15);
    l.elipse(9, 13, 7, 1, "rgba(20,30,20,.28)");
    l.circulo(6, 8, 5, COL.hojas); l.circulo(12, 8, 5, COL.hojas); l.circulo(9, 6, 5, COL.hojasMedias);
    l.circulo(7, 5, 2, COL.hojasClaras); l.r(3, 11, 12, 1, COL.hojasOscuras);
    if (conFlores) [[5, 6], [11, 5], [8, 9], [13, 9], [9, 4]].forEach(([x, y], i) => { l.p(x, y, i % 2 ? "#ffffff" : "#f28cb1"); });
    return contorno(l);
  }

  function roca() {
    const l = lienzo(14, 10);
    l.elipse(7, 8, 6, 1, "rgba(20,30,20,.25)");
    l.elipse(7, 5, 5, 3, COL.piedraOscura); l.elipse(6, 4, 4, 2, COL.piedra); l.r(4, 3, 3, 1, COL.piedraClara);
    l.p(9, 6, "#5a7a3a"); l.p(10, 5, "#6a9a44");
    return contorno(l);
  }

  /* ============================ mobiliario ============================ */

  function banca() {
    const l = lienzo(18, 14);
    l.elipse(9, 12, 8, 1, "rgba(20,30,20,.25)");
    // patas
    l.r(2, 8, 1, 4, "#3b3f4a"); l.r(15, 8, 1, 4, "#3b3f4a");
    // respaldo
    l.r(1, 1, 16, 2, COL.madera); l.h(1, 1, 16, COL.maderaClara); l.r(1, 4, 16, 2, COL.madera); l.h(1, 4, 16, COL.maderaClara);
    l.r(2, 3, 1, 5, "#3b3f4a"); l.r(15, 3, 1, 5, "#3b3f4a");
    // asiento
    l.r(1, 7, 16, 3, COL.maderaOscura); l.h(1, 7, 16, COL.maderaClara); l.h(1, 9, 16, oscuro(COL.maderaOscura));
    return contorno(l);
  }

  function farol() {
    const l = lienzo(12, 36);
    l.elipse(6, 34, 4, 1, "rgba(20,30,20,.3)");
    l.r(4, 30, 4, 4, "#3b3f4a"); l.h(4, 30, 4, "#5a6070");
    l.r(5, 9, 2, 22, "#3b3f4a"); l.v(5, 10, 20, "#5a6070");
    l.r(2, 2, 8, 2, "#3b3f4a"); l.r(3, 1, 6, 1, "#3b3f4a");
    l.r(3, 4, 6, 5, "#ffe18a"); l.r(4, 5, 4, 3, "#fff6cf"); l.v(3, 4, 5, "#3b3f4a"); l.v(8, 4, 5, "#3b3f4a");
    l.r(2, 9, 8, 1, "#3b3f4a");
    return contorno(l);
  }

  function resplandor() {
    const l = lienzo(24, 24);
    for (let rad = 11; rad > 0; rad--) l.circulo(12, 12, rad, `rgba(255,225,140,${(0.05 + (11 - rad) * 0.015).toFixed(3)})`);
    return l;
  }

  function tablero() {
    const l = lienzo(20, 26);
    l.elipse(10, 24, 8, 1, "rgba(20,30,20,.28)");
    l.r(3, 12, 2, 12, COL.maderaOscura); l.r(15, 12, 2, 12, COL.maderaOscura);
    // techito
    l.r(0, 1, 20, 3, "#8c3a2c"); l.h(0, 1, 20, "#b04a38"); l.r(1, 0, 18, 1, "#8c3a2c");
    // marco y corcho
    l.r(1, 4, 18, 12, COL.maderaOscura); l.r(2, 5, 16, 10, "#c79a5c");
    for (let i = 0; i < 8; i++) l.p(3 + (i * 5) % 14, 6 + (i * 3) % 8, "#b5884c");
    // hojas pegadas
    l.r(3, 6, 5, 6, "#fbf8f0"); l.h(4, 8, 3, "#9e9e9e"); l.h(4, 10, 3, "#9e9e9e"); l.p(5, 6, "#e04848");
    l.r(9, 7, 4, 5, "#fff3a8"); l.h(10, 9, 2, "#b5a04c"); l.p(10, 7, "#3b6fb6");
    l.r(14, 6, 3, 4, "#bfe3f2"); l.p(15, 6, "#e04848");
    l.r(12, 12, 5, 2, "#fbf8f0");
    return contorno(l);
  }

  function buzon() {
    const l = lienzo(12, 20);
    l.elipse(6, 18, 4, 1, "rgba(20,30,20,.28)");
    l.r(5, 10, 2, 8, COL.maderaOscura);
    l.r(1, 3, 10, 7, "#3b6fb6"); l.r(2, 2, 8, 1, "#3b6fb6"); l.h(2, 3, 8, "#5a8fd6"); l.r(1, 9, 10, 1, "#2a5590");
    l.r(3, 5, 6, 1, "#1e3a63");
    l.r(10, 1, 1, 5, "#e04848"); l.r(11, 1, 1, 2, "#e04848");
    return contorno(l);
  }

  /* ============================== fuente ============================== */

  function fuente(cuadro) {
    const l = lienzo(40, 42);
    l.elipse(20, 37, 19, 4, "rgba(20,30,20,.25)");
    // borde de piedra (octágono)
    const oct = (m, col) => { l.r(4 + m, 2 + m, 32 - 2 * m, 34 - 2 * m, col); l.r(2 + m, 4 + m, 36 - 2 * m, 30 - 2 * m, col); };
    oct(0, COL.piedraOscura); oct(1, COL.piedra);
    l.r(5, 3, 30, 1, COL.piedraClara); l.r(3, 5, 1, 26, COL.piedraClara);
    for (let i = 0; i < 6; i++) { l.v(8 + i * 5, 3, 2, COL.piedraOscura); l.v(8 + i * 5, 33, 2, COL.piedraOscura); }
    // agua
    oct(4, COL.aguaOscura); oct(5, COL.agua);
    const r = azar(cuadro * 13 + 1);
    for (let i = 0; i < 7; i++) { const x = 9 + Math.floor(r() * 22), y = 9 + Math.floor(r() * 20); l.r(x, y, 3, 1, COL.aguaClara); }
    // ondas alrededor del pedestal
    const ond = cuadro === 1 ? 8 : 10;
    l.r(20 - ond, 22, ond * 2, 1, COL.aguaClara); l.r(20 - ond + 2, 25, ond * 2 - 4, 1, COL.espuma);
    // pedestal y plato superior
    l.r(17, 14, 6, 10, COL.piedraOscura); l.r(18, 14, 3, 10, COL.piedra); l.v(18, 15, 8, COL.piedraClara);
    l.elipse(20, 12, 7, 2, COL.piedraOscura); l.elipse(20, 11, 6, 1, COL.piedra); l.r(15, 11, 10, 1, COL.agua);
    // chorro
    l.r(19, 4, 2, 7, COL.espuma); l.p(19, 3, "#ffffff"); l.p(20, 3, "#ffffff");
    const gotas = cuadro === 1 ? [[16, 6], [24, 7], [14, 9], [26, 10]] : [[15, 7], [25, 6], [13, 10], [27, 9]];
    gotas.forEach(([x, y]) => { l.p(x, y, COL.espuma); l.p(x, y + 1, COL.aguaClara); });
    return contorno(l);
  }

  /* ============================== edificios ============================== */

  function edificio(ed) {
    const W = ed.w * 16, Hf = ed.h * 16, ARR = 22;
    const CW = W + 8, CH = Hf + ARR;
    const l = lienzo(CW, CH);
    const x0 = 4;                         // borde izquierdo de las paredes
    const fy = (y) => ARR + y;            // y dentro de la huella del edificio
    const techo = ed.techo, techoO = oscuro(techo, 0.3), techoC = claro(techo, 0.22), techoOO = oscuro(techo, 0.5);
    const pared = ed.pared, paredO = oscuro(pared, 0.18), paredOO = oscuro(pared, 0.35);
    const id = ed.id;
    const colPuerta = ed.puerta.x - ed.x;

    // ---------- paredes ----------
    const yPared = fy(26), altoPared = Hf - 26;
    l.r(x0, yPared, W, altoPared, pared);
    if (id === "colegio") {
      for (let y = yPared + 2; y < CH - 6; y += 4) {
        l.h(x0, y, W, "#e9cdb1");
        for (let x = x0 + ((y / 4) % 2 ? 0 : 4); x < x0 + W; x += 8) l.v(x, y + 1, 3, "#e9cdb1");
      }
    } else if (id === "rectoria") {
      for (let y = yPared + 3; y < CH - 6; y += 3) l.h(x0, y, W, paredO);
    } else if (id === "secretaria") {
      for (let y = yPared + 4; y < CH - 6; y += 6) {
        l.h(x0, y, W, paredO);
        for (let x = x0 + ((y / 6) % 2 ? 3 : 9); x < x0 + W; x += 12) l.v(x, y + 1, 5, paredO);
      }
    }
    l.r(x0, yPared, W, 2, paredOO);                       // sombra del alero
    l.r(x0 + W - 2, yPared, 2, altoPared, paredO);        // sombra lateral
    // zócalo
    l.r(x0, CH - 6, W, 6, COL.piedraOscura); l.h(x0, CH - 6, W, COL.piedraClara);
    for (let x = x0 + 3; x < x0 + W; x += 7) l.v(x, CH - 5, 5, oscuro(COL.piedraOscura, 0.2));

    // ---------- ventanas ----------
    for (let c = 0; c < ed.w; c++) {
      if (c === colPuerta) continue;
      const vx = x0 + c * 16 + 3, arco = id === "universidad";
      const vy = fy(arco ? 31 : 33), vh = arco ? 15 : 12;
      if (id === "secretaria") { l.r(vx - 2, vy, 2, vh, techoO); l.r(vx + 10, vy, 2, vh, techoO); }
      l.r(vx, vy, 10, vh, CONTORNO);
      l.r(vx + 1, vy + 1, 8, vh - 2, COL.marco);
      l.r(vx + 2, vy + 2, 6, vh - 4, COL.vidrio);
      l.r(vx + 2, vy + vh - 5, 6, 3, COL.vidrioOscuro);
      l.v(vx + 5, vy + 2, vh - 4, COL.marco); l.h(vx + 2, vy + Math.floor(vh / 2), 6, COL.marco);
      l.p(vx + 2, vy + 2, COL.vidrioBrillo); l.p(vx + 3, vy + 3, COL.vidrioBrillo); l.p(vx + 6, vy + 2, COL.vidrioBrillo);
      if (arco) { l.p(vx, vy, "rgba(0,0,0,0)"); l.r(vx, vy, 2, 1, pared); l.r(vx + 8, vy, 2, 1, pared); l.p(vx, vy + 1, pared); l.p(vx + 9, vy + 1, pared); l.p(vx + 1, vy + 1, CONTORNO); l.p(vx + 8, vy + 1, CONTORNO); }
      if (id === "rectoria") { l.v(vx + 2, vy + 2, vh - 4, "#f2c14e"); l.v(vx + 7, vy + 2, vh - 4, "#f2c14e"); }
      // repisa
      l.r(vx - 1, vy + vh, 12, 2, "#d9cdb4"); l.h(vx - 1, vy + vh + 1, 12, "#b8ab90");
      if (id === "colegio" || id === "rectoria") {
        l.r(vx, vy + vh + 2, 10, 2, COL.maderaOscura);
        [1, 3, 5, 7, 9].forEach((k, i) => l.p(vx + k - 1, vy + vh + 1, FLORES[(i + c) % FLORES.length]));
        [2, 6].forEach((k) => l.p(vx + k, vy + vh + 1, COL.hojasMedias));
      }
    }

    // ---------- puerta ----------
    const px = x0 + colPuerta * 16 + 2, py = fy(40), doble = id === "secretaria" || id === "universidad";
    if (id === "secretaria") {
      // columnas y frontón
      [[px - 3, 3], [px + 12, 3]].forEach(([cx, w]) => { l.r(cx, fy(30), w, 30, "#f6f0e2"); l.v(cx + w - 1, fy(30), 30, "#d9cdb4"); l.r(cx - 1, fy(29), w + 2, 2, "#e8dfcb"); });
      for (let i = 0; i < 6; i++) l.h(px - 4 + i, fy(33) - i, 20 - 2 * i, i === 0 ? "#d9cdb4" : "#f6f0e2");
    }
    if (id === "rectoria") {
      // toldo a rayas
      for (let i = 0; i < 16; i++) l.v(px - 2 + i, fy(36), 4, Math.floor(i / 2) % 2 ? "#fbf8f0" : techo);
      for (let i = 0; i < 16; i += 2) l.p(px - 1 + i, fy(40), Math.floor(i / 2) % 2 ? "#fbf8f0" : techo);
      // matas en materas
      [[px - 7, 0], [px + 14, 1]].forEach(([mx, k]) => {
        l.r(mx, fy(53), 5, 5, "#c8693c"); l.h(mx, fy(53), 5, "#e08a55");
        l.circulo(mx + 2, fy(50), 3, COL.hojas); l.p(mx + 1, fy(49), COL.hojasClaras); l.p(mx + 3, fy(48), k ? "#f28cb1" : "#ffe082");
      });
    }
    l.r(px - 1, py - 1, 14, 21, CONTORNO);
    l.r(px, py, 12, 20, "#5a3620");
    l.r(px + 1, py + 1, 10, 19, COL.madera);
    l.r(px + 2, py + 2, 8, 3, COL.vidrio); l.p(px + 3, py + 2, COL.vidrioBrillo);
    l.r(px + 2, py + 7, 3, 5, COL.maderaOscura); l.r(px + 7, py + 7, 3, 5, COL.maderaOscura);
    l.r(px + 2, py + 13, 3, 5, COL.maderaOscura); l.r(px + 7, py + 13, 3, 5, COL.maderaOscura);
    if (doble) l.v(px + 6, py + 1, 19, "#5a3620");
    l.p(doble ? px + 5 : px + 9, py + 11, "#f2c14e"); if (doble) l.p(px + 7, py + 11, "#f2c14e");
    l.v(px + 1, py + 1, 19, COL.maderaClara);
    // escalones
    l.r(px - 2, CH - 4, 16, 2, COL.piedraClara); l.r(px - 3, CH - 2, 18, 2, COL.piedra); l.h(px - 3, CH - 1, 18, COL.piedraOscura);

    // ---------- techo ----------
    const yT = fy(0), altoT = 26;
    for (let i = 0; i < altoT; i++) {
      const recorte = Math.max(0, 5 - Math.floor(i / 2));
      l.h(1 + recorte, yT + i, CW - 2 - 2 * recorte, techo);
    }
    for (let i = 3; i < altoT - 3; i += 4) {
      const recorte = Math.max(0, 5 - Math.floor(i / 2));
      l.h(1 + recorte, yT + i, CW - 2 - 2 * recorte, techoO);
      l.h(1 + recorte, yT + i - 2, CW - 2 - 2 * recorte, techoC);
      for (let x = 1 + recorte + ((i / 4) % 2 ? 3 : 7); x < CW - 1 - recorte; x += 8) l.v(x, yT + i - 3, 3, techoO);
    }
    l.r(6, yT, CW - 12, 2, techoOO); l.h(7, yT, CW - 14, techoC);           // cumbrera
    l.r(1, yT + altoT - 3, CW - 2, 3, techoOO); l.h(1, yT + altoT - 3, CW - 2, techoO);  // alero

    // letrero de madera
    const lw = Math.min(W - 18, 74), lx = Math.round((CW - lw) / 2), ly = yT + 8;
    l.r(lx, ly, lw, 11, "#5a3620"); l.r(lx + 1, ly + 1, lw - 2, 9, COL.madera); l.h(lx + 1, ly + 1, lw - 2, COL.maderaClara); l.h(lx + 1, ly + 9, lw - 2, COL.maderaOscura);
    [lx + 2, lx + lw - 3].forEach((x) => { l.p(x, ly + 2, "#d9cdb4"); l.p(x, ly + 8, "#d9cdb4"); });
    // nombre del edificio con letras pixeladas talladas en la madera
    const etiqueta = ed.etiqueta || "";
    Pixel.texto(l, etiqueta, Math.round(CW / 2 - Pixel.anchoTexto(etiqueta) / 2), ly + 3, "#fff4d6", "#5a3620");

    // ---------- detalles propios ----------
    if (id === "secretaria") {
      // asta con bandera de Colombia
      const ax = CW - 14;
      l.r(ax, 0, 1, yT + 4, "#c9ced4"); l.p(ax, 0, "#f2c14e");
      l.r(ax + 1, 1, 11, 4, "#fcd116"); l.r(ax + 1, 5, 11, 2, "#003893"); l.r(ax + 1, 7, 11, 2, "#ce1126");
      l.r(ax + 11, 2, 1, 6, "rgba(0,0,0,.12)");
    }
    if (id === "colegio") {
      // campanario con reloj
      const cx = Math.round(CW / 2) - 7;
      l.r(cx, 6, 14, yT - 2, pared); l.r(cx + 12, 6, 2, yT - 2, paredO);
      l.circulo(cx + 7, 13, 4, "#fbf8f0"); l.p(cx + 7, 11, CONTORNO); l.p(cx + 7, 12, CONTORNO); l.p(cx + 8, 13, CONTORNO); l.p(cx + 9, 13, CONTORNO);
      l.r(cx + 4, 18, 6, 3, "#3b2412"); l.r(cx + 6, 18, 2, 2, "#f2c14e");
      for (let i = 0; i < 7; i++) l.h(cx - 1 + i, 6 - i, 16 - 2 * i, i % 2 ? techoO : techo);
      l.p(cx + 7, -1, "#f2c14e");
    }
    if (id === "universidad") {
      // columnas en la fachada y estandarte
      for (let c = 1; c < ed.w; c++) {
        const cx = x0 + c * 16 - 1;
        if (Math.abs(c - colPuerta) < 1 || c === colPuerta + 1) continue;
        l.r(cx, fy(28), 3, 30, "#f7f4fb"); l.v(cx + 2, fy(28), 30, "#d6cfe2"); l.r(cx - 1, fy(27), 5, 2, "#e2dbee"); l.r(cx - 1, fy(57), 5, 1, "#d6cfe2");
      }
      const bx = x0 + 2;
      l.r(bx, fy(28), 6, 14, "#5a3778"); l.r(bx + 1, fy(29), 4, 12, techo); l.r(bx + 2, fy(31), 2, 2, "#f2c14e"); l.p(bx + 1, fy(42), techo); l.p(bx + 4, fy(42), techo);
    }
    return contorno(l);
  }

  /* ============================ marcadores ============================ */

  function flecha() {
    const l = lienzo(13, 10);
    for (let i = 0; i < 6; i++) l.h(1 + i, 1 + i, 11 - 2 * i, i < 2 ? "#ffe08a" : "#f2c14e");
    l.r(4, 0, 5, 1, "#f2c14e"); l.p(3, 1, "#fff4c2"); l.p(4, 2, "#fff4c2");
    return contorno(l);
  }

  function carta() {
    const l = lienzo(13, 16);
    l.elipse(6, 14, 5, 1, "rgba(20,30,20,.3)");
    l.r(1, 0, 11, 14, "#f2c14e");
    l.r(2, 1, 9, 12, "#c8553d"); l.r(3, 2, 7, 10, "#9c3a28");
    l.r(5, 4, 3, 1, "#f2c14e"); l.p(7, 5, "#f2c14e"); l.p(6, 6, "#f2c14e"); l.p(6, 8, "#f2c14e");
    l.p(2, 1, "#fff4c2"); l.p(3, 2, "#e06a50");
    return contorno(l);
  }

  function destello() {
    const l = lienzo(7, 7);
    l.v(3, 0, 7, "#fff4c2"); l.h(0, 3, 7, "#fff4c2"); l.p(3, 3, "#ffffff"); l.p(2, 2, "#ffe08a"); l.p(4, 4, "#ffe08a"); l.p(4, 2, "#ffe08a"); l.p(2, 4, "#ffe08a");
    return l;
  }

  /* ========================= crear todas las texturas ========================= */

  function crearTexturas(scene) {
    if (scene.textures.exists("tex-lista")) return;
    for (let v = 0; v < 4; v++) { const l = lienzo(16, 16); pasto(l, 11 + v * 31, v === 3); textura(scene, "pasto" + v, l); }
    for (let v = 0; v < 2; v++) { const l = lienzo(16, 16); flores(l, 5 + v * 17); textura(scene, "flores" + v, l); }
    for (let v = 0; v < 3; v++) textura(scene, "arbol" + v, arbol(v));
    textura(scene, "bosque", bosque());
    textura(scene, "arbusto0", arbusto(false)); textura(scene, "arbusto1", arbusto(true));
    textura(scene, "roca", roca());
    textura(scene, "banca", banca());
    textura(scene, "farol", farol());
    textura(scene, "resplandor", resplandor());
    textura(scene, "tablero", tablero());
    textura(scene, "buzon", buzon());
    textura(scene, "fuente1", fuente(1)); textura(scene, "fuente2", fuente(2));
    textura(scene, "flecha", flecha());
    textura(scene, "carta", carta());
    textura(scene, "destello", destello());
    // sombra bajo los personajes y marcas al tocar el mapa
    const so = lienzo(14, 5); so.elipse(7, 2, 6, 2, "rgba(20,35,15,.32)"); textura(scene, "sombra", so);
    const mk = (col) => { const l = lienzo(13, 9); l.elipse(6, 4, 6, 3, col); l.elipse(6, 4, 4, 2, "rgba(0,0,0,0)"); l.x.clearRect(3, 3, 7, 3); l.x.clearRect(4, 2, 5, 5); return l; };
    textura(scene, "marca-ok", mk("#fff4c2")); textura(scene, "marca-no", mk("#e0685a"));
    ["check", "candado", "popularidad"].forEach((n) => { if (!scene.textures.exists("ico-" + n)) scene.textures.addCanvas("ico-" + n, Pixel.iconoCanvas(n, 2)); });
    // personajes: 3 direcciones × 3 cuadros (1 quieto, 2 y 3 caminando)
    (CONTENIDO.personajes || []).forEach((pj) => {
      ["abajo", "arriba", "lado"].forEach((dir) => [1, 2, 3].forEach((paso) => textura(scene, `${pj.id}-${dir}${paso}`, Pixel.personaje(pj, dir, paso))));
    });
    scene.textures.addCanvas("tex-lista", lienzo(1, 1).c);
  }

  function crearAnimaciones(scene) {
    (CONTENIDO.personajes || []).forEach((pj) => ["abajo", "arriba", "lado"].forEach((d) => {
      const k = pj.id + "-caminar-" + d;
      if (scene.anims.exists(k)) return;
      scene.anims.create({ key: k, frames: [2, 1, 3, 1].map((n) => ({ key: `${pj.id}-${d}${n}` })), frameRate: 10, repeat: -1 });
    }));
  }

  /* ============================ armar el mapa ============================ */

  const CAMINABLE = ".gf";
  function construirMapa(scene) {
    crearTexturas(scene);
    crearAnimaciones(scene);
    const filas = MAPA.filas;
    const W = filas[0].length * T, H = filas.length * T, B = 14 * T;
    const ch = (x, y) => (y >= 0 && y < filas.length && x >= 0 && x < filas[0].length ? filas[y][x] : "T");
    const esCamino = (x, y) => { const c = ch(x, y); return c === "." || c === "B" || c === "w"; };

    // bosque alrededor
    scene.add.tileSprite(-B, -B, W + 2 * B, B, "bosque").setOrigin(0).setDepth(0);
    scene.add.tileSprite(-B, H, W + 2 * B, B, "bosque").setOrigin(0).setDepth(0);
    scene.add.tileSprite(-B, 0, B, H, "bosque").setOrigin(0).setDepth(0);
    scene.add.tileSprite(W, 0, B, H, "bosque").setOrigin(0).setDepth(0);

    const caminable = [];
    const hash = (x, y) => (x * 73856093) ^ (y * 19349663);
    filas.forEach((fila, y) => {
      caminable[y] = [];
      [...fila].forEach((c, x) => {
        caminable[y][x] = CAMINABLE.includes(c);
        const px = x * T, py = y * T;
        let clave;
        if (c === ".") {
          let m = 0;
          if (!esCamino(x, y - 1)) m |= 1;
          if (!esCamino(x + 1, y)) m |= 2;
          if (!esCamino(x, y + 1)) m |= 4;
          if (!esCamino(x - 1, y)) m |= 8;
          if (esCamino(x, y - 1) && esCamino(x + 1, y) && !esCamino(x + 1, y - 1)) m |= 16;
          if (esCamino(x, y + 1) && esCamino(x + 1, y) && !esCamino(x + 1, y + 1)) m |= 32;
          if (esCamino(x, y + 1) && esCamino(x - 1, y) && !esCamino(x - 1, y + 1)) m |= 64;
          if (esCamino(x, y - 1) && esCamino(x - 1, y) && !esCamino(x - 1, y - 1)) m |= 128;
          const sem = Math.abs(hash(x, y)) % 3;
          clave = `camino-${m}-${sem}`;
          if (!scene.textures.exists(clave)) { const l = lienzo(16, 16); camino(l, m, sem * 7 + 3); textura(scene, clave, l); }
        } else if (c === "f") clave = "flores" + (Math.abs(hash(x, y)) % 2);
        else if (c === "w") clave = "camino-0-0";
        else clave = "pasto" + (Math.abs(hash(x, y)) % 7 === 0 ? 3 : Math.abs(hash(x, y)) % 3);
        if (clave === "camino-0-0" && !scene.textures.exists(clave)) { const l = lienzo(16, 16); camino(l, 0, 3); textura(scene, clave, l); }
        scene.add.image(px, py, clave).setOrigin(0).setDepth(0);

        // objetos con profundidad según su base
        const base = py + T;
        // los árboles del borde de abajo van más bajos para no tapar al jugador
        if (c === "T") scene.add.image(px + T / 2, base + (y === filas.length - 1 ? 22 : 2), "arbol" + (Math.abs(hash(x, y)) % 3)).setOrigin(0.5, 1).setDepth(base);
        if (c === "k") scene.add.image(px + T / 2, base - 1, "arbusto" + (Math.abs(hash(x, y)) % 2)).setOrigin(0.5, 1).setDepth(base);
        if (c === "r") scene.add.image(px + T / 2, base - 4, "roca").setOrigin(0.5, 1).setDepth(base);
        if (c === "b") scene.add.image(px + T / 2, base - 3, "banca").setOrigin(0.5, 1).setDepth(base);
        if (c === "p") scene.add.image(px + T / 2, base - 1, "tablero").setOrigin(0.5, 1).setDepth(base);
        if (c === "m") scene.add.image(px + T / 2, base - 2, "buzon").setOrigin(0.5, 1).setDepth(base);
        if (c === "l") {
          scene.add.image(px + T / 2, base - 2, "farol").setOrigin(0.5, 1).setDepth(base);
          const g = scene.add.image(px + T / 2, base - 2 - 62, "resplandor").setDepth(base + 1).setBlendMode(Phaser.BlendModes.ADD);
          scene.tweens.add({ targets: g, alpha: 0.55, duration: 1400 + (x * 97) % 600, yoyo: true, repeat: -1, ease: "Sine.inOut" });
        }
      });
    });

    // fuente animada (sobre el rectángulo de agua)
    let minX = 99, minY = 99, maxX = -1, maxY = -1;
    filas.forEach((f, y) => [...f].forEach((c, x) => { if (c === "w") { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); } }));
    if (maxX >= 0) {
      const cx = ((minX + maxX + 1) / 2) * T, by = (maxY + 1) * T + 10;
      const f = scene.add.image(cx, by, "fuente1").setOrigin(0.5, 1).setDepth(by);
      let k = 1;
      scene.time.addEvent({ delay: 320, loop: true, callback: () => { k = 3 - k; f.setTexture("fuente" + k); } });
      for (let i = 0; i < 3; i++) {
        const d = scene.add.image(cx - 20 + i * 18, by - 50 + (i % 2) * 18, "destello").setDepth(by + 1).setAlpha(0);
        scene.tweens.add({ targets: d, alpha: 1, duration: 500, yoyo: true, repeat: -1, delay: i * 700, repeatDelay: 1200 });
      }
    }

    // edificios
    const dibujos = {};
    MAPA.edificios.forEach((ed) => {
      const base = (ed.y + ed.h) * T;
      const x = ed.x * T - 4 * E;
      scene.add.rectangle(x + 4 * E + 6, base + 2, ed.w * T, 10, 0x1a2a10, 0.22).setOrigin(0, 1).setDepth(1);
      const img = scene.add.image(x, base, textura(scene, "edificio-" + ed.id, edificio(ed))).setOrigin(0, 1).setDepth(base - 1);
      const altoImg = img.height;
      const letrero = null;   // el nombre ya va pintado en el letrero de madera
      const insignia = scene.add.image(x + img.width - 10, base - altoImg + (22 + 4) * E, "ico-check").setOrigin(0.5).setDepth(base + 2).setVisible(false);
      scene.tweens.add({ targets: insignia, y: insignia.y - 3, duration: 700, yoyo: true, repeat: -1, ease: "Sine.inOut" });
      dibujos[ed.id] = { imagen: img, letrero, insignia };
    });

    return { caminable, dibujos };
  }

  // tipo: "check" | "candado" | "estrella" | null
  function marcar(dibujo, tipo) {
    if (!dibujo) return;
    if (!tipo) { dibujo.insignia.setVisible(false); return; }
    dibujo.insignia.setTexture("ico-" + (tipo === "estrella" ? "popularidad" : tipo)).setVisible(true);
  }

  return { crearTexturas, crearAnimaciones, construirMapa, marcar };
})();
