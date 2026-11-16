/* ==========================================================================
   MODO INDIVIDUAL — mapa, movimiento y simulación de la carrera por años.
   No hace falta editar este archivo para cambiar la historia: todo el
   contenido está en contenido.js.
   ========================================================================== */

(function () {
  const C = CONTENIDO;
  const T = MAPA.tam;
  const IND = Object.keys(C.indicadores);
  const $ = (id) => document.getElementById(id);
  const ico = (nombre, escala) => Pixel.icono(nombre, escala || 2);

  let E = null;               // estado de la partida
  let pueblo = null;          // escena de Phaser
  let interiorAbierto = false;
  let jugando = false;
  let elegido = null;         // personaje escogido en la selección

  /* ============================ utilidades ============================ */

  const lim = (n) => Math.max(0, Math.min(100, Math.round(n)));

  function nodo(tag, clase, texto) {
    const n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto !== undefined && texto !== null) n.textContent = texto;
    return n;
  }
  // Crea un nodo con hijos (textos o nodos)
  function con(tag, clase, ...hijos) {
    const n = nodo(tag, clase);
    hijos.forEach((h) => { if (h !== null && h !== undefined && h !== false) n.append(typeof h === "object" ? h : document.createTextNode(String(h))); });
    return n;
  }
  function boton(texto, clase, fn) {
    const b = nodo("button", clase || "btn-opcion", texto);
    b.onclick = fn;
    return b;
  }
  const a = () => (E && Pixel.esMujer(E.pj) ? "a" : "o");     // terminación según el personaje

  function nuevoEstado(pj) {
    return {
      pj,
      ind: Object.assign({}, pj.indicadores),
      anio: 1,
      aniosExp: pj.aniosExperiencia || 0,
      laboral: "aspirante",       // aspirante | provisional | prueba | carrera | excluido
      oportunidad: null,
      cargo: "Docente",
      grado: null,
      nivel: "A",
      aniosDesdeAscenso: 0,
      titulos: { pedagogia: pj.titulo === "licenciado", maestria: !!pj.maestria, doctorado: false, licenciatura: false },
      estudiando: null,           // { id, restantes }
      evalBajas: 0,
      anioConcurso: 0,
      intentos: 0,                // veces que se ha presentado al concurso (sube la dificultad)
      hechos: {},
      cartas: [],
      usadas: {},                 // preguntas ya usadas de cada banco
      articulos: [],
      historial: [],
      fin: false
    };
  }
  const usadas = (banco) => (E.usadas[banco] = E.usadas[banco] || []);

  function aplicar(efectos) {
    const cambios = [];
    Object.entries(efectos || {}).forEach(([k, d]) => {
      if (!(k in E.ind) || !d) return;
      const antes = E.ind[k];
      E.ind[k] = lim(antes + d);
      if (E.ind[k] !== antes) cambios.push({ k, d: E.ind[k] - antes });
    });
    actualizarHud();
    return cambios;
  }

  function chipsEfectos(cambios) {
    const cont = nodo("div", "efectos");
    if (!cambios.length) { cont.append(nodo("span", "efecto neutro", "Sin cambios en tus indicadores")); return cont; }
    cambios.forEach(({ k, d }) => {
      cont.append(con("span", "efecto " + (d > 0 ? "positivo" : "negativo"), ico(k), `${d > 0 ? "+" : ""}${d} ${C.indicadores[k].nombre}`));
    });
    return cont;
  }

  function descubrir(articulo) {
    if (Comun.articuloReal(articulo) && !E.articulos.includes(articulo)) { E.articulos.push(articulo); return true; }
    return false;
  }

  function tarjetaArticulo(articulo, explicacion) {
    const nuevo = descubrir(articulo);
    const t = nodo("div", "tarjeta-articulo");
    t.append(con("div", "art-titulo", ico("articulo"), (nuevo ? "Nuevo artículo · " : "") + (articulo || "Estatuto docente")));
    if (explicacion) t.append(nodo("p", "", explicacion));
    actualizarHud();
    return t;
  }

  // Quién habla: carita en pixel art + nombre
  function quien(nombre, npc) {
    return con("div", "personaje", Pixel.cara(npc || "funcionaria", 2), nombre);
  }
  function npcDe(texto) {
    const t = (texto || "").toLowerCase();
    if (/rector|coordinador|director/.test(t)) return "rector";
    if (/estudiante|alumn|niñ|joven/.test(t)) return "estudiante";
    if (/madre|padre|acudiente|mamá|papá|familia/.test(t)) return "asesora";
    return "funcionaria";
  }
  const globo = (texto) => nodo("div", "globo", texto);

  function resultadoCaja(bien, titulo, detalle) {
    const d = nodo("div", "resultado-pregunta " + (bien === null ? "neutro" : bien ? "bien" : "mal"));
    if (bien !== null) d.append(ico(bien ? "check" : "cruz", 3));
    d.append(nodo("div", "rp-titulo", titulo));
    if (detalle) d.append(nodo("div", "rp-puntos", detalle));
    return d;
  }

  const ICONO_OPORTUNIDAD = { vacante: "check", provisional: "proceso", reemplazo: "reloj", ninguna: "cruz" };
  function caja(clase, texto, icono) {
    return con("div", clase, icono ? ico(icono, 2) : null, nodo("div", "oportunidad-titulo", texto));
  }

  function filaTabla(texto, valor, nota, total, icono) {
    const f = nodo("div", "fila" + (total ? " total" : ""));
    const izq = con("div", "fila-texto", icono ? con("span", "fila-ico", ico(icono), texto) : texto);
    if (nota) izq.append(nodo("div", "fila-nota", nota));
    f.append(izq, nodo("div", "fila-valor", valor));
    return f;
  }

  function registrar(texto) { E.historial.push(`Año ${E.anio}: ${texto}`); }

  function tienePregrado() {
    return E.pj.titulo === "licenciado" || E.pj.titulo === "profesional" || E.titulos.licenciatura;
  }
  function pedagogiaAcreditada() {
    // Art. 12 par. 1: que "cursan o han terminado" un programa de pedagogía o posgrado en educación
    if (E.titulos.pedagogia) return true;
    const p = E.estudiando && C.formacion.find((f) => f.id === E.estudiando.id);
    return !!(p && p.otorga === "pedagogia");
  }
  function gradoPorTitulo() {
    if (tienePregrado() && (E.titulos.maestria || E.titulos.doctorado)) return 3;
    if (E.pj.titulo === "licenciado" || E.titulos.licenciatura || (E.pj.titulo === "profesional" && pedagogiaAcreditada())) return 2;
    if (E.pj.titulo === "normalista") return 1;
    return 2;
  }

  function textoSituacion() {
    switch (E.laboral) {
      case "aspirante": return E.sinPlaza ? "Aspirante" : "Inscrit" + a();
      case "provisional": return "Provisional";
      case "prueba": return "Periodo de prueba";
      case "carrera": return (E.cargo !== "Docente" ? E.cargo + " · " : "") + `Grado ${E.grado} · Nivel ${E.nivel}`;
      case "excluido": return "Fuera del servicio";
    }
    return "";
  }

  function evaluacion() {
    const pesos = C.evaluacionAnual.pesos;
    let total = 0;
    const partes = Object.entries(pesos).map(([k, w]) => {
      const v = E.ind[k] * w;
      total += v;
      return { k, w, v };
    });
    return { total: Math.round(total), partes };
  }

  /* ============================== HUD ============================== */

  function actualizarHud() {
    if (!E) return;
    IND.forEach((k) => {
      const v = E.ind[k];
      $("ind-" + k + "-v").textContent = v;
      $("ind-" + k + "-b").style.width = v + "%";
    });
    $("hud-anio-t").textContent = `Año ${Math.min(E.anio, C.aniosDeJuego)}/${C.aniosDeJuego}`;
    $("hud-situacion").textContent = textoSituacion();
    $("hud-arts-t").textContent = E.articulos.length + (E.articulos.length === 1 ? " artículo" : " artículos");
    $("hud-objetivo").textContent = objetivo().texto;
  }

  function construirHud() {
    $("hud-avatar").innerHTML = "";
    $("hud-avatar").append(Pixel.cara(E.pj, 3));
    const cont = $("hud-indicadores");
    cont.innerHTML = "";
    IND.forEach((k) => {
      const i = C.indicadores[k];
      const fila = nodo("div", "ind");
      fila.title = i.nombre + ": " + i.descripcion;
      const barra = nodo("div", "barra");
      const relleno = nodo("div", "barra-relleno ind-" + k);
      relleno.id = "ind-" + k + "-b";
      barra.append(relleno);
      const v = nodo("span", "ind-valor", "0");
      v.id = "ind-" + k + "-v";
      fila.append(ico(k), barra, v);
      cont.append(fila);
    });
    const chipAnio = $("hud-anio"); chipAnio.innerHTML = "";
    chipAnio.append(ico("reloj"), con("span", "", "")); chipAnio.lastChild.id = "hud-anio-t";
    const chipArts = $("hud-arts"); chipArts.innerHTML = "";
    chipArts.append(ico("articulo"), con("span", "", "")); chipArts.lastChild.id = "hud-arts-t";
  }

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

  /* ========================= objetivos y acceso ========================= */

  function objetivo() {
    if (!E || E.fin) return { texto: "Fin de la partida" };
    if (E.laboral === "aspirante") return { id: "secretaria", texto: E.sinPlaza ? "Objetivo: vuelve a presentarte al concurso en la Secretaría" : "Objetivo: ve a la Secretaría de Educación" };
    if (E.laboral === "provisional" && E.anioConcurso < E.anio) return { id: "secretaria", texto: "Objetivo: preséntate al nuevo concurso en la Secretaría" };
    if (!E.hechos.colegio) return { id: "colegio", texto: "Objetivo: ve a dar clase al Colegio" };
    const quedan = E.cartas.filter((c) => !c.tomada).length;
    if (quedan) return { carta: true, texto: `Objetivo: recoge las cartas del año (${quedan})` };
    return { id: "rectoria", texto: "Objetivo: ve a la Rectoría para tu evaluación anual" };
  }

  // Devuelve { estado: "objetivo" | "opcional" | "hecho" | "bloqueado", motivo }
  function acceso(id) {
    const obj = objetivo();
    if (obj.id === id) return { estado: "objetivo" };
    if (E.laboral === "aspirante") return { estado: "bloqueado", motivo: "Primero preséntate al concurso en la Secretaría" };
    if (obj.id === "secretaria") return { estado: "bloqueado", motivo: "Primero preséntate al nuevo concurso en la Secretaría" };
    switch (id) {
      case "secretaria": return E.hechos.secretaria ? { estado: "hecho", motivo: "Ya hiciste un trámite en la Secretaría este año" } : { estado: "opcional" };
      case "universidad": return E.hechos.universidad ? { estado: "hecho", motivo: "Ya pasaste por la Universidad este año" } : { estado: "opcional" };
      case "colegio": return { estado: "hecho", motivo: "Ya diste clase este año" };
      case "rectoria": return { estado: "bloqueado", motivo: obj.texto.replace("Objetivo: ", "Primero ") };
    }
    return { estado: "bloqueado" };
  }

  /* ============================ interiores ============================ */

  function abrirPanel(icono, nombre, sub) {
    interiorAbierto = true;
    $("aviso").classList.remove("visible");
    const ic = $("int-icono");
    ic.innerHTML = "";
    ic.append(ico(icono, 3));
    $("int-nombre").textContent = nombre;
    $("int-arts").textContent = sub || "";
    $("interior").classList.remove("oculto");
    return limpiarCuerpo();
  }
  function limpiarCuerpo() {
    const c = $("int-cuerpo");
    c.innerHTML = "";
    c.scrollTop = 0;
    $("int-pie").innerHTML = "";
    return c;
  }
  // Botón del pie del panel (siempre visible). Solo se puede tocar una vez.
  function accion(texto, fn, clase) {
    const b = boton(texto, clase || "btn-principal", () => {
      if (b.disabled) return;
      $("int-pie").querySelectorAll("button").forEach((x) => { x.disabled = true; });
      fn();
    });
    $("int-pie").append(b);
    return b;
  }
  function cerrarPanel() {
    $("interior").classList.add("oculto");
    interiorAbierto = false;
    actualizarHud();
    if (pueblo) pueblo.actualizarMarcadores();
  }
  function accionVolver(texto, antes) {
    return accion(texto || "Volver al mapa", () => { if (antes) antes(); cerrarPanel(); });
  }

  function entrar(id) {
    const ac = acceso(id);
    if (ac.estado === "bloqueado" || ac.estado === "hecho") { aviso(ac.motivo, ac.estado === "hecho" ? "check" : "candado"); return; }
    if (id === "secretaria") {
      if (E.laboral === "aspirante" || (E.laboral === "provisional" && E.anioConcurso < E.anio)) concurso();
      else secretaria();
    }
    if (id === "colegio") colegio();
    if (id === "universidad") universidad();
    if (id === "rectoria") evaluacionAnual();
  }

  /* -------------------- situación con opciones (genérica) -------------------- */
  // Sirve para el colegio y para las cartas.
  function situacion(cuerpo, item, npc, alTerminar) {
    if (!item) { cuerpo.append(globo("Todavía no hay situaciones en este banco.")); accionVolver(null, alTerminar); return; }
    if (item.personaje) cuerpo.append(quien(item.personaje, npc));
    if (item.titulo) cuerpo.append(nodo("h3", "titulo-carta", item.titulo));
    cuerpo.append(nodo("div", "enunciado", item.texto));
    cuerpo.append(nodo("div", "elige", "¿Qué haces?"));
    cuerpo.append(Comun.opciones(item, (op) => {
      const c = limpiarCuerpo();
      c.append(nodo("p", "respuesta-elegida", op.texto));
      if (op.correcta !== undefined) c.append(resultadoCaja(Comun.esCorrecta(op), Comun.esCorrecta(op) ? "¡Buena decisión!" : "No fue la mejor decisión"));
      if (op.consecuencia) c.append(globo(op.consecuencia));
      c.append(chipsEfectos(aplicar(op.efectos)));
      if (op.articulo || op.explicacion) c.append(tarjetaArticulo(op.articulo, op.explicacion));
      accionVolver("Volver al mapa", alTerminar);
    }));
    const ap = Comun.avisoPrueba(); if (ap) cuerpo.append(ap);
  }

  /* ------------------------------ concurso ------------------------------ */

  function concurso() {
    const K = C.concurso;
    const est = C.introduccion.estructura;
    E.intentos++;
    const nivel = Math.min(3, E.intentos);
    const orden = K.orden || K.pruebas.map((p) => p.id).concat("antecedentes");
    const prueba = {};
    K.pruebas.forEach((p) => { prueba[p.id] = { p, item: Comun.sacar(p.banco, usadas(p.banco), nivel) }; });
    const antecedentes = Math.round((E.ind.experiencia + E.ind.formacion) / 2);
    const resp = {};
    const nombreEtapa = (i) => (est.etapas[i] && est.etapas[i].nombre) || orden[i];
    const peso = (id) => (id === "antecedentes" ? K.pesoAntecedentes : prueba[id] ? prueba[id].p.peso : 0);

    let c = abrirPanel("secretaria", "Secretaría de Educación", "Concurso docente · Arts. 8–15");
    c.append(quien("Funcionaria de la Secretaría", "funcionaria"));
    c.append(globo(E.intentos === 1
      ? `¡Hola, ${E.pj.nombre}! Bienvenid${a()} al concurso docente.`
      : `De nuevo por aquí, ${E.pj.nombre}. Es tu intento número ${E.intentos}: te tocarán preguntas distintas` + (E.intentos <= 3 ? ` y más difíciles (nivel ${nivel}).` : " del nivel más difícil.")));
    c.append(nodo("h3", "", est.titulo));
    c.append(nodo("p", "", est.texto));
    const ol = nodo("ol", "etapas");
    orden.forEach((id, i) => {
      const et = est.etapas[i] || {};
      ol.append(con("li", "", con("div", "", con("b", "", et.nombre || id), ": " + (et.descripcion || ""), " ", nodo("span", "peso", Math.round(peso(id) * 100) + "%"))));
    });
    c.append(ol);
    c.append(tarjetaArticulo("Art. 9 · Etapas del concurso", "El concurso clasifica a los aspirantes por mérito con la prueba de aptitudes y competencias básicas, la prueba psicotécnica, la entrevista y la valoración de antecedentes, y con eso arma la lista de elegibles."));
    accion("Empezar las pruebas", () => etapa(0));

    function cabecera(i) {
      c = limpiarCuerpo();
      c.append(con("div", "paso", `Etapa ${i + 1} de ${orden.length} · ${nombreEtapa(i)}`, " ", nodo("span", "nivel", "Nivel " + nivel)));
      return c;
    }

    function etapa(i) {
      if (i >= orden.length) { resultado(); return; }
      const id = orden[i];
      if (id === "antecedentes") {
        cabecera(i);
        c.append(quien("Funcionaria de la Secretaría", "funcionaria"));
        c.append(globo("Revisamos tu hoja de vida: tus títulos y tu experiencia."));
        const tabla = nodo("div", "tabla");
        tabla.append(filaTabla("Experiencia", String(E.ind.experiencia), null, false, "experiencia"));
        tabla.append(filaTabla("Formación", String(E.ind.formacion), null, false, "formacion"));
        tabla.append(filaTabla("Valoración de antecedentes", antecedentes + "/100", null, true));
        c.append(tabla);
        accion(i + 1 < orden.length ? "Siguiente etapa" : "Ver resultados", () => etapa(i + 1));
        return;
      }
      const { p, item } = prueba[id];
      cabecera(i);
      if (!item) {
        resp[id] = { valor: 50 };
        c.append(globo("Todavía no hay preguntas en el banco \"" + p.banco + "\"."));
        accion("Siguiente etapa", () => etapa(i + 1));
        return;
      }
      c.append(quien(id === "entrevista" ? "Jurado de la entrevista" : "Funcionaria de la Secretaría", id === "entrevista" ? "jurado" : "funcionaria"));
      c.append(nodo("div", "enunciado", item.texto));
      c.append(nodo("div", "elige", "Elige una respuesta"));
      c.append(Comun.opciones(item, (op) => { resp[id] = op; retro(i, op, item, p); }));
      const ap = Comun.avisoPrueba(); if (ap) c.append(ap);
    }

    function retro(i, op, item, p) {
      cabecera(i);
      const bien = Comun.esCorrecta(op);
      const puntos = Math.round(Comun.valor(op) * p.peso);
      c.append(resultadoCaja(bien, bien ? "¡Correcto!" : "Incorrecto", `+${puntos} de ${Math.round(100 * p.peso)} puntos`));
      const cor = Comun.correctaDe(item);
      if (!bien && cor) c.append(con("p", "respuesta-elegida", "La respuesta correcta era: ", con("b", "", cor.texto)));
      if (item.articulo || item.explicacion) c.append(tarjetaArticulo(item.articulo, item.explicacion));
      accion(i + 1 < orden.length ? "Siguiente etapa" : "Ver resultados", () => etapa(i + 1));
    }

    function resultado() {
      let total = antecedentes * K.pesoAntecedentes;
      c = limpiarCuerpo();
      c.append(quien("Resultados del concurso", "funcionaria"));
      const tabla = nodo("div", "tabla");
      orden.forEach((id, i) => {
        if (id === "antecedentes") {
          tabla.append(filaTabla(`${nombreEtapa(i)}: ${antecedentes}/100`, `+${(antecedentes * K.pesoAntecedentes).toFixed(1)}`));
          return;
        }
        const pr = prueba[id];
        const v = Comun.valor(resp[id]);
        total += v * pr.p.peso;
        tabla.append(filaTabla(`${nombreEtapa(i)}: ${v}/100`, `+${(v * pr.p.peso).toFixed(1)}`, resp[id] && resp[id].comentario));
      });
      total = Math.round(total);
      tabla.append(filaTabla("Puntaje del concurso", String(total), null, true));
      c.append(tabla);

      const op = K.oportunidades.find((o) => total >= o.minimo);
      c.append(caja("oportunidad " + op.tipo, op.tipo === "ninguna" ? "Sin plaza esta vez" : "Oportunidad laboral: " + op.nombre, ICONO_OPORTUNIDAD[op.tipo]));
      c.append(tarjetaArticulo(op.articulo, op.explicacion));

      if (op.tipo === "ninguna") {
        E.sinPlaza = true;
        registrar(`Concurso (intento ${E.intentos}) con ${total} puntos → sin plaza.`);
        c.append(nodo("p", "suave pequeno", "Si te presentas de nuevo, las preguntas serán distintas y más difíciles."));
        accion("Presentarme en la siguiente convocatoria", () => concurso());
        accion("Volver al mapa", cerrarPanel, "btn-secundario");
        return;
      }
      if (op.estado === "prueba" && E.pj.titulo === "profesional" && !pedagogiaAcreditada()) {
        c.append(nodo("div", "alerta", "Como no eres licenciada, antes de la evaluación del periodo de prueba debes estar cursando o haber terminado un programa de pedagogía o un posgrado en educación (art. 12). Inscríbete en la Universidad."));
      }
      accion(E.laboral === "provisional" && op.estado === "provisional" ? "Seguir como provisional" : "Aceptar", () => {
        const antes = E.laboral;
        E.laboral = op.estado;
        E.oportunidad = op.nombre;
        E.anioConcurso = E.anio;
        registrar(`Concurso con ${total} puntos → ${op.nombre}.`);
        if (E.cartas.length === 0 && pueblo) pueblo.generarCartas(2);
        cerrarPanel();
        if (op.estado === "prueba" && E.pj.titulo === "profesional" && !pedagogiaAcreditada()) {
          aviso("Para aprobar el periodo de prueba debes inscribirte en pedagogía en la Universidad (art. 12).", "formacion");
        } else if (op.estado === "prueba") aviso("¡Nombramiento en periodo de prueba! Ve al Colegio.", "check");
        else aviso(antes === "provisional" ? "Sigues como provisional este año." : "Trabajarás como provisional. Ve al Colegio.", "colegio");
      });
    }
  }

  /* ------------------------------ colegio ------------------------------ */

  function colegio() {
    const item = Comun.sacar("colegio", usadas("colegio"));
    const c = abrirPanel("colegio", "Colegio", `Año ${E.anio} · ${textoSituacion()}`);
    situacion(c, item, npcDe(item && item.personaje), () => { E.hechos.colegio = true; });
  }

  /* ------------------------------ cartas ------------------------------ */

  function abrirCarta(carta) {
    const item = carta.item;
    const c = abrirPanel("carta", "Situación inesperada", item && item.tipo ? "Carta " + item.tipo.toLowerCase() : "Carta");
    situacion(c, item, "funcionaria", () => {
      carta.tomada = true;
      if (carta.sprite) carta.sprite.destroy();
      const quedan = E.cartas.filter((x) => !x.tomada).length;
      setTimeout(() => aviso(quedan ? `Te queda ${quedan} carta por recoger` : "¡Cartas listas! Ve a la Rectoría", "carta"), 300);
    });
  }

  /* ----------------------------- universidad ----------------------------- */

  function efectosCortos(ef, signo) {
    const s = nodo("span", "efectos-cortos");
    Object.entries(ef || {}).forEach(([k, d]) => s.append(con("span", "", `${signo && d > 0 ? "+" : ""}${d}`, ico(k))));
    return s;
  }

  function universidad() {
    const c = abrirPanel("universidad", "Universidad", "Formación · Arts. 21 y 38");
    c.append(quien("Asesora de posgrados", "asesora"));
    if (E.estudiando) {
      const p = C.formacion.find((f) => f.id === E.estudiando.id);
      c.append(globo(`Vas muy bien en tu ${p.nombre}. ${E.estudiando.restantes === 1 ? "Este es tu último año." : `Te faltan ${E.estudiando.restantes} años.`}`));
      accionVolver("Seguir estudiando", () => { E.hechos.universidad = true; });
      return;
    }
    c.append(globo("¿Quieres seguir formándote? Estudiar sube tu formación y te abre puertas en el escalafón, pero te quita tiempo."));
    if (E.pj.titulo === "profesional" && !E.titulos.pedagogia) {
      c.append(nodo("div", "alerta", "Como no eres licenciada, debes acreditar un programa de pedagogía o un posgrado en educación antes de terminar el periodo de prueba (art. 12)."));
    }
    const ops = nodo("div", "opciones");
    C.formacion.forEach((p) => {
      if (p.soloTitulo && p.soloTitulo !== E.pj.titulo) return;
      if (E.titulos[p.otorga] && p.otorga !== "pedagogia") return;
      if (p.otorga === "pedagogia" && E.titulos.pedagogia) return;
      let bloqueo = null;
      if (p.requiere === "pregrado" && !tienePregrado()) bloqueo = "Necesitas primero una licenciatura";
      if (p.requiere === "maestria" && !E.titulos.maestria) bloqueo = "Necesitas primero una maestría";
      const b = boton("", "btn-opcion btn-curso", () => inscribir(p));
      b.append(con("span", "curso-nombre", p.nombre, " ", nodo("span", "chip", `${p.anios} año${p.anios > 1 ? "s" : ""}`)));
      const det = con("span", "curso-detalle", "Al terminar: ", efectosCortos(p.efectos, true));
      if (p.costoAnual) det.append(" · Cada año: ", efectosCortos(p.costoAnual));
      b.append(det);
      if (bloqueo) { b.disabled = true; b.append(nodo("small", "motivo", bloqueo)); }
      ops.append(b);
    });
    c.append(ops);
    accion("Ahora no", cerrarPanel, "btn-secundario");

    function inscribir(p) {
      E.estudiando = { id: p.id, restantes: p.anios };
      E.hechos.universidad = true;
      registrar(`Empezó: ${p.nombre}.`);
      const c2 = limpiarCuerpo();
      c2.append(resultadoCaja(true, `¡Inscrit${a()} en ${p.nombre}!`, `Terminas en ${p.anios} año${p.anios > 1 ? "s" : ""}.`));
      c2.append(tarjetaArticulo(p.articulo, p.explicacion));
      accionVolver();
    }
  }

  /* ----------------------- secretaría: progresión ----------------------- */

  function secretaria() {
    const P = C.progresion;
    const c = abrirPanel("secretaria", "Secretaría de Educación", "Progresión profesional · Arts. 10, 20–23, 35–36");
    c.append(quien("Oficina de escalafón", "funcionaria"));
    c.append(globo("Aquí se tramitan las evaluaciones de competencias (para ascender o reubicarse) y los concursos para cargos directivos."));
    const ops = nodo("div", "opciones");

    // Evaluación de competencias
    let motivo = null;
    if (E.laboral !== "carrera") motivo = "Primero debes estar inscrit" + a() + " en el escalafón";
    else if (E.aniosDesdeAscenso < P.competencias.aniosMinimos) motivo = `Necesitas ${P.competencias.aniosMinimos} años de servicio en tu nivel (llevas ${E.aniosDesdeAscenso})`;
    const bComp = boton("", "btn-opcion btn-curso", competencias);
    bComp.append(con("span", "curso-nombre", ico("desempeno"), " Evaluación de competencias"), nodo("span", "curso-detalle", "Para ascender de grado o reubicarte de nivel"));
    if (motivo) { bComp.disabled = true; bComp.append(nodo("small", "motivo", motivo)); }
    ops.append(bComp);

    // Cargos directivos
    P.directivos.forEach((d) => {
      if (E.cargo === d.cargo || (E.cargo === "Rector")) return;
      let m = null;
      if (E.laboral !== "carrera") m = "Primero debes estar inscrit" + a() + " en el escalafón";
      else if (E.aniosExp < d.aniosExperiencia) m = `Necesitas ${d.aniosExperiencia} años de experiencia (llevas ${E.aniosExp})`;
      const b = boton("", "btn-opcion btn-curso", () => directivo(d));
      b.append(con("span", "curso-nombre", ico("rectoria"), ` Concurso para ${d.cargo.toLowerCase()}`), nodo("span", "curso-detalle", `Mínimo ${d.minimo} puntos · ${d.aniosExperiencia} años de experiencia`));
      if (m) { b.disabled = true; b.append(nodo("small", "motivo", m)); }
      ops.append(b);
    });
    c.append(ops);
    accion("Volver al mapa", cerrarPanel, "btn-secundario");
  }

  function competencias() {
    const K = C.progresion.competencias;
    const base = Math.round(Object.entries(K.pesos).reduce((s, [k, w]) => s + E.ind[k] * w, 0));
    const q = Comun.sacar("estatuto", usadas("estatuto"));
    let c = limpiarCuerpo();
    c.append(quien("Evaluación de competencias", "funcionaria"));
    c.append(globo(`Tu base por formación, desempeño y experiencia es ${base}. Responde esta pregunta: si aciertas sumas 10 puntos, si fallas pierdes 10.`));
    if (!q) { c.append(globo("Todavía no hay preguntas en el banco \"estatuto\".")); accionVolver(); return; }
    c.append(nodo("div", "enunciado", q.texto));
    c.append(nodo("div", "elige", "Elige una respuesta"));
    c.append(Comun.opciones(q, (o) => {
      const acierto = Comun.esCorrecta(o);
      const total = lim(base + (acierto ? 10 : -10));
      E.hechos.secretaria = true;
      c = limpiarCuerpo();
      c.append(resultadoCaja(acierto, acierto ? "¡Correcto!" : "Incorrecto", `Resultado: ${total}%`));
      const cor = Comun.correctaDe(q);
      if (!acierto && cor) c.append(con("p", "respuesta-elegida", "La respuesta correcta era: ", con("b", "", cor.texto)));
      if (q.articulo || q.explicacion) c.append(tarjetaArticulo(q.articulo, q.explicacion));
      if (total > K.umbral) {
        c.append(caja("oportunidad vacante", `¡Más de ${K.umbral}%! Eres candidat${a()} a ascenso o reubicación`, "check"));
        c.append(tarjetaArticulo(K.articulo, K.explicacion));
        const niveles = ["A", "B", "C", "D"];
        const sigNivel = niveles[niveles.indexOf(E.nivel) + 1];
        const gradoNuevo = gradoPorTitulo();
        if (gradoNuevo > E.grado) {
          accion(`Ascender al Grado ${gradoNuevo} (Nivel A)`, () => {
            E.grado = gradoNuevo; E.nivel = "A"; E.aniosDesdeAscenso = 0;
            registrar(`Ascendió al Grado ${gradoNuevo}.`);
            fin(`¡Ascendiste al Grado ${gradoNuevo}! Tu sueldo sube según tu nuevo título.`, "Art. 21 · Ascenso", "El ascenso es pasar de un grado a otro: exige cumplir los requisitos del grado, superar las evaluaciones y que haya disponibilidad presupuestal.");
          });
        }
        if (sigNivel) {
          accion(`Reubicarme en el Nivel ${sigNivel} del Grado ${E.grado}`, () => {
            E.nivel = sigNivel; E.aniosDesdeAscenso = 0;
            registrar(`Reubicación salarial al Nivel ${sigNivel}.`);
            fin(`¡Reubicación al Nivel ${sigNivel}! Tu salario sube dentro del mismo grado.`, "Art. 23 · Inscripción y ascenso", "La reubicación de nivel se da cuando la entidad convoca la evaluación de competencias y el docente obtiene el puntaje del art. 36, hasta donde alcance el presupuesto.");
          }, gradoNuevo > E.grado ? "btn-secundario" : "btn-principal");
        }
        if (!sigNivel && gradoNuevo <= E.grado) {
          c.append(nodo("p", "suave", "Ya estás en el nivel más alto de tu grado y no tienes un título nuevo para ascender."));
          accionVolver();
        }
      } else {
        c.append(caja("oportunidad reemplazo", `No superaste el ${K.umbral}%. Puedes intentarlo otro año.`, "reloj"));
        c.append(tarjetaArticulo(K.articulo, K.explicacion));
        accionVolver();
      }
    }));
    const ap = Comun.avisoPrueba(); if (ap) c.append(ap);

    function fin(texto, art, exp) {
      const c3 = limpiarCuerpo();
      c3.append(resultadoCaja(true, texto));
      c3.append(tarjetaArticulo(art, exp));
      accionVolver();
      actualizarHud();
    }
  }

  function directivo(d) {
    const puntaje = Math.round((E.ind.desempeno + E.ind.formacion + E.ind.popularidad + E.ind.experiencia) / 4);
    E.hechos.secretaria = true;
    const c = limpiarCuerpo();
    c.append(quien(`Concurso para ${d.cargo.toLowerCase()}`, "funcionaria"));
    const tabla = nodo("div", "tabla");
    IND.forEach((k) => tabla.append(filaTabla(C.indicadores[k].nombre, String(E.ind[k]), null, false, k)));
    tabla.append(filaTabla("Promedio (puntaje del concurso)", String(puntaje), null, true));
    tabla.append(filaTabla("Mínimo para ganar", String(d.minimo)));
    c.append(tabla);
    if (puntaje >= d.minimo) {
      E.cargo = d.cargo;
      registrar(`Ganó el concurso y fue nombrad${a()} ${d.cargo.toLowerCase()}.`);
      c.append(caja("oportunidad vacante", `¡Nombrad${a()} ${d.cargo}!`, "check"));
      c.append(chipsEfectos(aplicar(d.efectos)));
      c.append(tarjetaArticulo("Art. 22 · Escalafón de directivos", "Quien pasa a un cargo directivo conserva su grado en el escalafón y recibe una mayor remuneración."));
    } else {
      c.append(caja("oportunidad reemplazo", "No alcanzaste el puntaje esta vez.", "cruz"));
    }
    c.append(tarjetaArticulo(d.articulo, d.explicacion));
    accionVolver();
  }

  /* ------------------------- rectoría: evaluación ------------------------- */

  function evaluacionAnual() {
    const A = C.evaluacionAnual;
    const ev = evaluacion();
    const r = ev.total;
    const c = abrirPanel("rectoria", "Rectoría", `Evaluación del año ${E.anio}`);
    const esPrueba = E.laboral === "prueba";
    c.append(quien(E.cargo === "Rector" ? "Secretaría (evalúa al rector)" : "Rector", E.cargo === "Rector" ? "funcionaria" : "rector"));
    c.append(globo(esPrueba ? "Terminó el año escolar: llegó la evaluación de tu periodo de prueba." : "Terminó el año escolar: llegó tu evaluación anual de desempeño."));
    const tabla = nodo("div", "tabla");
    ev.partes.forEach(({ k, w, v }) => tabla.append(filaTabla(`${C.indicadores[k].nombre}: ${E.ind[k]} × ${Math.round(w * 100)}%`, v.toFixed(1), null, false, k)));
    tabla.append(filaTabla("Resultado", r + "%", null, true));
    c.append(tabla);

    let msg, art, exp, clase = r >= A.minimo ? "vacante" : "reemplazo";
    if (esPrueba) {
      if (r >= A.minimo && (E.pj.titulo !== "profesional" || pedagogiaAcreditada())) {
        const g = gradoPorTitulo();
        msg = `¡Aprobaste el periodo de prueba! Quedas inscrit${a()} en el escalafón: Grado ${g}, Nivel A.`;
        art = "Art. 31 · Evaluación del periodo de prueba";
        exp = "Con 60% o más, el docente queda inscrito en el escalafón en el grado que corresponde a sus títulos (art. 21), empezando en el Nivel A.";
      } else if (r >= A.minimo) {
        msg = `Aprobaste la evaluación, pero no acreditaste un programa de pedagogía ni un posgrado en educación. Quedas separad${a()} del servicio; puedes volver a concursar.`;
        art = "Art. 12, parágrafo 1"; clase = "reemplazo";
        exp = "Los profesionales no licenciados deben acreditar, al terminar el periodo de prueba, que cursan o terminaron un posgrado en educación o un programa de pedagogía.";
      } else {
        msg = `No alcanzaste el 60%. Quedas separad${a()} del servicio, pero puedes presentarte al siguiente concurso.`;
        art = "Arts. 12 y 31 · Periodo de prueba";
        exp = "Quien no supera el periodo de prueba sale del servicio y puede volver a concursar en una nueva convocatoria.";
      }
    } else if (E.laboral === "carrera") {
      if (r >= A.minimo) {
        msg = "Evaluación satisfactoria. Sigues en tu cargo.";
        art = "Art. 37 · Derechos";
        exp = "Los docentes tienen derecho a permanecer en el cargo mientras su desempeño sea satisfactorio.";
      } else if (E.evalBajas + 1 >= 2) {
        msg = E.cargo !== "Docente"
          ? "Segundo año seguido por debajo de 60%. Como venías de la docencia, regresas a un cargo docente."
          : `Segundo año seguido por debajo de 60%. Quedas excluid${a()} del escalafón y sales del servicio.`;
        art = "Art. 36 · Resultados y consecuencias";
        exp = "Dos evaluaciones anuales consecutivas por debajo de 60% llevan a la exclusión del escalafón y al retiro del servicio; un directivo que venía de la docencia regresa a la docencia.";
      } else {
        msg = "Tu evaluación quedó por debajo de 60%. Si se repite el próximo año, quedarías fuera del escalafón.";
        art = "Art. 36 · Resultados y consecuencias";
        exp = "Dos evaluaciones anuales consecutivas por debajo de 60% llevan a la exclusión del escalafón.";
      }
    } else {
      msg = (r >= A.minimo ? "Buen año. " : "Año difícil. ") + "Como eres provisional, para tener derechos de carrera debes ganar el concurso. El próximo año preséntate de nuevo.";
      art = "Art. 13 · Nombramientos provisionales";
      exp = "Para ocupar un cargo en propiedad y tener derechos de carrera, hay que ganar el concurso y aprobar la evaluación del periodo de prueba.";
    }
    c.append(caja("oportunidad " + clase, msg, clase === "vacante" ? "check" : "cruz"));
    c.append(tarjetaArticulo(art, exp));
    accion(E.anio >= C.aniosDeJuego ? "Ver el final de mi carrera" : "Pasar al siguiente año", () => cerrarAnio(r));
  }

  function cerrarAnio(r) {
    const A = C.evaluacionAnual;
    // 1. Consecuencias de la evaluación
    if (E.laboral === "prueba") {
      if (r >= A.minimo && (E.pj.titulo !== "profesional" || pedagogiaAcreditada())) {
        E.laboral = "carrera"; E.grado = gradoPorTitulo(); E.nivel = "A"; E.aniosDesdeAscenso = 0; E.evalBajas = 0;
        registrar(`Aprobó el periodo de prueba (${r}%) y entró al escalafón en el Grado ${E.grado}.`);
      } else {
        E.laboral = "aspirante"; E.oportunidad = null; E.sinPlaza = true;
        registrar(`No superó el periodo de prueba (${r}%) y salió del servicio.`);
      }
    } else if (E.laboral === "carrera") {
      if (r >= A.minimo) { E.evalBajas = 0; registrar(`Evaluación anual: ${r}%.`); }
      else {
        E.evalBajas++;
        registrar(`Evaluación anual: ${r}% (insatisfactoria).`);
        if (E.evalBajas >= 2) {
          if (E.cargo !== "Docente") { E.cargo = "Docente"; E.evalBajas = 0; registrar("Regresó a la docencia."); }
          else { E.laboral = "excluido"; registrar("Fue excluido del escalafón."); }
        }
      }
    } else if (E.laboral === "provisional") {
      registrar(`Año como provisional, evaluación: ${r}%.`);
    }

    // 2. Estudios
    if (E.estudiando) {
      const p = C.formacion.find((f) => f.id === E.estudiando.id);
      if (p.costoAnual) aplicar(p.costoAnual);
      E.estudiando.restantes--;
      if (E.estudiando.restantes <= 0) {
        E.titulos[p.otorga] = true;
        aplicar(p.efectos);
        registrar(`Terminó: ${p.nombre}.`);
        setTimeout(() => aviso(`¡Terminaste tu ${p.nombre}!`, "formacion"), 900);
        E.estudiando = null;
      }
    }

    // 3. Pasa el año
    if (E.laboral !== "aspirante") { aplicar({ experiencia: A.experienciaPorAnio }); E.aniosExp++; }
    if (E.laboral === "carrera") E.aniosDesdeAscenso++;
    E.anio++;
    E.hechos = {};
    E.cartas.forEach((x) => x.sprite && x.sprite.destroy());
    E.cartas = [];

    if (E.laboral === "excluido" || E.anio > C.aniosDeJuego) { E.fin = true; cerrarPanel(); pantallaFinal(); return; }
    if (E.laboral !== "aspirante" && pueblo) pueblo.generarCartas(2);
    cerrarPanel();
    aviso(`Comienza el año ${E.anio}`, "reloj");
  }

  /* ============================== pantallas ============================== */

  const PANTALLAS = ["menu", "indicacion", "seleccion", "intro-concurso", "convocatoria", "final"];
  function mostrar(id) {
    PANTALLAS.forEach((p) => $(p).classList.toggle("oculto", p !== id));
    if (id) $(id).scrollTop = 0;
  }

  function menu() {
    $("titulo").textContent = C.titulo;
    $("subtitulo").textContent = C.subtitulo;
    $("creditos").textContent = C.creditos;
    const esc = $("menu-escena");
    if (!esc.firstChild) esc.append(Pixel.escenaMenu(C.personajes, 3));
    $("btn-individual").onclick = indicacion;
    mostrar("menu");
  }

  // 1. Indicaciones (texto del grupo)
  function indicacion() {
    $("ind-texto").textContent = C.introduccion.indicacion;
    const lista = $("ind-lista");
    lista.innerHTML = "";
    [
      ["colegio", "Toca el mapa para caminar y toca un edificio para entrar."],
      ["popularidad", "La flecha amarilla marca tu objetivo; la estrella, algo opcional."],
      ["carta", "Cada año aparecen cartas con situaciones inesperadas."],
      ["rectoria", "Al final de cada año, el rector te evalúa: necesitas 60%."],
      ["articulo", "Cada decisión te enseña un artículo del estatuto."]
    ].forEach(([i, t]) => lista.append(con("li", "", ico(i), nodo("span", "", t))));
    $("btn-ind-seguir").onclick = seleccion;
    $("btn-ind-volver").onclick = menu;
    mostrar("indicacion");
  }

  // 2. Escoge un personaje (con la explicación de cada indicador al lado de su barra)
  function seleccion() {
    $("sel-titulo").textContent = C.introduccion.seleccion || "Escoge un personaje";
    const cont = $("lista-personajes");
    cont.innerHTML = "";
    elegido = null;
    const seguir = $("btn-sel-seguir");
    seguir.disabled = true;
    seguir.textContent = "Toca un personaje";
    C.personajes.forEach((pj) => {
      const t = nodo("button", "tarjeta-personaje");
      t.dataset.id = pj.id;
      const ret = nodo("div", "pj-retrato");
      ret.append(Pixel.retrato(pj, 3));
      t.append(con("div", "pj-cabecera", ret, con("div", "", nodo("div", "pj-nombre", pj.nombre), nodo("div", "pj-perfil", pj.perfil))));
      t.append(nodo("p", "pj-desc", pj.descripcion));
      const inds = nodo("div", "pj-inds");
      IND.forEach((k) => {
        const i = C.indicadores[k];
        const barra = nodo("div", "barra");
        const r = nodo("div", "barra-relleno ind-" + k);
        r.style.width = pj.indicadores[k] + "%";
        barra.append(r);
        inds.append(con("div", "pj-ind",
          con("div", "pj-ind-cab", ico(k), nodo("span", "pj-ind-nombre", i.nombre), barra, nodo("span", "ind-valor", pj.indicadores[k])),
          nodo("div", "pj-ind-desc", i.descripcion)));
      });
      t.append(inds);
      if (pj.nota) t.append(nodo("p", "pj-nota", pj.nota));
      t.onclick = () => {
        elegido = pj;
        cont.querySelectorAll(".tarjeta-personaje").forEach((x) => x.classList.toggle("elegido", x === t));
        seguir.disabled = false;
        seguir.textContent = "Continuar con " + pj.nombre;
      };
      cont.append(t);
    });
    seguir.onclick = () => { if (elegido) introConcurso(); };
    $("btn-volver-menu").onclick = indicacion;
    mostrar("seleccion");
  }

  // 3. Panel del concurso (art. 7)
  function introConcurso() {
    const I = C.introduccion.concurso;
    const esc = $("ic-escena");
    esc.innerHTML = "";
    esc.append(Pixel.retrato(elegido, 4), ico("secretaria", 5));
    $("ic-titulo").textContent = I.titulo;
    $("ic-texto").textContent = I.texto;
    $("btn-ic-seguir").onclick = convocatoria;
    mostrar("intro-concurso");
  }

  // 4. Convocatoria + Inscribirse → ¡Felicidades!
  function convocatoria() {
    const V = C.introduccion.convocatoria;
    $("cv-titulo").textContent = V.titulo;
    $("cv-emisor").textContent = V.emisor;
    $("cv-texto").textContent = V.texto;
    const res = $("cv-resultado");
    res.classList.add("oculto");
    res.innerHTML = "";
    const ins = $("btn-inscribirse");
    ins.textContent = V.boton || "Inscribirse";
    ins.disabled = false;
    ins.classList.remove("oculto");
    $("btn-ir-mapa").classList.add("oculto");
    ins.onclick = () => {
      ins.disabled = true;
      res.append(resultadoCaja(true, "¡Inscripción exitosa!", C.introduccion.inscrito));
      res.classList.remove("oculto");
      ins.classList.add("oculto");
      const ir = $("btn-ir-mapa");
      ir.classList.remove("oculto");
      ir.onclick = () => empezar(elegido);
      setTimeout(() => ir.scrollIntoView({ block: "end", behavior: "smooth" }), 50);
    };
    mostrar("convocatoria");
  }

  function empezar(pj) {
    E = nuevoEstado(pj);
    construirHud();
    mostrar(null);
    $("hud").classList.remove("oculto");
    jugando = true;
    if (pueblo) pueblo.reiniciar(pj);
    actualizarHud();
    aviso("Toca el mapa para caminar. Ve a la Secretaría.", "secretaria");
  }

  function puntajeCarrera() {
    const prom = IND.reduce((s, k) => s + E.ind[k], 0) / IND.length;
    let bonus = 0;
    if (E.laboral === "carrera") bonus += (E.grado || 0) * 4 + ["A", "B", "C", "D"].indexOf(E.nivel) * 2;
    if (E.cargo === "Coordinador") bonus += 8;
    if (E.cargo === "Rector") bonus += 15;
    if (E.laboral === "excluido") bonus -= 20;
    return Math.round(prom + bonus);
  }

  function pantallaFinal() {
    jugando = false;
    const p = puntajeCarrera();
    const excluido = E.laboral === "excluido";
    const fi = $("fin-icono");
    fi.innerHTML = "";
    fi.append(Pixel.retrato(E.pj, 4), ico(excluido ? "cruz" : E.cargo === "Rector" ? "popularidad" : E.laboral === "carrera" ? "check" : "proceso", 5));
    $("fin-titulo").textContent = `${E.pj.nombre}: ${textoSituacion()}`;
    $("fin-texto").textContent = excluido
      ? "Tu carrera terminó antes de tiempo por dos evaluaciones insatisfactorias seguidas."
      : `Terminaste ${C.aniosDeJuego} años de juego con ${E.aniosExp} años de experiencia. Puntaje de carrera: ${p}.`;
    const inds = $("fin-indicadores");
    inds.innerHTML = "";
    IND.forEach((k) => inds.append(con("li", "", ico(k), `${C.indicadores[k].nombre}: ${E.ind[k]}`)));
    const hist = $("fin-historial");
    hist.innerHTML = "";
    E.historial.forEach((h) => hist.append(nodo("li", "", h)));
    const lista = $("fin-articulos");
    lista.innerHTML = "";
    if (!E.articulos.length) lista.append(nodo("li", "", "Ninguno todavía"));
    E.articulos.forEach((ar) => lista.append(con("li", "", ico("articulo"), ar)));
    $("btn-reiniciar").onclick = () => location.reload();
    $("hud").classList.add("oculto");
    if (pueblo && pueblo.flecha) pueblo.flecha.setVisible(false);
    mostrar("final");
  }

  /* ============================== el pueblo ============================== */

  class Pueblo extends Phaser.Scene {
    constructor() { super("pueblo"); }

    create() {
      pueblo = this;
      const m = Graficos.construirMapa(this);
      this.caminable = m.caminable;
      this.dibujos = m.dibujos;

      this.pj = C.personajes[0].id;
      const ini = MAPA.inicio;
      this.casilla = { x: ini.x, y: ini.y };
      this.dir = "arriba";
      this.sombra = this.add.image(this.pxX(ini.x), this.pxY(ini.y), "sombra").setOrigin(0.5, 0.5);
      this.jugador = this.add.sprite(this.pxX(ini.x), this.pxY(ini.y), this.pj + "-arriba1").setOrigin(0.5, 1);
      this.camino = [];
      this.moviendo = false;

      this.flecha = this.add.image(0, 0, "flecha").setDepth(100000).setVisible(false);
      this.rebote = { v: 0 };
      this.tweens.add({ targets: this.rebote, v: -7, duration: 420, yoyo: true, repeat: -1, ease: "Sine.inOut" });

      this.cameras.main.startFollow(this.jugador, true, 0.15, 0.15);
      this.ajustarZoom();
      this.scale.on("resize", () => this.ajustarZoom());

      this.input.on("pointerup", (p) => this.alTocar(p));
      this.teclas = this.input.keyboard.addKeys("UP,DOWN,LEFT,RIGHT,W,A,S,D,SPACE,ENTER");
      this.actualizarMarcadores();
    }

    reiniciar(pj) {
      this.pj = pj.id;
      this.jugador.setTexture(this.pj + "-arriba1");
      this.ajustarZoom();
      this.actualizarMarcadores();
    }

    pxX(x) { return x * T + T / 2; }
    pxY(y) { return y * T + T - 2; }

    ajustarZoom() {
      const w = this.scale.width, h = this.scale.height;
      const W = MAPA.filas[0].length * T, H = MAPA.filas.length * T;
      const hud = document.getElementById("hud");
      const visible = hud && !hud.classList.contains("oculto");
      const altoHud = visible && hud.offsetHeight ? hud.offsetHeight : 130;
      // Que se vean unas 11 columnas y al menos 8 filas por debajo de la barra superior
      let z = Math.min(w / (11 * T), (h - altoHud) / (8 * T));
      // Zoom en pasos de 0,5 para que cada píxel del dibujo mida lo mismo
      z = z >= 1 ? Math.floor(z * 2) / 2 : z;
      z = Phaser.Math.Clamp(z, 0.7, 3);
      const cam = this.cameras.main;
      cam.setZoom(z);
      const vw = w / z, vh = h / z;
      const extra = Math.ceil(altoHud / z);
      // Límites de la cámara: el pueblo más un margen de bosque si la pantalla es más grande
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
    cartaEn(x, y) { return E && E.cartas.find((c) => !c.tomada && c.x === x && c.y === y); }

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

    generarCartas(n) {
      const libres = [];
      const puertas = MAPA.edificios.map((e) => e.puerta);
      MAPA.filas.forEach((fila, y) => [...fila].forEach((ch, x) => {
        if (ch !== "g" || y <= 1) return; // la fila de arriba queda detrás de los edificios
        if (puertas.some((p) => Math.abs(p.x - x) + Math.abs(p.y - y) < 3)) return;
        if (Math.abs(this.casilla.x - x) + Math.abs(this.casilla.y - y) < 4) return;
        if (!this.buscarRuta(this.casilla, { x, y })) return;
        libres.push({ x, y });
      }));
      for (let i = 0; i < n && libres.length; i++) {
        const pos = libres.splice(Math.floor(Math.random() * libres.length), 1)[0];
        const item = Comun.sacar("cartas", usadas("cartas"));
        const base = pos.y * T + T;
        const sprite = this.add.image(this.pxX(pos.x), pos.y * T + T / 2 + 4, "carta").setDepth(base);
        this.tweens.add({ targets: sprite, y: sprite.y - 5, duration: 600, yoyo: true, repeat: -1, ease: "Sine.inOut", delay: i * 200 });
        E.cartas.push({ item, x: pos.x, y: pos.y, sprite, tomada: false });
      }
      this.actualizarMarcadores();
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
        if (ep) entrar(ep.id);
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
      this.jugador.setTexture(this.pj + "-" + this.dir + "1");
    }

    paso() {
      const carta = this.cartaEn(this.casilla.x, this.casilla.y);
      if (carta && this.moviendo) { this.detener(); abrirCarta(carta); return; }
      if (!this.camino.length) {
        this.detener();
        const ed = this.edificioConPuerta(this.casilla.x, this.casilla.y);
        if (ed) entrar(ed.id);
        return;
      }
      const sig = this.camino.shift();
      const dx = sig.x - this.casilla.x, dy = sig.y - this.casilla.y;
      this.dir = dy > 0 ? "abajo" : dy < 0 ? "arriba" : "lado";
      this.jugador.setFlipX(this.dir === "lado" && dx < 0);
      this.jugador.anims.play(this.pj + "-caminar-" + this.dir, true);
      this.casilla = sig;
      this.moviendo = true;
      this.tweens.add({ targets: this.jugador, x: this.pxX(sig.x), y: this.pxY(sig.y), duration: 170, onComplete: () => this.paso() });
    }

    actualizarMarcadores() {
      if (!this.dibujos) return;
      MAPA.edificios.forEach((ed) => {
        const d = this.dibujos[ed.id];
        if (!E || !jugando) { Graficos.marcar(d, null); return; }
        const ac = acceso(ed.id);
        Graficos.marcar(d, ac.estado === "hecho" ? "check" : ac.estado === "bloqueado" ? "candado" : ac.estado === "opcional" ? "estrella" : null);
      });
      const obj = E ? objetivo() : {};
      let destino = null;
      if (obj.id) {
        const ed = MAPA.edificios.find((e) => e.id === obj.id);
        destino = { x: this.pxX(ed.puerta.x), y: (ed.y + ed.h) * T - 14 };
      } else if (obj.carta) {
        const libres = E.cartas.filter((c) => !c.tomada);
        libres.sort((p, q) => (Math.abs(p.x - this.casilla.x) + Math.abs(p.y - this.casilla.y)) - (Math.abs(q.x - this.casilla.x) + Math.abs(q.y - this.casilla.y)));
        if (libres[0]) destino = { x: this.pxX(libres[0].x), y: libres[0].y * T - 10 };
      }
      this.flechaBase = destino;
      this.flecha.setVisible(!!destino && jugando);
    }

    update() {
      // profundidad según la altura en el mapa (pasa por delante o por detrás de las cosas)
      this.jugador.setDepth(this.jugador.y);
      this.sombra.setPosition(this.jugador.x, this.jugador.y - 1).setDepth(this.jugador.y - 2);
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
        if (this.esCaminable(sig.x, sig.y)) { this.camino = [sig]; this.moviendo = true; this.paso(); }
        else {
          this.dir = dy > 0 ? "abajo" : dy < 0 ? "arriba" : "lado";
          this.jugador.setFlipX(dx < 0);
          this.jugador.setTexture(this.pj + "-" + this.dir + "1");
        }
      }
      if (Phaser.Input.Keyboard.JustDown(k.SPACE) || Phaser.Input.Keyboard.JustDown(k.ENTER)) {
        const ed = this.edificioConPuerta(this.casilla.x, this.casilla.y);
        if (ed) entrar(ed.id);
      }
    }
  }

  /* ============================== arranque ============================== */

  menu();
  window.juego = new Phaser.Game({
    type: Phaser.AUTO,
    parent: "juego",
    backgroundColor: "#17241f",
    pixelArt: true,
    roundPixels: true,
    scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },
    scene: [Pueblo]
  });

  // Para pruebas automáticas
  window.__juego = { estado: () => E, entrar: (id) => entrar(id), pueblo: () => pueblo };
})();
