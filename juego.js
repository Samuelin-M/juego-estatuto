/* ==========================================================================
   MOTOR DEL JUEGO — mapa, movimiento, interfaz e interiores.
   No hace falta editar este archivo para cambiar la historia.
   ========================================================================== */

(function () {
  const T = MAPA.tam;
  const $ = (id) => document.getElementById(id);

  const estado = {
    puntaje: CONTENIDO.puntajeInicial,
    grado: "Recién graduado",
    anio: 0,
    articulos: [],
    completados: {},
    puntajeEntrada: 0,
    articulosEntrada: 0
  };

  let pueblo = null;          // la escena de Phaser
  let interiorAbierto = false;
  let jugando = false;

  const siguienteEdificio = () => MAPA.orden.find((id) => !estado.completados[id]);
  const nombreDe = (id) => CONTENIDO.edificios[id].nombre;
  const limitar = (n) => Math.max(0, Math.min(100, n));

  /* ---------------------------- Interfaz (HTML) ---------------------------- */

  function actualizarHud() {
    $("hud-puntaje").textContent = estado.puntaje;
    const barra = $("barra-relleno");
    barra.style.width = estado.puntaje + "%";
    barra.style.background = estado.puntaje >= 60 ? "var(--bien)" : estado.puntaje >= 40 ? "var(--acento)" : "var(--mal)";
    $("hud-grado").textContent = estado.grado;
    $("hud-anio").textContent = "Año " + estado.anio;
    $("hud-arts").textContent = "📜 " + estado.articulos.length;
    const sig = siguienteEdificio();
    $("hud-objetivo").textContent = sig ? "Objetivo: ve a " + nombreDe(sig) : "¡Recorrido completo!";
  }

  let temporizadorAviso;
  function aviso(msg) {
    const el = $("aviso");
    el.textContent = msg;
    el.classList.add("visible");
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => el.classList.remove("visible"), 2200);
  }

  function nodo(tag, clase, texto) {
    const n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto !== undefined) n.textContent = texto;
    return n;
  }

  /* ------------------------------ Interiores ------------------------------ */

  function abrirInterior(id) {
    const ed = CONTENIDO.edificios[id];
    interiorAbierto = true;
    estado.puntajeEntrada = estado.puntaje;
    estado.articulosEntrada = estado.articulos.length;
    $("int-icono").textContent = ed.icono || "🏠";
    $("int-nombre").textContent = ed.nombre;
    $("int-arts").textContent = ed.articulos || "";
    $("interior").classList.remove("oculto");
    mostrarEscena(id, ed.inicio);
  }

  function cerrarInterior() {
    $("interior").classList.add("oculto");
    interiorAbierto = false;
  }

  function mostrarEscena(idEd, idEscena) {
    const escena = CONTENIDO.edificios[idEd].escenas[idEscena];
    const cuerpo = $("int-cuerpo");
    cuerpo.innerHTML = "";
    if (!escena) {
      cuerpo.append(nodo("p", "", `No existe la escena "${idEscena}". Revisa contenido.js.`));
      const b = nodo("button", "btn-principal", "Volver al mapa");
      b.onclick = cerrarInterior;
      cuerpo.append(b);
      return;
    }
    if (escena.personaje) cuerpo.append(nodo("div", "personaje", escena.personaje));
    cuerpo.append(nodo("div", "globo", escena.texto));
    const ops = nodo("div", "opciones");
    escena.opciones.forEach((op) => {
      const b = nodo("button", "btn-opcion", op.texto);
      b.onclick = () => elegir(idEd, escena, op);
      ops.append(b);
    });
    cuerpo.append(ops);
    cuerpo.scrollTop = 0;
  }

  function elegir(idEd, escena, op) {
    const puntos = op.puntos || 0;
    estado.puntaje = limitar(estado.puntaje + puntos);
    if (op.cambios) {
      if (op.cambios.grado) estado.grado = op.cambios.grado;
      if (typeof op.cambios.anio === "number") estado.anio += op.cambios.anio;
    }
    let nuevo = false;
    if (op.articulo && !estado.articulos.includes(op.articulo)) {
      estado.articulos.push(op.articulo);
      nuevo = true;
    }
    actualizarHud();

    const cuerpo = $("int-cuerpo");
    cuerpo.innerHTML = "";
    if (escena.opciones.length > 1) cuerpo.append(nodo("p", "respuesta-elegida", op.texto));
    if (op.consecuencia) cuerpo.append(nodo("div", "globo", op.consecuencia));

    if (op.articulo) {
      const tarjeta = nodo("div", "tarjeta-articulo");
      tarjeta.append(nodo("div", "art-titulo", (nuevo ? "📜 Nuevo artículo · " : "📜 ") + op.articulo));
      tarjeta.append(nodo("p", "", op.explicacion || ""));
      let clase = "neutro", txt = "Sin cambio en el puntaje";
      if (puntos > 0) { clase = "positivo"; txt = `+${puntos} puntos`; }
      if (puntos < 0) { clase = "negativo"; txt = `${puntos} puntos`; }
      tarjeta.append(nodo("span", "efecto " + clase, txt));
      cuerpo.append(tarjeta);
    }

    const b = nodo("button", "btn-principal", "Continuar");
    b.onclick = () => avanzar(idEd, op);
    cuerpo.append(b);
    cuerpo.scrollTop = 0;
  }

  function avanzar(idEd, op) {
    let sig = op.siguiente;
    if (typeof sig === "function") sig = sig(estado);
    if (!sig || sig === "SALIR") return completar(idEd);
    if (sig === "REINTENTAR") {
      estado.puntaje = estado.puntajeEntrada;
      actualizarHud();
      return mostrarEscena(idEd, CONTENIDO.edificios[idEd].inicio);
    }
    mostrarEscena(idEd, sig);
  }

  function completar(idEd) {
    estado.completados[idEd] = true;
    cerrarInterior();
    actualizarHud();
    if (pueblo) pueblo.actualizarMarcadores();
    const sig = siguienteEdificio();
    if (sig) aviso("✅ ¡Listo! Ahora ve a " + nombreDe(sig));
    else setTimeout(pantallaFinal, 600);
  }

  /* -------------------------- Inicio y final -------------------------- */

  function pantallaInicio() {
    $("titulo").textContent = CONTENIDO.titulo;
    $("subtitulo").textContent = CONTENIDO.subtitulo;
    $("creditos").textContent = CONTENIDO.creditos;
    $("btn-jugar").onclick = () => {
      $("inicio").classList.add("oculto");
      $("hud").classList.remove("oculto");
      jugando = true;
      actualizarHud();
      if (pueblo) pueblo.ajustarZoom();
      aviso("Toca el mapa para caminar 👆");
    };
  }

  function pantallaFinal() {
    jugando = false;
    const aprobo = estado.puntaje >= 60;
    $("fin-icono").textContent = aprobo ? "🏆" : "📚";
    $("fin-titulo").textContent = aprobo ? "¡Carrera completada!" : "Terminaste, pero con dificultades";
    $("fin-texto").textContent =
      `Terminaste con ${estado.puntaje} puntos, en ${estado.grado}, después de ${estado.anio} años de servicio. ` +
      (aprobo ? "Cumpliste lo que exige el estatuto." : "Tu puntaje quedó por debajo del 60% que exige el estatuto.");
    const lista = $("fin-articulos");
    lista.innerHTML = "";
    estado.articulos.forEach((a) => lista.append(nodo("li", "", a)));
    $("btn-reiniciar").onclick = () => location.reload();
    $("final").classList.remove("oculto");
  }

  /* ------------------------------ El pueblo ------------------------------ */

  class Pueblo extends Phaser.Scene {
    constructor() { super("pueblo"); }

    create() {
      pueblo = this;
      Graficos.crearTexturas(this);

      // Baldosas y mapa de casillas caminables
      this.caminable = [];
      MAPA.filas.forEach((fila, y) => {
        this.caminable[y] = [];
        [...fila].forEach((ch, x) => {
          let clave = (x * 7 + y * 13) % 3 === 0 ? "pasto2" : "pasto";
          if (ch === ".") clave = "camino";
          if (ch === "f") clave = "flores";
          if (ch === "w") clave = "agua";
          if (ch === "T") clave = "arbol";
          this.add.image(x * T, y * T, clave).setOrigin(0).setDepth(0);
          this.caminable[y][x] = ".gf".includes(ch);
        });
      });

      // Árboles decorativos por encima del mapa, para que la barra superior no tape los edificios
      for (let y = -5; y < 0; y++) {
        for (let x = 0; x < MAPA.filas[0].length; x++) this.add.image(x * T, y * T, "arbol").setOrigin(0).setDepth(0);
      }

      Graficos.dibujarFuente(this);
      this.dibujos = {};
      MAPA.edificios.forEach((ed) => { this.dibujos[ed.id] = Graficos.dibujarEdificio(this, ed); });

      // Personaje
      this.crearAnimaciones();
      const ini = MAPA.inicio;
      this.casilla = { x: ini.x, y: ini.y };
      this.dir = "arriba";
      this.jugador = this.add.sprite(this.pxX(ini.x), this.pxY(ini.y), "j-arriba1").setOrigin(0.5, 1).setDepth(10);
      this.sombra = this.add.ellipse(this.jugador.x, this.jugador.y - 2, 18, 6, 0x000000, 0.25).setDepth(9);
      this.camino = [];
      this.moviendo = false;

      // Flecha del objetivo
      this.flecha = this.add.image(0, 0, "flecha").setDepth(20);
      this.rebote = { v: 0 };
      this.tweens.add({ targets: this.rebote, v: -7, duration: 420, yoyo: true, repeat: -1, ease: "Sine.inOut" });
      this.actualizarMarcadores();

      // Cámara
      const W = MAPA.filas[0].length * T, H = MAPA.filas.length * T;
      this.cameras.main.setBounds(0, 0, W, H);
      this.cameras.main.startFollow(this.jugador, true, 0.15, 0.15);
      this.ajustarZoom();
      this.scale.on("resize", () => this.ajustarZoom());

      // Controles
      this.input.on("pointerup", (p) => this.alTocar(p));
      this.teclas = this.input.keyboard.addKeys("UP,DOWN,LEFT,RIGHT,W,A,S,D,SPACE,ENTER");
    }

    pxX(x) { return x * T + T / 2; }
    pxY(y) { return y * T + T - 2; }

    ajustarZoom() {
      const w = this.scale.width, h = this.scale.height;
      const W = MAPA.filas[0].length * T, H = MAPA.filas.length * T;
      let z = Math.min(w / (11 * T), h / (13 * T));
      z = Phaser.Math.Clamp(z, 1, 2.5);
      z = Math.max(z, w / W, h / H); // que el mapa siempre llene la pantalla
      this.cameras.main.setZoom(z);
      // Margen superior del tamaño de la barra (HUD) para que no tape la primera fila de edificios
      const hud = document.getElementById("hud");
      const altoHud = hud && hud.offsetHeight ? hud.offsetHeight : 110;
      const extra = Math.min(5 * T, Math.ceil(altoHud / z));
      this.cameras.main.setBounds(0, -extra, W, H + extra);
      // Centra al personaje en el espacio visible debajo de la barra
      this.cameras.main.setFollowOffset(0, altoHud / 2 / z);
    }

    crearAnimaciones() {
      ["abajo", "arriba", "lado"].forEach((d) => {
        if (this.anims.exists("caminar-" + d)) return;
        this.anims.create({
          key: "caminar-" + d,
          frames: [{ key: "j-" + d + "1" }, { key: "j-" + d + "2" }],
          frameRate: 8,
          repeat: -1
        });
      });
    }

    edificioEn(x, y) {
      return MAPA.edificios.find((e) => x >= e.x && x < e.x + e.w && y >= e.y && y < e.y + e.h);
    }
    edificioConPuerta(x, y) {
      return MAPA.edificios.find((e) => e.puerta.x === x && e.puerta.y === y);
    }
    esCaminable(x, y) {
      return y >= 0 && y < this.caminable.length && x >= 0 && x < this.caminable[0].length && this.caminable[y][x];
    }

    // Búsqueda en anchura: el camino más corto en casillas
    buscarRuta(desde, hasta) {
      if (desde.x === hasta.x && desde.y === hasta.y) return [];
      const clave = (p) => p.x + "," + p.y;
      const previo = new Map([[clave(desde), null]]);
      const cola = [desde];
      while (cola.length) {
        const p = cola.shift();
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const q = { x: p.x + dx, y: p.y + dy };
          const k = clave(q);
          if (previo.has(k) || !this.esCaminable(q.x, q.y)) continue;
          previo.set(k, p);
          if (q.x === hasta.x && q.y === hasta.y) {
            const ruta = [q];
            let r = p;
            while (r && clave(r) !== clave(desde)) { ruta.unshift(r); r = previo.get(clave(r)); }
            return ruta;
          }
          cola.push(q);
        }
      }
      return null;
    }

    alTocar(p) {
      if (!jugando || interiorAbierto) return;
      if (Phaser.Math.Distance.Between(p.downX, p.downY, p.upX, p.upY) > 15) return;
      const wp = this.cameras.main.getWorldPoint(p.x, p.y);
      const tx = Math.floor(wp.x / T), ty = Math.floor(wp.y / T);
      const ed = this.edificioEn(tx, ty);
      const meta = ed ? ed.puerta : { x: tx, y: ty };

      if (!this.esCaminable(meta.x, meta.y)) { this.marca(wp.x, wp.y, false); return; }

      if (!this.moviendo && this.casilla.x === meta.x && this.casilla.y === meta.y) {
        const edPuerta = this.edificioConPuerta(meta.x, meta.y);
        if (edPuerta) this.intentarEntrar(edPuerta);
        return;
      }
      const ruta = this.buscarRuta(this.casilla, meta);
      if (!ruta) { this.marca(wp.x, wp.y, false); return; }
      this.marca(this.pxX(meta.x), meta.y * T + T / 2, true);
      this.camino = ruta;
      if (!this.moviendo) this.paso();
    }

    marca(x, y, ok) {
      const c = this.add.circle(x, y, 9, ok ? 0xffffff : 0xe87a6a, 0.6).setDepth(8);
      this.tweens.add({ targets: c, scale: 0.2, alpha: 0, duration: 450, onComplete: () => c.destroy() });
    }

    paso() {
      if (!this.camino.length) {
        this.moviendo = false;
        this.jugador.anims.stop();
        this.jugador.setTexture("j-" + this.dir + "1");
        const ed = this.edificioConPuerta(this.casilla.x, this.casilla.y);
        if (ed) this.intentarEntrar(ed);
        return;
      }
      const sig = this.camino.shift();
      const dx = sig.x - this.casilla.x, dy = sig.y - this.casilla.y;
      this.dir = dy > 0 ? "abajo" : dy < 0 ? "arriba" : "lado";
      this.jugador.setFlipX(this.dir === "lado" && dx < 0);
      this.jugador.anims.play("caminar-" + this.dir, true);
      this.casilla = sig;
      this.moviendo = true;
      this.tweens.add({
        targets: this.jugador, x: this.pxX(sig.x), y: this.pxY(sig.y),
        duration: 150, onComplete: () => this.paso()
      });
    }

    intentarEntrar(ed) {
      const sig = siguienteEdificio();
      if (estado.completados[ed.id]) { aviso("✅ Ya pasaste por " + nombreDe(ed.id)); return; }
      if (ed.id !== sig) { aviso("🔒 Primero ve a " + nombreDe(sig)); return; }
      this.jugador.setTexture("j-arriba1");
      this.dir = "arriba";
      abrirInterior(ed.id);
    }

    actualizarMarcadores() {
      const sig = siguienteEdificio();
      MAPA.edificios.forEach((ed) => {
        const d = this.dibujos[ed.id];
        if (estado.completados[ed.id]) { d.insignia.setText("✓").setColor("#7bc98f"); }
        else if (ed.id === sig) { d.insignia.setText(""); }
        else { d.insignia.setText("🔒").setColor("#ffffff"); }
      });
      const ed = MAPA.edificios.find((e) => e.id === sig);
      this.flecha.setVisible(!!ed);
      if (ed) this.flechaBase = { x: this.pxX(ed.puerta.x), y: (ed.y + ed.h) * T - 44 };
    }

    update() {
      this.sombra.setPosition(this.jugador.x, this.jugador.y - 2);
      if (this.flechaBase) this.flecha.setPosition(this.flechaBase.x, this.flechaBase.y + this.rebote.v);

      if (!jugando || interiorAbierto || this.moviendo) return;
      const k = this.teclas;
      let dx = 0, dy = 0;
      if (k.LEFT.isDown || k.A.isDown) dx = -1;
      else if (k.RIGHT.isDown || k.D.isDown) dx = 1;
      else if (k.UP.isDown || k.W.isDown) dy = -1;
      else if (k.DOWN.isDown || k.S.isDown) dy = 1;
      if (dx || dy) {
        const sig = { x: this.casilla.x + dx, y: this.casilla.y + dy };
        if (this.esCaminable(sig.x, sig.y)) { this.camino = [sig]; this.paso(); }
        else {
          // si choca con la pared de un edificio desde su puerta, intenta entrar
          this.dir = dy > 0 ? "abajo" : dy < 0 ? "arriba" : "lado";
          this.jugador.setFlipX(dx < 0);
          this.jugador.setTexture("j-" + this.dir + "1");
        }
      }
      if (Phaser.Input.Keyboard.JustDown(k.SPACE) || Phaser.Input.Keyboard.JustDown(k.ENTER)) {
        const ed = this.edificioConPuerta(this.casilla.x, this.casilla.y);
        if (ed) this.intentarEntrar(ed);
      }
    }
  }

  /* ------------------------------ Arranque ------------------------------ */

  pantallaInicio();
  window.juego = new Phaser.Game({
    type: Phaser.AUTO,
    parent: "juego",
    backgroundColor: "#1d2b2a",
    pixelArt: true,
    scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },
    scene: [Pueblo]
  });

  // Para pruebas automáticas
  window.__estado = estado;
})();
