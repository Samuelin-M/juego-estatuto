/* ==========================================================================
   MULTIJUGADOR EN EL MAPA
   Hasta 3 jugadores en el mismo pueblo, cada uno con un personaje distinto.
   Compiten por completar los procesos (contenido.js → multijugador.procesos)
   respondiendo preguntas: cuenta el acierto y la rapidez. Al final, podio.

   La conexión entre celulares usa red.js (Supabase Realtime, ver config.js).
   No hace falta editar este archivo para cambiar preguntas o procesos.
   ========================================================================== */

(function () {
  const C = CONTENIDO;
  const M = C.multijugador;
  const T = MAPA.tam;
  const IND = Object.keys(C.indicadores);
  const $ = (id) => document.getElementById(id);
  const PREFIJO = "carrera-mapa-";
  const MEDALLAS = ["medalla1", "medalla2", "medalla3"];
  // Puntos de salida separados para que los nombres no se monten
  const INICIOS = [{ x: 9, y: 22 }, { x: 6, y: 20 }, { x: 13, y: 20 }];
  const ico = (nombre, escala) => Pixel.icono(nombre, escala || 2);
  const DESCONECTADO_MS = 12000;

  /* ============================ estado ============================ */

  const guardar = (k, v) => { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } };
  const leer = (k) => { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } };
  const nombreGuardado = (() => { try { return localStorage.getItem("cd-nombre") || ""; } catch (e) { return ""; } })();

  const yo = {
    id: "j" + Math.random().toString(36).slice(2, 10),
    nombre: nombreGuardado, sala: null, anf: false, unido: 0, pj: null,
    x: 9, y: 22, dir: "arriba", proc: 0, puntos: 0, bonoOp: 0, oportunidad: null,
    aciertos: 0, termino: false, tiempo: 0, fase: "inicio", ind: null, cartasTomadas: [], hechas: []
  };
  const otros = {};        // id → último estado recibido de cada jugador
  let red = null;
  let partida = null;      // { semilla, ids, nombres, t0, plan }
  let pueblo = null;
  let interiorAbierto = false;
  let jugando = false;
  let podioMostrado = false;
  let respuestasConcurso = {};
  let relojPregunta = null;

  /* ============================ utilidades ============================ */

  const lim = (n) => Math.max(0, Math.min(100, Math.round(n)));
  function nodo(tag, clase, texto) {
    const n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto !== undefined && texto !== null) n.textContent = texto;
    return n;
  }
  function boton(texto, clase, fn) { const b = nodo("button", clase || "btn-opcion", texto); b.onclick = fn; return b; }
  function con(tag, clase, ...hijos) {
    const n = nodo(tag, clase);
    hijos.forEach((h) => { if (h !== null && h !== undefined && h !== false) n.append(typeof h === "object" ? h : document.createTextNode(String(h))); });
    return n;
  }
  // Botón que solo responde al primer toque (evita dobles toques en el celular)
  function botonUnaVez(texto, clase, fn) {
    const b = nodo("button", clase || "btn-opcion", texto);
    b.onclick = () => { if (b.dataset.usado) return; b.dataset.usado = "1"; b.disabled = true; fn(); };
    return b;
  }
  const pjDe = (id) => C.personajes.find((p) => p.id === id);
  const NOMBRES = { secretaria: "la Secretaría", colegio: "el Colegio", universidad: "la Universidad", rectoria: "la Rectoría" };
  const nombreEdificio = (id) => NOMBRES[id] || MAPA.edificios.find((e) => e.id === id).etiqueta;
  const mmss = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  const azarConSemilla = Pixel.azar;

  let tAviso;
  function aviso(msg, icono) {
    const el = $("aviso");
    el.innerHTML = "";
    if (icono) el.append(ico(icono));
    el.append(nodo("span", "", msg));
    el.classList.add("visible");
    clearTimeout(tAviso);
    tAviso = setTimeout(() => el.classList.remove("visible"), 2600);
  }

  function mostrarPantalla(visible) { $("mj-pantalla").classList.toggle("oculto", !visible); }
  function caja() { const c = $("mj-caja"); c.innerHTML = ""; $("mj-pantalla").scrollTop = 0; return c; }

  /* ============================ preguntas ============================ */

  // Plan de preguntas de la partida: sale de la semilla, así todos reciben las
  // mismas preguntas en el mismo orden (sin repetir dentro de cada banco).
  function planPreguntas(semilla) {
    const rnd = azarConSemilla(semilla ^ 0x5bd1e995);
    const usadas = {};
    return M.procesos.map((p) => p.preguntas.map((banco) => {
      const it = Comun.sacar(banco, (usadas[banco] = usadas[banco] || []), p.concurso ? 1 : null, rnd);
      return it ? { banco, indice: it.indice } : { banco, indice: -1 };
    }));
  }

  const QUIEN = {
    aptitudes: ["Prueba de aptitudes", "funcionaria"], psicotecnica: ["Prueba psicotécnica", "funcionaria"],
    entrevista: ["Jurado de la entrevista", "jurado"], estatuto: ["Pregunta del estatuto", "funcionaria"]
  };
  function elemento(ref) {
    const item = Comun.item(ref.banco, ref.indice);
    const situacion = !!(item && item.opciones && item.opciones.some((o) => o.efectos));
    let quien = QUIEN[ref.banco] || [null, "funcionaria"];
    if (ref.banco === "colegio" && item) quien = [item.personaje, "estudiante"];
    if (ref.banco === "cartas" && item) quien = ["Carta " + (item.tipo || "").toLowerCase(), "funcionaria"];
    return { item, situacion, quien: quien[0], npc: quien[1] };
  }

  /* ============================ red ============================ */

  function estadoPublico() {
    return {
      t: "j", id: yo.id, nombre: yo.nombre, pj: yo.pj, anf: yo.anf, unido: yo.unido,
      x: yo.x, y: yo.y, dir: yo.dir, proc: yo.proc, puntos: yo.puntos, bonoOp: yo.bonoOp,
      oportunidad: yo.oportunidad, aciertos: yo.aciertos, termino: yo.termino, tiempo: yo.tiempo, fase: yo.fase,
      // datos de la partida, por si a alguien no le llegó el aviso de inicio
      ini: partida ? { semilla: partida.semilla, ids: partida.ids, nombres: partida.nombres } : null
    };
  }
  function enviarEstado() { if (red) red.enviar(estadoPublico()); guardarProgreso(); }
  let ultimoEnvio = 0, tEnvio = null;
  function enviarMovimiento() {
    const ahora = Date.now();
    clearTimeout(tEnvio);
    if (ahora - ultimoEnvio > 100) { ultimoEnvio = ahora; enviarEstado(); }
    else tEnvio = setTimeout(() => { ultimoEnvio = Date.now(); enviarEstado(); }, 110);
  }

  function conectar() {
    if (red) red.cerrar();
    red = Red.conectar(yo.sala, recibir, (e) => {
      if (e === "conectado") { enviarEstado(); red.enviar({ t: "hola", id: yo.id }); }
      if (e === "error" && yo.fase !== "inicio") aviso("Problema de conexión, reintentando…", "reloj");
    }, PREFIJO);
  }

  function recibir(m) {
    if (!m || !m.t || m.id === yo.id) return;
    if (m.t === "j") {
      const nuevo = !otros[m.id];
      otros[m.id] = Object.assign(otros[m.id] || {}, m, { visto: Date.now() });
      if (nuevo) enviarEstado();
      if (yo.fase === "sala" && m.ini && m.ini.ids.includes(yo.id)) { iniciarPartida(m.ini); return; }
      resolverConflictoPersonaje();
      if (yo.fase === "sala") pantallaSala();
      if (jugando || yo.fase === "fin") { if (pueblo) pueblo.actualizarOtro(otros[m.id]); actualizarHud(); revisarFin(); }
      if (yo.fase === "fin" && !podioMostrado) pantallaEspera();
    } else if (m.t === "hola") {
      enviarEstado();
    } else if (m.t === "inicio") {
      if (yo.fase === "sala") iniciarPartida(m);
    } else if (m.t === "fin") {
      if (partida) mostrarPodio();
    } else if (m.t === "salir") {
      delete otros[m.id];
      if (pueblo) pueblo.quitarOtro(m.id);
      if (yo.fase === "sala") pantallaSala();
      revisarFin();
    }
  }

  const conectado = (o) => Date.now() - (o.visto || 0) < DESCONECTADO_MS;
  function enSala() {
    const lista = [estadoPublico()].concat(Object.values(otros).filter((o) => conectado(o) && o.fase === "sala"));
    return lista.sort((a, b) => a.unido - b.unido || (a.id < b.id ? -1 : 1));
  }
  function anfitrion() {
    const lista = enSala();
    return lista.find((j) => j.anf) || lista[0];
  }

  function resolverConflictoPersonaje() {
    if (!yo.pj || yo.fase !== "sala") return;
    const rival = Object.values(otros).find((o) => conectado(o) && o.fase === "sala" && o.pj === yo.pj &&
      (o.unido < yo.unido || (o.unido === yo.unido && o.id < yo.id)));
    if (rival) { yo.pj = null; aviso(`${rival.nombre} ya eligió ese personaje`); enviarEstado(); }
  }

  function guardarProgreso() {
    if (!partida || !yo.sala) return;
    guardar("cd-mj", { yo, partida: { semilla: partida.semilla, ids: partida.ids, nombres: partida.nombres, transcurrido: Date.now() - partida.t0 } });
  }

  /* ============================ pantallas de sala ============================ */

  function pantallaInicio(mensaje) {
    yo.fase = "inicio";
    mostrarPantalla(true);
    const c = caja();
    const params = new URLSearchParams(location.search);
    const esc = nodo("div", "escena-menu");
    esc.append(Pixel.escenaMenu(C.personajes, 3));
    c.append(esc);
    c.append(nodo("h1", "", "Multijugador"));
    c.append(nodo("div", "indicacion", C.introduccion.indicacion));
    c.append(nodo("p", "suave centrado", `Hasta ${M.maxJugadores} jugadores en el mismo pueblo. Cada uno elige un personaje y compiten por completar los procesos del estatuto: gana quien responda mejor y más rápido.`));
    if (mensaje) c.append(nodo("div", "alerta", mensaje));
    if (Red.modo() !== "supabase") c.append(nodo("div", "alerta", "Sin servidor configurado en config.js: solo funciona entre pestañas de este mismo navegador."));

    c.append(nodo("label", "etiqueta", "Tu nombre"));
    const nombre = nodo("input", "campo");
    nombre.maxLength = 16; nombre.placeholder = "Ej: Laura"; nombre.value = yo.nombre || "";
    nombre.autocomplete = "off";
    c.append(nombre);

    const leerNombre = () => {
      const n = nombre.value.trim();
      if (!n) { pantallaInicio("Escribe tu nombre."); return null; }
      yo.nombre = n;
      try { localStorage.setItem("cd-nombre", n); } catch (e) { /* nada */ }
      return n;
    };

    const codigoUrl = (params.get("sala") || "").toUpperCase().slice(0, 4);
    if (!codigoUrl) {
      c.append(boton("Crear una sala nueva", "btn-principal btn-grande", () => {
        if (!leerNombre()) return;
        const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        entrarSala(Array.from({ length: 4 }, () => letras[Math.floor(Math.random() * letras.length)]).join(""), true);
      }));
      c.append(nodo("div", "separador", "o únete a la de un compañero"));
    }
    c.append(nodo("label", "etiqueta", "Código de la sala"));
    const codigo = nodo("input", "campo codigo");
    codigo.maxLength = 4; codigo.placeholder = "ABCD"; codigo.autocapitalize = "characters"; codigo.autocomplete = "off";
    codigo.value = codigoUrl;
    c.append(codigo);
    c.append(boton("Unirme", codigoUrl ? "btn-principal btn-grande" : "btn-secundario", () => {
      if (!leerNombre()) return;
      const s = codigo.value.trim().toUpperCase();
      if (!/^[A-Z]{4}$/.test(s)) return pantallaInicio("El código tiene 4 letras.");
      entrarSala(s, false);
    }));
    const volver = nodo("a", "btn-secundario btn-enlace", "Volver al menú");
    volver.href = "index.html";
    c.append(volver);
  }

  let vigiaSala = null;
  function entrarSala(codigo, crear) {
    yo.sala = codigo;
    yo.anf = crear;
    yo.unido = Date.now();
    yo.pj = null;
    yo.fase = "sala";
    conectar();
    pantallaSala();
    clearTimeout(vigiaSala);
    if (!crear) vigiaSala = setTimeout(() => {
      if (yo.fase === "sala" && !Object.values(otros).some(conectado)) {
        salirSala();
        pantallaInicio(`No encontramos la sala ${codigo}. Revisa el código: quien la creó debe tenerla abierta.`);
      }
    }, 9000);
  }

  function salirSala() {
    if (red) { red.enviar({ t: "salir", id: yo.id }); setTimeout(() => red && red.cerrar(), 300); }
    Object.keys(otros).forEach((k) => delete otros[k]);
    yo.fase = "inicio";
  }

  function urlSala() {
    const u = new URL("multijugador.html", location.href);
    u.search = "?sala=" + yo.sala;
    return u.href;
  }

  function pantallaSala() {
    if (yo.fase !== "sala") return;
    mostrarPantalla(true);
    const lista = enSala();
    const pos = lista.findIndex((j) => j.id === yo.id);
    if (pos >= M.maxJugadores) { salirSala(); return pantallaInicio(`La sala ${yo.sala} ya tiene ${M.maxJugadores} jugadores.`); }
    const yaEmpezo = Object.values(otros).some((o) => conectado(o) && (o.fase === "juego" || o.fase === "fin") && !(o.ini && o.ini.ids.includes(yo.id)));
    if (yaEmpezo) { salirSala(); return pantallaInicio(`La partida de la sala ${yo.sala} ya empezó.`); }

    const host = anfitrion();
    const soyHost = host && host.id === yo.id;
    const c = caja();
    c.append(nodo("h2", "", "Sala de espera"));
    const cab = nodo("div", "sala-cabecera");
    const info = nodo("div", "sala-info");
    info.append(nodo("div", "suave", "Código de la sala"));
    info.append(nodo("div", "codigo-grande", yo.sala));
    const compartir = boton("Compartir enlace", "btn-secundario", async () => {
      const url = urlSala();
      try {
        if (navigator.share) await navigator.share({ title: "Carrera Docente", text: `Únete a mi sala ${yo.sala}`, url });
        else { await navigator.clipboard.writeText(url); aviso("Enlace copiado", "check"); }
      } catch (e) { /* el usuario canceló */ }
    });
    info.append(compartir);
    cab.append(info);
    const qr = nodo("div", "qr");
    try { const q = qrcode(0, "M"); q.addData(urlSala()); q.make(); qr.innerHTML = q.createSvgTag({ cellSize: 4, margin: 2, scalable: true }); } catch (e) { qr.remove(); }
    cab.append(qr);
    c.append(cab);

    c.append(nodo("div", "etiqueta", `Jugadores (${lista.length}/${M.maxJugadores})`));
    const ul = nodo("ul", "lista-jugadores");
    lista.forEach((j) => {
      const li = nodo("li", j.id === yo.id ? "yo" : "");
      const p = j.pj ? pjDe(j.pj) : null;
      li.append(con("span", "lj-icono", p ? Pixel.cara(p, 2) : ico("reloj")));
      li.append(nodo("span", "lj-nombre", j.nombre + (j.id === yo.id ? " (tú)" : "")));
      li.append(nodo("span", "lj-pj", p ? p.nombre : "eligiendo…"));
      if (host && j.id === host.id) li.append(nodo("span", "chip", "anfitrión"));
      ul.append(li);
    });
    c.append(ul);

    c.append(nodo("div", "etiqueta", C.introduccion.seleccion || "Escoge un personaje"));
    // qué significa cada indicador
    const leyenda = nodo("ul", "leyenda-ind");
    IND.forEach((k) => leyenda.append(con("li", "", ico(k), con("span", "", con("b", "", C.indicadores[k].nombre), ": " + C.indicadores[k].descripcion))));
    c.append(leyenda);
    const grid = nodo("div", "lista-personajes compacta");
    C.personajes.forEach((pj) => {
      const dueno = lista.find((j) => j.pj === pj.id && j.id !== yo.id);
      const t = nodo("button", "tarjeta-personaje" + (yo.pj === pj.id ? " elegido" : ""));
      const ret = nodo("div", "pj-retrato");
      ret.append(Pixel.retrato(pj, 2));
      t.append(con("div", "pj-cabecera", ret, con("div", "", nodo("div", "pj-nombre", pj.nombre), nodo("div", "pj-perfil", pj.perfil))));
      const inds = nodo("div", "pj-inds");
      IND.forEach((k) => {
        const b = nodo("div", "barra");
        const r = nodo("div", "barra-relleno ind-" + k);
        r.style.width = pj.indicadores[k] + "%";
        b.append(r);
        inds.append(con("div", "pj-ind-cab", ico(k), nodo("span", "pj-ind-nombre", C.indicadores[k].nombre), b, nodo("span", "ind-valor", pj.indicadores[k])));
      });
      t.append(inds);
      if (dueno) { t.disabled = true; t.append(nodo("p", "pj-nota", `Elegido por ${dueno.nombre}`)); }
      else if (yo.pj === pj.id) t.append(nodo("p", "pj-nota", "Tu personaje"));
      t.onclick = () => { yo.pj = pj.id; enviarEstado(); pantallaSala(); };
      grid.append(t);
    });
    c.append(grid);

    if (soyHost) {
      const listos = lista.every((j) => j.pj);
      const n = lista.length;
      const b = boton(listos ? (n > 1 ? `Empezar partida (${n} jugadores)` : "Empezar solo (para probar)") : "Esperando a que todos elijan personaje…", "btn-principal btn-grande", empezarComoHost);
      b.disabled = !listos;
      const fija = nodo("div", "barra-fija");
      fija.append(b);
      c.append(fija);
    } else {
      c.append(con("p", "espera-host", ico("reloj"), ` Esperando a que ${host ? host.nombre : "el anfitrión"} empiece la partida…`));
    }
    c.append(boton("Salir de la sala", "btn-secundario", () => { salirSala(); pantallaInicio(); }));
  }

  function empezarComoHost() {
    const lista = enSala();
    if (!lista.every((j) => j.pj)) return;
    const m = {
      t: "inicio", id: yo.id,
      semilla: Math.floor(Math.random() * 1e9),
      ids: lista.map((j) => j.id),
      nombres: Object.fromEntries(lista.map((j) => [j.id, j.nombre]))
    };
    red.enviar(m);
    iniciarPartida(m);
  }

  /* ============================ partida ============================ */

  function iniciarPartida(m, restaurar) {
    if (!m.ids.includes(yo.id)) { salirSala(); return pantallaInicio("La partida empezó sin ti. Pide que creen una sala nueva."); }
    clearTimeout(vigiaSala);
    partida = { semilla: m.semilla, ids: m.ids, nombres: m.nombres, t0: Date.now() - (restaurar ? restaurar.transcurrido : 0), plan: planPreguntas(m.semilla) };
    if (!restaurar) {
      const ini = INICIOS[m.ids.indexOf(yo.id)] || INICIOS[0];
      Object.assign(yo, { fase: "juego", proc: 0, puntos: 0, bonoOp: 0, oportunidad: null, aciertos: 0, termino: false, tiempo: 0, x: ini.x, y: ini.y, dir: "arriba", cartasTomadas: [], hechas: [] });
      yo.ind = Object.assign({}, pjDe(yo.pj).indicadores);
    }
    respuestasConcurso = {};
    mostrarPantalla(false);
    $("hud").classList.remove("oculto");
    jugando = yo.fase === "juego";
    if (pueblo) pueblo.empezar();
    actualizarHud();
    enviarEstado();
    if (jugando) aviso("¡Arranca la carrera! Toca el mapa para caminar", "llegada");
    else pantallaEspera();
  }

  function procesoActual() { return M.procesos[yo.proc]; }

  function objetivoTexto() {
    const p = procesoActual();
    if (!p) return "¡Terminaste todos los procesos!";
    if (p.tipo === "cartas") return `Recoge las cartas (${p.preguntas.length - yo.cartasTomadas.length}) · ${p.nombre}`;
    return `Ve a ${nombreEdificio(p.edificio)}: ${p.nombre}`;
  }

  function jugadoresPartida() {
    if (!partida) return [];
    return partida.ids.map((id) => (id === yo.id ? Object.assign(estadoPublico(), { visto: Date.now() }) : otros[id]))
      .filter(Boolean)
      .map((j) => Object.assign({}, j, { nombre: j.nombre || partida.nombres[j.id] }));
  }

  let hudDe = null;
  function actualizarHud() {
    if (!partida) return;
    if (hudDe !== yo.pj && yo.pj) {
      hudDe = yo.pj;
      $("hud-avatar").innerHTML = "";
      $("hud-avatar").append(Pixel.cara(pjDe(yo.pj), 3));
    }
    $("hud-objetivo").textContent = objetivoTexto();
    $("hud-puntos-t").textContent = `${yo.puntos} pts`;
    $("hud-proceso-t").textContent = `${Math.min(yo.proc + 1, M.procesos.length)}/${M.procesos.length}` + (yo.termino ? " listo" : "");
    $("hud-reloj-t").textContent = mmss(yo.termino ? yo.tiempo : Date.now() - partida.t0);
    const rk = $("hud-ranking");
    rk.innerHTML = "";
    jugadoresPartida().sort((a, b) => b.puntos - a.puntos).forEach((j, i) => {
      const p = pjDe(j.pj);
      const ch = nodo("span", "chip rk" + (j.id === yo.id ? " yo" : "") + (conectado(j) ? "" : " fuera"));
      if (MEDALLAS[i]) ch.append(ico(MEDALLAS[i]));
      if (p) ch.append(Pixel.cara(p, 1));
      ch.append(nodo("span", "", `${j.nombre} ${j.puntos} · ${j.termino ? "listo" : Math.min(j.proc + 1, M.procesos.length) + "/" + M.procesos.length}`));
      rk.append(ch);
    });
  }

  setInterval(() => {
    if (!partida) return;
    actualizarHud();
    if (jugando || yo.fase === "fin") enviarEstado();     // latido
    if (pueblo) Object.values(otros).forEach((o) => { if (!conectado(o)) pueblo.quitarOtro(o.id); });
    if (!podioMostrado && Date.now() - partida.t0 > M.duracionMaximaMin * 60000) {
      mostrarPodio();
    }
    revisarFin();
  }, 2500);

  /* -------------------------- panel de procesos -------------------------- */

  function abrirPanel(icono, nombre, sub) {
    interiorAbierto = true;
    $("aviso").classList.remove("visible");
    $("int-icono").innerHTML = "";
    $("int-icono").append(ico(icono, 3));
    $("int-nombre").textContent = nombre;
    $("int-arts").textContent = sub || "";
    $("interior").classList.remove("oculto");
    return limpiarCuerpo();
  }
  function limpiarCuerpo() { const c = $("int-cuerpo"); c.innerHTML = ""; c.scrollTop = 0; $("int-pie").innerHTML = ""; return c; }
  // Botón del pie del panel (siempre visible); solo responde al primer toque
  function accion(texto, fn, clase) {
    const b = nodo("button", clase || "btn-principal", texto);
    b.onclick = () => {
      if (b.disabled) return;
      $("int-pie").querySelectorAll("button").forEach((x) => { x.disabled = true; });
      fn();
    };
    $("int-pie").append(b);
    return b;
  }
  function cerrarPanel() {
    clearInterval(relojPregunta);
    $("interior").classList.add("oculto");
    interiorAbierto = false;
    actualizarHud();
    if (pueblo) pueblo.actualizarMarcadores();
  }

  function entrarEdificio(id) {
    if (!jugando || interiorAbierto) return;
    const p = procesoActual();
    if (!p) return aviso("Ya terminaste todos los procesos", "check");
    if (p.tipo === "cartas") return aviso(`Primero recoge las cartas del mapa (${p.preguntas.length - yo.cartasTomadas.length})`, "carta");
    if (p.edificio !== id) return aviso(`Ahora te toca: ${p.nombre} en ${nombreEdificio(p.edificio)}`, "candado");
    abrirPanel(id, p.nombre, `Proceso ${yo.proc + 1} de ${M.procesos.length} · ${p.articulos || ""}`);
    if (p.concurso) estructuraConcurso(p);
    else preguntaDeProceso(p, 0);
  }

  // Antes de las pruebas del concurso: las cuatro etapas (texto del grupo)
  function estructuraConcurso(p) {
    const K = C.concurso, est = C.introduccion.estructura;
    const orden = K.orden || K.pruebas.map((x) => x.id).concat("antecedentes");
    const peso = (id) => (id === "antecedentes" ? K.pesoAntecedentes : (K.pruebas.find((x) => x.id === id) || {}).peso || 0);
    const c = limpiarCuerpo();
    c.append(con("div", "personaje", Pixel.cara("funcionaria", 2), "Funcionaria de la Secretaría"));
    c.append(nodo("div", "globo", C.introduccion.concurso.texto));
    c.append(nodo("h3", "", est.titulo));
    c.append(nodo("p", "", est.texto));
    const ol = nodo("ol", "etapas");
    orden.forEach((id, i) => {
      const et = est.etapas[i] || {};
      ol.append(con("li", "", con("div", "", con("b", "", et.nombre || id), ": " + (et.descripcion || ""), " ", nodo("span", "peso", Math.round(peso(id) * 100) + "%"))));
    });
    c.append(ol);
    c.append(nodo("p", "suave pequeno", `Responde rápido: cada pregunta tiene ${M.segundosPorPregunta} segundos. La valoración de antecedentes sale de tu personaje.`));
    accion("Empezar las pruebas", () => preguntaDeProceso(p, 0));
  }

  function preguntaDeProceso(p, i) {
    if (i >= p.preguntas.length) return finalizarProceso(p);
    jugarPregunta(partida.plan[yo.proc][i], i + 1, p.preguntas.length, () => preguntaDeProceso(p, i + 1), i + 1 < p.preguntas.length ? "Siguiente pregunta" : "Continuar");
  }

  function jugarPregunta(ref, numero, total, alTerminar, textoBoton) {
    const q = elemento(ref);
    const limite = M.segundosPorPregunta * 1000;
    const inicio = Date.now();
    let respondida = false;
    const c = limpiarCuerpo();
    if (!q.item) {
      c.append(nodo("div", "globo", `Todavía no hay preguntas en el banco "${ref.banco}".`));
      accion(textoBoton || "Continuar", alTerminar);
      return;
    }
    const cab = nodo("div", "pregunta-cabecera");
    cab.append(nodo("span", "paso", `Pregunta ${numero} de ${total}`));
    const reloj = con("span", "reloj-mj", ico("reloj"), nodo("span", "", String(M.segundosPorPregunta)));
    cab.append(reloj);
    c.append(cab);
    const barra = nodo("div", "barra-tiempo");
    const relleno = nodo("div", "barra-tiempo-relleno");
    barra.append(relleno);
    c.append(barra);
    if (q.quien) c.append(con("div", "personaje", Pixel.cara(q.npc, 2), q.quien));
    if (q.item.titulo) c.append(nodo("h3", "titulo-carta", q.item.titulo));
    c.append(nodo("div", "enunciado", q.item.texto));
    c.append(nodo("div", "elige", q.situacion ? "¿Qué haces?" : "Elige una respuesta"));
    const ops = Comun.opciones(q.item, (op) => responder(op));
    c.append(ops);
    const ap = Comun.avisoPrueba(); if (ap) c.append(ap);

    clearInterval(relojPregunta);
    relojPregunta = setInterval(() => {
      const resta = limite - (Date.now() - inicio);
      reloj.lastChild.textContent = Math.max(0, Math.ceil(resta / 1000));
      relleno.style.width = Math.max(0, (resta / limite) * 100) + "%";
      reloj.classList.toggle("urgente", resta < 5000);
      if (resta <= 0) { ops.querySelectorAll("button").forEach((b) => { b.disabled = true; }); responder(null); }
    }, 200);

    function responder(op) {
      if (respondida) return;
      respondida = true;
      clearInterval(relojPregunta);
      const t = Date.now() - inicio;
      const ok = !!op && Comun.esCorrecta(op);
      const clave = `${yo.proc}:${numero}:${ref.banco}:${ref.indice}`;
      const repetida = yo.hechas.includes(clave);
      const bono = ok && !repetida ? Math.round(M.bonoRapidez * Math.max(0, (limite - t) / limite)) : 0;
      const pts = ok && !repetida ? M.puntosAcierto + bono : 0;
      if (!repetida) { yo.hechas.push(clave); yo.puntos += pts; if (ok) yo.aciertos++; }
      let cambios = [];
      if (q.situacion && op) cambios = aplicar(op.efectos);
      if (C.concurso.pruebas.some((x) => x.banco === ref.banco)) respuestasConcurso[ref.banco] = op;
      enviarEstado();
      actualizarHud();

      const c2 = limpiarCuerpo();
      const res = nodo("div", "resultado-pregunta " + (op === null ? "neutro" : ok ? "bien" : "mal"));
      res.append(ico(op === null ? "reloj" : ok ? "check" : "cruz", 3));
      res.append(nodo("div", "rp-titulo", op === null ? "Se acabó el tiempo" : ok ? "¡Correcto!" : "Incorrecto"));
      res.append(nodo("div", "rp-puntos", ok ? `+${pts} pts (${M.puntosAcierto} + ${bono} por rapidez · ${(t / 1000).toFixed(1)} s)` : "+0 pts"));
      c2.append(res);
      if (op && !ok) c2.append(nodo("p", "respuesta-elegida", "Tu respuesta: " + op.texto));
      const cor = Comun.correctaDe(q.item);
      if (!ok && cor) c2.append(con("div", "globo", "La respuesta correcta: ", con("b", "", cor.texto)));
      if (q.situacion && op && op.consecuencia) c2.append(nodo("div", "globo", op.consecuencia));
      if (cambios.length) c2.append(chipsEfectos(cambios));
      const fuente = q.situacion ? (op && (op.articulo || op.explicacion) ? op : cor) : q.item;
      if (fuente && (fuente.articulo || fuente.explicacion)) {
        const tarjeta = nodo("div", "tarjeta-articulo");
        tarjeta.append(con("div", "art-titulo", ico("articulo"), fuente.articulo || "Estatuto docente"));
        if (fuente.explicacion) tarjeta.append(nodo("p", "", fuente.explicacion));
        c2.append(tarjeta);
      }
      accion(textoBoton || "Continuar", alTerminar);
    }
  }

  function aplicar(efectos) {
    const cambios = [];
    Object.entries(efectos || {}).forEach(([k, d]) => {
      if (!(k in yo.ind) || !d) return;
      const antes = yo.ind[k];
      yo.ind[k] = lim(antes + d);
      if (yo.ind[k] !== antes) cambios.push({ k, d: yo.ind[k] - antes });
    });
    return cambios;
  }
  function chipsEfectos(cambios) {
    const cont = nodo("div", "efectos");
    cambios.forEach(({ k, d }) => {
      const i = C.indicadores[k];
      cont.append(con("span", "efecto " + (d > 0 ? "positivo" : "negativo"), ico(k), `${d > 0 ? "+" : ""}${d} ${i.nombre}`));
    });
    return cont;
  }

  const ICONO_OPORTUNIDAD = { vacante: "check", provisional: "proceso", reemplazo: "reloj", ninguna: "cruz" };
  function finalizarProceso(p) {
    if (!p.concurso) return avanzar();
    // Resultado del concurso: pruebas + antecedentes del personaje → oportunidad laboral
    const K = C.concurso;
    const antecedentes = Math.round((yo.ind.experiencia + yo.ind.formacion) / 2);
    let total = antecedentes * K.pesoAntecedentes;
    const c = limpiarCuerpo();
    c.append(con("div", "personaje", Pixel.cara("funcionaria", 2), "Resultado del concurso"));
    const tabla = nodo("div", "tabla");
    K.pruebas.forEach((pr) => {
      const valor = Comun.valor(respuestasConcurso[pr.banco]);
      total += valor * pr.peso;
      tabla.append(fila(`${pr.nombre}: ${valor}/100`, `+${(valor * pr.peso).toFixed(1)}`));
    });
    tabla.append(fila(`Valoración de antecedentes de ${pjDe(yo.pj).nombre}: ${antecedentes}/100`, `+${(antecedentes * K.pesoAntecedentes).toFixed(1)}`));
    total = Math.round(total);
    tabla.append(fila("Puntaje del concurso", String(total), true));
    c.append(tabla);
    const op = K.oportunidades.find((o) => total >= o.minimo);
    const bono = M.bonoOportunidad[op.tipo] || 0;
    if (yo.oportunidad === null) { yo.bonoOp = bono; yo.puntos += bono; yo.oportunidad = op.nombre; }
    c.append(con("div", "oportunidad " + op.tipo, ico(ICONO_OPORTUNIDAD[op.tipo]), nodo("div", "oportunidad-titulo", (op.tipo === "ninguna" ? "Sin plaza" : "Oportunidad laboral: " + op.nombre) + ` · +${bono} pts`)));
    const t = nodo("div", "tarjeta-articulo");
    t.append(con("div", "art-titulo", ico("articulo"), op.articulo));
    t.append(nodo("p", "", op.explicacion));
    c.append(t);
    enviarEstado();
    actualizarHud();
    accion("Continuar", avanzar);
  }

  function fila(texto, valor, total) {
    const f = nodo("div", "fila" + (total ? " total" : ""));
    f.append(nodo("div", "fila-texto", texto), nodo("div", "fila-valor", valor));
    return f;
  }

  let procesoCerrado = -1;
  function avanzar() {
    if (procesoCerrado === yo.proc) return;
    procesoCerrado = yo.proc;
    yo.proc++;
    yo.cartasTomadas = [];
    if (pueblo) pueblo.limpiarCartas();   // las cartas del proceso anterior desaparecen del todo
    cerrarPanel();
    if (yo.proc >= M.procesos.length) return terminar();
    const p = procesoActual();
    if (p.tipo === "cartas" && pueblo) pueblo.generarCartas();
    aviso("Siguiente: " + p.nombre, p.tipo === "cartas" ? "carta" : p.edificio);
    enviarEstado();
    actualizarHud();
  }

  function abrirCarta(carta) {
    if (interiorAbierto || yo.cartasTomadas.includes(carta.indice)) return;
    const p = procesoActual();
    abrirPanel("carta", "Situación inesperada", `${p.nombre} · Carta ${yo.cartasTomadas.length + 1} de ${p.preguntas.length}`);
    jugarPregunta(carta.ref, yo.cartasTomadas.length + 1, p.preguntas.length, () => {
      if (!yo.cartasTomadas.includes(carta.indice)) yo.cartasTomadas.push(carta.indice);
      if (carta.sprite) carta.sprite.destroy();
      enviarEstado();
      if (yo.cartasTomadas.length >= p.preguntas.length) avanzar();
      else { cerrarPanel(); aviso(`Te falta ${p.preguntas.length - yo.cartasTomadas.length} carta`, "carta"); }
    });
  }

  function terminar() {
    yo.termino = true;
    yo.tiempo = Date.now() - partida.t0;
    yo.fase = "fin";
    jugando = false;
    enviarEstado();
    actualizarHud();
    if (pueblo) pueblo.actualizarMarcadores();
    pantallaEspera();
    revisarFin();
  }

  function revisarFin() {
    if (!partida || podioMostrado || !yo.termino) return;
    const todos = jugadoresPartida();
    const pendientes = todos.filter((j) => !j.termino && conectado(j));
    const faltantes = partida.ids.filter((id) => id !== yo.id && !otros[id]);
    if (!pendientes.length && !faltantes.length) mostrarPodio();
  }

  function pantallaEspera() {
    if (podioMostrado) return;
    mostrarPantalla(true);
    const c = caja();
    c.append(con("div", "icono-grande", Pixel.retrato(pjDe(yo.pj), 4), ico("llegada", 5)));
    c.append(nodo("h2", "", "¡Terminaste!"));
    c.append(nodo("p", "centrado", `Hiciste ${yo.puntos} puntos en ${mmss(yo.tiempo)} con ${yo.aciertos} aciertos.`));
    c.append(nodo("p", "suave centrado", "Esperando a que los demás terminen…"));
    const ul = nodo("ul", "lista-jugadores");
    jugadoresPartida().sort((a, b) => b.puntos - a.puntos).forEach((j) => {
      const li = nodo("li", j.id === yo.id ? "yo" : "");
      li.append(con("span", "lj-icono", pjDe(j.pj) ? Pixel.cara(pjDe(j.pj), 2) : ico("jugadores")));
      li.append(nodo("span", "lj-nombre", j.nombre));
      li.append(nodo("span", "lj-pj", j.termino ? `Listo · ${j.puntos} pts` : (conectado(j) ? `Proceso ${Math.min(j.proc + 1, M.procesos.length)}/${M.procesos.length} · ${j.puntos} pts` : "desconectado")));
      ul.append(li);
    });
    c.append(ul);
    const host = partida.ids[0];
    if (host === yo.id || !otros[host] || !conectado(otros[host])) {
      c.append(boton("Terminar la partida y ver el podio", "btn-secundario", () => { red.enviar({ t: "fin", id: yo.id }); mostrarPodio(); }));
    }
  }

  function calcularPodio() {
    const js = jugadoresPartida();
    const terminados = js.filter((j) => j.termino).sort((a, b) => a.tiempo - b.tiempo);
    const filas = js.map((j) => {
      const pos = terminados.findIndex((x) => x.id === j.id);
      const llegada = pos >= 0 ? (M.bonoLlegada[pos] || 0) : 0;
      return { j, llegada, total: j.puntos + llegada };
    });
    filas.sort((a, b) => b.total - a.total || (a.j.termino ? a.j.tiempo : 1e12) - (b.j.termino ? b.j.tiempo : 1e12));
    return filas;
  }

  function mostrarPodio() {
    if (podioMostrado || !partida) return;
    podioMostrado = true;
    jugando = false;
    cerrarPanel();
    $("hud").classList.add("oculto");
    mostrarPantalla(true);
    try { sessionStorage.removeItem("cd-mj"); } catch (e) { /* nada */ }
    const c = caja();
    c.append(nodo("h1", "centrado", "Podio"));
    const filas = calcularPodio();
    const podio = nodo("div", "podio-mj");
    filas.forEach((f, i) => {
      const p = pjDe(f.j.pj);
      const d = nodo("div", "puesto-mj p" + (i + 1) + (f.j.id === yo.id ? " yo" : ""));
      d.append(con("div", "medalla", MEDALLAS[i] ? ico(MEDALLAS[i], 3) : `${i + 1}°`));
      if (p) { const r = nodo("div", "pj-retrato"); r.append(Pixel.retrato(p, 2)); d.append(r); }
      d.append(nodo("div", "puesto-nombre", `${f.j.nombre}${f.j.id === yo.id ? " (tú)" : ""}`));
      d.append(nodo("div", "puesto-total", f.total + " pts"));
      d.append(nodo("div", "puesto-detalle",
        `Preguntas ${f.j.puntos - (f.j.bonoOp || 0)} · Oportunidad ${f.j.bonoOp || 0} · Llegada ${f.llegada}` +
        ` · ${f.j.aciertos || 0} aciertos` + (f.j.termino ? ` · ${mmss(f.j.tiempo)}` : " · no terminó")));
      podio.append(d);
    });
    c.append(podio);
    const total = M.procesos.reduce((s, p) => s + p.preguntas.length, 0);
    c.append(nodo("p", "suave centrado pequeno-texto",
      `Cada acierto vale ${M.puntosAcierto} + hasta ${M.bonoRapidez} por rapidez (${total} preguntas). Bono por oportunidad laboral del concurso y por orden de llegada (${M.bonoLlegada.join(", ")}).`));
    c.append(boton("Jugar otra vez", "btn-principal", () => { location.href = "multijugador.html"; }));
    const volver = nodo("a", "btn-secundario btn-enlace", "Volver al menú");
    volver.href = "index.html";
    c.append(volver);
  }

  /* ============================== el pueblo ============================== */

  class Pueblo extends Phaser.Scene {
    constructor() { super("pueblo"); }

    create() {
      pueblo = this;
      const m = Graficos.construirMapa(this);
      this.caminable = m.caminable;
      this.dibujos = m.dibujos;

      this.casilla = { x: MAPA.inicio.x, y: MAPA.inicio.y };
      this.dir = "arriba";
      this.sombra = this.add.image(0, 0, "sombra").setVisible(false);
      this.jugador = this.add.sprite(this.pxX(this.casilla.x), this.pxY(this.casilla.y), C.personajes[0].id + "-arriba1").setOrigin(0.5, 1).setVisible(false);
      this.miEtiqueta = this.etiqueta("", true).setVisible(false);
      this.camino = [];
      this.moviendo = false;
      this.otros = {};
      this.cartas = [];

      this.flecha = this.add.image(0, 0, "flecha").setDepth(100000).setVisible(false);
      this.rebote = { v: 0 };
      this.tweens.add({ targets: this.rebote, v: -7, duration: 420, yoyo: true, repeat: -1, ease: "Sine.inOut" });

      this.cameras.main.startFollow(this.jugador, true, 0.15, 0.15);
      this.ajustarZoom();
      this.scale.on("resize", () => this.ajustarZoom());
      this.input.on("pointerup", (p) => this.alTocar(p));
      this.teclas = this.input.keyboard.addKeys("UP,DOWN,LEFT,RIGHT,W,A,S,D,SPACE,ENTER");
      this.actualizarMarcadores();

      if (partida) this.empezar();
    }

    // Nombre sobre el personaje, con letras pixeladas
    etiqueta(texto, propia) {
      const clave = "placa-" + (propia ? "p-" : "o-") + texto;
      if (!this.textures.exists(clave)) this.textures.addCanvas(clave, Pixel.escalar(Pixel.placa(texto, propia).c, 2));
      return this.add.image(0, 0, clave).setOrigin(0.5, 1).setDepth(propia ? 99995 : 99990);
    }

    empezar() {
      this.casilla = { x: yo.x, y: yo.y };
      this.dir = yo.dir || "arriba";
      this.jugador.setTexture(yo.pj + "-" + this.dir + "1").setPosition(this.pxX(yo.x), this.pxY(yo.y)).setVisible(true);
      this.sombra.setVisible(true);
      this.miEtiqueta.destroy();
      this.miEtiqueta = this.etiqueta(yo.nombre, true);
      this.miEtiqueta.setVisible(true);
      this.ajustarZoom();
      Object.values(otros).forEach((o) => this.actualizarOtro(o));
      const p = procesoActual();
      if (p && p.tipo === "cartas") this.generarCartas();
      this.actualizarMarcadores();
    }

    pxX(x) { return x * T + T / 2; }
    pxY(y) { return y * T + T - 2; }

    ajustarZoom() {
      const w = this.scale.width, h = this.scale.height;
      const W = MAPA.filas[0].length * T, H = MAPA.filas.length * T;
      const hud = document.getElementById("hud");
      const visible = hud && !hud.classList.contains("oculto");
      const altoHud = visible && hud.offsetHeight ? hud.offsetHeight : 140;
      let z = Math.min(w / (11 * T), (h - altoHud) / (8 * T));
      // Zoom en pasos de 0,5 para que cada píxel del dibujo mida lo mismo
      z = z >= 1 ? Math.floor(z * 2) / 2 : z;
      z = Phaser.Math.Clamp(z, 0.7, 3);
      const cam = this.cameras.main;
      cam.setZoom(z);
      const vw = w / z, vh = h / z;
      const extra = Math.ceil(altoHud / z);
      const bx = vw > W ? -(vw - W) / 2 : 0;
      const bw = Math.max(W, vw);
      let by = -extra, bh = H + extra;
      if (vh > bh) { by -= (vh - bh) / 2; bh = vh; }
      cam.setBounds(bx, by, bw, bh);
      cam.setFollowOffset(0, altoHud / 2 / z);
      // Los avisos aparecen justo debajo de la barra superior
      document.documentElement.style.setProperty("--alto-hud", (visible ? altoHud : 0) + "px");
    }

    edificioEn(x, y) { return MAPA.edificios.find((e) => x >= e.x && x < e.x + e.w && y >= e.y && y < e.y + e.h); }
    edificioConPuerta(x, y) { return MAPA.edificios.find((e) => e.puerta.x === x && e.puerta.y === y); }
    esCaminable(x, y) { return y >= 0 && y < this.caminable.length && x >= 0 && x < this.caminable[0].length && this.caminable[y][x]; }
    cartaEn(x, y) {
      const p = procesoActual();
      if (!p || p.tipo !== "cartas") return null;
      return this.cartas.find((c) => !yo.cartasTomadas.includes(c.indice) && c.x === x && c.y === y);
    }

    limpiarCartas() {
      this.cartas.forEach((c) => c.sprite && c.sprite.destroy());
      this.cartas = [];
    }

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

    // Las cartas salen en las mismas casillas para todos (semilla de la partida)
    generarCartas() {
      this.limpiarCartas();
      const p = procesoActual();
      if (!p || p.tipo !== "cartas") return;
      const rnd = azarConSemilla(partida.semilla + yo.proc * 101);
      const libres = [];
      const puertas = MAPA.edificios.map((e) => e.puerta);
      MAPA.filas.forEach((fila, y) => [...fila].forEach((ch, x) => {
        if (ch !== "g" || y <= 1 || y >= 22) return;
        if (puertas.some((q) => Math.abs(q.x - x) + Math.abs(q.y - y) < 3)) return;
        libres.push({ x, y });
      }));
      partida.plan[yo.proc].forEach((ref, i) => {
        const pos = libres.splice(Math.floor(rnd() * libres.length), 1)[0];
        const carta = { indice: i, ref, x: pos.x, y: pos.y, sprite: null };
        if (!yo.cartasTomadas.includes(i)) {
          carta.sprite = this.add.image(this.pxX(pos.x), pos.y * T + T / 2 + 4, "carta").setDepth(pos.y * T + T);
          this.tweens.add({ targets: carta.sprite, y: carta.sprite.y - 5, duration: 600, yoyo: true, repeat: -1, ease: "Sine.inOut", delay: i * 200 });
        }
        this.cartas.push(carta);
      });
      this.actualizarMarcadores();
    }

    actualizarOtro(o) {
      if (!partida || !partida.ids.includes(o.id) || !o.pj || o.fase === "sala" || o.fase === "inicio") return;
      let v = this.otros[o.id];
      const px = this.pxX(o.x), py = this.pxY(o.y);
      if (!v) {
        v = this.otros[o.id] = {
          sombra: this.add.image(px, py - 1, "sombra"),
          sprite: this.add.sprite(px, py, o.pj + "-abajo1").setOrigin(0.5, 1),
          texto: this.etiqueta(o.nombre),
          nombre: o.nombre, x: o.x, y: o.y
        };
      }
      const dx = o.x - v.x, dy = o.y - v.y;
      const dir = o.dir || "abajo";
      if (Math.abs(dx) + Math.abs(dy) === 1) {
        v.sprite.anims.play(o.pj + "-caminar-" + dir, true);
        v.sprite.setFlipX(dir === "lado" && dx < 0);
        this.tweens.killTweensOf(v.sprite);
        this.tweens.add({ targets: v.sprite, x: px, y: py, duration: 170, onComplete: () => { v.sprite.anims.stop(); v.sprite.setTexture(o.pj + "-" + dir + "1"); } });
      } else if (dx || dy) {
        this.tweens.killTweensOf(v.sprite);
        v.sprite.setPosition(px, py);
      }
      v.x = o.x; v.y = o.y;
      const rotulo = o.nombre + (o.termino ? " !" : "");
      if (v.nombre !== rotulo) { v.nombre = rotulo; v.texto.destroy(); v.texto = this.etiqueta(rotulo); }
    }

    quitarOtro(id) {
      const v = this.otros[id];
      if (!v) return;
      v.sprite.destroy(); v.sombra.destroy(); v.texto.destroy();
      delete this.otros[id];
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
        const ep = this.edificioConPuerta(meta.x, meta.y);
        if (ep) entrarEdificio(ep.id);
        return;
      }
      const ruta = this.buscarRuta(this.casilla, meta);
      if (!ruta) { this.marca(wp.x, wp.y, false); return; }
      this.marca(this.pxX(meta.x), meta.y * T + T / 2, true);
      this.camino = ruta;
      if (!this.moviendo) this.paso();
    }

    marca(x, y, ok) {
      const c = this.add.image(x, y, ok ? "marca-ok" : "marca-no").setDepth(y + 1);
      this.tweens.add({ targets: c, scale: 0.3, alpha: 0, duration: 450, onComplete: () => c.destroy() });
    }

    detener() {
      this.moviendo = false;
      this.camino = [];
      this.jugador.anims.stop();
      this.jugador.setTexture(yo.pj + "-" + this.dir + "1");
    }

    paso() {
      const carta = this.cartaEn(this.casilla.x, this.casilla.y);
      if (carta && this.moviendo) { this.detener(); abrirCarta(carta); return; }
      if (!this.camino.length) {
        this.detener();
        const ed = this.edificioConPuerta(this.casilla.x, this.casilla.y);
        if (ed) entrarEdificio(ed.id);
        return;
      }
      if (!jugando) { this.detener(); return; }
      const sig = this.camino.shift();
      const dx = sig.x - this.casilla.x, dy = sig.y - this.casilla.y;
      this.dir = dy > 0 ? "abajo" : dy < 0 ? "arriba" : "lado";
      this.jugador.setFlipX(this.dir === "lado" && dx < 0);
      this.jugador.anims.play(yo.pj + "-caminar-" + this.dir, true);
      this.casilla = sig;
      this.moviendo = true;
      yo.x = sig.x; yo.y = sig.y; yo.dir = this.dir;
      enviarMovimiento();
      this.tweens.add({ targets: this.jugador, x: this.pxX(sig.x), y: this.pxY(sig.y), duration: 170, onComplete: () => this.paso() });
    }

    actualizarMarcadores() {
      if (!this.dibujos) return;
      const p = partida ? procesoActual() : null;
      MAPA.edificios.forEach((ed) => {
        const d = this.dibujos[ed.id];
        if (!partida) { Graficos.marcar(d, null); return; }
        const pendientes = M.procesos.slice(yo.proc).some((x) => x.edificio === ed.id);
        if (p && p.edificio === ed.id) Graficos.marcar(d, null);
        else if (!pendientes) Graficos.marcar(d, "check");
        else Graficos.marcar(d, "candado");
      });
      let destino = null;
      if (p && p.edificio) {
        const ed = MAPA.edificios.find((e) => e.id === p.edificio);
        destino = { x: this.pxX(ed.puerta.x), y: (ed.y + ed.h) * T - 14 };
      } else if (p && p.tipo === "cartas") {
        const libres = this.cartas.filter((c) => !yo.cartasTomadas.includes(c.indice));
        libres.sort((a, b) => (Math.abs(a.x - this.casilla.x) + Math.abs(a.y - this.casilla.y)) - (Math.abs(b.x - this.casilla.x) + Math.abs(b.y - this.casilla.y)));
        if (libres[0]) destino = { x: this.pxX(libres[0].x), y: libres[0].y * T - 10 };
      }
      this.flechaBase = destino;
      this.flecha.setVisible(!!destino && jugando);
    }

    update() {
      // profundidad según la altura en el mapa
      this.jugador.setDepth(this.jugador.y);
      this.sombra.setPosition(this.jugador.x, this.jugador.y - 1).setDepth(this.jugador.y - 2);
      this.miEtiqueta.setPosition(this.jugador.x, this.jugador.y - 46);
      Object.values(this.otros).forEach((v) => {
        v.sprite.setDepth(v.sprite.y);
        v.sombra.setPosition(v.sprite.x, v.sprite.y - 1).setDepth(v.sprite.y - 2);
        v.texto.setPosition(v.sprite.x, v.sprite.y - 46);
      });
      if (this.flechaBase) {
        this.flecha.setPosition(this.flechaBase.x, this.flechaBase.y + this.rebote.v);
        if (this.cartas.length) this.actualizarMarcadores();
      }
      if (!jugando || interiorAbierto || this.moviendo) return;
      const k = this.teclas;
      let dx = 0, dy = 0;
      if (k.LEFT.isDown || k.A.isDown) dx = -1;
      else if (k.RIGHT.isDown || k.D.isDown) dx = 1;
      else if (k.UP.isDown || k.W.isDown) dy = -1;
      else if (k.DOWN.isDown || k.S.isDown) dy = 1;
      if (dx || dy) {
        const sig = { x: this.casilla.x + dx, y: this.casilla.y + dy };
        if (this.esCaminable(sig.x, sig.y)) { this.camino = [sig]; this.moviendo = true; this.paso(); }
      }
      if (Phaser.Input.Keyboard.JustDown(k.SPACE) || Phaser.Input.Keyboard.JustDown(k.ENTER)) {
        const ed = this.edificioConPuerta(this.casilla.x, this.casilla.y);
        if (ed) entrarEdificio(ed.id);
      }
    }
  }

  /* ============================== arranque ============================== */

  // Al volver de pantalla bloqueada u otra app, ponerse al día
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && red) { enviarEstado(); red.enviar({ t: "hola", id: yo.id }); }
  });
  window.addEventListener("pagehide", () => { if (red && yo.fase === "sala") red.enviar({ t: "salir", id: yo.id }); });

  document.querySelectorAll("img[data-ico]").forEach((img) => { const cv = Pixel.iconoCanvas(img.dataset.ico, 2); if (cv) img.src = cv.toDataURL(); });

  window.juego = new Phaser.Game({
    type: Phaser.AUTO,
    parent: "juego",
    backgroundColor: "#17241f",
    pixelArt: true,
    roundPixels: true,
    scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },
    scene: [Pueblo]
  });

  // ¿Se recargó la página a mitad de partida? Se retoma donde iba.
  const guardado = leer("cd-mj");
  const params = new URLSearchParams(location.search);
  if (guardado && guardado.yo && guardado.partida && (!params.get("sala") || params.get("sala").toUpperCase() === guardado.yo.sala) &&
      guardado.partida.transcurrido < M.duracionMaximaMin * 60000) {
    Object.assign(yo, guardado.yo);
    conectar();
    iniciarPartida({ semilla: guardado.partida.semilla, ids: guardado.partida.ids, nombres: guardado.partida.nombres }, guardado.partida);
  } else {
    pantallaInicio();
  }

  window.__mj = { yo, otros, estado: () => ({ yo, otros, partida, podioMostrado }), entrar: (id) => entrarEdificio(id), escena: () => pueblo };
})();
