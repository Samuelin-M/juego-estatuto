/* ==========================================================================
   MULTIJUGADOR EN EL MAPA
   Hasta 3 jugadores en el mismo pueblo, cada uno con un personaje distinto.
   Se juega por años, como el modo individual: cada uno hace las tareas de su
   año (contenido.js → multijugador.tareasPorAnio) y, al terminar, espera a que
   todos terminen para pasar juntos al año siguiente. Al final, podio.

   La conexión entre celulares usa red.js (Supabase Realtime, ver config.js).
   No hace falta editar este archivo para cambiar preguntas o tareas.
   ========================================================================== */

(function () {
  const C = CONTENIDO;
  const M = C.multijugador;
  const T = MAPA.tam;
  const IND = Object.keys(C.indicadores);
  const ANIOS = C.aniosDeJuego || M.tareasPorAnio.length;
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

  // fase: inicio | sala | tarde (pidiendo entrar) | juego | espera (terminó el año) | fin
  const yo = {
    id: "j" + Math.random().toString(36).slice(2, 10),
    nombre: nombreGuardado, sala: null, anf: false, unido: 0, pj: null,
    x: 9, y: 22, dir: "arriba", fase: "inicio", ind: null
  };
  function datosPartida() {
    return {
      anio: 1, hecho: {}, cartasTomadas: [], evidencias: [], terminoAnio: 0, tiempos: {}, evaluaciones: {},
      puntos: 0, ptsPreguntas: 0, ptsEval: 0, bonoOp: 0, aciertos: 0, oportunidad: null, usadas: {}, hechas: []
    };
  }
  Object.assign(yo, datosPartida());

  const otros = {};          // id → último estado recibido de cada jugador
  const salidos = new Set(); // jugadores que se salieron de la partida
  const forzados = {};       // años que el anfitrión pasó sin esperar
  let red = null;
  let partida = null;        // { semilla, ids, nombres, t0, inicioAnio }
  let pueblo = null;
  let interiorAbierto = false;
  let jugando = false;
  let podioMostrado = false;
  let respuestasConcurso = {};
  let relojPregunta = null;
  let panelActual = null;
  let entradaTarde = null;   // { ini, intentos } mientras se pide entrar a una partida ya empezada
  let esperaDesde = 0;

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
  const pjDe = (id) => C.personajes.find((p) => p.id === id);
  const escribiendo = () => { const a = document.activeElement; return !!a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA"); };
  const NOMBRES = { secretaria: "la Secretaría", colegio: "el Colegio", universidad: "la Universidad", rectoria: "la Rectoría" };
  const nombreEdificio = (id) => NOMBRES[id] || MAPA.edificios.find((e) => e.id === id).etiqueta;
  const mmss = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  const azarConSemilla = Pixel.azar;
  const temaDe = (anio) => (C.anios || []).find((t) => t.anio === anio);

  let tAviso;
  function aviso(msg, icono) {
    const el = $("aviso");
    el.innerHTML = "";
    if (icono) el.append(ico(icono));
    el.append(nodo("span", "", msg));
    el.classList.add("visible");
    clearTimeout(tAviso);
    tAviso = setTimeout(() => el.classList.remove("visible"), 2800);
  }

  function mostrarPantalla(visible) { $("mj-pantalla").classList.toggle("oculto", !visible); }
  // conservar: no volver arriba (para pantallas que se actualizan solas)
  let firmaPantalla = null;
  function caja(conservar) {
    const c = $("mj-caja");
    const arriba = $("mj-pantalla").scrollTop;
    c.innerHTML = "";
    $("mj-pantalla").scrollTop = conservar ? arriba : 0;
    firmaPantalla = null;
    return c;
  }

  /* ============================ tareas del año ============================ */

  const tareasDelAnio = (anio) => M.tareasPorAnio[Math.min(Math.max(anio, 1), M.tareasPorAnio.length) - 1] || [];
  const infoTarea = (t) => (M.tareas && M.tareas[t]) || { nombre: t };
  function hecha(t) {
    if (t === "cartas") return yo.cartasTomadas.length >= M.cartasPorAnio;
    return !!yo.hecho[t];
  }
  function tareaActual() { return tareasDelAnio(yo.anio).find((t) => !hecha(t)) || null; }
  function progresoAnio() { const ts = tareasDelAnio(yo.anio); return [ts.filter(hecha).length, ts.length]; }
  // Las cartas del año aparecen desde el principio (el primer año, después del concurso)
  function cartasDisponibles() {
    const ts = tareasDelAnio(yo.anio);
    return ts.includes("cartas") && (!ts.includes("concurso") || !!yo.hecho.concurso);
  }

  /* ============================ red ============================ */

  function estadoPublico() {
    const [k, n] = partida ? progresoAnio() : [0, 0];
    return {
      t: "j", id: yo.id, nombre: yo.nombre, pj: yo.pj, anf: yo.anf, unido: yo.unido,
      x: yo.x, y: yo.y, dir: yo.dir, fase: yo.fase,
      anio: yo.anio, terminoAnio: yo.terminoAnio, tiempos: yo.tiempos, evaluaciones: yo.evaluaciones,
      puntos: yo.puntos, ptsPreguntas: yo.ptsPreguntas, ptsEval: yo.ptsEval, bonoOp: yo.bonoOp,
      aciertos: yo.aciertos, oportunidad: yo.oportunidad,
      progreso: [k, n], tarea: partida ? tareaActual() : null,
      panel: panelActual,          // edificio o carta donde está respondiendo (para que los demás lo vean)
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

  const enSalaOTarde = () => yo.fase === "sala" || yo.fase === "tarde";
  const enPartida = (f) => f === "juego" || f === "espera" || f === "fin";
  const mismaPartida = (ini) => partida && ini && ini.semilla === partida.semilla;

  function recibir(m) {
    if (!m || !m.t || m.id === yo.id) return;
    if (m.t === "j") {
      const nuevo = !otros[m.id];
      otros[m.id] = Object.assign(otros[m.id] || {}, m, { visto: Date.now() });
      if (nuevo) enviarEstado();
      if (enSalaOTarde() && m.ini && m.ini.ids.includes(yo.id) && enPartida(m.fase)) { iniciarPartida(m.ini); return; }
      if (mismaPartida(m.ini)) unirIds(m.ini);
      resolverConflictoPersonaje();
      if (yo.fase === "sala") pantallaSala();
      if (yo.fase === "tarde") pantallaUnirseTarde();
      if (partida && enPartida(yo.fase)) {
        if (pueblo) pueblo.actualizarOtro(otros[m.id]);
        actualizarHud();
        revisarAvance();
        if (podioMostrado) mostrarPodio(true);
      }
    } else if (m.t === "hola") {
      enviarEstado();
    } else if (m.t === "inicio") {
      if (enSalaOTarde()) iniciarPartida(m);
      else if (mismaPartida(m)) unirIds(m);
    } else if (m.t === "pedir") {
      atenderPedido(m);
    } else if (m.t === "rechazo") {
      if (m.para === yo.id && yo.fase === "tarde") { entradaTarde = null; pantallaUnirseTarde(m.motivo); }
    } else if (m.t === "forzar") {
      if (partida && partida.ids.includes(m.id)) forzarAnio(m.anio, m.nombre);
    } else if (m.t === "cancelar") {
      if (partida && partida.ids.includes(m.id)) volverASala(`${m.nombre || "El anfitrión"} canceló la partida. ¡Pueden empezar otra!`);
    } else if (m.t === "fin") {
      if (partida && partida.ids.includes(m.id)) mostrarPodio();
    } else if (m.t === "salir") {
      if (partida && partida.ids.includes(m.id)) { salidos.add(m.id); aviso(`${(otros[m.id] && otros[m.id].nombre) || "Un jugador"} salió de la partida`, "jugadores"); }
      delete otros[m.id];
      if (pueblo) pueblo.quitarOtro(m.id);
      if (yo.fase === "sala") pantallaSala();
      revisarAvance();
    }
  }

  // Alguien entró tarde: se agrega a la lista de jugadores de esta partida
  function unirIds(ini) {
    let cambio = false;
    ini.ids.forEach((id) => { if (!partida.ids.includes(id)) { partida.ids.push(id); cambio = true; } });
    Object.assign(partida.nombres, ini.nombres || {});
    if (cambio) { actualizarHud(); guardarProgreso(); }
  }

  // Quien coordina la partida: el primero de la lista que siga conectado
  function coordinador() {
    if (!partida) return null;
    return partida.ids.find((id) => id === yo.id || (otros[id] && conectado(otros[id]) && !salidos.has(id)));
  }
  function reenviarInicio() {
    if (!partida || !red) return;
    red.enviar({ t: "inicio", id: yo.id, semilla: partida.semilla, ids: partida.ids, nombres: partida.nombres });
    enviarEstado();
  }
  function atenderPedido(m) {
    if (!partida || podioMostrado || coordinador() !== yo.id) return;
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
    actualizarHud();
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
    guardar("cd-mj", { yo, partida: { semilla: partida.semilla, ids: partida.ids, nombres: partida.nombres, transcurrido: Date.now() - partida.t0, enAnio: Date.now() - partida.inicioAnio } });
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
    c.append(nodo("p", "suave centrado", `Hasta ${M.maxJugadores} jugadores en el mismo pueblo viven ${ANIOS} años de carrera docente al mismo tiempo. Cada año hacen sus tareas y, al terminar, esperan a los demás. Gana quien decida mejor y más rápido.`));
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
    const enCurso = Object.values(otros).find((o) => conectado(o) && (o.fase === "juego" || o.fase === "espera") && o.ini && !o.ini.ids.includes(yo.id));
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
    if (!m.ids.includes(yo.id)) {
      // La partida empezó sin este jugador (por ejemplo, se le apagó la pantalla): pide entrar
      yo.fase = "tarde";
      entradaTarde = { ini: m };
      enviarEstado();
      if (yo.pj) pedirEntrada(); else pantallaUnirseTarde();
      return;
    }
    clearTimeout(vigiaSala);
    if (entradaTarde) { clearTimeout(entradaTarde.timer); entradaTarde = null; }
    const tarde = !restaurar && Object.values(otros).some((o) => m.ids.includes(o.id) && conectado(o) && (o.fase === "juego" || o.fase === "espera") && o.anio);
    salidos.clear();
    partida = {
      semilla: m.semilla, ids: m.ids.slice(), nombres: Object.assign({}, m.nombres),
      t0: Date.now() - (restaurar ? restaurar.transcurrido : 0),
      inicioAnio: Date.now() - (restaurar ? restaurar.enAnio || 0 : 0)
    };
    if (!restaurar) {
      const ini = INICIOS[m.ids.indexOf(yo.id)] || INICIOS[0];
      Object.assign(yo, datosPartida(), { fase: "juego", x: ini.x, y: ini.y, dir: "arriba" });
      yo.ind = Object.assign({}, pjDe(yo.pj).indicadores);
      // Si entra tarde, empieza en el año en que van los demás
      if (tarde) {
        const anios = Object.values(otros).filter((o) => m.ids.includes(o.id) && conectado(o) && o.anio).map((o) => o.anio);
        yo.anio = Math.max(1, Math.min(...anios));
        yo.terminoAnio = yo.anio - 1;
      }
    }
    respuestasConcurso = {};
    mostrarPantalla(false);
    $("hud").classList.remove("oculto");
    jugando = yo.fase === "juego" || yo.fase === "espera";
    if (pueblo) pueblo.empezar();
    actualizarHud();
    enviarEstado();
    if (yo.fase === "fin") { mostrarPodio(); return; }
    if (yo.fase === "espera") { esperaDesde = Date.now(); actualizarEspera(); revisarAvance(); return; }
    const tema = temaDe(yo.anio);
    aviso(`¡Arranca la carrera! Año ${yo.anio}` + (tema ? `: ${tema.tema}` : ""), "llegada");
  }

  /* ----------------- entrar a una partida que ya empezó ----------------- */

  function partidaEnCurso() {
    const o = Object.values(otros).find((x) => conectado(x) && enPartida(x.fase) && x.ini);
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
      c.append(nodo("div", "etiqueta", "Elige un personaje libre para entrar"));
      const grid = nodo("div", "lista-personajes compacta");
      C.personajes.forEach((pj) => {
        const ocupado = ocupados.includes(pj.id);
        const t = nodo("button", "tarjeta-personaje" + (yo.pj === pj.id && !ocupado ? " elegido" : ""));
        const ret = nodo("div", "pj-retrato");
        ret.append(Pixel.retrato(pj, 2));
        t.append(con("div", "pj-cabecera", ret, con("div", "", nodo("div", "pj-nombre", pj.nombre), nodo("div", "pj-perfil", pj.perfil))));
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


  /* ----------------- cancelar, salir y volver a la sala ----------------- */

  function limpiarPartida() {
    clearInterval(relojPregunta);
    $("interior").classList.add("oculto");
    interiorAbierto = false;
    dormirMapa(false);
    panelActual = null;
    partida = null;
    podioMostrado = false;
    jugando = false;
    respuestasConcurso = {};
    hudDe = null;
    salidos.clear();
    Object.keys(forzados).forEach((k) => delete forzados[k]);
    try { sessionStorage.removeItem("cd-mj"); } catch (e) { /* nada */ }
    Object.assign(yo, datosPartida());
    $("hud").classList.add("oculto");
    ocultarEspera();
    if (pueblo) pueblo.reiniciarTodo();
  }

  // Todos vuelven a la sala de espera del mismo código para jugar otra partida
  function volverASala(mensaje) {
    limpiarPartida();
    yo.fase = "sala";
    enviarEstado();
    firmaPantalla = null;
    pantallaSala();
    if (mensaje) aviso(mensaje, "jugadores");
  }
  function cancelarParaTodos(mensaje) {
    if (red) red.enviar({ t: "cancelar", id: yo.id, nombre: yo.nombre });
    volverASala(mensaje || "Cancelaste la partida. Pueden empezar otra.");
  }
  function salirDePartida() {
    limpiarPartida();
    salirSala();
    pantallaInicio();
  }
  const soyCoordinador = () => !!partida && coordinador() === yo.id;

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
      c.append(boton("Sí, ver el podio", "btn-principal", () => { if (red) red.enviar({ t: "fin", id: yo.id }); mostrarPodio(); }));
      c.append(boton("No, seguir jugando", "btn-secundario", cerrarMenu));
    } else {
      c.append(nodo("p", "centrado", "¿Seguro? Se termina la partida para todos y vuelven a la sala de espera."));
      c.append(boton("Sí, cancelar la partida", "btn-principal", () => cancelarParaTodos()));
      c.append(boton("No, seguir jugando", "btn-secundario", cerrarMenu));
    }
  }
  function cerrarMenu() { mostrarPantalla(false); }

  /* ============================== puntajes ============================== */

  function jugadoresPartida() {
    if (!partida) return [];
    return partida.ids.map((id) => (id === yo.id ? estadoPublico() : otros[id])).filter(Boolean);
  }
  // Los que siguen jugando (conectados y que no se han salido)
  function jugadoresActivos() {
    return jugadoresPartida().filter((j) => j.id === yo.id || (conectado(j) && !salidos.has(j.id)));
  }
  // Puntos por orden de llegada: cada año, el más rápido en terminarlo gana más
  function llegadaDe(id) {
    const lista = jugadoresPartida().filter((j) => !salidos.has(j.id));
    let total = 0;
    for (let a = 1; a <= ANIOS; a++) {
      const con = lista.filter((j) => j.tiempos && typeof j.tiempos[a] === "number").sort((p, q) => p.tiempos[a] - q.tiempos[a]);
      const pos = con.findIndex((j) => j.id === id);
      if (pos >= 0) total += M.bonoLlegadaAnio[pos] || 0;
    }
    return total;
  }
  const totalDe = (j) => (j.puntos || 0) + llegadaDe(j.id);

  /* ================================ HUD ================================ */

  let hudDe = null;
  function textoEstado(j) {
    if (j.fase === "fin" || j.fase === "espera") return "listo";
    const p = j.progreso || [0, 0];
    return `${p[0]}/${p[1]}`;
  }
  function objetivoTexto() {
    if (yo.fase === "fin") return `¡Terminaste los ${ANIOS} años!`;
    if (yo.fase === "espera") return `Terminaste el año ${yo.anio}: espera a que los demás terminen`;
    const t = tareaActual();
    if (!t) return "";
    if (t === "cartas") return `Año ${yo.anio} · Busca las cartas del año (${M.cartasPorAnio - yo.cartasTomadas.length} por encontrar)`;
    const info = infoTarea(t);
    return `Año ${yo.anio} · ${info.nombre} en ${nombreEdificio(info.edificio)}`;
  }
  function actualizarHud() {
    if (!partida) return;
    if (hudDe !== yo.pj && yo.pj) {
      hudDe = yo.pj;
      $("hud-avatar").innerHTML = "";
      $("hud-avatar").append(Pixel.cara(pjDe(yo.pj), 3));
    }
    $("hud-objetivo").textContent = objetivoTexto();
    $("hud-puntos-t").textContent = `${totalDe(estadoPublico())} pts`;
    $("hud-anio-t").textContent = `Año ${Math.min(yo.anio, ANIOS)}/${ANIOS}`;
    const [k, n] = progresoAnio();
    $("hud-proceso-t").textContent = yo.fase === "juego" ? `${k}/${n}` : "listo";
    $("hud-reloj-t").textContent = mmss(yo.fase === "juego" ? Date.now() - partida.inicioAnio : (yo.tiempos[yo.anio] || 0));
    const rk = $("hud-ranking");
    rk.innerHTML = "";
    jugadoresPartida().filter((j) => !salidos.has(j.id)).sort((a, b) => totalDe(b) - totalDe(a)).forEach((j, i) => {
      const p = pjDe(j.pj);
      const ch = nodo("span", "chip rk" + (j.id === yo.id ? " yo" : "") + (j.id === yo.id || conectado(j) ? "" : " fuera"));
      if (MEDALLAS[i]) ch.append(ico(MEDALLAS[i]));
      if (p) ch.append(Pixel.cara(p, 1));
      ch.append(nodo("span", "", `${String(j.nombre).split(" ")[0]} ${totalDe(j)} · ${textoEstado(j)}`));
      rk.append(ch);
    });
  }

  // Latido: los demás saben que sigues aquí; también revisa si ya todos terminaron el año
  setInterval(() => {
    if (yo.fase === "sala" || yo.fase === "tarde") {
      enviarEstado();
      if (yo.fase === "sala") pantallaSala(); else pantallaUnirseTarde();
    }
    if (!partida) return;
    actualizarHud();
    enviarEstado();
    revisarAvance();
    if (yo.fase === "espera") actualizarEspera();
    if (!podioMostrado && Date.now() - partida.t0 > M.duracionMaximaMin * 60000) {
      aviso("Se acabó el tiempo de la partida", "reloj");
      mostrarPodio();
    }
  }, 2500);

  /* -------------------------- paneles (edificios) -------------------------- */

  // Mientras hay un panel abierto el mapa no se ve: se pausa para que el celular vaya fluido
  function dormirMapa(si) {
    const g = window.juego;
    if (!g || !g.loop) return;
    if (si && g.loop.running) g.loop.sleep();
    else if (!si && !g.loop.running) g.loop.wake(true);
  }

  function abrirPanel(icono, nombre, sub) {
    interiorAbierto = true;
    setTimeout(() => { if (interiorAbierto) dormirMapa(true); }, 30);
    panelActual = icono;
    $("aviso").classList.remove("visible");
    $("int-icono").innerHTML = "";
    $("int-icono").append(ico(icono, 3));
    $("int-nombre").textContent = nombre;
    $("int-arts").textContent = sub || "";
    $("interior").classList.remove("oculto");
    enviarEstado();
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
    dormirMapa(false);
    if (panelActual) { panelActual = null; if (partida) enviarEstado(); }
    actualizarHud();
    if (pueblo) pueblo.actualizarMarcadores();
  }

  function entrarEdificio(id) {
    if (!jugando || interiorAbierto || !partida) return;
    if (yo.fase === "espera") return aviso(`Ya terminaste el año ${yo.anio}: espera a los demás`, "reloj");
    const t = tareaActual();
    if (!t) return;
    if (t === "cartas") return aviso(`Primero busca las cartas del año (${M.cartasPorAnio - yo.cartasTomadas.length} por encontrar)`, "carta");
    const info = infoTarea(t);
    if (info.edificio !== id) return aviso(`Ahora te toca: ${info.nombre} en ${nombreEdificio(info.edificio)}`, "candado");
    abrirPanel(id, info.nombre, `Año ${yo.anio} de ${ANIOS}` + (info.articulos ? ` · ${info.articulos}` : ""));
    hacerTarea(t);
  }

  function hacerTarea(t) {
    if (t === "concurso") return estructuraConcurso();
    if (t === "evaluacion") return evaluacionAnual();
    const banco = t === "colegio" ? "colegio" : t;
    const item = Comun.sacar(banco, (yo.usadas[banco] = yo.usadas[banco] || []), null, Math.random, yo.anio);
    const nombre = infoTarea(t).nombre;
    jugarPregunta(item, banco, 1, 1, nombre, () => { yo.hecho[t] = true; tareaHecha(nombre); }, "Volver al mapa");
  }

  // Al completar una tarea: guardar, avisar y, si toca, aparecer las cartas
  function tareaHecha(nombre) {
    cerrarPanel();
    enviarEstado();
    if (pueblo && cartasDisponibles() && !pueblo.cartas.length) pueblo.generarCartas();
    const t = tareaActual();
    if (t) aviso(`${nombre}: ¡listo! Ahora: ${t === "cartas" ? "busca las cartas del año" : infoTarea(t).nombre}`, "check");
    actualizarHud();
    if (pueblo) pueblo.actualizarMarcadores();
  }

  /* --------------------------- preguntas con tiempo --------------------------- */

  const QUIEN = {
    aptitudes: ["Prueba de aptitudes", "funcionaria"], psicotecnica: ["Prueba psicotécnica", "funcionaria"],
    entrevista: ["Jurado de la entrevista", "jurado"], universidad: ["Asesora de posgrados", "asesora"],
    secretaria: ["Oficina de escalafón", "funcionaria"]
  };

  function chipsEfectos(cambios) {
    const cont = nodo("div", "efectos");
    cambios.forEach(({ k, d }) => cont.append(con("span", "efecto " + (d > 0 ? "positivo" : "negativo"), ico(k), `${d > 0 ? "+" : ""}${d} ${C.indicadores[k].nombre}`)));
    return cont;
  }
  function aplicar(efectos) {
    const cambios = [];
    Object.entries(efectos || {}).forEach(([k, d]) => {
      if (!yo.ind || !(k in yo.ind) || !d) return;
      const antes = yo.ind[k];
      yo.ind[k] = lim(antes + d);
      if (yo.ind[k] !== antes) cambios.push({ k, d: yo.ind[k] - antes });
    });
    return cambios;
  }

  // item: pregunta o situación sacada de un banco. etiqueta: cómo se llama en la carpeta de evidencias
  function jugarPregunta(item, banco, numero, total, etiqueta, alTerminar, textoBoton) {
    const limite = M.segundosPorPregunta * 1000;
    const inicio = Date.now();
    let respondida = false;
    const c = limpiarCuerpo();
    if (!item) {
      c.append(nodo("div", "globo", `Todavía no hay preguntas en el banco "${banco}".`));
      accion(textoBoton || "Continuar", alTerminar);
      return;
    }
    const situacion = !!(item.opciones && item.opciones.some((o) => o.efectos));
    let quien = QUIEN[banco] || [null, "funcionaria"];
    if (banco === "colegio") quien = [item.personaje, "estudiante"];
    if (banco === "cartas") quien = ["Carta " + (item.tipo || "").toLowerCase(), "funcionaria"];
    const dif = item.dificultad || 1;
    const valorAcierto = M.puntosPorDificultad[dif - 1] || M.puntosPorDificultad[0];

    const cab = nodo("div", "pregunta-cabecera");
    cab.append(con("span", "paso", total > 1 ? `Pregunta ${numero} de ${total}` : (situacion ? "Situación" : "Pregunta"), " ", nodo("span", "nivel nivel-" + dif, Comun.nombreNivel(dif))));
    const reloj = con("span", "reloj-mj", ico("reloj"), nodo("span", "", String(M.segundosPorPregunta)));
    cab.append(reloj);
    c.append(cab);
    const barra = nodo("div", "barra-tiempo");
    const relleno = nodo("div", "barra-tiempo-relleno");
    barra.append(relleno);
    c.append(barra);
    if (quien[0]) c.append(con("div", "personaje", Pixel.cara(quien[1], 2), quien[0]));
    if (item.titulo) c.append(nodo("h3", "titulo-carta", item.titulo));
    c.append(nodo("div", "enunciado", item.texto));
    c.append(nodo("div", "elige", situacion ? "¿Qué haces?" : "Elige una respuesta"));
    const ops = Comun.opciones(item, (op) => responder(op));
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
      const clave = `${yo.anio}:${banco}:${item.indice}:${numero}`;
      const repetida = yo.hechas.includes(clave);
      const bono = ok && !repetida ? Math.round(M.bonoRapidez * Math.max(0, (limite - t) / limite)) : 0;
      const pts = ok && !repetida ? valorAcierto + bono : 0;
      if (!repetida) { yo.hechas.push(clave); yo.puntos += pts; yo.ptsPreguntas += pts; if (ok) yo.aciertos++; }
      let cambios = [];
      if (situacion && op) cambios = aplicar(op.efectos);
      if (situacion) yo.evidencias.push({ nombre: etiqueta || item.titulo || "Situación", bien: op ? ok : false, efectos: op ? op.efectos || {} : {} });
      if (C.concurso.pruebas.some((x) => x.banco === banco)) respuestasConcurso[banco] = op;
      enviarEstado();
      actualizarHud();

      const c2 = limpiarCuerpo();
      const res = nodo("div", "resultado-pregunta " + (op === null ? "neutro" : ok ? "bien" : "mal"));
      res.append(ico(op === null ? "reloj" : ok ? "check" : "cruz", 3));
      res.append(nodo("div", "rp-titulo", op === null ? "Se acabó el tiempo" : ok ? (situacion ? "¡Buena decisión!" : "¡Correcto!") : (situacion ? "No fue la mejor decisión" : "Incorrecto")));
      res.append(nodo("div", "rp-puntos", ok ? `+${pts} pts (${valorAcierto} por ser ${Comun.nombreNivel(dif)} + ${bono} por rapidez · ${(t / 1000).toFixed(1)} s)` : "+0 pts"));
      c2.append(res);
      if (op && !ok) c2.append(nodo("p", "respuesta-elegida", "Tu respuesta: " + op.texto));
      const cor = Comun.correctaDe(item);
      if (!ok && cor) c2.append(con("div", "globo", "La respuesta correcta: ", con("b", "", cor.texto)));
      if (situacion && op && op.consecuencia) c2.append(nodo("div", "globo", op.consecuencia));
      if (cambios.length) c2.append(chipsEfectos(cambios));
      const fuente = situacion ? (op && (op.articulo || op.explicacion) ? op : cor) : item;
      if (fuente && (fuente.articulo || fuente.explicacion)) {
        const tarjeta = nodo("div", "tarjeta-articulo");
        tarjeta.append(con("div", "art-titulo", ico("articulo"), fuente.articulo || "Estatuto docente"));
        if (fuente.explicacion) tarjeta.append(nodo("p", "", fuente.explicacion));
        c2.append(tarjeta);
      }
      accion(textoBoton || "Continuar", alTerminar);
    }
  }

  /* ------------------------------ concurso ------------------------------ */

  // Antes de las pruebas: las cuatro etapas (texto del grupo)
  function estructuraConcurso() {
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
    respuestasConcurso = {};
    const pruebas = K.pruebas.map((p) => p.banco);
    const siguiente = (i) => {
      if (i >= pruebas.length) return resultadoConcurso();
      const banco = pruebas[i];
      const item = Comun.sacar(banco, (yo.usadas[banco] = yo.usadas[banco] || []), null, Math.random, 1);
      jugarPregunta(item, banco, i + 1, pruebas.length, null, () => siguiente(i + 1), i + 1 < pruebas.length ? "Siguiente prueba" : "Ver resultados");
    };
    accion("Empezar las pruebas", () => siguiente(0));
  }

  const ICONO_OPORTUNIDAD = { vacante: "check", provisional: "proceso", reemplazo: "reloj", ninguna: "cruz" };
  function fila(texto, valor, total, icono) {
    const f = nodo("div", "fila" + (total ? " total" : ""));
    f.append(icono ? con("span", "fila-ico", ico(icono), texto) : nodo("span", "", texto), nodo("span", "fila-valor", valor));
    return f;
  }

  function resultadoConcurso() {
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
    if (!yo.hecho.concurso) { yo.bonoOp = bono; yo.puntos += bono; yo.oportunidad = op.tipo; }
    c.append(con("div", "oportunidad " + op.tipo, ico(ICONO_OPORTUNIDAD[op.tipo]), nodo("div", "oportunidad-titulo", (op.tipo === "ninguna" ? "Sin plaza" : "Oportunidad laboral: " + op.nombre) + ` · +${bono} pts`)));
    const t = nodo("div", "tarjeta-articulo");
    t.append(con("div", "art-titulo", ico("articulo"), op.articulo));
    t.append(nodo("p", "", op.explicacion));
    c.append(t);
    if (op.tipo === "ninguna") c.append(nodo("p", "suave pequeno", "En el juego sigues adelante como reemplazo para poder vivir toda la carrera, pero en la vida real tendrías que presentarte a otra convocatoria."));
    accion("Continuar", () => { yo.hecho.concurso = true; tareaHecha(infoTarea("concurso").nombre); });
  }

  /* ----------------- evaluación anual (sin preguntas) ----------------- */

  // No es un examen: el rector revisa lo que se hizo durante el año (arts. 32 a 34)
  function evaluacionAnual() {
    const A = C.evaluacionAnual;
    let total = 0;
    const partes = Object.entries(A.pesos).map(([k, w]) => { const v = yo.ind[k] * w; total += v; return { k, w, v }; });
    const r = Math.round(total);
    const prueba = yo.anio === 1 && yo.oportunidad === "vacante";
    const c = limpiarCuerpo();
    c.append(con("div", "personaje", Pixel.cara("rector", 2), "Rector"));
    c.append(nodo("div", "globo", (prueba ? "Terminó tu primer año: esta es la evaluación de tu periodo de prueba." : `Terminó el año ${yo.anio}: esta es tu evaluación anual de desempeño.`) +
      " No es un examen: reviso lo que hiciste durante el año, como tus clases y las situaciones que resolviste."));
    // carpeta de evidencias (art. 33)
    const carpeta = nodo("div", "carpeta");
    carpeta.append(con("div", "art-titulo", ico("proceso"), "Carpeta de evidencias del año · Art. 33"));
    if (!yo.evidencias.length) carpeta.append(nodo("p", "suave pequeno", "Este año no hubo situaciones registradas."));
    else {
      const ul = nodo("ul", "evidencias");
      yo.evidencias.forEach((ev) => {
        const ef = Object.entries(ev.efectos || {}).filter(([, v]) => v).map(([k, v]) => `${v > 0 ? "+" : ""}${v} ${C.indicadores[k] ? C.indicadores[k].nombre.toLowerCase() : k}`).join(", ");
        ul.append(con("li", "", ico(ev.bien ? "check" : "cruz"), con("span", "", ev.nombre, ef ? nodo("small", "", " · " + ef) : null)));
      });
      carpeta.append(ul);
    }
    c.append(carpeta);
    const tabla = nodo("div", "tabla");
    partes.forEach(({ k, w, v }) => tabla.append(fila(`${C.indicadores[k].nombre}: ${yo.ind[k]} × ${Math.round(w * 100)}%`, v.toFixed(1), false, k)));
    tabla.append(fila("Resultado", r + "%", true));
    c.append(tabla);
    const aprobo = r >= A.minimo;
    const pts = aprobo ? r : 0;
    c.append(con("div", "oportunidad " + (aprobo ? "vacante" : "reemplazo"), ico(aprobo ? "check" : "cruz"),
      nodo("div", "oportunidad-titulo", aprobo ? `Evaluación satisfactoria · +${pts} pts` : `No alcanzaste el ${A.minimo}% · +0 pts`)));
    const t = nodo("div", "tarjeta-articulo");
    if (prueba) {
      t.append(con("div", "art-titulo", ico("articulo"), "Art. 31 · Evaluación del periodo de prueba"));
      t.append(nodo("p", "", "Al terminar el año escolar se evalúa el periodo de prueba; con 60% o más, el docente queda inscrito en el escalafón."));
    } else if (aprobo) {
      t.append(con("div", "art-titulo", ico("articulo"), "Arts. 32 y 33 · Evaluación de desempeño"));
      t.append(nodo("p", "", "Se hace al terminar cada año escolar y mide el cumplimiento de las funciones con instrumentos como la observación de clases, encuestas a padres y estudiantes y la autoevaluación."));
    } else {
      t.append(con("div", "art-titulo", ico("articulo"), "Art. 36 · Resultados de la evaluación"));
      t.append(nodo("p", "", "Si un docente saca menos de 60% en dos evaluaciones de desempeño seguidas, queda excluido del escalafón y sale del servicio."));
    }
    c.append(t);
    accion(yo.anio >= ANIOS ? "Terminar mi carrera" : `Terminar el año ${yo.anio}`, () => {
      yo.evaluaciones[yo.anio] = r;
      yo.ptsEval += pts;
      yo.puntos += pts;
      yo.hecho.evaluacion = true;
      aplicar({ experiencia: C.evaluacionAnual.experienciaPorAnio || 6 });
      terminarAnio();
    });
  }

  /* ---------------------- fin de año y lista de espera ---------------------- */

  function terminarAnio() {
    yo.terminoAnio = yo.anio;
    yo.tiempos[yo.anio] = Date.now() - partida.inicioAnio;
    yo.fase = "espera";
    esperaDesde = Date.now();
    cerrarPanel();
    if (pueblo) pueblo.limpiarCartas();
    aviso(`¡Terminaste el año ${yo.anio} en ${mmss(yo.tiempos[yo.anio])}! Espera a los demás`, "llegada");
    enviarEstado();
    actualizarEspera();
    revisarAvance();
  }

  // ¿Ya terminaron todos el año? Entonces todos pasan juntos al siguiente
  function revisarAvance() {
    if (!partida || yo.fase !== "espera") return;
    const n = yo.anio;
    const faltan = jugadoresActivos().filter((j) => j.id !== yo.id && (j.terminoAnio || 0) < n);
    if (faltan.length && !forzados[n]) { actualizarEspera(); return; }
    avanzarAnio();
  }

  function avanzarAnio() {
    const n = yo.anio;
    if (n >= ANIOS) {
      yo.fase = "fin";
      jugando = false;
      enviarEstado();
      ocultarEspera();
      mostrarPodio();
      return;
    }
    Object.assign(yo, { anio: n + 1, hecho: {}, cartasTomadas: [], evidencias: [], fase: "juego" });
    partida.inicioAnio = Date.now();
    ocultarEspera();
    if (pueblo) { pueblo.generarCartas(); pueblo.actualizarMarcadores(); }
    const tema = temaDe(yo.anio);
    aviso(`¡Comienza el año ${yo.anio}!` + (tema ? ` ${tema.tema}` : ""), "reloj");
    enviarEstado();
    actualizarHud();
  }

  // El anfitrión pasa de año sin esperar (por si alguien se quedó quieto)
  function forzarAnio(n, quien) {
    forzados[n] = true;
    if (partida && yo.fase === "juego" && yo.anio === n) {
      cerrarPanel();
      yo.terminoAnio = n;
      yo.fase = "espera";
      aviso(`${quien || "El anfitrión"} pasó al año siguiente`, "reloj");
    }
    revisarAvance();
  }

  function actualizarEspera() {
    const el = $("espera-anio");
    if (!partida || yo.fase !== "espera") { ocultarEspera(); return; }
    el.classList.remove("oculto");
    el.innerHTML = "";
    el.append(con("div", "espera-titulo", ico("llegada"), `Terminaste el año ${yo.anio} de ${ANIOS}`));
    const ul = nodo("ul", "espera-lista");
    jugadoresActivos().forEach((j) => {
      const listo = (j.terminoAnio || 0) >= yo.anio;
      const p = j.progreso || [0, 0];
      const tarea = j.tarea ? (j.tarea === "cartas" ? "buscando cartas" : infoTarea(j.tarea).nombre.toLowerCase()) : "";
      ul.append(con("li", listo ? "listo" : "", ico(listo ? "check" : "reloj"),
        nodo("span", "", j.id === yo.id ? "Tú" : j.nombre),
        nodo("small", "", listo ? (j.tiempos && j.tiempos[yo.anio] ? mmss(j.tiempos[yo.anio]) : "listo") : `${p[0]}/${p[1]} · ${tarea}`)));
    });
    el.append(ul);
    if (soyCoordinador() && Date.now() - esperaDesde > M.esperaParaForzar * 1000) {
      el.append(boton("Pasar al siguiente año sin esperar", "btn-secundario", () => {
        if (red) red.enviar({ t: "forzar", id: yo.id, anio: yo.anio, nombre: yo.nombre });
        forzarAnio(yo.anio, yo.nombre);
      }));
    } else {
      el.append(nodo("p", "espera-nota", "Puedes caminar por el pueblo mientras tanto."));
    }
  }
  function ocultarEspera() { $("espera-anio").classList.add("oculto"); }

  /* ------------------------------ cartas ------------------------------ */

  function abrirCarta(carta) {
    if (yo.fase !== "juego" || yo.cartasTomadas.includes(carta.indice)) return;
    const item = Comun.sacar("cartas", (yo.usadas.cartas = yo.usadas.cartas || []), null, Math.random, yo.anio);
    abrirPanel("carta", "Situación inesperada", `Año ${yo.anio} · Carta ${yo.cartasTomadas.length + 1} de ${M.cartasPorAnio}`);
    jugarPregunta(item, "cartas", yo.cartasTomadas.length + 1, M.cartasPorAnio, item && item.titulo ? item.titulo : "Situación inesperada", () => {
      yo.cartasTomadas.push(carta.indice);
      if (carta.sprite) { carta.sprite.destroy(); carta.sprite = null; }
      const faltan = M.cartasPorAnio - yo.cartasTomadas.length;
      if (faltan > 0) { cerrarPanel(); enviarEstado(); aviso(`Te falta ${faltan} carta por encontrar`, "carta"); }
      else tareaHecha("Situaciones inesperadas");
    }, "Volver al mapa");
  }

  /* ------------------------------ podio ------------------------------ */

  function mostrarPodio(refrescar) {
    if (!partida) return;
    if (refrescar && !podioMostrado) return;
    if (!podioMostrado) {
      podioMostrado = true;
      jugando = false;
      cerrarPanel();
      ocultarEspera();
      $("hud").classList.add("oculto");
      try { sessionStorage.removeItem("cd-mj"); } catch (e) { /* nada */ }
      if (yo.fase !== "fin") { yo.fase = "fin"; enviarEstado(); }
    }
    mostrarPantalla(true);
    const c = caja(refrescar);
    c.append(nodo("h1", "centrado", "Podio"));
    const filas = jugadoresPartida().filter((j) => !salidos.has(j.id)).map((j) => ({ j, llegada: llegadaDe(j.id), total: totalDe(j) }))
      .sort((a, b) => b.total - a.total);
    const podio = nodo("div", "podio-mj");
    filas.forEach((f, i) => {
      const p = pjDe(f.j.pj);
      const d = nodo("div", "puesto-mj p" + (i + 1) + (f.j.id === yo.id ? " yo" : ""));
      d.append(con("div", "medalla", MEDALLAS[i] ? ico(MEDALLAS[i], 3) : `${i + 1}°`));
      if (p) { const r = nodo("div", "pj-retrato"); r.append(Pixel.retrato(p, 2)); d.append(r); }
      d.append(con("div", "puesto-info",
        con("div", "puesto-nombre", f.j.nombre, f.j.id === yo.id ? nodo("span", "tu", " (tú)") : null),
        nodo("div", "puesto-total", f.total + " pts")));
      const evals = Object.values(f.j.evaluaciones || {});
      d.append(nodo("div", "puesto-detalle",
        `Preguntas y situaciones ${f.j.ptsPreguntas || 0} · Evaluaciones ${f.j.ptsEval || 0} · Llegadas ${f.llegada} · Concurso ${f.j.bonoOp || 0}` +
        ` · ${f.j.aciertos || 0} aciertos` + (evals.length ? ` · evaluación promedio ${Math.round(evals.reduce((a, b) => a + b, 0) / evals.length)}%` : "") +
        (f.j.fase === "fin" ? "" : ` · iba en el año ${f.j.anio}`)));
      podio.append(d);
    });
    c.append(podio);
    c.append(nodo("p", "suave pequeno centrado", "Puntos: aciertos (más si la pregunta es difícil y si respondes rápido), evaluaciones anuales, orden de llegada de cada año y el resultado del concurso."));
    if (soyCoordinador()) c.append(boton("Otra partida en esta sala", "btn-principal btn-grande", () => cancelarParaTodos("Nueva partida: elijan personaje y empiecen.")));
    else c.append(boton("Volver a la sala de espera", "btn-principal btn-grande", () => volverASala()));
    c.append(boton("Crear una sala nueva", "btn-secundario", () => { limpiarPartida(); salirSala(); pantallaInicio(); }));
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
      this.tapado = m.tapado;

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
      // Sin "capturar" las teclas: si no, no se podrían escribir la a, d, s, w ni espacios en los campos de texto
      this.teclas = this.input.keyboard.addKeys("UP,DOWN,LEFT,RIGHT,W,A,S,D,SPACE,ENTER", false);
      this.input.keyboard.clearCaptures();
      this.input.keyboard.disableGlobalCapture();
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
      this.generarCartas();
      this.actualizarMarcadores();
    }

    // Deja el mapa como al principio (al cancelar o salir de la partida)
    reiniciarTodo() {
      Object.keys(this.otros).forEach((id) => this.quitarOtro(id));
      this.limpiarCartas();
      this.tweens.killTweensOf(this.jugador);
      this.jugador.anims.stop();
      this.moviendo = false;
      this.camino = [];
      this.jugador.setVisible(false);
      this.sombra.setVisible(false);
      this.miEtiqueta.setVisible(false);
      this.flecha.setVisible(false);
      this.flechaBase = null;
      MAPA.edificios.forEach((ed) => Graficos.marcar(this.dibujos[ed.id], null));
    }

    // Globito con el ícono de lo que está haciendo otro jugador
    texBurbuja(icono) {
      const clave = "burbuja-" + icono;
      if (!this.textures.exists(clave)) this.textures.addCanvas(clave, Pixel.escalar(Pixel.burbuja(icono).c, 2));
      return clave;
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
      if (!partida || yo.fase !== "juego" || !cartasDisponibles()) return null;
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

    // Cartas del año: salen en las mismas casillas para todos (semilla de la partida y año),
    // pero cada uno recoge las suyas y le salen sus propias situaciones
    generarCartas() {
      this.limpiarCartas();
      if (!partida || yo.fase !== "juego" || !cartasDisponibles()) return;
      const rnd = azarConSemilla(partida.semilla + yo.anio * 101);
      const libres = [];
      const puertas = MAPA.edificios.map((e) => e.puerta);
      MAPA.filas.forEach((fila, y) => [...fila].forEach((ch, x) => {
        // en cualquier casilla por donde se camina (también caminos y orillas), pero nunca detrás de algo
        if (!this.esCaminable(x, y) || this.tapado[y][x]) return;
        if (puertas.some((q) => Math.abs(q.x - x) + Math.abs(q.y - y) < 2)) return;
        if (INICIOS.some((q) => q.x === x && q.y === y)) return;
        libres.push({ x, y });
      }));
      for (let i = 0; i < M.cartasPorAnio && libres.length; i++) {
        const pos = libres.splice(Math.floor(rnd() * libres.length), 1)[0];
        const carta = { indice: i, x: pos.x, y: pos.y, sprite: null };
        if (!yo.cartasTomadas.includes(i)) {
          carta.sprite = this.add.image(this.pxX(pos.x), pos.y * T + T / 2 + 4, "carta").setDepth(pos.y * T + T);
          this.tweens.add({ targets: carta.sprite, y: carta.sprite.y - 5, duration: 600, yoyo: true, repeat: -1, ease: "Sine.inOut", delay: i * 200 });
        }
        this.cartas.push(carta);
      }
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
      // qué está haciendo: respondiendo en un edificio o una carta, o esperando a los demás
      const icono = o.panel && Pixel.ICONOS[o.panel] ? o.panel : (o.fase === "espera" ? "reloj" : null);
      if (icono) {
        if (!v.burbuja) v.burbuja = this.add.image(px, py, this.texBurbuja(icono)).setOrigin(0.5, 1).setDepth(99992);
        else v.burbuja.setTexture(this.texBurbuja(icono));
        v.burbuja.setVisible(true);
      } else if (v.burbuja) v.burbuja.setVisible(false);
      // avisos de su progreso
      const k = (o.progreso || [0])[0];
      if (v.anio === o.anio && v.k !== undefined && k > v.k && v.tarea && v.tarea !== "cartas" && v.tarea !== "evaluacion") aviso(`${o.nombre} completó: ${infoTarea(v.tarea).nombre}`, "check");
      if (v.terminoAnio !== undefined && (o.terminoAnio || 0) > v.terminoAnio) aviso(`${o.nombre} terminó el año ${o.terminoAnio}`, "llegada");
      v.anio = o.anio; v.k = k; v.tarea = o.tarea; v.terminoAnio = o.terminoAnio || 0;
      const rotulo = o.nombre;
      if (v.nombre !== rotulo) { v.nombre = rotulo; v.texto.destroy(); v.texto = this.etiqueta(rotulo); }
    }

    quitarOtro(id) {
      const v = this.otros[id];
      if (!v) return;
      v.sprite.destroy(); v.sombra.destroy(); v.texto.destroy();
      if (v.burbuja) v.burbuja.destroy();
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
      const t = partida && yo.fase === "juego" ? tareaActual() : null;
      const ts = partida ? tareasDelAnio(yo.anio) : [];
      MAPA.edificios.forEach((ed) => {
        const d = this.dibujos[ed.id];
        if (!partida || yo.fase === "fin") { Graficos.marcar(d, null); return; }
        const delEdificio = ts.filter((x) => infoTarea(x).edificio === ed.id);
        if (!delEdificio.length) { Graficos.marcar(d, null); return; }
        if (t && infoTarea(t).edificio === ed.id) Graficos.marcar(d, null);
        else if (delEdificio.every(hecha)) Graficos.marcar(d, "check");
        else Graficos.marcar(d, "candado");
      });
      let destino = null;
      if (t && t !== "cartas") {
        const ed = MAPA.edificios.find((e) => e.id === infoTarea(t).edificio);
        destino = { x: this.pxX(ed.puerta.x), y: (ed.y + ed.h) * T - 14 };
      } else if (t === "cartas") {
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
        if (v.burbuja) v.burbuja.setPosition(v.sprite.x, v.sprite.y - 72 + this.rebote.v * 0.4);
      });
      if (this.flechaBase) {
        this.flecha.setPosition(this.flechaBase.x, this.flechaBase.y + this.rebote.v);
        if (this.cartas.length) this.actualizarMarcadores();
      }
      if (!jugando || interiorAbierto || this.moviendo || escribiendo() || !$("mj-pantalla").classList.contains("oculto")) return;
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
  $("btn-menu").onclick = () => { if (!interiorAbierto) menuPartida(); };

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
  if (guardado && guardado.yo && guardado.partida && guardado.yo.anio && (!params.get("sala") || params.get("sala").toUpperCase() === guardado.yo.sala) &&
      guardado.partida.transcurrido < M.duracionMaximaMin * 60000) {
    Object.assign(yo, guardado.yo);
    conectar();
    iniciarPartida({ semilla: guardado.partida.semilla, ids: guardado.partida.ids, nombres: guardado.partida.nombres }, guardado.partida);
  } else {
    pantallaInicio();
  }

  window.__mj = { yo, otros, estado: () => ({ yo, otros, partida, podioMostrado }), entrar: (id) => entrarEdificio(id), escena: () => pueblo };
})();
