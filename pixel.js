/* ==========================================================================
   PIXEL ART — utilidades de dibujo píxel a píxel (sin imágenes externas).
   Lo usan el mapa (sprites.js) y la interfaz (íconos y retratos).
   ========================================================================== */

const Pixel = (function () {
  const CONTORNO = "#2b1d24";

  /* ----------------------------- lienzo ----------------------------- */

  function lienzo(w, h) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const x = c.getContext("2d");
    x.imageSmoothingEnabled = false;
    return {
      c, x, ancho: w, alto: h,
      p(px, py, col) { if (col) { x.fillStyle = col; x.fillRect(px, py, 1, 1); } },
      r(px, py, ww, hh, col) { if (col) { x.fillStyle = col; x.fillRect(px, py, ww, hh); } },
      // línea horizontal / vertical
      h(px, py, ww, col) { this.r(px, py, ww, 1, col); },
      v(px, py, hh, col) { this.r(px, py, 1, hh, col); },
      // elipse rellena (en píxeles enteros)
      elipse(cx, cy, rx, ry, col) {
        for (let yy = -ry; yy <= ry; yy++) {
          const ancho = Math.round(rx * Math.sqrt(Math.max(0, 1 - (yy * yy) / (ry * ry + 0.0001))));
          this.r(Math.round(cx - ancho), Math.round(cy + yy), ancho * 2 + 1, 1, col);
        }
      },
      circulo(cx, cy, rad, col) { this.elipse(cx, cy, rad, rad, col); }
    };
  }

  function escalar(src, n) {
    const c = document.createElement("canvas");
    c.width = src.width * n; c.height = src.height * n;
    const x = c.getContext("2d");
    x.imageSmoothingEnabled = false;
    x.drawImage(src, 0, 0, c.width, c.height);
    return c;
  }

  // Agrega un contorno de 1 px alrededor de todo lo opaco
  function contorno(l, color) {
    const W = l.ancho, H = l.alto;
    const d = l.x.getImageData(0, 0, W, H).data;
    const opaco = (x, y) => x >= 0 && y >= 0 && x < W && y < H && d[(y * W + x) * 4 + 3] > 0;
    const marcar = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (opaco(x, y)) continue;
      if (opaco(x - 1, y) || opaco(x + 1, y) || opaco(x, y - 1) || opaco(x, y + 1)) marcar.push([x, y]);
    }
    marcar.forEach(([x, y]) => l.p(x, y, color || CONTORNO));
    return l;
  }

  function desdeFilas(filas, paleta) {
    const l = lienzo(filas[0].length, filas.length);
    filas.forEach((f, y) => [...f].forEach((ch, x) => l.p(x, y, paleta[ch])));
    return l;
  }

  function azar(semilla) {
    let a = semilla >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function mezclar(hex, otro, f) {
    const a = parseInt(hex.slice(1), 16), b = parseInt(otro.slice(1), 16);
    const ch = (s) => Math.round(((a >> s) & 255) * (1 - f) + ((b >> s) & 255) * f);
    return "#" + ((1 << 24) + (ch(16) << 16) + (ch(8) << 8) + ch(0)).toString(16).slice(1);
  }
  const oscuro = (hex, f) => mezclar(hex, "#1a1020", f === undefined ? 0.28 : f);
  const claro = (hex, f) => mezclar(hex, "#ffffff", f === undefined ? 0.25 : f);

  /* ---------------------------- personajes ---------------------------- */

  // Paletas completas de cada personaje (si no está, se arma con los colores de contenido.js)
  //   mujer: true → pelo largo, pestañas, labios, falda y piernas
  const PALETAS = {
    lucia: {
      mujer: true, piel: "#e8b48a", pelo: "#2e1c16", camisa: "#d8573d", falda: "#d8573d", vestido: true,
      zapato: "#8c2f2a", peinado: "largo", diadema: "#f2c14e"
    },
    andres: {
      piel: "#c98c5e", pelo: "#4a2f1d", camisa: "#3d7dd8", pantalon: "#a68b5b", zapato: "#2b2b2b",
      peinado: "corto", morral: "#8a5a35"
    },
    valentina: {
      mujer: true, piel: "#f2cda5", pelo: "#b0702e", camisa: "#2f9f7f", falda: "#3b3352", zapato: "#4a3226",
      peinado: "cola", gafas: true, mono: "#f2c14e"
    },
    // Personajes del pueblo que hablan en los edificios
    funcionaria: { mujer: true, piel: "#d9a27a", pelo: "#5a3a2a", camisa: "#7a5aa8", falda: "#3b3352", zapato: "#3a2a2a", peinado: "cola", mono: "#e8455a", gafas: true },
    rector:      { piel: "#e0b08a", pelo: "#a7a7ad", camisa: "#4a5568", pantalon: "#2f3542", zapato: "#2b2b2b", peinado: "corto" },
    asesora:     { mujer: true, piel: "#8d5a3b", pelo: "#1e1414", camisa: "#e0a458", falda: "#5a3a6a", zapato: "#3a2a2a", peinado: "largo", diadema: "#7bc98f" },
    estudiante:  { piel: "#f0c8a0", pelo: "#6a4020", camisa: "#f3f3ef", pantalon: "#2f3e66", zapato: "#2b2b2b", peinado: "corto", morral: "#c8553d" },
    jurado:      { piel: "#b97a52", pelo: "#2a2a2a", camisa: "#2f6f8f", pantalon: "#39304a", zapato: "#2b2b2b", peinado: "corto" }
  };
  const esMujer = (pj) => !!(PALETAS[pj && pj.id] || {}).mujer;

  function paletaDe(pj) {
    const base = PALETAS[pj.id] || {};
    const col = pj.colores || {};
    const p = Object.assign({ piel: "#e8b48a", pelo: col.pelo || "#4a2f1d", camisa: col.camisa || "#3d7dd8", pantalon: "#3a3a4a", zapato: "#2b2b2b", peinado: "corto" }, base);
    p.falda = p.falda || p.pantalon;
    p.pielS = oscuro(p.piel, 0.22);
    p.peloS = oscuro(p.pelo, 0.3);
    p.peloL = claro(p.pelo, 0.22);
    p.camisaS = oscuro(p.camisa, 0.25);
    p.camisaL = claro(p.camisa, 0.18);
    p.pantalonS = oscuro(p.pantalon, 0.3);
    p.faldaS = oscuro(p.falda, 0.28);
    p.faldaL = claro(p.falda, 0.2);
    p.zapatoL = claro(p.zapato, 0.25);
    p.ojo = "#2b1d24";
    p.labio = "#c4505e";
    p.mejilla = mezclar(p.piel, "#e86a6a", p.mujer ? 0.45 : 0.3);
    return p;
  }

  // dir: "abajo" | "arriba" | "lado" (mirando a la derecha) · paso: 1 quieto, 2 y 3 caminando
  function personaje(pj, dir, paso) {
    const P = paletaDe(pj);
    const l = lienzo(18, 24);
    const ox = 1, oy = 1;                 // margen para el contorno
    const R = (x, y, w, h, c) => l.r(ox + x, oy + y, w, h, c);
    const Px = (x, y, c) => l.p(ox + x, oy + y, c);
    const b = paso === 1 ? 0 : -1;         // al caminar, el cuerpo sube 1 px
    const M = !!P.mujer;

    /* ================== de perfil (mirando a la derecha) ================== */
    if (dir === "lado") {
      const ade = paso === 2, atr = paso === 3;
      // pelo largo detrás de la espalda (se dibuja primero)
      if (P.peinado === "largo") { R(3, 3 + b, 4, 10, P.pelo); R(3, 10 + b, 3, 3, P.peloS); Px(4, 5 + b, P.peloL); Px(4, 6 + b, P.peloL); }
      if (P.peinado === "cola") {
        const cx = paso === 2 ? 1 : 2;                               // la cola se mece
        R(cx, 4 + b, 3, 7, P.pelo); R(cx, 9 + b, 2, 2, P.peloS); Px(cx + 1, 5 + b, P.peloL);
        R(4, 3 + b, 2, 2, P.mono); Px(4, 3 + b, claro(P.mono, 0.4));  // moño
      }
      // ---- piernas ----
      if (M) {
        const pier = (x, y, h, c) => { R(x, y, 2, h, c); };
        if (paso === 1) { pier(7, 16, 3, P.piel); R(7, 19, 3, 2, P.zapato); Px(9, 19, P.zapatoL); }
        else {
          const fx = ade ? 9 : 5, bx = ade ? 5 : 9;
          pier(bx, 16 + b, 3, P.pielS); R(bx, 19 + b, 2, 1, oscuro(P.zapato, 0.2));
          pier(fx, 16, 3, P.piel); R(fx, 19, 3, 2, P.zapato); Px(fx + 2, 19, P.zapatoL);
        }
      } else if (paso === 1) {
        R(6, 16, 3, 3, P.pantalon); R(6, 16, 1, 3, P.pantalonS);
        R(6, 19, 4, 2, P.zapato); R(9, 19, 1, 1, P.zapatoL);
      } else {
        const fx = ade ? 8 : 4, bx = ade ? 4 : 8;
        R(bx, 16 + b, 3, 3, P.pantalonS); R(bx, 19 + b, 3, 1, oscuro(P.zapato, 0.2));
        R(fx, 16 + b, 3, 3, P.pantalon); R(fx, 19, 4, 2, P.zapato); R(fx + 3, 19, 1, 1, P.zapatoL);
      }
      // ---- torso ----
      if (M) {
        R(6, 10 + b, 5, 4, P.camisa); R(6, 10 + b, 1, 4, P.camisaS); Px(10, 10 + b, P.camisaL);
        // falda acampanada
        R(5, 14 + b, 6, 1, P.falda); R(4, 15 + b, 8, 2, P.falda); R(4, 16 + b, 8, 1, P.faldaS); R(4, 15 + b, 1, 1, P.faldaS);
        if (!P.vestido) R(6, 13 + b, 5, 1, oscuro(P.falda, 0.15));
      } else {
        R(5, 10 + b, 6, 6, P.camisa); R(5, 10 + b, 1, 6, P.camisaS); R(10, 10 + b, 1, 2, P.camisaL);
      }
      if (P.morral) { R(3, 10 + b, 3, 5, P.morral); R(3, 10 + b, 1, 5, oscuro(P.morral)); Px(4, 11 + b, claro(P.morral)); }
      // brazo
      const bx = paso === 2 ? 9 : paso === 3 ? 6 : 7;
      if (M && P.vestido) { R(bx, 11 + b, 2, 1, P.camisaS); R(bx, 12 + b, 2, 2, P.piel); R(bx, 14 + b, 2, 1, P.pielS); }
      else { R(bx, 11 + b, 2, 4, P.camisaS); R(bx, 15 + b, 2, 1, P.piel); }
      // ---- cabeza ----
      R(5, 2 + b, 7, 8, P.piel); R(12, 6 + b, 1, 2, P.piel);          // nariz
      R(5, 2 + b, 2, 8, P.pielS);
      Px(10, 5 + b, P.ojo); Px(10, 6 + b, P.ojo);
      if (M) { Px(11, 5 + b, P.ojo); Px(11, 8 + b, P.labio); Px(9, 7 + b, P.mejilla); }
      else { Px(11, 8 + b, P.pielS); Px(10, 8 + b, P.mejilla); }
      Px(7, 6 + b, P.pielS); Px(7, 7 + b, P.pielS);                  // oreja
      // ---- pelo ----
      R(5, 1 + b, 7, 2, P.pelo); R(4, 2 + b, 3, 4, P.pelo); R(6, 1 + b, 4, 1, P.peloL);
      R(11, 2 + b, 1, 2, P.pelo);
      if (P.peinado === "corto") { Px(8, 0 + b + (b ? 1 : 0), P.pelo); Px(10, 0 + b + (b ? 1 : 0), P.pelo); R(5, 3 + b, 2, 3, P.pelo); }
      if (P.peinado === "largo") {
        R(4, 2 + b, 3, 8, P.pelo); R(10, 3 + b, 2, 1, P.pelo);        // flequillo
        if (P.diadema) { R(7, 1 + b, 2, 1, P.diadema); Px(6, 2 + b, P.diadema); Px(9, 1 + b, oscuro(P.diadema, 0.2)); }
      }
      if (P.peinado === "cola") { R(4, 2 + b, 3, 7, P.pelo); R(4, 8 + b, 3, 1, P.peloS); R(10, 3 + b, 2, 1, P.pelo); Px(5, 3 + b, P.peloL); }
      if (P.gafas) { R(9, 5 + b, 3, 1, "#4a3a3a"); Px(9, 6 + b, "#4a3a3a"); Px(11, 6 + b, "#4a3a3a"); Px(10, 6 + b, "#cfeaf6"); Px(10, 5 + b, P.ojo); }
      return contorno(l);
    }

    /* ======================= de frente o de espaldas ======================= */
    const frente = dir === "abajo";
    const pi = paso === 2, pd = paso === 3;

    // pelo largo que cae por detrás de los hombros (debajo del cuerpo)
    if (M && P.peinado === "largo") {
      if (frente) {
        R(2, 5 + b, 2, 8, P.pelo); R(12, 5 + b, 2, 8, P.pelo);
        R(2, 11 + b, 2, 2, P.peloS); R(12, 11 + b, 2, 2, P.peloS);
      } else {
        R(3, 2 + b, 10, 12, P.pelo); R(2, 5 + b, 1, 8, P.pelo); R(13, 5 + b, 1, 8, P.pelo);
        R(3, 12 + b, 10, 2, P.peloS); R(5, 4 + b, 1, 7, P.peloL); R(9, 5 + b, 1, 6, P.peloS);
      }
    }

    // piernas y zapatos
    if (M) {
      R(5, 17, 2, pi ? 1 : 2, P.piel); R(9, 17, 2, pd ? 1 : 2, P.piel);
      Px(6, 17, P.pielS); Px(10, 17, P.pielS);
      R(5, pi ? 18 : 19, 2, 2, P.zapato); R(9, pd ? 18 : 19, 2, 2, P.zapato);
      Px(5, pi ? 18 : 19, P.zapatoL); Px(9, pd ? 18 : 19, P.zapatoL);
    } else {
      R(5, 16 + b, 3, 3 - (pi ? 1 : 0), P.pantalon);
      R(8, 16 + b, 3, 3 - (pd ? 1 : 0), P.pantalon);
      R(7, 16 + b, 1, 3, P.pantalonS); R(10, 16 + b, 1, 3, P.pantalonS);
      R(5, pi ? 18 : 19, 3, 2, P.zapato); R(8, pd ? 18 : 19, 3, 2, P.zapato);
      Px(5, pi ? 18 : 19, P.zapatoL); Px(8, pd ? 18 : 19, P.zapatoL);
    }

    // torso
    const bi = pi ? -1 : pd ? 1 : 0;
    if (M) {
      // hombros más angostos, cintura y falda acampanada
      R(5, 10 + b, 6, 4, P.camisa);
      R(10, 10 + b, 1, 4, P.camisaS); Px(5, 10 + b, P.camisaL);
      if (frente) { R(7, 10 + b, 2, 1, P.piel); Px(7, 11 + b, P.pielS); Px(8, 11 + b, P.pielS); }  // escote
      if (!P.vestido) { R(5, 13 + b, 6, 1, oscuro(P.falda, 0.15)); if (frente) Px(8, 13 + b, "#e8c547"); }  // cinturón
      R(5, 14 + b, 6, 1, P.falda); R(4, 15 + b, 8, 2, P.falda);
      R(10, 14 + b, 1, 1, P.faldaS); R(11, 15 + b, 1, 2, P.faldaS); R(4, 16 + b, 8, 1, P.faldaS);
      Px(5, 15 + b, P.faldaL); if (P.vestido) { Px(7, 16 + b, P.faldaL); Px(9, 16 + b, P.faldaL); }
      // brazos (se balancean)
      [[4, Math.max(0, bi)], [11, Math.max(0, -bi)]].forEach(([ax, d]) => {
        if (P.vestido) { R(ax, 11 + b + d, 1, 1, P.camisaS); R(ax, 12 + b + d, 1, 2, P.piel); Px(ax, 14 + b + d, P.pielS); }
        else { R(ax, 11 + b + d, 1, 3, P.camisaS); Px(ax, 14 + b + d, P.piel); }
      });
    } else {
      R(4, 10 + b, 8, 6, P.camisa);
      R(11, 10 + b, 1, 6, P.camisaS); R(4, 15 + b, 8, 1, P.camisaS);
      R(5, 10 + b, 2, 1, P.camisaL);
      if (frente) { R(7, 10 + b, 2, 1, P.pielS); Px(7, 11 + b, P.camisaS); Px(8, 11 + b, P.camisaS); } // cuello
      if (P.morral) {
        if (frente) { R(5, 11 + b, 1, 4, P.morral); R(10, 11 + b, 1, 4, P.morral); }
        else { R(5, 10 + b, 6, 6, P.morral); R(5, 10 + b, 6, 1, claro(P.morral)); R(10, 11 + b, 1, 5, oscuro(P.morral)); R(6, 13 + b, 4, 1, oscuro(P.morral)); Px(7, 12 + b, "#f2c14e"); }
      }
      R(3, 11 + b + Math.max(0, bi), 1, 4, P.camisaS); Px(3, 15 + b + Math.max(0, bi), P.piel);
      R(12, 11 + b + Math.max(0, -bi), 1, 4, P.camisaS); Px(12, 15 + b + Math.max(0, -bi), P.piel);
    }

    // cabeza (esquinas de la barbilla redondeadas)
    R(4, 2 + b, 8, 7, P.piel); R(5, 9 + b, 6, 1, P.piel);
    R(11, 3 + b, 1, 6, P.pielS); R(5, 9 + b, 6, 1, P.pielS);
    if (frente) {
      R(6, 5 + b, 1, 2, P.ojo); R(9, 5 + b, 1, 2, P.ojo);
      if (M) {
        Px(5, 5 + b, P.ojo); Px(10, 5 + b, P.ojo);                  // pestañas
        R(7, 8 + b, 2, 1, P.labio);                                  // labios
        Px(5, 7 + b, P.mejilla); Px(10, 7 + b, P.mejilla);
      } else {
        Px(6, 5 + b, "#5a4a5a");
        Px(5, 7 + b, P.mejilla); Px(10, 7 + b, P.mejilla);
        R(7, 8 + b, 2, 1, P.pielS);
        Px(3, 6 + b, P.pielS); Px(12, 6 + b, P.pielS);              // orejas
      }
    }

    // pelo
    if (frente) {
      R(4, 1 + b, 8, 2, P.pelo); R(5, 0 + b, 6, 1, P.pelo); R(6, 0 + b, 3, 1, P.peloL);
      if (P.peinado === "corto") {
        R(4, 3 + b, 1, 3, P.pelo); R(11, 3 + b, 1, 3, P.pelo);
        R(5, 3 + b, 2, 1, P.pelo); R(8, 3 + b, 3, 1, P.pelo); Px(5, 1 + b, P.peloL);
        if (!b) { Px(6, -1, P.pelo); Px(9, -1, P.pelo); }
      }
      if (P.peinado === "largo") {
        // flequillo recto con raya y mechones que enmarcan la cara
        R(4, 3 + b, 3, 1, P.pelo); R(8, 3 + b, 4, 1, P.pelo); Px(4, 4 + b, P.pelo); Px(11, 4 + b, P.pelo);
        R(3, 2 + b, 1, 10, P.pelo); R(12, 2 + b, 1, 10, P.pelo);
        R(3, 9 + b, 1, 3, P.peloS); R(12, 9 + b, 1, 3, P.peloS);
        Px(5, 1 + b, P.peloL); Px(3, 4 + b, P.peloL);
        if (P.diadema) { R(4, 2 + b, 8, 1, P.diadema); Px(5, 2 + b, claro(P.diadema, 0.45)); Px(11, 2 + b, oscuro(P.diadema, 0.2)); }
      }
      if (P.peinado === "cola") {
        // flequillo de lado, melena hasta los hombros y moño
        R(4, 3 + b, 4, 1, P.pelo); Px(4, 4 + b, P.pelo); R(9, 3 + b, 3, 1, P.pelo); Px(5, 4 + b, P.pelo);
        R(3, 2 + b, 1, 8, P.pelo); R(12, 2 + b, 1, 8, P.pelo); Px(2, 8 + b, P.pelo); Px(13, 8 + b, P.pelo);
        R(3, 8 + b, 1, 2, P.peloS); R(12, 8 + b, 1, 2, P.peloS);
        Px(6, 1 + b, P.peloL); Px(3, 4 + b, P.peloL);
        // moño amarillo arriba a un lado
        R(10, 0 + b, 3, 2, P.mono); Px(11, 0 + b, oscuro(P.mono, 0.25)); Px(11, 1 + b, oscuro(P.mono, 0.25)); Px(10, 0 + b, claro(P.mono, 0.4));
      }
      if (P.gafas) {
        // marcos finos alrededor de cada ojo, con el cristal claro debajo
        [5, 7, 8, 10].forEach((gx) => { Px(gx, 5 + b, "#4a3a3a"); Px(gx, 6 + b, "#4a3a3a"); });
        Px(6, 6 + b, "#cfeaf6"); Px(9, 6 + b, "#cfeaf6");
        Px(6, 5 + b, P.ojo); Px(9, 5 + b, P.ojo);
      }
    } else {
      R(4, 1 + b, 8, 8, P.pelo); R(5, 0 + b, 6, 1, P.pelo); R(5, 1 + b, 4, 1, P.peloL);
      R(4, 8 + b, 8, 1, P.peloS);
      if (P.peinado === "corto") { Px(3, 6 + b, P.pielS); Px(12, 6 + b, P.pielS); if (!b) { Px(6, -1, P.pelo); Px(9, -1, P.pelo); } }
      if (P.peinado === "largo") {
        R(5, 2 + b, 3, 1, P.peloL);
        if (P.diadema) { R(4, 2 + b, 8, 1, P.diadema); Px(4, 2 + b, oscuro(P.diadema, 0.2)); }
      }
      if (P.peinado === "cola") {
        R(3, 2 + b, 10, 7, P.pelo); R(3, 8 + b, 10, 1, P.peloS);
        R(7, 8 + b, 2, 6, P.pelo); R(7, 12 + b, 2, 2, P.peloS); Px(7, 9 + b, P.peloL);   // cola de caballo
        R(6, 7 + b, 4, 2, P.mono); Px(6, 7 + b, claro(P.mono, 0.4)); Px(9, 8 + b, oscuro(P.mono, 0.25));  // moño
      }
    }
    return contorno(l);
  }

  // Solo la cabeza (para la barra superior y los diálogos)
  function cara(pj, escala) {
    if (typeof pj === "string") pj = { id: pj };
    const cuerpo = personaje(pj, "abajo", 1).c;
    const l = lienzo(16, 13);
    l.x.drawImage(cuerpo, 0, 0, 16, 13, 0, 0, 16, 13);
    const c = escalar(l.c, escala || 2);
    c.className = "retrato-px";
    return c;
  }

  // Escena del menú: los tres personajes sobre el pasto
  function escenaMenu(pjs, escala) {
    const l = lienzo(78, 34);
    l.elipse(39, 30, 38, 3, "#55963f"); l.elipse(39, 29, 36, 2, "#6cb24f");
    [[6, 2], [52, 4], [30, 1], [70, 3], [16, 3]].forEach(([fx, k]) => { l.p(fx, 28, ["#e85d75", "#f2c14e", "#ffffff", "#9b6ad6"][k % 4]); l.p(fx, 29, "#3f7d3a"); });
    (pjs || []).slice(0, 3).forEach((pj, i) => {
      const x = [6, 30, 54][i], dir = i === 1 ? "abajo" : "abajo";
      l.elipse(x + 9, 30, 6, 1, "rgba(30,50,20,.35)");
      l.x.drawImage(personaje(pj, dir, 1).c, x, 7);
    });
    const c = escalar(l.c, escala || 3);
    c.className = "retrato-px";
    return c;
  }

  // Retrato para la interfaz (personaje de frente, ampliado)
  function retrato(pj, escala) {
    const c = escalar(personaje(pj, "abajo", 1).c, escala || 3);
    c.className = "retrato-px";
    return c;
  }

  /* ------------------------------ íconos ------------------------------ */

  const ICONOS = {
    experiencia: { p: { o: CONTORNO, m: "#c98f4f", M: "#8a5a35", a: "#f2d16b", A: "#e0a83a", v: "#bfe3f2" }, f: [
      "oooooooooo", "oMmmmmmmMo", ".ovvvvvvo.", ".ovaaaavo.", "..ovaavo..", "...oaao...", "..ovvavo..", ".ovvvvAvo.", ".oAAAAAAo.", "oMmmmmmmMo", "oooooooooo"] },
    formacion: { p: { o: CONTORNO, n: "#3b3f5c", N: "#565b82", y: "#f2c14e", Y: "#c48a1f" }, f: [
      "....oo....", "..ooNNoo..", "ooNNNNNNoo", "oNNNNNNNNo", ".ooNNNNooy", "..onnnnoyy", "..onnnno.y", "...oooo..Y", "..........", ".........."] },
    popularidad: { p: { o: CONTORNO, y: "#f2c14e", Y: "#d99a1f", w: "#fff4c2" }, f: [
      "....oo....", "....oyo...", "...oyyo...", "ooooywyoooo".slice(0, 10), "oyyyyyyyyo", ".oyyyyyYo.", "..oyyyYo..", ".oyyYoYYo.", ".oyYo.oYo.", ".ooo...oo."] },
    desempeno: { p: { o: CONTORNO, g: "#7bc98f", G: "#4f9a62", b: "#f3ead8", r: "#e87a6a" }, f: [
      "o.........", "o.....oo..", "o....ogo..", "o..o.ogo..", "o.ogoogoo.", "o.ogoogogo", "oogogogogo", "oogogogogo", "oooooooooo", ".........."] },
    puntos: { p: { o: CONTORNO, y: "#f2c14e", Y: "#d99a1f", w: "#fff4c2" }, f: [
      "..oooooo..", ".oyyyyyyo.", "oyywyyyyYo", "oywyyyyyYo", "oyyyoyyyYo", "oyyyoyyyYo", "oyyyyyyyYo", "oyyyyyyYYo", ".oYYYYYYo.", "..oooooo.."] },
    reloj: { p: { o: CONTORNO, w: "#f3ead8", r: "#c8553d", W: "#d6ccb7" }, f: [
      "..oooooo..", ".owwwwwwo.", "owwwrwwwwo", "owwwrwwwWo", "owwwrrrwWo", "owwwwwwwWo", "owwwwwwwWo", ".oWwwwwWo.", "..oooooo..", ".........."] },
    proceso: { p: { o: CONTORNO, b: "#8a5a35", w: "#f3ead8", l: "#9e9e9e", m: "#c9c2b0" }, f: [
      "...oooo...", ".oobmmboo.", ".owwwwwwo.", ".owllllwo.", ".owwwwwwo.", ".owllllwo.", ".owwwwwwo.", ".owlllwwo.", ".owwwwwwo.", ".oooooooo."] },
    articulo: { p: { o: CONTORNO, w: "#f3e4c0", W: "#d9c49a", l: "#a8865a" }, f: [
      ".ooooooo..", "oWwwwwwwo.", "oWwllllwo.", ".owwwwwwo.", ".owlllwwo.", ".owwwwwwo.", ".owllllwo.", ".owwwwwwoo", ".oWwwwwwWo", "..oooooooo"] },
    candado: { p: { o: CONTORNO, y: "#f2c14e", Y: "#c48a1f", g: "#9e9e9e" }, f: [
      "...oooo...", "..oggggo..", "..og..go..", "..og..go..", ".oooooooo.", ".oyyyyyYo.", ".oyyooyYo.", ".oyyooyYo.", ".oyyyyyYo.", ".oooooooo."] },
    check: { p: { o: CONTORNO, g: "#7bc98f", G: "#4f9a62" }, f: [
      "........oo", ".......ogo", "......ogGo", "oo...ogGo.", "ogo.ogGo..", "oggogGo...", ".oggGo....", "..ogo.....", "...o......", ".........."] },
    cruz: { p: { o: CONTORNO, r: "#e87a6a", R: "#b84a3a" }, f: [
      "oo......oo", "oro....oro", ".oro..oro.", "..orooro..", "...orRo...", "...oRRo...", "..oRooRo..", ".oRo..oRo.", "oRo....oRo", "oo......oo"] },
    carta: { p: { o: CONTORNO, w: "#fbf8f0", r: "#c8553d", R: "#9c3a28", y: "#f2c14e" }, f: [
      ".oooooooo.", ".owwwwwwo.", ".owrrrrwo.", ".owryyrwo.", ".owrrrrwo.", ".owryyrwo.", ".owrrrrwo.", ".owwwwwwo.", ".oooooooo.", ".........."] },
    jugadores: { p: { o: CONTORNO, s: "#e8b48a", b: "#3d7dd8", r: "#d8573d" }, f: [
      "..oo..oo..", ".osso.osso", ".osso.osso", "..oo..oo..", ".obbo.orro", "obbbbobrrr", "obbbborrrr", "obbbborrrr", ".oooo.oooo", ".........."] },
    llegada: { p: { o: CONTORNO, w: "#fbf8f0", k: "#2b1d24", m: "#8a5a35" }, f: [
      "oooooooo..", "owkwkwko..", "okwkwkwo..", "owkwkwko..", "oooooooo..", "o.........", "o.........", "o.........", "o.........", "o........."] },
    secretaria: { p: { o: CONTORNO, b: "#3b6fb6", B: "#2a5590", w: "#efe6d4", W: "#d4c9b2", d: "#6b4226" }, f: [
      "....oo....", "..oobboo..", "oobbbbbboo", "oBBBBBBBBo", "owwWwwWwwo", "owowwwwowo", "owowddowwo", "owowddowwo", "oWWWddWWWo", "oooooooooo"] },
    colegio: { p: { o: CONTORNO, r: "#c8553d", R: "#9c3a28", w: "#f3e3c3", d: "#6b4226", y: "#f2c14e" }, f: [
      "....oyo...", "...orro...", "..orrrro..", "oorrrrrroo", "oRRRRRRRRo", "owwowwowwo", "owwwddwwwo", "owowddwowo", "owwwddwwwo", "oooooooooo"] },
    universidad: { p: { o: CONTORNO, v: "#7b4fa0", V: "#5a3778", w: "#ece7f2", W: "#cfc6dc", d: "#6b4226" }, f: [
      "....oo....", "...ovvo...", "..ovvvvo..", "oovvvvvvoo", "oVVVVVVVVo", "owWwWwWwWo", "owWwddwWwo", "owWwddwWwo", "oWWWddWWWo", "oooooooooo"] },
    medalla1: { p: { o: CONTORNO, r: "#c8553d", b: "#3b6fb6", y: "#f2c14e", Y: "#c48a1f", w: "#fff4c2" }, f: [
      ".orro.obbo", "..orrobbo.", "...orbbo..", "...oyyo...", "..oyyyyo..", ".oyywyyYo.", ".oywyyyYo.", ".oyyyyYYo.", "..oYYYYo..", "...oooo..."] },
    medalla2: { p: { o: CONTORNO, r: "#c8553d", b: "#3b6fb6", y: "#d6dbe0", Y: "#9aa3ad", w: "#ffffff" }, f: [
      ".orro.obbo", "..orrobbo.", "...orbbo..", "...oyyo...", "..oyyyyo..", ".oyywyyYo.", ".oywyyyYo.", ".oyyyyYYo.", "..oYYYYo..", "...oooo..."] },
    medalla3: { p: { o: CONTORNO, r: "#c8553d", b: "#3b6fb6", y: "#d99a5b", Y: "#a8693a", w: "#f3c99a" }, f: [
      ".orro.obbo", "..orrobbo.", "...orbbo..", "...oyyo...", "..oyyyyo..", ".oyywyyYo.", ".oywyyyYo.", ".oyyyyYYo.", "..oYYYYo..", "...oooo..."] },
    rectoria: { p: { o: CONTORNO, t: "#2f8f6f", T: "#226a52", w: "#e6f0e8", d: "#6b4226", s: "#fbf8f0" }, f: [
      "..........", "....oo....", "..oottoo..", "oottttttoo", "oTTTTTTTTo", "owwwwwwwwo", "ostststsso", "owwoddowwo", "owwoddowwo", "oooooooooo"] }
  };

  const cacheIconos = {};
  function iconoCanvas(nombre, escala) {
    const def = ICONOS[nombre];
    if (!def) return null;
    const k = nombre + "@" + escala;
    if (!cacheIconos[k]) cacheIconos[k] = escalar(desdeFilas(def.f.map((f) => f.padEnd(10, ".").slice(0, 10)), def.p).c, escala);
    return cacheIconos[k];
  }
  // Devuelve una <img> lista para insertar en la interfaz
  function icono(nombre, escala, clase) {
    const c = iconoCanvas(nombre, escala || 2);
    const img = document.createElement("img");
    img.className = "ico-px" + (clase ? " " + clase : "");
    img.alt = "";
    if (c) img.src = c.toDataURL();
    return img;
  }

  /* --------------------- letras pixeladas (letreros) --------------------- */

  // Mayúsculas de 5 píxeles de alto, dibujadas a mano para que se lean bien
  const LETRAS = {
    A: [".##.", "#..#", "####", "#..#", "#..#"], B: ["###.", "#..#", "###.", "#..#", "###."],
    C: [".###", "#...", "#...", "#...", ".###"], D: ["###.", "#..#", "#..#", "#..#", "###."],
    E: ["####", "#...", "###.", "#...", "####"], F: ["####", "#...", "###.", "#...", "#..."],
    G: [".###", "#...", "#.##", "#..#", ".###"], H: ["#..#", "#..#", "####", "#..#", "#..#"],
    I: ["###", ".#.", ".#.", ".#.", "###"],      J: ["..##", "...#", "...#", "#..#", ".##."],
    K: ["#..#", "#.#.", "##..", "#.#.", "#..#"], L: ["#...", "#...", "#...", "#...", "####"],
    M: ["#...#", "##.##", "#.#.#", "#...#", "#...#"], N: ["#..#", "##.#", "#.##", "#..#", "#..#"],
    O: [".##.", "#..#", "#..#", "#..#", ".##."], P: ["###.", "#..#", "###.", "#...", "#..."],
    Q: [".##.", "#..#", "#..#", "#.#.", ".#.#"], R: ["###.", "#..#", "###.", "#.#.", "#..#"],
    S: [".###", "#...", ".##.", "...#", "###."], T: ["###", ".#.", ".#.", ".#.", ".#."],
    U: ["#..#", "#..#", "#..#", "#..#", ".##."], V: ["#...#", "#...#", ".#.#.", ".#.#.", "..#.."],
    W: ["#...#", "#...#", "#.#.#", "##.##", "#...#"], X: ["#..#", "#..#", ".##.", "#..#", "#..#"],
    Y: ["#.#", "#.#", ".#.", ".#.", ".#."],      Z: ["####", "...#", ".##.", "#...", "####"],
    "0": [".##.", "#..#", "#..#", "#..#", ".##."], "1": [".#", "##", ".#", ".#", ".#"],
    "2": ["###.", "...#", ".##.", "#...", "####"], "3": ["###.", "...#", ".##.", "...#", "###."],
    "4": ["#..#", "#..#", "####", "...#", "...#"], "5": ["####", "#...", "###.", "...#", "###."],
    "6": [".##.", "#...", "###.", "#..#", ".##."], "7": ["####", "...#", "..#.", ".#..", ".#.."],
    "8": [".##.", "#..#", ".##.", "#..#", ".##."], "9": [".##.", "#..#", ".###", "...#", ".##."],
    ".": [".", ".", ".", ".", "#"], "-": ["...", "...", "###", "...", "..."], "!": ["#", "#", "#", ".", "#"],
    "?": ["###", "..#", ".##", "...", ".#."], ":": [".", "#", ".", "#", "."], "'": ["#", "#", ".", ".", "."],
    "_": ["....", "....", "....", "....", "####"], "Ü": ["#..#", "....", "#..#", "#..#", ".##."]
  };
  const TILDES = { "Á": "A", "É": "E", "Í": "I", "Ó": "O", "Ú": "U", "Ñ": "N" };

  function glifo(ch) {
    const base = TILDES[ch] || ch;
    const g = LETRAS[base];
    if (!g) return null;
    const ancho = Math.max(...g.map((f) => f.length), 1);
    return { g, ancho, tilde: TILDES[ch] ? (ch === "Ñ" ? "ñ" : "´") : null };
  }
  function anchoTexto(str) {
    let w = 0;
    [...String(str).toUpperCase()].forEach((ch, i) => { const gl = glifo(ch); w += (gl ? gl.ancho : 2) + (i ? 1 : 0); });
    return w;
  }
  // Escribe en un lienzo (x, y = esquina superior izquierda de las letras; las tildes van 2 px arriba)
  function texto(l, str, x, y, color, sombra) {
    let cx = x;
    [...String(str).toUpperCase()].forEach((ch) => {
      const gl = glifo(ch);
      if (!gl) { cx += 3; return; }
      const pintar = (dx, dy, col) => {
        gl.g.forEach((fila, fy) => [...fila].forEach((c, fx) => { if (c === "#") l.p(cx + fx + dx, y + fy + dy, col); }));
        if (gl.tilde === "´") l.p(cx + Math.ceil(gl.ancho / 2) + dx, y - 2 + dy, col);
        if (gl.tilde === "ñ") l.r(cx + dx, y - 2 + dy, gl.ancho, 1, col);
      };
      if (sombra) pintar(0, 1, sombra);
      pintar(0, 0, color);
      cx += gl.ancho + 1;
    });
    return cx - x - 1;
  }

  // Placa con un nombre escrito en letras pixeladas (para el mapa)
  function placa(nombre, propia) {
    const txt = String(nombre || "").toUpperCase().slice(0, 14);
    const w = Math.max(9, anchoTexto(txt) + 6);
    const l = lienzo(w + 2, 12);
    l.r(1, 1, w, 9, propia ? "#f2c14e" : "#2b4638");
    l.h(2, 1, w - 2, propia ? "#ffe49a" : "#3f6450");
    l.h(2, 9, w - 2, propia ? "#b8862a" : "#1f3329");
    texto(l, txt, 4, 3, propia ? "#2b1d24" : "#f6f1e3");
    // piquito que apunta al personaje
    l.r(Math.floor(w / 2), 10, 3, 1, propia ? "#b8862a" : "#1f3329");
    return contorno(l);
  }

  /* ------------------------------ fuente ------------------------------ */

  // Espera a que cargue la fuente pixelada antes de dibujar textos en el mapa
  function fuenteLista() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    const espera = new Promise((r) => setTimeout(r, 2500));
    return Promise.race([document.fonts.load('19px "Jersey 10"').catch(() => {}), espera]);
  }

  return { lienzo, escalar, contorno, desdeFilas, azar, mezclar, oscuro, claro, personaje, retrato, cara, escenaMenu, esMujer, icono, iconoCanvas, fuenteLista, texto, anchoTexto, placa, CONTORNO, ICONOS };
})();
