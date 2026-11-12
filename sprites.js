/* ==========================================================================
   GRÁFICOS — todo se dibuja por código (pixel art), sin imágenes externas.
   Para cambiar colores del personaje, editar PALETA_JUGADOR.
   ========================================================================== */

const PALETA_JUGADOR = {
  h: "#4a2f1d", // pelo
  s: "#f2c6a0", // piel
  e: "#222222", // ojos
  c: "#3d7dd8", // camisa
  p: "#3a3a4a", // pantalón
  b: "#1e1e1e"  // zapatos
};

// Cada fila es una línea de píxeles; "." es transparente.
const FRAMES_JUGADOR = {
  abajo1: [
    "....hhhh....", "...hhhhhh...", "..hhhhhhhh..", "..hssssssh..",
    "..sesssses..", "..ssssssss..", "...ssssss...", "..cccccccc..",
    ".sccccccccs.", ".sccccccccs.", "..cccccccc..", "..pppppppp..",
    "..ppp..ppp..", "..ppp..ppp..", "..bbb..bbb..", "............"
  ],
  abajo2: [
    "....hhhh....", "...hhhhhh...", "..hhhhhhhh..", "..hssssssh..",
    "..sesssses..", "..ssssssss..", "...ssssss...", "..cccccccc..",
    ".sccccccccs.", ".sccccccccs.", "..cccccccc..", "..pppppppp..",
    "..ppp..ppp..", "..bbb..ppp..", ".......bbb..", "............"
  ],
  arriba1: [
    "....hhhh....", "...hhhhhh...", "..hhhhhhhh..", "..hhhhhhhh..",
    "..hhhhhhhh..", "..shhhhhhs..", "...ssssss...", "..cccccccc..",
    ".sccccccccs.", ".sccccccccs.", "..cccccccc..", "..pppppppp..",
    "..ppp..ppp..", "..ppp..ppp..", "..bbb..bbb..", "............"
  ],
  arriba2: [
    "....hhhh....", "...hhhhhh...", "..hhhhhhhh..", "..hhhhhhhh..",
    "..hhhhhhhh..", "..shhhhhhs..", "...ssssss...", "..cccccccc..",
    ".sccccccccs.", ".sccccccccs.", "..cccccccc..", "..pppppppp..",
    "..ppp..ppp..", "..ppp..bbb..", "..bbb.......", "............"
  ],
  lado1: [
    "....hhhh....", "...hhhhhh...", "..hhhhhhhh..", "..hhhsssss..",
    "..hhssssess.", "..hsssssss..", "...ssssss...", "...cccccc...",
    "...ccccccs..", "...cccccc...", "...cccccc...", "...pppppp...",
    "...pp..pp...", "...pp..pp...", "...bb..bb...", "............"
  ],
  lado2: [
    "....hhhh....", "...hhhhhh...", "..hhhhhhhh..", "..hhhsssss..",
    "..hhssssess.", "..hsssssss..", "...ssssss...", "...cccccc...",
    "...ccccccs..", "...cccccc...", "...cccccc...", "...pppppp...",
    "..pp...pp...", "..pp....pp..", "..bb....bb..", "............"
  ]
};

const Graficos = (function () {
  const T = MAPA.tam;
  const color = (hex) => Phaser.Display.Color.HexStringToColor(hex).color;

  // Generador pseudoaleatorio con semilla, para que el pasto siempre se vea igual
  function azar(semilla) {
    return function () {
      semilla |= 0; semilla = (semilla + 0x6D2B79F5) | 0;
      let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pixelArt(scene, clave, filas, paleta, escala) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    filas.forEach((fila, y) => {
      [...fila].forEach((ch, x) => {
        if (!paleta[ch]) return;
        g.fillStyle(color(paleta[ch]), 1);
        g.fillRect(x * escala, y * escala, escala, escala);
      });
    });
    g.generateTexture(clave, filas[0].length * escala, filas.length * escala);
    g.destroy();
  }

  function salpicar(g, rnd, colores, cantidad, tam) {
    for (let i = 0; i < cantidad; i++) {
      g.fillStyle(color(colores[Math.floor(rnd() * colores.length)]), 1);
      g.fillRect(Math.floor(rnd() * (T / 2)) * 2, Math.floor(rnd() * (T / 2)) * 2, tam, tam);
    }
  }

  function baldosa(scene, clave, dibujar) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    dibujar(g);
    g.generateTexture(clave, T, T);
    g.destroy();
  }

  function pasto(g, semilla) {
    g.fillStyle(color("#6fbf5a"), 1).fillRect(0, 0, T, T);
    salpicar(g, azar(semilla), ["#5aa848", "#86d06f", "#62b24f"], 14, 2);
  }

  function crearTexturas(scene) {
    baldosa(scene, "pasto", (g) => pasto(g, 1));
    baldosa(scene, "pasto2", (g) => pasto(g, 7));

    baldosa(scene, "camino", (g) => {
      g.fillStyle(color("#e3c99a"), 1).fillRect(0, 0, T, T);
      salpicar(g, azar(3), ["#d4b682", "#ecd7ae", "#cfae78"], 12, 2);
    });

    baldosa(scene, "flores", (g) => {
      pasto(g, 11);
      const rnd = azar(5);
      ["#ff6b6b", "#ffd166", "#ffffff", "#ff6b6b", "#ffd166"].forEach((c) => {
        const x = 4 + Math.floor(rnd() * 24), y = 4 + Math.floor(rnd() * 24);
        g.fillStyle(color(c), 1).fillRect(x, y, 4, 4);
        g.fillStyle(color("#7a5c1e"), 1).fillRect(x + 1, y + 1, 2, 2);
      });
    });

    baldosa(scene, "arbol", (g) => {
      pasto(g, 13);
      g.fillStyle(0x000000, 0.18).fillEllipse(16, 28, 24, 7);
      g.fillStyle(color("#7a4b2a"), 1).fillRect(13, 18, 6, 10);
      g.fillStyle(color("#2e7d32"), 1).fillCircle(16, 13, 12);
      g.fillStyle(color("#43a047"), 1).fillCircle(14, 11, 9);
      g.fillStyle(color("#66bb6a"), 1).fillCircle(11, 8, 4);
    });

    baldosa(scene, "agua", (g) => {
      g.fillStyle(color("#4aa3df"), 1).fillRect(0, 0, T, T);
      const rnd = azar(9);
      for (let i = 0; i < 5; i++) {
        g.fillStyle(color("#8fd0f5"), 1).fillRect(Math.floor(rnd() * 24), Math.floor(rnd() * 30), 8, 2);
      }
    });

    // Flecha que señala el siguiente edificio
    const f = scene.make.graphics({ x: 0, y: 0, add: false });
    f.fillStyle(color("#3b3024"), 1).fillTriangle(0, 0, 20, 0, 10, 14);
    f.fillStyle(color("#f2c14e"), 1).fillTriangle(3, 2, 17, 2, 10, 11);
    f.generateTexture("flecha", 20, 14);
    f.destroy();

    // Personaje
    Object.entries(FRAMES_JUGADOR).forEach(([nombre, filas]) => {
      pixelArt(scene, "j-" + nombre, filas, PALETA_JUGADOR, 2);
    });
  }

  function dibujarEdificio(scene, ed) {
    const g = scene.add.graphics().setDepth(5);
    const x = ed.x * T, y = ed.y * T, w = ed.w * T, h = ed.h * T;
    const techoH = Math.round(h * 0.45);
    const techo = Phaser.Display.Color.HexStringToColor(ed.techo);
    const oscuro = techo.clone().darken(20).color;
    const borde = color("#3b3024");

    // sombra
    g.fillStyle(0x000000, 0.18).fillRect(x + 5, y + 8, w, h);
    // paredes
    g.fillStyle(color(ed.pared), 1).fillRect(x, y + techoH, w, h - techoH);
    g.lineStyle(2, borde, 1).strokeRect(x, y + techoH, w, h - techoH);
    // techo
    g.fillStyle(techo.color, 1).fillRect(x - 4, y, w + 8, techoH);
    g.lineStyle(1, oscuro, 0.6);
    for (let yy = y + 8; yy < y + techoH - 6; yy += 8) g.lineBetween(x - 4, yy, x + w + 4, yy);
    g.fillStyle(oscuro, 1).fillRect(x - 4, y + techoH - 6, w + 8, 6);
    g.lineStyle(2, borde, 1).strokeRect(x - 4, y, w + 8, techoH);

    // ventanas (en todas las columnas menos la de la puerta)
    const vy = y + techoH + 12;
    for (let cx = ed.x; cx < ed.x + ed.w; cx++) {
      if (cx === ed.puerta.x) continue;
      const vx = cx * T + 8;
      g.fillStyle(color("#a9d8f5"), 1).fillRect(vx, vy, 16, 16);
      g.lineStyle(2, borde, 1).strokeRect(vx, vy, 16, 16);
      g.lineBetween(vx + 8, vy, vx + 8, vy + 16);
      g.lineBetween(vx, vy + 8, vx + 16, vy + 8);
    }

    // puerta
    const px = ed.puerta.x * T + 6, ph = 32;
    g.fillStyle(color("#6b4226"), 1).fillRect(px, y + h - ph, 20, ph);
    g.lineStyle(2, borde, 1).strokeRect(px, y + h - ph, 20, ph);
    g.fillStyle(color("#f2c14e"), 1).fillRect(px + 14, y + h - ph / 2, 3, 3);

    // letrero
    const texto = scene.add.text(x + w / 2, y + techoH / 2 - 2, ed.etiqueta, {
      fontFamily: "Verdana, sans-serif", fontSize: "13px", fontStyle: "bold",
      color: "#ffffff", stroke: "#3b3024", strokeThickness: 4
    }).setOrigin(0.5).setDepth(6).setResolution(3);

    const insignia = scene.add.text(x + w - 2, y + 4, "", {
      fontFamily: "Verdana, sans-serif", fontSize: "14px", fontStyle: "bold",
      color: "#ffffff", stroke: "#3b3024", strokeThickness: 4
    }).setOrigin(1, 0).setDepth(6).setResolution(3);

    return { grafico: g, texto, insignia };
  }

  function dibujarFuente(scene) {
    // Busca el rectángulo de agua y le pone un borde de piedra
    let minX = 99, minY = 99, maxX = -1, maxY = -1;
    MAPA.filas.forEach((fila, y) => [...fila].forEach((ch, x) => {
      if (ch === "w") { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
    }));
    if (maxX < 0) return;
    const g = scene.add.graphics().setDepth(2);
    const x = minX * T, y = minY * T, w = (maxX - minX + 1) * T, h = (maxY - minY + 1) * T;
    g.lineStyle(6, color("#9e9e9e"), 1).strokeRect(x + 3, y + 3, w - 6, h - 6);
    g.lineStyle(2, color("#6d6d6d"), 1).strokeRect(x, y, w, h);
    g.fillStyle(color("#bdbdbd"), 1).fillCircle(x + w / 2, y + h / 2, 7);
    const chorro = scene.add.circle(x + w / 2, y + h / 2 - 2, 4, 0xffffff, 0.9).setDepth(3);
    scene.tweens.add({ targets: chorro, scale: 1.6, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });
  }

  return { crearTexturas, dibujarEdificio, dibujarFuente };
})();
