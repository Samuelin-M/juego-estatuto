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

  let E = null;               // estado de la partida
  let pueblo = null;          // escena de Phaser
  let interiorAbierto = false;
  let jugando = false;

  /* ============================ utilidades ============================ */

  const lim = (n) => Math.max(0, Math.min(100, Math.round(n)));
  const azar = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function nodo(tag, clase, texto) {
    const n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto !== undefined && texto !== null) n.textContent = texto;
    return n;
  }
  function boton(texto, clase, fn) {
    const b = nodo("button", clase || "btn-opcion", texto);
    b.onclick = fn;
    return b;
  }

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
      hechos: {},
      cartas: [],
      usadosColegio: [],
      usadasCartas: [],
      articulos: [],
      historial: [],
      fin: false
    };
  }

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
      const i = C.indicadores[k];
      cont.append(nodo("span", "efecto " + (d > 0 ? "positivo" : "negativo"), `${d > 0 ? "+" : ""}${d} ${i.icono} ${i.nombre}`));
    });
    return cont;
  }

  function descubrir(articulo) {
    if (articulo && !E.articulos.includes(articulo)) { E.articulos.push(articulo); return true; }
    return false;
  }

  function tarjetaArticulo(articulo, explicacion) {
    const nuevo = descubrir(articulo);
    const t = nodo("div", "tarjeta-articulo");
    t.append(nodo("div", "art-titulo", (nuevo ? "📜 Nuevo artículo · " : "📜 ") + articulo));
    t.append(nodo("p", "", explicacion));
    actualizarHud();
    return t;
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
      case "aspirante": return "Aspirante";
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
      const barra = $("ind-" + k + "-b");
      barra.style.width = v + "%";
    });
    $("hud-anio").textContent = `Año ${Math.min(E.anio, C.aniosDeJuego)}/${C.aniosDeJuego}`;
    $("hud-situacion").textContent = textoSituacion();
    $("hud-arts").textContent = "📜 " + E.articulos.length;
    $("hud-avatar").textContent = E.pj.icono;
    $("hud-objetivo").textContent = objetivo().texto;
  }

  function construirHud() {
    const cont = $("hud-indicadores");
    cont.innerHTML = "";
    IND.forEach((k) => {
      const i = C.indicadores[k];
      const fila = nodo("div", "ind");
      fila.title = i.descripcion;
      fila.append(nodo("span", "ind-icono", i.icono));
      const barra = nodo("div", "barra");
      const relleno = nodo("div", "barra-relleno");
      relleno.id = "ind-" + k + "-b";
      relleno.classList.add("ind-" + k);
      barra.append(relleno);
      fila.append(barra);
      const v = nodo("span", "ind-valor", "0");
      v.id = "ind-" + k + "-v";
      fila.append(v);
      cont.append(fila);
    });
  }

  let tAviso;
  function aviso(msg) {
    const el = $("aviso");
    el.textContent = msg;
    el.classList.add("visible");
    clearTimeout(tAviso);
    tAviso = setTimeout(() => el.classList.remove("visible"), 2600);
  }

  /* ========================= objetivos y acceso ========================= */

  function objetivo() {
    if (!E || E.fin) return { texto: "Fin de la partida" };
    if (E.laboral === "aspirante") return { id: "secretaria", texto: "Objetivo: preséntate al concurso en la Secretaría" };
    if (E.laboral === "provisional" && E.anioConcurso < E.anio) return { id: "secretaria", texto: "Objetivo: preséntate al nuevo concurso en la Secretaría" };
    if (!E.hechos.colegio) return { id: "colegio", texto: "Objetivo: ve a dar clase al Colegio" };
    const quedan = E.cartas.filter((c) => !c.tomada).length;
    if (quedan) return { carta: true, texto: `Objetivo: recoge las cartas del año 🃏 (${quedan})` };
    return { id: "rectoria", texto: "Objetivo: ve a la Rectoría para tu evaluación anual" };
  }

  // Devuelve { estado: "objetivo" | "opcional" | "hecho" | "bloqueado", motivo }
  function acceso(id) {
    const obj = objetivo();
    if (obj.id === id) return { estado: "objetivo" };
    if (E.laboral === "aspirante") return { estado: "bloqueado", motivo: "Primero consigue una plaza en el concurso de la Secretaría" };
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
    $("int-icono").textContent = icono;
    $("int-nombre").textContent = nombre;
    $("int-arts").textContent = sub || "";
    $("interior").classList.remove("oculto");
    return limpiarCuerpo();
  }
  function limpiarCuerpo() {
    const c = $("int-cuerpo");
    c.innerHTML = "";
    c.scrollTop = 0;
    return c;
  }
  function cerrarPanel() {
    $("interior").classList.add("oculto");
    interiorAbierto = false;
    actualizarHud();
    if (pueblo) pueblo.actualizarMarcadores();
  }
  function botonVolver(texto, antes) {
    return boton(texto || "Volver al mapa", "btn-principal", () => { if (antes) antes(); cerrarPanel(); });
  }

  function entrar(id) {
    const a = acceso(id);
    if (a.estado === "bloqueado" || a.estado === "hecho") { aviso((a.estado === "hecho" ? "✅ " : "🔒 ") + a.motivo); return; }
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
  function situacion(cuerpo, item, alTerminar) {
    if (item.personaje) cuerpo.append(nodo("div", "personaje", item.personaje));
    if (item.titulo) cuerpo.append(nodo("h3", "titulo-carta", item.titulo));
    cuerpo.append(nodo("div", "enunciado", item.texto));
    cuerpo.append(nodo("div", "elige", "Elige una respuesta"));
    const ops = nodo("div", "opciones respuestas");
    item.opciones.forEach((op) => ops.append(boton(op.texto, "btn-opcion", () => {
      const c = limpiarCuerpo();
      c.append(nodo("p", "respuesta-elegida", op.texto));
      if (op.consecuencia) c.append(nodo("div", "globo", op.consecuencia));
      c.append(chipsEfectos(aplicar(op.efectos)));
      if (op.articulo) c.append(tarjetaArticulo(op.articulo, op.explicacion));
      c.append(botonVolver("Volver al mapa", alTerminar));
    })));
    cuerpo.append(ops);
  }

  function siguienteDe(lista, usados) {
    let libres = lista.filter((x) => !usados.includes(x.id));
    if (!libres.length) { usados.length = 0; libres = lista.slice(); }
    const item = azar(libres);
    usados.push(item.id);
    return item;
  }

  /* ------------------------------ concurso ------------------------------ */

  function concurso() {
    const K = C.concurso;
    const respuestas = {};
    const antecedentes = Math.round((E.ind.experiencia + E.ind.formacion) / 2);
    let c = abrirPanel("🏛️", "Secretaría de Educación", "Concurso docente · Arts. 8–15");

    c.append(nodo("div", "personaje", "👩‍💼 Funcionaria de la Secretaría"));
    c.append(nodo("div", "globo",
      (E.laboral === "provisional"
        ? "Para tener derechos de carrera tiene que ganar el concurso y aprobar el periodo de prueba."
        : "Bienvenido al concurso docente.") +
      " Le haremos tres pruebas, y su hoja de vida cuenta como valoración de antecedentes."));
    const tabla = nodo("div", "tabla");
    K.componentes.forEach((comp) => tabla.append(filaTabla(comp.nombre, Math.round(comp.peso * 100) + "%")));
    tabla.append(filaTabla(`Valoración de antecedentes (experiencia y formación): ${antecedentes}`, Math.round(K.pesoAntecedentes * 100) + "%"));
    c.append(tabla);
    c.append(tarjetaArticulo("Art. 9 · Etapas del concurso", "El concurso clasifica a los aspirantes por mérito con la prueba de aptitudes y competencias básicas, la prueba psicotécnica, la entrevista y la valoración de antecedentes, y con eso arma la lista de elegibles."));
    c.append(boton("Empezar las pruebas", "btn-principal", () => pregunta(0)));

    function pregunta(i) {
      const comp = K.componentes[i];
      c = limpiarCuerpo();
      c.append(nodo("div", "paso", `Prueba ${i + 1} de ${K.componentes.length} · ${comp.nombre}`));
      c.append(nodo("div", "personaje", comp.personaje));
      c.append(nodo("div", "enunciado", comp.texto));
      c.append(nodo("div", "elige", "Elige una respuesta"));
      const ops = nodo("div", "opciones respuestas");
      comp.opciones.forEach((op) => ops.append(boton(op.texto, "btn-opcion", () => {
        respuestas[comp.id] = op;
        if (i + 1 < K.componentes.length) pregunta(i + 1);
        else resultado();
      })));
      c.append(ops);
    }

    function resultado() {
      let total = antecedentes * K.pesoAntecedentes;
      c = limpiarCuerpo();
      c.append(nodo("div", "personaje", "📋 Resultados del concurso"));
      const tabla = nodo("div", "tabla");
      K.componentes.forEach((comp) => {
        const op = respuestas[comp.id];
        total += op.valor * comp.peso;
        tabla.append(filaTabla(`${comp.nombre}: ${op.valor}/100`, `+${(op.valor * comp.peso).toFixed(1)}`, op.comentario));
      });
      tabla.append(filaTabla(`Antecedentes: ${antecedentes}/100`, `+${(antecedentes * K.pesoAntecedentes).toFixed(1)}`));
      total = Math.round(total);
      tabla.append(filaTabla("Puntaje del concurso", String(total), null, true));
      c.append(tabla);

      const op = K.oportunidades.find((o) => total >= o.minimo);
      c.append(caja("oportunidad " + op.tipo, op.tipo === "ninguna" ? "Sin plaza esta vez" : "Oportunidad laboral: " + op.nombre));
      c.append(tarjetaArticulo(op.articulo, op.explicacion));

      if (op.tipo === "ninguna") {
        c.append(boton("Presentarme en la siguiente convocatoria", "btn-principal", () => concurso()));
        c.append(boton("Volver al mapa", "btn-opcion", cerrarPanel));
        return;
      }
      if (op.estado === "prueba" && E.pj.titulo === "profesional" && !pedagogiaAcreditada()) {
        c.append(nodo("div", "alerta", "⚠️ Como no eres licenciada, antes de la evaluación del periodo de prueba debes estar cursando o haber terminado un programa de pedagogía o un posgrado en educación (art. 12). Inscríbete en la Universidad."));
      }
      c.append(boton(E.laboral === "provisional" && op.estado === "provisional" ? "Seguir como provisional" : "Aceptar", "btn-principal", () => {
        const antes = E.laboral;
        E.laboral = op.estado;
        E.oportunidad = op.nombre;
        E.anioConcurso = E.anio;
        registrar(`Concurso con ${total} puntos → ${op.nombre}.`);
        if (E.cartas.length === 0 && pueblo) pueblo.generarCartas(2);
        cerrarPanel();
        if (op.estado === "prueba" && E.pj.titulo === "profesional" && !pedagogiaAcreditada()) {
          aviso("⚠️ Para aprobar el periodo de prueba debes inscribirte en pedagogía en la Universidad (art. 12).");
        } else if (op.estado === "prueba") aviso("🎉 ¡Nombramiento en periodo de prueba! Ve al Colegio.");
        else aviso(antes === "provisional" ? "Sigues como provisional este año." : "Trabajarás como provisional. Ve al Colegio.");
      }));
    }
  }

  function caja(clase, texto) {
    const d = nodo("div", clase);
    d.append(nodo("div", "oportunidad-titulo", texto));
    return d;
  }

  function filaTabla(texto, valor, nota, total) {
    const f = nodo("div", "fila" + (total ? " total" : ""));
    const izq = nodo("div", "fila-texto", texto);
    if (nota) izq.append(nodo("div", "fila-nota", nota));
    f.append(izq, nodo("div", "fila-valor", valor));
    return f;
  }

  /* ------------------------------ colegio ------------------------------ */

  function colegio() {
    const item = siguienteDe(C.colegio, E.usadosColegio);
    const c = abrirPanel("🏫", "Colegio", `Año ${E.anio} · ${textoSituacion()}`);
    situacion(c, item, () => { E.hechos.colegio = true; });
  }

  /* ------------------------------ cartas ------------------------------ */

  function abrirCarta(carta) {
    const item = C.cartas.find((x) => x.id === carta.id);
    const c = abrirPanel("🃏", "Situación inesperada", "Carta " + item.tipo.toLowerCase());
    situacion(c, item, () => {
      carta.tomada = true;
      if (carta.sprite) carta.sprite.destroy();
      const quedan = E.cartas.filter((x) => !x.tomada).length;
      setTimeout(() => aviso(quedan ? `🃏 Te queda ${quedan} carta por recoger` : "🃏 ¡Cartas listas! Ve a la Rectoría"), 300);
    });
  }

  /* ----------------------------- universidad ----------------------------- */

  function universidad() {
    const c = abrirPanel("🎓", "Universidad", "Formación · Arts. 21 y 38");
    if (E.estudiando) {
      const p = C.formacion.find((f) => f.id === E.estudiando.id);
      c.append(nodo("div", "personaje", "👩‍🎓 Asesora de posgrados"));
      c.append(nodo("div", "globo", `Vas muy bien en tu ${p.nombre}. ${E.estudiando.restantes === 1 ? "Este es tu último año." : `Te faltan ${E.estudiando.restantes} años.`}`));
      c.append(botonVolver("Seguir estudiando", () => { E.hechos.universidad = true; }));
      return;
    }
    c.append(nodo("div", "personaje", "👩‍🎓 Asesora de posgrados"));
    c.append(nodo("div", "globo", "¿Quieres seguir formándote? Estudiar sube tu formación y te abre puertas en el escalafón, pero te quita tiempo."));
    if (E.pj.titulo === "profesional" && !E.titulos.pedagogia) {
      c.append(nodo("div", "alerta", "⚠️ Como no eres licenciada, debes acreditar un programa de pedagogía o un posgrado en educación antes de terminar el periodo de prueba (art. 12)."));
    }
    const ops = nodo("div", "opciones");
    C.formacion.forEach((p) => {
      if (p.soloTitulo && p.soloTitulo !== E.pj.titulo) return;
      if (E.titulos[p.otorga] && p.otorga !== "pedagogia") return;
      if (p.otorga === "pedagogia" && E.titulos.pedagogia) return;
      let bloqueo = null;
      if (p.requiere === "pregrado" && !tienePregrado()) bloqueo = "Necesitas primero una licenciatura";
      if (p.requiere === "maestria" && !E.titulos.maestria) bloqueo = "Necesitas primero una maestría";
      const efectos = Object.entries(p.efectos).map(([k, d]) => `+${d} ${C.indicadores[k].icono}`).join(" ");
      const costo = p.costoAnual ? " · cada año: " + Object.entries(p.costoAnual).map(([k, d]) => `${d} ${C.indicadores[k].icono}`).join(" ") : "";
      const b = boton(`${p.nombre} — ${p.anios} año${p.anios > 1 ? "s" : ""} · al terminar: ${efectos}${costo}`, "btn-opcion", () => inscribir(p));
      if (bloqueo) { b.disabled = true; b.textContent += ` (${bloqueo})`; }
      ops.append(b);
    });
    c.append(ops);
    c.append(boton("Ahora no", "btn-secundario", cerrarPanel));

    function inscribir(p) {
      E.estudiando = { id: p.id, restantes: p.anios };
      E.hechos.universidad = true;
      registrar(`Empezó: ${p.nombre}.`);
      const c2 = limpiarCuerpo();
      c2.append(nodo("div", "globo", `¡Inscrito en ${p.nombre}! Terminas en ${p.anios} año${p.anios > 1 ? "s" : ""}.`));
      c2.append(tarjetaArticulo(p.articulo, p.explicacion));
      c2.append(botonVolver());
    }
  }

  /* ----------------------- secretaría: progresión ----------------------- */

  function secretaria() {
    const P = C.progresion;
    const c = abrirPanel("🏛️", "Secretaría de Educación", "Progresión profesional · Arts. 10, 20–23, 35–36");
    c.append(nodo("div", "personaje", "👩‍💼 Oficina de escalafón"));
    c.append(nodo("div", "globo", "Aquí se tramitan las evaluaciones de competencias (para ascender o reubicarse) y los concursos para cargos directivos."));
    const ops = nodo("div", "opciones");

    // Evaluación de competencias
    let motivo = null;
    if (E.laboral !== "carrera") motivo = "Primero debes estar inscrito en el escalafón";
    else if (E.aniosDesdeAscenso < P.competencias.aniosMinimos) motivo = `Necesitas ${P.competencias.aniosMinimos} años de servicio en tu nivel (llevas ${E.aniosDesdeAscenso})`;
    const bComp = boton("📊 Evaluación de competencias (ascenso o reubicación)", "btn-opcion", competencias);
    if (motivo) { bComp.disabled = true; bComp.append(nodo("small", "motivo", motivo)); }
    ops.append(bComp);

    // Cargos directivos
    P.directivos.forEach((d) => {
      if (E.cargo === d.cargo || (E.cargo === "Rector")) return;
      let m = null;
      if (E.laboral !== "carrera") m = "Primero debes estar inscrito en el escalafón";
      else if (E.aniosExp < d.aniosExperiencia) m = `Necesitas ${d.aniosExperiencia} años de experiencia (llevas ${E.aniosExp})`;
      const b = boton(`🏅 Concurso para ${d.cargo.toLowerCase()}`, "btn-opcion", () => directivo(d));
      if (m) { b.disabled = true; b.append(nodo("small", "motivo", m)); }
      ops.append(b);
    });
    c.append(ops);
    c.append(boton("Volver al mapa", "btn-secundario", cerrarPanel));
  }

  function competencias() {
    const K = C.progresion.competencias;
    const base = Math.round(Object.entries(K.pesos).reduce((s, [k, w]) => s + E.ind[k] * w, 0));
    const q = azar(C.preguntas);
    let c = limpiarCuerpo();
    c.append(nodo("div", "personaje", "📊 Evaluación de competencias"));
    c.append(nodo("div", "globo", `Tu base por formación, desempeño y experiencia es ${base}. Responde esta pregunta: si aciertas sumas 10 puntos, si fallas pierdes 10.`));
    c.append(nodo("div", "enunciado pregunta", q.texto));
    c.append(nodo("div", "elige", "Elige una respuesta"));
    const ops = nodo("div", "opciones respuestas");
    q.opciones.forEach((o, i) => ops.append(boton(o, "btn-opcion", () => {
      const acierto = i === q.correcta;
      const total = lim(base + (acierto ? 10 : -10));
      E.hechos.secretaria = true;
      c = limpiarCuerpo();
      c.append(nodo("div", "globo", (acierto ? "✅ ¡Correcto! " : `❌ La respuesta era: ${q.opciones[q.correcta]}. `) + `Resultado: ${total}%.`));
      c.append(tarjetaArticulo(q.articulo, q.explicacion));
      if (total > K.umbral) {
        c.append(caja("oportunidad vacante", `¡Más de ${K.umbral}%! Eres candidato a ascenso o reubicación`));
        c.append(tarjetaArticulo(K.articulo, K.explicacion));
        const niveles = ["A", "B", "C", "D"];
        const sigNivel = niveles[niveles.indexOf(E.nivel) + 1];
        const gradoNuevo = gradoPorTitulo();
        const ops2 = nodo("div", "opciones");
        if (gradoNuevo > E.grado) {
          ops2.append(boton(`⬆️ Ascender al Grado ${gradoNuevo} (Nivel A)`, "btn-opcion", () => {
            E.grado = gradoNuevo; E.nivel = "A"; E.aniosDesdeAscenso = 0;
            registrar(`Ascendió al Grado ${gradoNuevo}.`);
            fin(`¡Ascendiste al Grado ${gradoNuevo}! Tu sueldo sube según tu nuevo título.`, "Art. 21 · Ascenso", "El ascenso es pasar de un grado a otro: exige cumplir los requisitos del grado, superar las evaluaciones y que haya disponibilidad presupuestal.");
          }));
        }
        if (sigNivel) {
          ops2.append(boton(`➡️ Reubicarme en el Nivel ${sigNivel} del Grado ${E.grado}`, "btn-opcion", () => {
            E.nivel = sigNivel; E.aniosDesdeAscenso = 0;
            registrar(`Reubicación salarial al Nivel ${sigNivel}.`);
            fin(`¡Reubicación al Nivel ${sigNivel}! Tu salario sube dentro del mismo grado.`, "Art. 23 · Inscripción y ascenso", "La reubicación de nivel se da cuando la entidad convoca la evaluación de competencias y el docente obtiene el puntaje del art. 36, hasta donde alcance el presupuesto.");
          }));
        }
        if (!ops2.children.length) ops2.append(nodo("p", "suave", "Ya estás en el nivel más alto de tu grado y no tienes un título nuevo para ascender."));
        c.append(ops2);
        if (!sigNivel && gradoNuevo <= E.grado) c.append(botonVolver());
      } else {
        c.append(caja("oportunidad reemplazo", `No superaste el ${K.umbral}%. Puedes intentarlo otro año.`));
        c.append(tarjetaArticulo(K.articulo, K.explicacion));
        c.append(botonVolver());
      }
    })));
    c.append(ops);

    function fin(texto, art, exp) {
      const c3 = limpiarCuerpo();
      c3.append(nodo("div", "globo", texto));
      c3.append(tarjetaArticulo(art, exp));
      c3.append(botonVolver());
      actualizarHud();
    }
  }

  function directivo(d) {
    const puntaje = Math.round((E.ind.desempeno + E.ind.formacion + E.ind.popularidad + E.ind.experiencia) / 4);
    E.hechos.secretaria = true;
    const c = limpiarCuerpo();
    c.append(nodo("div", "personaje", `🏅 Concurso para ${d.cargo.toLowerCase()}`));
    const tabla = nodo("div", "tabla");
    IND.forEach((k) => tabla.append(filaTabla(`${C.indicadores[k].icono} ${C.indicadores[k].nombre}`, String(E.ind[k]))));
    tabla.append(filaTabla("Promedio (puntaje del concurso)", String(puntaje), null, true));
    tabla.append(filaTabla("Mínimo para ganar", String(d.minimo)));
    c.append(tabla);
    if (puntaje >= d.minimo) {
      E.cargo = d.cargo;
      registrar(`Ganó el concurso y fue nombrado ${d.cargo.toLowerCase()}.`);
      c.append(caja("oportunidad vacante", `¡Nombrado ${d.cargo}!`));
      c.append(chipsEfectos(aplicar(d.efectos)));
      c.append(tarjetaArticulo("Art. 22 · Escalafón de directivos", "Quien pasa a un cargo directivo conserva su grado en el escalafón y recibe una mayor remuneración."));
    } else {
      c.append(caja("oportunidad reemplazo", "No alcanzaste el puntaje esta vez."));
    }
    c.append(tarjetaArticulo(d.articulo, d.explicacion));
    c.append(botonVolver());
  }

  /* ------------------------- rectoría: evaluación ------------------------- */

  function evaluacionAnual() {
    const A = C.evaluacionAnual;
    const ev = evaluacion();
    const r = ev.total;
    const c = abrirPanel("🗂️", "Rectoría", `Evaluación del año ${E.anio}`);
    const esPrueba = E.laboral === "prueba";
    c.append(nodo("div", "personaje", E.cargo === "Rector" ? "🏛️ Secretaría (evalúa al rector)" : "🧔 Rector"));
    c.append(nodo("div", "globo", esPrueba ? "Terminó el año escolar: llegó la evaluación de tu periodo de prueba." : "Terminó el año escolar: llegó tu evaluación anual de desempeño."));
    const tabla = nodo("div", "tabla");
    ev.partes.forEach(({ k, w, v }) => tabla.append(filaTabla(`${C.indicadores[k].icono} ${C.indicadores[k].nombre}: ${E.ind[k]} × ${Math.round(w * 100)}%`, v.toFixed(1))));
    tabla.append(filaTabla("Resultado", r + "%", null, true));
    c.append(tabla);

    let msg, art, exp, clase = r >= A.minimo ? "vacante" : "reemplazo";
    if (esPrueba) {
      if (r >= A.minimo && (E.pj.titulo !== "profesional" || pedagogiaAcreditada())) {
        const g = gradoPorTitulo();
        msg = `¡Aprobaste el periodo de prueba! Quedas inscrito en el escalafón: Grado ${g}, Nivel A.`;
        art = "Art. 31 · Evaluación del periodo de prueba";
        exp = "Con 60% o más, el docente queda inscrito en el escalafón en el grado que corresponde a sus títulos (art. 21), empezando en el Nivel A.";
      } else if (r >= A.minimo) {
        msg = "Aprobaste la evaluación, pero no acreditaste un programa de pedagogía ni un posgrado en educación. Quedas separado del servicio; puedes volver a concursar.";
        art = "Art. 12, parágrafo 1"; clase = "reemplazo";
        exp = "Los profesionales no licenciados deben acreditar, al terminar el periodo de prueba, que cursan o terminaron un posgrado en educación o un programa de pedagogía.";
      } else {
        msg = "No alcanzaste el 60%. Quedas separado del servicio, pero puedes presentarte al siguiente concurso.";
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
          : "Segundo año seguido por debajo de 60%. Quedas excluido del escalafón y sales del servicio.";
        art = "Art. 36 · Resultados y consecuencias";
        exp = "Dos evaluaciones anuales consecutivas por debajo de 60% llevan a la exclusión del escalafón y al retiro del servicio; un directivo que venía de la docencia regresa a la docencia.";
      } else {
        msg = "⚠️ Tu evaluación quedó por debajo de 60%. Si se repite el próximo año, quedarías fuera del escalafón.";
        art = "Art. 36 · Resultados y consecuencias";
        exp = "Dos evaluaciones anuales consecutivas por debajo de 60% llevan a la exclusión del escalafón.";
      }
    } else {
      msg = (r >= A.minimo ? "Buen año. " : "Año difícil. ") + "Como eres provisional, para tener derechos de carrera debes ganar el concurso. El próximo año preséntate de nuevo.";
      art = "Art. 13 · Nombramientos provisionales";
      exp = "Para ocupar un cargo en propiedad y tener derechos de carrera, hay que ganar el concurso y aprobar la evaluación del periodo de prueba.";
    }
    c.append(caja("oportunidad " + clase, msg));
    c.append(tarjetaArticulo(art, exp));
    c.append(boton(E.anio >= C.aniosDeJuego ? "Ver el final de mi carrera" : "Pasar al siguiente año", "btn-principal", () => cerrarAnio(r)));
  }

  function cerrarAnio(r) {
    const A = C.evaluacionAnual;
    // 1. Consecuencias de la evaluación
    if (E.laboral === "prueba") {
      if (r >= A.minimo && (E.pj.titulo !== "profesional" || pedagogiaAcreditada())) {
        E.laboral = "carrera"; E.grado = gradoPorTitulo(); E.nivel = "A"; E.aniosDesdeAscenso = 0; E.evalBajas = 0;
        registrar(`Aprobó el periodo de prueba (${r}%) y entró al escalafón en el Grado ${E.grado}.`);
      } else {
        E.laboral = "aspirante"; E.oportunidad = null;
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
        setTimeout(() => aviso(`🎓 ¡Terminaste tu ${p.nombre}!`), 900);
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
    aviso(`📅 Comienza el año ${E.anio}`);
  }

  /* ============================== pantallas ============================== */

  function mostrar(id) {
    ["menu", "seleccion", "final"].forEach((p) => $(p).classList.toggle("oculto", p !== id));
  }

  function menu() {
    $("titulo").textContent = C.titulo;
    $("subtitulo").textContent = C.subtitulo;
    $("creditos").textContent = C.creditos;
    $("btn-individual").onclick = seleccion;
    mostrar("menu");
  }

  function seleccion() {
    const cont = $("lista-personajes");
    cont.innerHTML = "";
    C.personajes.forEach((pj) => {
      const t = nodo("button", "tarjeta-personaje");
      const cab = nodo("div", "pj-cabecera");
      cab.append(nodo("span", "pj-icono", pj.icono));
      const nom = nodo("div");
      nom.append(nodo("div", "pj-nombre", pj.nombre), nodo("div", "pj-perfil", pj.perfil));
      cab.append(nom);
      t.append(cab, nodo("p", "pj-desc", pj.descripcion));
      const inds = nodo("div", "pj-inds");
      IND.forEach((k) => {
        const f = nodo("div", "ind");
        f.append(nodo("span", "ind-icono", C.indicadores[k].icono));
        const b = nodo("div", "barra");
        const r = nodo("div", "barra-relleno ind-" + k);
        r.style.width = pj.indicadores[k] + "%";
        b.append(r);
        f.append(b, nodo("span", "ind-valor", pj.indicadores[k]));
        inds.append(f);
      });
      t.append(inds);
      if (pj.nota) t.append(nodo("p", "pj-nota", pj.nota));
      t.onclick = () => empezar(pj);
      cont.append(t);
    });
    $("btn-volver-menu").onclick = menu;
    mostrar("seleccion");
  }

  function empezar(pj) {
    E = nuevoEstado(pj);
    construirHud();
    mostrar(null);
    $("hud").classList.remove("oculto");
    jugando = true;
    if (pueblo) pueblo.reiniciar(pj);
    actualizarHud();
    aviso("Toca el mapa para caminar 👆");
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
    $("fin-icono").textContent = excluido ? "📚" : E.cargo === "Rector" ? "🏆" : E.laboral === "carrera" ? "🎉" : "🧭";
    $("fin-titulo").textContent = `${E.pj.nombre}: ${textoSituacion()}`;
    $("fin-texto").textContent = excluido
      ? "Tu carrera terminó antes de tiempo por dos evaluaciones insatisfactorias seguidas."
      : `Terminaste ${C.aniosDeJuego} años de juego con ${E.aniosExp} años de experiencia. Puntaje de carrera: ${p}.`;
    const inds = $("fin-indicadores");
    inds.innerHTML = "";
    IND.forEach((k) => inds.append(nodo("li", "", `${C.indicadores[k].icono} ${C.indicadores[k].nombre}: ${E.ind[k]}`)));
    const hist = $("fin-historial");
    hist.innerHTML = "";
    E.historial.forEach((h) => hist.append(nodo("li", "", h)));
    const lista = $("fin-articulos");
    lista.innerHTML = "";
    E.articulos.forEach((a) => lista.append(nodo("li", "", a)));
    $("btn-reiniciar").onclick = () => location.reload();
    $("hud").classList.add("oculto");
    mostrar("final");
  }

  /* ============================== el pueblo ============================== */

  class Pueblo extends Phaser.Scene {
    constructor() { super("pueblo"); }

    create() {
      pueblo = this;
      Graficos.crearTexturas(this);

      // Bosque decorativo alrededor del mapa, para pantallas más anchas o altas que el pueblo
      const Wm = MAPA.filas[0].length * T, Hm = MAPA.filas.length * T, B = 12 * T;
      this.add.tileSprite(-B, -B, Wm + 2 * B, B, "arbol").setOrigin(0).setDepth(0);
      this.add.tileSprite(-B, Hm, Wm + 2 * B, B, "arbol").setOrigin(0).setDepth(0);
      this.add.tileSprite(-B, 0, B, Hm, "arbol").setOrigin(0).setDepth(0);
      this.add.tileSprite(Wm, 0, B, Hm, "arbol").setOrigin(0).setDepth(0);
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
      Graficos.dibujarFuente(this);
      this.dibujos = {};
      MAPA.edificios.forEach((ed) => { this.dibujos[ed.id] = Graficos.dibujarEdificio(this, ed); });

      this.crearAnimaciones();
      this.pj = C.personajes[0].id;
      const ini = MAPA.inicio;
      this.casilla = { x: ini.x, y: ini.y };
      this.dir = "arriba";
      this.jugador = this.add.sprite(this.pxX(ini.x), this.pxY(ini.y), this.pj + "-arriba1").setOrigin(0.5, 1).setDepth(10);
      this.sombra = this.add.ellipse(this.jugador.x, this.jugador.y - 2, 18, 6, 0x000000, 0.25).setDepth(9);
      this.camino = [];
      this.moviendo = false;

      this.flecha = this.add.image(0, 0, "flecha").setDepth(20).setVisible(false);
      this.rebote = { v: 0 };
      this.tweens.add({ targets: this.rebote, v: -7, duration: 420, yoyo: true, repeat: -1, ease: "Sine.inOut" });

      const W = MAPA.filas[0].length * T, H = MAPA.filas.length * T;
      this.cameras.main.setBounds(0, 0, W, H);
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
      const altoHud = hud && hud.offsetHeight ? hud.offsetHeight : 130;
      // Que se vean unas 11 columnas y al menos 8 filas por debajo de la barra superior
      let z = Math.min(w / (11 * T), (h - altoHud) / (8 * T));
      z = Phaser.Math.Clamp(z, 0.7, 2.5);
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
      document.documentElement.style.setProperty("--alto-hud", (hud && !hud.classList.contains("oculto") ? altoHud : 0) + "px");
    }

    crearAnimaciones() {
      C.personajes.forEach((pj) => {
        ["abajo", "arriba", "lado"].forEach((d) => {
          const k = pj.id + "-caminar-" + d;
          if (this.anims.exists(k)) return;
          this.anims.create({ key: k, frames: [{ key: pj.id + "-" + d + "1" }, { key: pj.id + "-" + d + "2" }], frameRate: 8, repeat: -1 });
        });
      });
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
        libres.push({ x, y });
      }));
      for (let i = 0; i < n && libres.length; i++) {
        const pos = libres.splice(Math.floor(Math.random() * libres.length), 1)[0];
        const item = siguienteDe(C.cartas, E.usadasCartas);
        const sprite = this.add.image(this.pxX(pos.x), pos.y * T + T / 2, "carta").setDepth(8);
        this.tweens.add({ targets: sprite, y: sprite.y - 5, duration: 600, yoyo: true, repeat: -1, ease: "Sine.inOut", delay: i * 200 });
        E.cartas.push({ id: item.id, x: pos.x, y: pos.y, sprite, tomada: false });
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
      const c = this.add.circle(x, y, 9, ok ? 0xffffff : 0xe87a6a, 0.6).setDepth(8);
      this.tweens.add({ targets: c, scale: 0.2, alpha: 0, duration: 450, onComplete: () => c.destroy() });
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
      this.tweens.add({ targets: this.jugador, x: this.pxX(sig.x), y: this.pxY(sig.y), duration: 150, onComplete: () => this.paso() });
    }

    actualizarMarcadores() {
      if (!this.dibujos) return;
      MAPA.edificios.forEach((ed) => {
        const d = this.dibujos[ed.id];
        if (!E) { d.insignia.setText(""); return; }
        const a = acceso(ed.id);
        if (a.estado === "hecho") d.insignia.setText("✓").setColor("#7bc98f");
        else if (a.estado === "bloqueado") d.insignia.setText("🔒").setColor("#ffffff");
        else if (a.estado === "opcional") d.insignia.setText("★").setColor("#f2c14e");
        else d.insignia.setText("");
      });
      const obj = E ? objetivo() : {};
      let destino = null;
      if (obj.id) {
        const ed = MAPA.edificios.find((e) => e.id === obj.id);
        destino = { x: this.pxX(ed.puerta.x), y: (ed.y + ed.h) * T - 44 };
      } else if (obj.carta) {
        const libres = E.cartas.filter((c) => !c.tomada);
        libres.sort((a, b) => (Math.abs(a.x - this.casilla.x) + Math.abs(a.y - this.casilla.y)) - (Math.abs(b.x - this.casilla.x) + Math.abs(b.y - this.casilla.y)));
        if (libres[0]) destino = { x: this.pxX(libres[0].x), y: libres[0].y * T - 14 };
      }
      this.flechaBase = destino;
      this.flecha.setVisible(!!destino && jugando);
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
    backgroundColor: "#1d2b2a",
    pixelArt: true,
    scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },
    scene: [Pueblo]
  });

  // Para pruebas automáticas
  window.__juego = { estado: () => E, entrar: (id) => entrar(id) };
})();
