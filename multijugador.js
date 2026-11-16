/* ==========================================================================
   MULTIJUGADOR — agregado sobre el juego (juego.js)
   El juego es el mismo del modo individual. Esto solo agrega:
     - la sala para jugar hasta 3 personas en el mismo pueblo (se ven en el mapa),
     - la lista de espera al terminar cada año (todos pasan juntos al siguiente),
     - los puntos y el podio.
   Se conecta al juego con los "ganchos" de Juego.extra.
   ========================================================================== */

(function () {
  const C = CONTENIDO;
  const M = C.multijugador;
  const ANIOS = C.aniosDeJuego;
  const $ = (id) => document.getElementById(id);
  const PREFIJO = "carrera-mapa-";
  const MEDALLAS = ["medalla1", "medalla2", "medalla3"];
  const INICIOS = [{ x: 9, y: 22 }, { x: 6, y: 20 }, { x: 13, y: 20 }];
  const DESCONECTADO_MS = 12000;
  const VERSION = (() => { try { return new URL(document.currentScript.src).searchParams.get("v") || ""; } catch (e) { return ""; } })();

  /* ============================ utilidades ============================ */

  const ico = (nombre, escala) => Pixel.icono(nombre, escala || 2);
  function nodo(tag, clase, texto) {
    const el = document.createElement(tag);
    if (clase) el.className = clase;
    if (texto !== undefined && texto !== null) el.textContent = texto;
    return el;
  }
  function con(tag, clase, ...hijos) {
    const el = nodo(tag, clase);
    hijos.forEach((h) => { if (h !== null && h !== undefined) el.append(h); });
    return el;
  }
  function boton(texto, clase, fn) { const b = nodo("button", clase || "btn-opcion", texto); b.onclick = fn; return b; }
  const pjDe = (id) => C.personajes.find((p) => p.id === id);
  const mmss = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  const guardar = (k, v) => { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } };
  const leer = (k) => { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } };
  const borrar = (k) => { try { sessionStorage.removeItem(k); } catch (e) { /* nada */ } };
  const aviso = (msg, icono) => window.Juego && Juego.aviso(msg, icono);
  const nombreGuardado = (() => { try { return localStorage.getItem("cd-nombre") || ""; } catch (e) { return ""; } })();

  /* ============================ estado ============================ */

  // El id se conserva si se recarga la página, para que los demás no vean un jugador nuevo
  const miId = leer("cd-id") || "j" + Math.random().toString(36).slice(2, 10);
  guardar("cd-id", miId);

  function datosPartida() {
    return {
      terminoAnio: 0, tiempos: {}, evaluaciones: {}, aciertos: 0, inicioAnio: 0, carreraBase: null,
      pts: { preg: 0, eval: 0, op: 0 },
      x: INICIOS[0].x, y: INICIOS[0].y, dir: "arriba", panel: null
    };
  }
  // fase: inicio | sala | tarde (pidiendo entrar) | intro (antes del pueblo) | juego | fin
  const yo = Object.assign({ id: miId, nombre: nombreGuardado, sala: null, anf: false, unido: 0, pj: null, fase: "inicio" }, datosPartida());

  const otros = {};          // id → último estado recibido de cada jugador
  const salidos = new Set(); // jugadores que se salieron de la partida
  const forzados = {};       // años en que el coordinador decidió no esperar más
  let red = null;
  let partida = null;        // { semilla, ids, nombres, t0 }
  let espera = null;         // { n, ids, continuar, desde } mientras espera a los demás al terminar un año
  let entradaTarde = null;
  let firmaPantalla = null;
  let relojRapidez = null;
  let partidaDejada = null;  // la partida de la que se acaba de salir (para no volver a entrar a ella)
  let saliendo = false;

  /* ============================ librerías ============================ */

  // Supabase, el código QR y la red solo se cargan si se abre el multijugador
  let cargando = null;
  function cargarScript(src) {
    return new Promise((ok, mal) => {
      const s = document.createElement("script");
      s.src = src + (VERSION ? "?v=" + VERSION : "");
      s.onload = ok;
      s.onerror = () => mal(new Error(src));
      document.head.append(s);
    });
  }
  function cargarLibs() {
    if (!cargando) {
      cargando = ["lib/qrcode.js", "lib/supabase.min.js", "config.js", "red.js"].reduce((p, src) => p.then(() => cargarScript(src)), Promise.resolve());
      cargando.catch(() => { cargando = null; });
    }
    return cargando;
  }

  /* ============================ pantallas ============================ */

  function mostrarPantalla(visible) { $("mj-pantalla").classList.toggle("oculto", !visible); }
  function caja(conservar) {
    const c = $("mj-caja");
    const arriba = $("mj-pantalla").scrollTop;
    c.innerHTML = "";
    $("mj-pantalla").scrollTop = conservar ? arriba : 0;
    firmaPantalla = null;
    return c;
  }

  // Desde el menú principal
  function abrir(mensaje) {
    Juego.mostrar(null);
    mostrarPantalla(true);
    const c = caja();
    c.append(con("p", "espera-host", ico("reloj"), " Cargando el multijugador…"));
    return cargarLibs().then(() => pantallaInicio(mensaje)).catch(() => {
      const c2 = caja();
      c2.append(nodo("div", "alerta", "No se pudo cargar el multijugador. Revisa la conexión a internet e intenta de nuevo."));
      c2.append(boton("Reintentar", "btn-principal btn-grande", () => abrir(mensaje)));
      c2.append(boton("Volver al menú", "btn-secundario", volverAlMenu));
    });
  }
  function volverAlMenu() {
    mostrarPantalla(false);
    history.replaceState(null, "", location.pathname);
    Juego.menu();
  }
  const urlBase = () => location.pathname;

  /* ============================ red ============================ */

  const conectado = (o) => Date.now() - (o.visto || 0) < DESCONECTADO_MS;
  const enSalaOTarde = () => yo.fase === "sala" || yo.fase === "tarde";
  const enPartida = (f) => f === "intro" || f === "juego" || f === "fin";
  // Una partida a la que se puede entrar: alguien la está jugando y no es la que se acaba de dejar
  const partidaViva = (o) => conectado(o) && (o.fase === "intro" || o.fase === "juego") && o.ini && o.ini.semilla !== partidaDejada;
  const mismaPartida = (ini) => partida && ini && ini.semilla === partida.semilla;
  // Cuánto mejoró la carrera desde que empezó (así ningún personaje arranca con ventaja)
  const puntosCarrera = () => (yo.carreraBase === null ? 0 : Math.round((Juego.puntajeCarrera() - yo.carreraBase) * (M.puntosPorCarrera || 0)));

  function estadoPublico() {
    const E = Juego.estado();
    return {
      t: "j", id: yo.id, nombre: yo.nombre, pj: yo.pj, anf: yo.anf, unido: yo.unido, fase: yo.fase,
      x: yo.x, y: yo.y, dir: yo.dir, panel: yo.panel,
      anio: partida && E ? E.anio : 1, terminoAnio: yo.terminoAnio, esperando: partida && E ? E.esperando || 0 : 0,
      fin: yo.fase === "fin", situacion: partida && E ? Juego.situacion() : "",
      tiempos: yo.tiempos, evaluaciones: yo.evaluaciones, pts: yo.pts, aciertos: yo.aciertos,
      carrera: partida && E ? puntosCarrera() : 0,
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
      if (enSalaOTarde() && m.ini && m.ini.ids.includes(yo.id) && enPartida(m.fase) && m.ini.semilla !== partidaDejada) { iniciarPartida(m.ini); return; }
      if (mismaPartida(m.ini)) unirIds(m.ini);
      resolverConflictoPersonaje();
      if (yo.fase === "sala") pantallaSala();
      if (yo.fase === "tarde") pantallaUnirseTarde();
      if (partida && enPartida(yo.fase)) {
        actualizarOtro(otros[m.id]);
        actualizarHudMj();
        revisarAvance();
        if (yo.fase === "fin") pintarPodio();
      }
    } else if (m.t === "hola") {
      enviarEstado();
    } else if (m.t === "inicio") {
      if (enSalaOTarde() && m.semilla !== partidaDejada) iniciarPartida(m);
      else if (mismaPartida(m)) unirIds(m);
    } else if (m.t === "pedir") {
      atenderPedido(m);
    } else if (m.t === "rechazo") {
      if (m.para === yo.id && yo.fase === "tarde") { entradaTarde = null; pantallaUnirseTarde(m.motivo); }
    } else if (m.t === "forzar") {
      if (partida && partida.ids.includes(m.id)) { forzados[m.anio] = true; revisarAvance(); }
    } else if (m.t === "cancelar") {
      if (partida && partida.ids.includes(m.id)) volverASala(`${m.nombre || "El anfitrión"} canceló la partida. ¡Pueden empezar otra!`);
    } else if (m.t === "fin") {
      if (partida && partida.ids.includes(m.id)) Juego.terminarYa(`${m.nombre || "El anfitrión"} terminó la partida.`);
    } else if (m.t === "salir") {
      if (partida && partida.ids.includes(m.id)) { salidos.add(m.id); aviso(`${(otros[m.id] && otros[m.id].nombre) || "Un jugador"} salió de la partida`, "jugadores"); }
      delete otros[m.id];
      quitarOtro(m.id);
      if (yo.fase === "sala") pantallaSala();
      revisarAvance();
      if (yo.fase === "fin") pintarPodio();
    }
  }

  // Alguien entró tarde: se agrega a la lista de jugadores de esta partida
  function unirIds(ini) {
    let cambio = false;
    ini.ids.forEach((id) => { if (!partida.ids.includes(id)) { partida.ids.push(id); cambio = true; } });
    Object.assign(partida.nombres, ini.nombres || {});
    if (cambio) { actualizarHudMj(); guardarProgreso(); }
  }

  // Quien coordina la partida: el primero de la lista que siga conectado
  function coordinador() {
    if (!partida) return null;
    return partida.ids.find((id) => id === yo.id || (otros[id] && conectado(otros[id]) && !salidos.has(id)));
  }
  const soyCoordinador = () => !!partida && coordinador() === yo.id;
  function reenviarInicio() {
    if (!partida || !red) return;
    red.enviar({ t: "inicio", id: yo.id, semilla: partida.semilla, ids: partida.ids, nombres: partida.nombres });
    enviarEstado();
  }
  function atenderPedido(m) {
    if (!partida || coordinador() !== yo.id) return;
    if (partida.ids.includes(m.id)) { reenviarInicio(); return; }
    const ocupados = jugadoresPartida().map((j) => j.pj);
    let motivo = null;
    if (partida.ids.length >= M.maxJugadores) motivo = `La partida ya tiene ${M.maxJugadores} jugadores.`;
    else if (!m.pj || ocupados.includes(m.pj)) motivo = "Ese personaje ya está en la partida: elige otro.";
    if (motivo) { red.enviar({ t: "rechazo", id: yo.id, para: m.id, motivo }); return; }
    partida.ids.push(m.id);
    partida.nombres[m.id] = m.nombre;
    reenviarInicio();
    aviso(`${m.nombre} entró a la partida`, "jugadores");
    actualizarHudMj();
  }

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

  // Por si se recarga la página a mitad de partida
  function guardarProgreso() {
    if (!partida || !yo.sala || saliendo) return;
    const E = Juego.estado();
    let copia = null;
    try { copia = E ? JSON.parse(JSON.stringify(E, (k, v) => (k === "sprite" ? undefined : v))) : null; } catch (e) { copia = null; }
    guardar("cd-mj", {
      v: 2, yo, E: copia,
      partida: { semilla: partida.semilla, ids: partida.ids, nombres: partida.nombres, transcurrido: Date.now() - partida.t0 },
      espera: espera ? { n: espera.n, ids: espera.ids } : null
    });
  }

  /* ============================ sala ============================ */

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
    c.append(nodo("p", "suave centrado", `Es el mismo juego del modo individual, pero hasta ${M.maxJugadores} personas viven su carrera en el mismo pueblo al mismo tiempo. Cuando alguien termina un año, espera a que los demás también lo terminen. Al final, el podio muestra quién sumó más puntos.`));
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
    c.append(boton("Volver al menú", "btn-secundario", volverAlMenu));
  }

  let vigiaSala = null;
  function entrarSala(codigo, crear, unido) {
    yo.sala = codigo;
    yo.anf = crear;
    yo.unido = unido || Date.now();
    yo.fase = "sala";
    history.replaceState(null, "", urlBase() + "?sala=" + codigo);
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
    if (red) { red.enviar({ t: "salir", id: yo.id }); const r = red; setTimeout(() => r.cerrar(), 300); red = null; }
    Object.keys(otros).forEach((k) => delete otros[k]);
    yo.fase = "inicio";
    yo.pj = null;
  }
  function urlSala() {
    const u = new URL(location.href);
    u.search = "?sala=" + yo.sala;
    u.hash = "";
    return u.href;
  }

  function tarjetaPj(pj, escala) {
    const t = nodo("button", "tarjeta-personaje");
    const ret = nodo("div", "pj-retrato");
    ret.append(Pixel.retrato(pj, escala));
    t.append(con("div", "pj-cabecera", ret, con("div", "", nodo("div", "pj-nombre", pj.nombre), nodo("div", "pj-perfil", pj.perfil))));
    return t;
  }

  function pantallaSala() {
    if (yo.fase !== "sala") return;
    mostrarPantalla(true);
    const lista = enSala();
    const pos = lista.findIndex((j) => j.id === yo.id);
    if (pos >= M.maxJugadores) { salirSala(); return pantallaInicio(`La sala ${yo.sala} ya tiene ${M.maxJugadores} jugadores.`); }
    const enCurso = Object.values(otros).find((o) => partidaViva(o) && !o.ini.ids.includes(yo.id));
    if (enCurso) {
      // La partida empezó sin este jugador: si ya tenía un personaje libre, entra solo
      yo.fase = "tarde";
      entradaTarde = { ini: enCurso.ini };
      enviarEstado();
      const ocupados = enCurso.ini.ids.map((id) => otros[id] && otros[id].pj).filter(Boolean);
      if (yo.pj && !ocupados.includes(yo.pj)) return pedirEntrada();
      return pantallaUnirseTarde();
    }

    const host = anfitrion();
    const soyHost = host && host.id === yo.id;
    const firma = "sala|" + JSON.stringify(lista.map((j) => [j.id, j.nombre, j.pj])) + "|" + (host && host.id) + "|" + yo.pj;
    if (firma === firmaPantalla && !$("mj-pantalla").classList.contains("oculto")) return;
    const c = caja(true);
    firmaPantalla = firma;
    c.append(nodo("h2", "", "Sala de espera"));
    const cab = nodo("div", "sala-cabecera");
    const info = nodo("div", "sala-info");
    info.append(nodo("div", "suave", "Código de la sala"));
    info.append(nodo("div", "codigo-grande", yo.sala));
    info.append(boton("Compartir enlace", "btn-secundario", async () => {
      const url = urlSala();
      try {
        if (navigator.share) await navigator.share({ title: "Carrera Docente", text: `Únete a mi sala ${yo.sala}`, url });
        else { await navigator.clipboard.writeText(url); aviso("Enlace copiado", "check"); }
      } catch (e) { /* el usuario canceló */ }
    }));
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
    const IND = Object.keys(C.indicadores);
    const leyenda = nodo("ul", "leyenda-ind");
    IND.forEach((k) => leyenda.append(con("li", "", ico(k), con("span", "", con("b", "", C.indicadores[k].nombre), ": " + C.indicadores[k].descripcion))));
    c.append(leyenda);
    const grid = nodo("div", "lista-personajes compacta");
    C.personajes.forEach((pj) => {
      const dueno = lista.find((j) => j.pj === pj.id && j.id !== yo.id);
      const t = tarjetaPj(pj, 2);
      if (yo.pj === pj.id) t.classList.add("elegido");
      const inds = nodo("div", "pj-inds");
      IND.forEach((k) => {
        const b = nodo("div", "barra");
        const r = nodo("div", "barra-relleno ind-" + k);
        r.style.width = pj.indicadores[k] + "%";
        b.append(r);
        inds.append(con("div", "pj-ind-cab", ico(k), nodo("span", "pj-ind-nombre", C.indicadores[k].nombre), b, nodo("span", "ind-valor", pj.indicadores[k])));
      });
      t.append(inds);
      if (pj.nota) t.append(nodo("p", "pj-nota", pj.nota));
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

  /* ----------------- entrar a una partida que ya empezó ----------------- */

  function partidaEnCurso() {
    const o = Object.values(otros).find(partidaViva);
    return o ? o.ini : (entradaTarde && entradaTarde.ini) || null;
  }

  function pantallaUnirseTarde(motivo) {
    if (yo.fase !== "tarde") return;
    const ini = partidaEnCurso();
    if (!ini) { yo.fase = "sala"; entradaTarde = null; enviarEstado(); return pantallaSala(); }
    const enJuego = ini.ids.map((id) => otros[id]).filter(Boolean);
    const ocupados = enJuego.map((o) => o.pj);
    const llena = ini.ids.length >= M.maxJugadores;
    const pidiendo = !!(entradaTarde && entradaTarde.pidiendo);
    const firma = "tarde|" + JSON.stringify([ini.ids, ocupados, yo.pj, pidiendo, motivo || ""]);
    if (firma === firmaPantalla && !$("mj-pantalla").classList.contains("oculto")) return;
    mostrarPantalla(true);
    const c = caja(true);
    firmaPantalla = firma;
    c.append(nodo("h2", "", "La partida ya empezó"));
    c.append(nodo("p", "centrado", `En la sala ${yo.sala} ya están jugando: ${enJuego.map((o) => o.nombre).join(", ") || "otros jugadores"}.`));
    if (motivo) c.append(nodo("div", "alerta", motivo));
    if (llena) {
      c.append(nodo("div", "alerta", `La partida está llena (${M.maxJugadores} jugadores). Espera a que termine o crea otra sala.`));
    } else if (pidiendo) {
      c.append(con("p", "espera-host", ico("reloj"), " Entrando a la partida…"));
    } else {
      c.append(nodo("p", "suave centrado", "Puedes entrar: empiezas tu carrera desde el año 1 y los demás no tienen que esperarte."));
      c.append(nodo("div", "etiqueta", "Elige un personaje libre para entrar"));
      const grid = nodo("div", "lista-personajes compacta");
      C.personajes.forEach((pj) => {
        const ocupado = ocupados.includes(pj.id);
        const t = tarjetaPj(pj, 2);
        if (yo.pj === pj.id && !ocupado) t.classList.add("elegido");
        if (ocupado) { t.disabled = true; t.append(nodo("p", "pj-nota", "Ya está en la partida")); }
        t.onclick = () => { yo.pj = pj.id; firmaPantalla = null; pantallaUnirseTarde(); };
        grid.append(t);
      });
      c.append(grid);
      const b = boton(yo.pj && !ocupados.includes(yo.pj) ? "Entrar a la partida" : "Elige un personaje", "btn-principal btn-grande", pedirEntrada);
      b.disabled = !yo.pj || ocupados.includes(yo.pj);
      c.append(b);
    }
    c.append(boton("Salir de la sala", "btn-secundario", () => { if (entradaTarde) clearTimeout(entradaTarde.timer); entradaTarde = null; salirSala(); pantallaInicio(); }));
  }

  function pedirEntrada() {
    if (yo.fase !== "tarde" || !yo.pj) return;
    if (entradaTarde) clearTimeout(entradaTarde.timer);
    entradaTarde = Object.assign(entradaTarde || {}, { pidiendo: true, intentos: 0 });
    const enviar = () => {
      if (yo.fase !== "tarde" || !entradaTarde || !entradaTarde.pidiendo) return;
      if (red) red.enviar({ t: "pedir", id: yo.id, nombre: yo.nombre, pj: yo.pj });
      entradaTarde.intentos++;
      if (entradaTarde.intentos < 8) entradaTarde.timer = setTimeout(enviar, 2500);
      else { entradaTarde.pidiendo = false; firmaPantalla = null; pantallaUnirseTarde("No hubo respuesta de la partida. Intenta otra vez."); }
    };
    enviar();
    firmaPantalla = null;
    pantallaUnirseTarde();
  }

  /* ============================ partida ============================ */

  // Conecta el juego con el multijugador
  function activar() {
    Object.assign(Juego.extra, {
      inicio: INICIOS[Math.max(0, partida.ids.indexOf(yo.id))] || INICIOS[0],
      alMostrar, alResponder, alPanel, alMover, alEmpezar, alConcurso, alEvaluar, alCerrarAnio, alTerminar,
      menu: menuPartida
    });
  }

  function iniciarPartida(m) {
    if (!m.ids.includes(yo.id)) {
      // La partida empezó sin este jugador (por ejemplo, se le apagó la pantalla): pide entrar
      yo.fase = "tarde";
      entradaTarde = { ini: m };
      enviarEstado();
      if (yo.pj) pedirEntrada(); else pantallaUnirseTarde();
      return;
    }
    if (partida && partida.semilla === m.semilla) return;
    clearTimeout(vigiaSala);
    if (entradaTarde) { clearTimeout(entradaTarde.timer); entradaTarde = null; }
    salidos.clear();
    partida = { semilla: m.semilla, ids: m.ids.slice(), nombres: Object.assign({}, m.nombres), t0: Date.now() };
    Object.assign(yo, datosPartida(), { fase: "intro" });
    activar();
    Object.assign(yo, { x: Juego.extra.inicio.x, y: Juego.extra.inicio.y });
    mostrarPantalla(false);
    enviarEstado();
    // El mismo comienzo del modo individual: el concurso, la convocatoria y el pueblo
    Juego.iniciar(pjDe(yo.pj));
  }

  /* ---------------------- ganchos del juego ---------------------- */

  function alEmpezar() {
    yo.fase = "juego";
    yo.inicioAnio = Date.now();
    yo.carreraBase = Juego.puntajeCarrera();
    prepararEscena();
    hudExtras();
    enviarEstado();
    actualizarHudMj();
  }

  // Bono por rapidez: se ve mientras se responde (no hay límite de tiempo para responder)
  function alMostrar(item) {
    clearInterval(relojRapidez);
    if (!Comun.tieneCorrecta(item)) return null;
    const limite = M.segundosPorPregunta * 1000;
    const t0 = Date.now();
    const valor = nodo("b", "", "+" + M.bonoRapidez);
    const chip = con("div", "rapidez", ico("reloj"), nodo("span", "", "Bono por rapidez: "), valor);
    relojRapidez = setInterval(() => {
      const b = Math.round(M.bonoRapidez * Math.max(0, 1 - (Date.now() - t0) / limite));
      valor.textContent = "+" + b;
      if (!b) { chip.classList.add("agotado"); clearInterval(relojRapidez); }
    }, 250);
    return chip;
  }

  function alResponder({ item, correcta, ms }) {
    clearInterval(relojRapidez);
    if (correcta === null) return null;
    const dif = (item && item.dificultad) || 1;
    if (!correcta) { enviarEstado(); return "+0 pts"; }
    const base = M.puntosPorDificultad[dif - 1] || M.puntosPorDificultad[0];
    const bono = Math.round(M.bonoRapidez * Math.max(0, 1 - ms / (M.segundosPorPregunta * 1000)));
    yo.pts.preg += base + bono;
    yo.aciertos++;
    enviarEstado();
    actualizarHudMj();
    return `+${base + bono} pts · ${base} por ser ${Comun.nombreNivel(dif).toLowerCase()} + ${bono} por rapidez (${(ms / 1000).toFixed(1)} s)`;
  }

  function alPanel(id) {
    yo.panel = id;
    if (!id) clearInterval(relojRapidez);
    enviarEstado();
  }

  function alMover(casilla, dir) {
    yo.x = casilla.x; yo.y = casilla.y; yo.dir = dir;
    enviarMovimiento();
  }

  function alConcurso(tipo) {
    yo.pts.op = Math.max(yo.pts.op, M.bonoOportunidad[tipo] || 0);
    enviarEstado();
    actualizarHudMj();
  }

  function alEvaluar(r) {
    const E = Juego.estado();
    yo.evaluaciones[E.anio] = r;
    if (r >= C.evaluacionAnual.minimo) yo.pts.eval += r;
    enviarEstado();
  }

  /* ---------------------- fin de año y lista de espera ---------------------- */

  function jugadoresPartida() {
    if (!partida) return [];
    return partida.ids.map((id) => (id === yo.id ? estadoPublico() : otros[id])).filter(Boolean);
  }
  // Los que siguen jugando (conectados y que no se han salido)
  function jugadoresActivos() {
    return jugadoresPartida().filter((j) => j.id === yo.id || (conectado(j) && !salidos.has(j.id)));
  }

  // Terminó el año n: espera solo a quienes estén jugando ese mismo año (al que entró tarde no se le espera)
  function alCerrarAnio(n, continuar) {
    yo.terminoAnio = n;
    yo.tiempos[n] = Date.now() - yo.inicioAnio;
    const ids = jugadoresActivos().filter((j) => j.id !== yo.id && j.anio === n && (j.terminoAnio || 0) < n && !j.fin).map((j) => j.id);
    espera = { n, ids, continuar, desde: Date.now() };
    aviso(`¡Terminaste el año ${n} en ${mmss(yo.tiempos[n])}!`, "llegada");
    enviarEstado();
    revisarAvance();
  }

  function pendientes() {
    if (!espera) return [];
    return espera.ids.filter((id) => {
      const o = otros[id];
      return o && conectado(o) && !salidos.has(id) && !o.fin && (o.terminoAnio || 0) < espera.n;
    });
  }

  function revisarAvance() {
    if (!espera) return;
    if (pendientes().length && !forzados[espera.n]) { actualizarEspera(); return; }
    const seguir = espera.continuar;
    espera = null;
    ocultarEspera();
    yo.inicioAnio = Date.now();
    seguir();
    enviarEstado();
    actualizarHudMj();
  }

  function actualizarEspera() {
    const el = $("espera-anio");
    if (!espera) { ocultarEspera(); return; }
    el.classList.remove("oculto");
    el.innerHTML = "";
    el.append(con("div", "espera-titulo", ico("llegada"), `Terminaste el año ${espera.n} de ${ANIOS}`));
    const ul = nodo("ul", "espera-lista");
    ul.append(con("li", "listo", ico("check"), nodo("span", "", "Tú"), nodo("small", "", mmss(yo.tiempos[espera.n] || 0))));
    espera.ids.forEach((id) => {
      const j = otros[id];
      if (!j) return;
      const listo = (j.terminoAnio || 0) >= espera.n || j.fin;
      const fuera = !conectado(j) || salidos.has(id);
      ul.append(con("li", listo ? "listo" : "", ico(listo ? "check" : fuera ? "cruz" : "reloj"), nodo("span", "", j.nombre),
        nodo("small", "", listo ? (j.tiempos && j.tiempos[espera.n] ? mmss(j.tiempos[espera.n]) : "listo") : fuera ? "desconectado" : "terminando el año")));
    });
    el.append(ul);
    if (soyCoordinador() && Date.now() - espera.desde > M.esperaParaForzar * 1000) {
      el.append(boton("Seguir sin esperar más", "btn-secundario", () => {
        if (red) red.enviar({ t: "forzar", id: yo.id, anio: espera.n, nombre: yo.nombre });
        forzados[espera.n] = true;
        revisarAvance();
      }));
    } else {
      el.append(nodo("p", "espera-nota", "Cuando todos terminen, empieza el año siguiente. Puedes caminar por el pueblo mientras tanto."));
    }
  }
  function ocultarEspera() { $("espera-anio").classList.add("oculto"); }

  /* ------------------------------ puntos ------------------------------ */

  // Puntos por orden de llegada: cada año, el más rápido en terminarlo gana más
  function llegadaDe(id) {
    const lista = jugadoresPartida().filter((j) => !salidos.has(j.id));
    let total = 0;
    for (let a = 1; a <= ANIOS; a++) {
      const conTiempo = lista.filter((j) => j.tiempos && typeof j.tiempos[a] === "number").sort((p, q) => p.tiempos[a] - q.tiempos[a]);
      const pos = conTiempo.findIndex((j) => j.id === id);
      if (pos >= 0) total += M.bonoLlegadaAnio[pos] || 0;
    }
    return total;
  }
  const ptsDe = (j) => j.pts || { preg: 0, eval: 0, op: 0 };
  const totalDe = (j) => { const p = ptsDe(j); return p.preg + p.eval + p.op + (j.carrera || 0) + llegadaDe(j.id); };

  function estadoCorto(j) {
    if (j.fin) return "terminó";
    if (j.fase === "intro") return "concurso";
    if (j.esperando) return `listo año ${j.esperando}`;
    return `año ${j.anio}`;
  }

  /* ------------------------------ barra superior ------------------------------ */

  // Debajo de la barra del juego: los puntos de cada jugador (los tuyos resaltados)
  function hudExtras() {
    const fila = document.querySelector("#hud .hud-fila.chips");
    if (fila && !$("hud-ranking")) {
      const rk = nodo("div", "ranking");
      rk.id = "hud-ranking";
      rk.title = "Puntos de cada jugador";
      fila.after(rk);
    }
  }

  function actualizarHudMj() {
    if (!partida || !$("hud-ranking")) return;
    const rk = $("hud-ranking");
    rk.innerHTML = "";
    jugadoresPartida().filter((j) => !salidos.has(j.id)).sort((a, b) => totalDe(b) - totalDe(a)).forEach((j, i) => {
      const ch = nodo("span", "chip rk" + (j.id === yo.id ? " yo" : "") + (j.id === yo.id || conectado(j) ? "" : " fuera"));
      if (MEDALLAS[i]) ch.append(ico(MEDALLAS[i]));
      ch.append(nodo("span", "", `${String(j.nombre).split(" ")[0]} ${totalDe(j)}`));
      if (j.fin || j.esperando) ch.append(ico(j.fin ? "llegada" : "check"));
      ch.title = estadoCorto(j);
      rk.append(ch);
    });
    if (window.Juego) Juego.actualizarHud();
    // Si la barra cambió de alto, se reacomoda el mapa (y los avisos quedan justo debajo)
    const alto = $("hud").offsetHeight;
    if (alto && alto !== altoHud) { altoHud = alto; const s = escena(); if (s && s.ajustarZoom) s.ajustarZoom(); }
  }
  let altoHud = 0;

  /* ------------------------------ los demás en el mapa ------------------------------ */

  const vistas = {};
  let miEtiqueta = null;
  let escenaLista = null;

  const escena = () => window.Juego && Juego.pueblo();

  function etiqueta(s, texto, propia) {
    const clave = "placa-" + (propia ? "p-" : "o-") + texto;
    if (!s.textures.exists(clave)) s.textures.addCanvas(clave, Pixel.escalar(Pixel.placa(texto, propia).c, 2));
    return s.add.image(0, 0, clave).setOrigin(0.5, 1).setDepth(propia ? 99995 : 99990);
  }
  function texBurbuja(s, icono) {
    const clave = "burbuja-" + icono;
    if (!s.textures.exists(clave)) s.textures.addCanvas(clave, Pixel.escalar(Pixel.burbuja(icono).c, 2));
    return clave;
  }

  function prepararEscena() {
    const s = escena();
    if (!s || !s.jugador) return false;
    if (escenaLista !== s) {
      escenaLista = s;
      s.events.on("update", () => moverVistas(s));
    }
    if (!miEtiqueta) miEtiqueta = etiqueta(s, yo.nombre, true);
    Object.values(otros).forEach(actualizarOtro);
    return true;
  }

  function moverVistas(s) {
    if (miEtiqueta) miEtiqueta.setPosition(s.jugador.x, s.jugador.y - 46);
    Object.values(vistas).forEach((v) => {
      v.sprite.setDepth(v.sprite.y);
      v.sombra.setPosition(v.sprite.x, v.sprite.y - 1).setDepth(v.sprite.y - 2);
      v.texto.setPosition(v.sprite.x, v.sprite.y - 46);
      if (v.burbuja) v.burbuja.setPosition(v.sprite.x, v.sprite.y - 72 + (s.rebote ? s.rebote.v * 0.4 : 0));
    });
  }

  function actualizarOtro(o) {
    const s = escena();
    if (!s || !partida || !o || !partida.ids.includes(o.id) || !o.pj || salidos.has(o.id)) return;
    if (o.fase !== "juego" && o.fase !== "fin") return;
    let v = vistas[o.id];
    const px = s.pxX(o.x), py = s.pxY(o.y);
    if (!v) {
      v = vistas[o.id] = {
        sombra: s.add.image(px, py - 1, "sombra"),
        sprite: s.add.sprite(px, py, o.pj + "-abajo1").setOrigin(0.5, 1),
        texto: etiqueta(s, o.nombre),
        nombre: o.nombre, x: o.x, y: o.y, terminoAnio: o.terminoAnio || 0
      };
    }
    const dx = o.x - v.x, dy = o.y - v.y;
    const dir = o.dir || "abajo";
    if (Math.abs(dx) + Math.abs(dy) === 1) {
      v.sprite.anims.play(o.pj + "-caminar-" + dir, true);
      v.sprite.setFlipX(dir === "lado" && dx < 0);
      s.tweens.killTweensOf(v.sprite);
      s.tweens.add({ targets: v.sprite, x: px, y: py, duration: 170, onComplete: () => { v.sprite.anims.stop(); v.sprite.setTexture(o.pj + "-" + dir + "1"); } });
    } else if (dx || dy) {
      s.tweens.killTweensOf(v.sprite);
      v.sprite.setPosition(px, py);
    }
    v.x = o.x; v.y = o.y;
    // qué está haciendo: respondiendo en un edificio o una carta, o esperando a los demás
    const icono = o.panel && Pixel.ICONOS[o.panel] ? o.panel : (o.esperando || o.fin ? "reloj" : null);
    if (icono) {
      if (!v.burbuja) v.burbuja = s.add.image(px, py, texBurbuja(s, icono)).setOrigin(0.5, 1).setDepth(99992);
      else v.burbuja.setTexture(texBurbuja(s, icono));
      v.burbuja.setVisible(true);
    } else if (v.burbuja) v.burbuja.setVisible(false);
    if ((o.terminoAnio || 0) > v.terminoAnio) aviso(`${o.nombre} terminó el año ${o.terminoAnio}`, "llegada");
    v.terminoAnio = o.terminoAnio || 0;
    if (v.nombre !== o.nombre) { v.nombre = o.nombre; v.texto.destroy(); v.texto = etiqueta(s, o.nombre); }
  }

  function quitarOtro(id) {
    const v = vistas[id];
    if (!v) return;
    v.sprite.destroy(); v.sombra.destroy(); v.texto.destroy();
    if (v.burbuja) v.burbuja.destroy();
    delete vistas[id];
  }

  /* ------------------------------ final y podio ------------------------------ */

  function alTerminar() {
    yo.fase = "fin";
    espera = null;
    ocultarEspera();
    clearInterval(relojRapidez);
    enviarEstado();
    pintarPodio();
    const b = $("btn-reiniciar");
    if (soyCoordinador()) { b.textContent = "Otra partida en esta sala"; b.onclick = () => cancelarParaTodos("Nueva partida: elijan personaje y empiecen."); }
    else { b.textContent = "Volver a la sala de espera"; b.onclick = () => volverASala(); }
  }

  function pintarPodio() {
    const cont = $("fin-extra");
    if (!cont || !partida) return;
    cont.innerHTML = "";
    const lista = jugadoresPartida().filter((j) => !salidos.has(j.id));
    const faltan = lista.filter((j) => !j.fin && j.id !== yo.id && conectado(j));
    cont.append(nodo("h2", "centrado", faltan.length ? "Podio (en vivo)" : "Podio final"));
    if (faltan.length) cont.append(con("p", "espera-host", ico("reloj"), ` Esperando a que terminen: ${faltan.map((j) => `${j.nombre} (${estadoCorto(j)})`).join(", ")}`));
    const podio = nodo("div", "podio-mj");
    lista.map((j) => ({ j, llegada: llegadaDe(j.id), total: totalDe(j) })).sort((a, b) => b.total - a.total).forEach((f, i) => {
      const p = pjDe(f.j.pj);
      const pt = ptsDe(f.j);
      const d = nodo("div", "puesto-mj p" + (i + 1) + (f.j.id === yo.id ? " yo" : ""));
      d.append(con("div", "medalla", MEDALLAS[i] ? ico(MEDALLAS[i], 3) : `${i + 1}°`));
      if (p) { const r = nodo("div", "pj-retrato"); r.append(Pixel.retrato(p, 2)); d.append(r); }
      d.append(con("div", "puesto-info",
        con("div", "puesto-nombre", f.j.nombre, f.j.id === yo.id ? nodo("span", "tu", " (tú)") : null),
        nodo("div", "puesto-total", f.total + " pts")));
      const evals = Object.values(f.j.evaluaciones || {});
      d.append(nodo("div", "puesto-detalle",
        `${f.j.situacion || ""} · Preguntas y situaciones ${pt.preg} (${f.j.aciertos || 0} aciertos) · Evaluaciones ${pt.eval} · Carrera ${f.j.carrera || 0} · Llegadas ${f.llegada} · Concurso ${pt.op}` +
        (evals.length ? ` · evaluación promedio ${Math.round(evals.reduce((a, b) => a + b, 0) / evals.length)}%` : "")));
      podio.append(d);
    });
    cont.append(podio);
    cont.append(nodo("p", "suave pequeno centrado", "Puntos: aciertos (más si la pregunta es difícil y si respondes rápido), evaluaciones anuales aprobadas, cuánto mejora tu carrera (indicadores, grado y cargo), orden de llegada de cada año y el resultado del concurso."));
  }

  /* ------------------------------ menú ------------------------------ */

  function menuPartida(confirmar) {
    if (!partida) return;
    mostrarPantalla(true);
    const c = caja();
    c.append(nodo("h2", "", "Menú"));
    if (!confirmar) {
      c.append(boton("Seguir jugando", "btn-principal btn-grande", cerrarMenu));
      c.append(boton("Salir de la partida", "btn-secundario", () => menuPartida("salir")));
      if (soyCoordinador()) {
        c.append(boton("Terminar ya y ver el podio", "btn-secundario", () => menuPartida("terminar")));
        c.append(boton("Cancelar la partida para todos", "btn-secundario", () => menuPartida("cancelar")));
      }
      c.append(nodo("p", "suave pequeno centrado", soyCoordinador()
        ? "Si cancelas, todos vuelven a la sala de espera y pueden empezar otra partida."
        : "Si sales, puedes crear otra sala o unirte a otra."));
    } else if (confirmar === "salir") {
      c.append(nodo("p", "centrado", "¿Seguro? Saldrás de la partida y perderás tu puntaje."));
      c.append(boton("Sí, salir", "btn-principal", salirDePartida));
      c.append(boton("No, seguir jugando", "btn-secundario", cerrarMenu));
    } else if (confirmar === "terminar") {
      c.append(nodo("p", "centrado", "¿Seguro? La partida termina para todos con los puntos que lleven ahora."));
      c.append(boton("Sí, ver el podio", "btn-principal", () => {
        if (red) red.enviar({ t: "fin", id: yo.id, nombre: yo.nombre });
        cerrarMenu();
        Juego.terminarYa("Terminaste la partida.");
      }));
      c.append(boton("No, seguir jugando", "btn-secundario", cerrarMenu));
    } else {
      c.append(nodo("p", "centrado", "¿Seguro? Se termina la partida para todos y vuelven a la sala de espera."));
      c.append(boton("Sí, cancelar la partida", "btn-principal", () => cancelarParaTodos()));
      c.append(boton("No, seguir jugando", "btn-secundario", cerrarMenu));
    }
  }
  function cerrarMenu() { mostrarPantalla(false); }

  /* ----------------- cancelar, salir y volver a la sala ----------------- */

  // Se recarga la página para empezar limpio, y se vuelve a entrar sola a la sala
  function volverASala(mensaje) {
    saliendo = true;
    borrar("cd-mj");
    if (partida) guardar("cd-dejada", partida.semilla);
    guardar("cd-volver", { sala: yo.sala, anf: yo.anf, unido: yo.unido, nombre: yo.nombre, pj: yo.pj, mensaje: mensaje || "", dejada: partida && partida.semilla });
    if (red) red.enviar({ t: "salir", id: yo.id });
    setTimeout(() => location.replace(urlBase() + "?sala=" + yo.sala), 150);
  }
  function cancelarParaTodos(mensaje) {
    if (red) red.enviar({ t: "cancelar", id: yo.id, nombre: yo.nombre });
    volverASala(mensaje || "Cancelaste la partida. Pueden empezar otra.");
  }
  function salirDePartida() {
    saliendo = true;
    borrar("cd-mj");
    if (partida) guardar("cd-dejada", partida.semilla);
    if (red) red.enviar({ t: "salir", id: yo.id });
    setTimeout(() => location.replace(urlBase() + "?mj=1"), 150);
  }

  /* ============================ latido ============================ */

  // Los demás saben que sigues aquí; también revisa si ya todos terminaron el año
  setInterval(() => {
    if (yo.fase === "sala" || yo.fase === "tarde") {
      enviarEstado();
      if (yo.fase === "sala") pantallaSala(); else pantallaUnirseTarde();
    }
    if (!partida) return;
    if (yo.fase === "juego" && !escenaLista) prepararEscena();
    enviarEstado();
    revisarAvance();
    actualizarHudMj();
    if (yo.fase === "fin") pintarPodio();
    if (yo.fase === "juego" && Date.now() - partida.t0 > M.duracionMaximaMin * 60000) Juego.terminarYa("Se acabó el tiempo de la partida.");
  }, 2500);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && red) { enviarEstado(); red.enviar({ t: "hola", id: yo.id }); }
  });
  window.addEventListener("pagehide", () => { if (red && yo.fase === "sala") red.enviar({ t: "salir", id: yo.id }); });

  /* ============================ arranque ============================ */

  // Lo llama juego.js al cargar la página. Devuelve true si el multijugador se encarga del inicio.
  function arrancar() {
    partidaDejada = leer("cd-dejada");
    const params = new URLSearchParams(location.search);
    const salaUrl = (params.get("sala") || "").toUpperCase();

    // ¿Se recargó la página a mitad de partida? Se retoma donde iba.
    const g = leer("cd-mj");
    if (g && g.v === 2 && g.yo && g.partida && (!salaUrl || salaUrl === g.yo.sala) && g.partida.transcurrido < M.duracionMaximaMin * 60000) {
      Object.assign(yo, g.yo, { id: miId });
      partida = Object.assign({}, g.partida, { t0: Date.now() - g.partida.transcurrido });
      activar();
      cargarLibs().then(conectar).catch(() => aviso("No se pudo conectar. Revisa internet.", "cruz"));
      if (g.E) {
        Juego.restaurar(g.E);
        if (g.E.esperando && !g.E.fin) {
          espera = { n: g.E.esperando, ids: (g.espera && g.espera.ids) || [], continuar: Juego.empezarAnio, desde: Date.now() };
          actualizarEspera();
        }
        if (!g.E.fin) { yo.fase = "juego"; hudExtras(); prepararEscena(); actualizarHudMj(); }
      } else {
        yo.fase = "intro";
        Juego.iniciar(pjDe(yo.pj));
      }
      return true;
    }
    borrar("cd-mj");

    // Volver a la sala después de cancelar o terminar
    const v = leer("cd-volver");
    borrar("cd-volver");
    if (v && v.sala && (!salaUrl || salaUrl === v.sala)) {
      yo.nombre = v.nombre || yo.nombre;
      yo.pj = v.pj || null;
      abrir().then(() => {
        entrarSala(v.sala, v.anf, v.unido);
        if (v.mensaje) aviso(v.mensaje, "jugadores");
      });
      return true;
    }

    // Enlace de una sala o "Salir de la partida"
    if (salaUrl || params.has("mj")) { abrir(); return true; }
    return false;
  }

  window.Multijugador = { abrir: () => abrir(), arrancar };
  window.__mj = { yo, otros, estado: () => ({ yo, otros, partida, espera }), escena };
})();
