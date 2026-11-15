/* ==========================================================================
   MODO EN VIVO — PANTALLA DEL PRESENTADOR (para proyectar)
   Crea la sala, recibe las respuestas de los celulares y lleva el puntaje
   de los tres personajes. Las rondas y preguntas están en contenido.js.
   ========================================================================== */

(function () {
  const C = CONTENIDO;
  const EV = C.enVivo;
  const IND = Object.keys(C.indicadores);
  const $ = (id) => document.getElementById(id);
  const FORMAS = ["▲", "◆", "●", "■"];

  const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const sala = Array.from({ length: 4 }, () => letras[Math.floor(Math.random() * letras.length)]).join("");

  const S = {
    fase: "lobby",              // lobby | intro | desafio | revelar | finRonda | final
    jugadores: {},              // id → { id, nombre, equipo }
    equipos: {},                // personajeId → { pj, ind, oportunidad, cargo, ascenso, evaluacion }
    ronda: -1,
    desafio: -1,
    actual: null,               // desafío en curso
    revelacion: null,
    resumenRonda: null,
    puntosRonda: {}
  };
  C.personajes.forEach((pj) => {
    S.equipos[pj.id] = { pj, ind: Object.assign({}, pj.indicadores), oportunidad: null, cargo: null, ascenso: false, evaluacion: null };
  });

  let red = null;
  let reloj = null;

  /* ------------------------------ utilidades ------------------------------ */

  const lim = (n) => Math.max(0, Math.min(100, Math.round(n)));
  function nodo(tag, clase, texto) {
    const n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto !== undefined && texto !== null) n.textContent = texto;
    return n;
  }
  function boton(texto, clase, fn) { const b = nodo("button", clase, texto); b.onclick = fn; return b; }
  const miembros = (eq) => Object.values(S.jugadores).filter((j) => j.equipo === eq);
  const rondaActual = () => EV.rondas[S.ronda];
  // Equipos que compiten: los que tienen jugadores (si nadie se ha unido, todos)
  const activos = () => {
    const con = Object.keys(S.equipos).filter((eq) => miembros(eq).length > 0);
    return con.length ? con : Object.keys(S.equipos);
  };

  function aplicar(eq, efectos) {
    const cambios = [];
    Object.entries(efectos || {}).forEach(([k, d]) => {
      if (!d || !(k in S.equipos[eq].ind)) return;
      const antes = S.equipos[eq].ind[k];
      S.equipos[eq].ind[k] = lim(antes + d);
      if (S.equipos[eq].ind[k] !== antes) cambios.push({ k, d: S.equipos[eq].ind[k] - antes });
    });
    return cambios;
  }
  const textoCambios = (cambios) => cambios.map(({ k, d }) => `${d > 0 ? "+" : ""}${d} ${C.indicadores[k].icono}`).join("  ");

  function evaluacionDe(eq) {
    const p = C.evaluacionAnual.pesos;
    return Math.round(Object.entries(p).reduce((s, [k, w]) => s + S.equipos[eq].ind[k] * w, 0));
  }
  function puntajeFinal(eq) {
    const e = S.equipos[eq];
    const prom = IND.reduce((s, k) => s + e.ind[k], 0) / IND.length;
    let bonus = 0;
    if (e.oportunidad && e.oportunidad.tipo === "vacante") bonus += 5;
    if (e.cargo) bonus += 8;
    if (e.ascenso) bonus += 5;
    return Math.round(prom + bonus);
  }

  /* --------------------------------- red --------------------------------- */

  function difundir() {
    if (!red) return;
    const equipos = {};
    Object.entries(S.equipos).forEach(([id, e]) => {
      equipos[id] = { ind: e.ind, oportunidad: e.oportunidad ? e.oportunidad.nombre : null, cargo: e.cargo, ascenso: e.ascenso, miembros: miembros(id).length };
    });
    const r = rondaActual();
    red.enviar({
      t: "estado",
      sala,
      fase: S.fase,
      ronda: r ? { nombre: r.nombre, numero: S.ronda + 1, total: EV.rondas.length } : null,
      desafio: S.actual && (S.fase === "desafio" || S.fase === "revelar") ? {
        clave: S.actual.clave, tipo: S.actual.tipo, titulo: S.actual.titulo, texto: S.actual.texto, opciones: S.actual.opciones,
        restante: Math.max(0, Math.round((S.actual.termina - Date.now()) / 1000))
      } : null,
      revelar: S.fase === "revelar" ? S.revelacion : null,
      equipos,
      final: S.fase === "final" ? ranking() : null
    });
  }

  function recibir(m) {
    if (!m || !m.t) return;
    if (m.t === "unir" && S.equipos[m.equipo]) {
      S.jugadores[m.id] = { id: String(m.id).slice(0, 40), nombre: String(m.nombre || "Jugador").slice(0, 20), equipo: m.equipo };
      render();
      difundir();
    } else if (m.t === "hola") {
      difundir();
    } else if (m.t === "resp") {
      registrarRespuesta(m);
    }
  }

  /* ------------------------------ desafíos ------------------------------ */

  function prepararDesafio(def) {
    const clave = S.ronda + "-" + S.desafio + "-" + Date.now();
    if (def.tipo === "caso") {
      const [fuente, id] = def.ref.split(":");
      const item = (fuente === "carta" ? C.cartas : C.colegio).find((x) => x.id === id);
      return {
        clave, tipo: "caso", def, item,
        titulo: def.titulo || (fuente === "carta" ? `Carta ${item.tipo.toLowerCase()}: ${item.titulo}` : "Caso profesional"),
        personaje: item.personaje || null,
        texto: item.texto, opciones: item.opciones.map((o) => o.texto),
        respuestas: {}, primero: null
      };
    }
    let q;
    if (def.ref && def.ref.startsWith("concurso:")) {
      const comp = C.concurso.componentes.find((x) => x.id === def.ref.split(":")[1]);
      const valores = comp.opciones.map((o) => o.valor);
      const correcta = valores.indexOf(Math.max(...valores));
      q = { texto: comp.texto, opciones: comp.opciones.map((o) => o.texto), correcta, articulo: "Art. 9 · Etapas del concurso · " + comp.nombre, explicacion: comp.opciones[correcta].comentario };
      def = Object.assign({ titulo: comp.nombre }, def);
    } else {
      q = C.preguntas.find((p) => p.id === def.pregunta);
    }
    return {
      clave, tipo: def.tipo, def, q,
      titulo: def.titulo || (def.tipo === "rapida" ? "Pregunta rápida" : "Duelo de conocimientos"),
      texto: q.texto, opciones: q.opciones,
      respuestas: {}, primero: null
    };
  }

  function registrarRespuesta(m) {
    const a = S.actual;
    if (S.fase !== "desafio" || !a || m.clave !== a.clave) return;
    const j = S.jugadores[m.id];
    if (!j || a.respuestas[m.id]) return;
    const op = Number(m.op);
    if (!(op >= 0 && op < a.opciones.length)) return;
    a.respuestas[m.id] = { op, t: Date.now() };
    if (a.tipo === "rapida" && !a.primero && op === a.q.correcta) a.primero = m.id;
    const total = Object.keys(S.jugadores).length;
    const n = Object.keys(a.respuestas).length;
    if ((a.tipo === "rapida" && a.primero) || (total > 0 && n >= total)) { setTimeout(revelar, 600); }
    render();
  }

  function iniciarDesafio() {
    const r = rondaActual();
    S.actual = prepararDesafio(r.desafios[S.desafio]);
    S.actual.termina = Date.now() + (EV.segundos || 20) * 1000;
    S.fase = "desafio";
    clearInterval(reloj);
    reloj = setInterval(() => {
      if (S.fase !== "desafio") { clearInterval(reloj); return; }
      if (Date.now() >= S.actual.termina) { revelar(); return; }
      const el = $("reloj");
      if (el) el.textContent = Math.max(0, Math.ceil((S.actual.termina - Date.now()) / 1000));
    }, 250);
    render();
    difundir();
  }

  function revelar() {
    if (S.fase !== "desafio") return;
    clearInterval(reloj);
    const a = S.actual;
    const def = a.def;
    const resultados = {};   // equipo → texto
    const rev = { tipo: a.tipo, correcta: null, decisiones: {}, ganador: null, explicacion: null, articulo: null };

    if (a.tipo === "duelo") {
      rev.correcta = a.q.correcta;
      Object.keys(S.equipos).forEach((eq) => {
        const ms = miembros(eq);
        if (!ms.length) { resultados[eq] = "Sin jugadores"; return; }
        const aciertos = ms.filter((j) => a.respuestas[j.id] && a.respuestas[j.id].op === a.q.correcta).length;
        const pct = aciertos / ms.length;
        const cambios = aplicar(eq, { [def.indicador || "formacion"]: Math.round(15 * pct) });
        S.puntosRonda[eq] = (S.puntosRonda[eq] || 0) + pct * 100;
        let txt = `${aciertos}/${ms.length} aciertos (${Math.round(pct * 100)}%)` + (cambios.length ? " · " + textoCambios(cambios) : "");
        if (def.premio === "ascenso" && pct > 0.8) { S.equipos[eq].ascenso = true; txt += " · ⬆️ ¡Ascenso!"; }
        resultados[eq] = txt;
      });
      rev.explicacion = a.q.explicacion; rev.articulo = a.q.articulo;
      if (def.premio === "ascenso") rev.extra = "Con más de 80% en la evaluación de competencias se es candidato al ascenso (art. 36).";
    }

    if (a.tipo === "rapida") {
      rev.correcta = a.q.correcta;
      if (a.primero) {
        const j = S.jugadores[a.primero];
        rev.ganador = { nombre: j.nombre, equipo: j.equipo };
        const cambios = aplicar(j.equipo, { [def.indicador || "desempeno"]: 12 });
        S.puntosRonda[j.equipo] = (S.puntosRonda[j.equipo] || 0) + 100;
        let txt = `⚡ ${j.nombre} respondió primero` + (cambios.length ? " · " + textoCambios(cambios) : "");
        if (def.premio) { S.equipos[j.equipo].cargo = def.premio; txt += ` · 🏅 ${def.premio}`; }
        resultados[j.equipo] = txt;
      }
      Object.keys(S.equipos).forEach((eq) => { if (!resultados[eq]) resultados[eq] = miembros(eq).length ? "—" : "Sin jugadores"; });
      rev.explicacion = a.q.explicacion; rev.articulo = a.q.articulo;
    }

    if (a.tipo === "caso") {
      Object.keys(S.equipos).forEach((eq) => {
        const votos = a.item.opciones.map(() => 0);
        miembros(eq).forEach((j) => { if (a.respuestas[j.id]) votos[a.respuestas[j.id].op]++; });
        const max = Math.max(...votos);
        if (max === 0) { resultados[eq] = miembros(eq).length ? "Sin respuesta" : "Sin jugadores"; return; }
        const op = votos.indexOf(max);
        rev.decisiones[eq] = op;
        const o = a.item.opciones[op];
        const cambios = aplicar(eq, o.efectos);
        S.puntosRonda[eq] = (S.puntosRonda[eq] || 0) + cambios.reduce((s, c) => s + c.d, 0);
        resultados[eq] = `Eligió: "${o.texto}"` + (cambios.length ? " · " + textoCambios(cambios) : "");
      });
      // La mejor opción según el estatuto: la de mayor efecto total
      const sumas = a.item.opciones.map((o) => Object.values(o.efectos || {}).reduce((s, d) => s + d, 0));
      rev.correcta = sumas.indexOf(Math.max(...sumas));
      const mejor = a.item.opciones[rev.correcta];
      rev.explicacion = mejor.explicacion; rev.articulo = mejor.articulo;
    }

    rev.resultados = resultados;
    S.revelacion = rev;
    S.fase = "revelar";
    render();
    difundir();
  }

  /* ------------------------------ flujo ------------------------------ */

  function introRonda(i) {
    S.ronda = i;
    S.desafio = -1;
    S.puntosRonda = {};
    S.fase = "intro";
    render();
    difundir();
  }

  function siguiente() {
    const r = rondaActual();
    if (S.fase === "lobby") return introRonda(0);
    if (S.fase === "intro") { S.desafio = 0; return iniciarDesafio(); }
    if (S.fase === "revelar") {
      if (S.desafio + 1 < r.desafios.length) { S.desafio++; return iniciarDesafio(); }
      if (r.alFinal) return finRonda();
      return S.ronda + 1 < EV.rondas.length ? introRonda(S.ronda + 1) : final();
    }
    if (S.fase === "finRonda") return S.ronda + 1 < EV.rondas.length ? introRonda(S.ronda + 1) : final();
  }

  function finRonda() {
    const r = rondaActual();
    const filas = {};
    if (r.alFinal === "oportunidades") {
      const orden = activos().sort((a, b) => (S.puntosRonda[b] || 0) - (S.puntosRonda[a] || 0) || S.equipos[b].ind.desempeno - S.equipos[a].ind.desempeno);
      const ops = C.concurso.oportunidades.filter((o) => o.tipo !== "ninguna");
      orden.forEach((eq, i) => {
        const op = ops[Math.min(i, ops.length - 1)];
        S.equipos[eq].oportunidad = op;
        const cambios = op.tipo === "vacante" ? aplicar(eq, { desempeno: 5 }) : [];
        filas[eq] = { titulo: `${i + 1}° · ${op.nombre}`, texto: op.explicacion, articulo: op.articulo, extra: textoCambios(cambios) };
      });
      S.resumenRonda = { titulo: "Oportunidades laborales", filas, nota: "Las plazas se asignan en estricto orden de puntaje (art. 11)." };
    }
    if (r.alFinal === "evaluacion") {
      activos().forEach((eq) => {
        const v = evaluacionDe(eq);
        S.equipos[eq].evaluacion = v;
        filas[eq] = {
          titulo: `Evaluación: ${v}%`,
          texto: v >= C.evaluacionAnual.minimo ? "Satisfactoria: sigue en su cargo." : "Insatisfactoria: si se repite el próximo año, quedaría excluido del escalafón.",
          articulo: v >= C.evaluacionAnual.minimo ? "Art. 32 · Evaluación de desempeño" : "Art. 36 · Resultados y consecuencias",
          ok: v >= C.evaluacionAnual.minimo
        };
      });
      const p = C.evaluacionAnual.pesos;
      S.resumenRonda = {
        titulo: "Evaluación anual del rector",
        filas,
        nota: "Fórmula: " + Object.entries(p).map(([k, w]) => `${C.indicadores[k].nombre} ${Math.round(w * 100)}%`).join(" + ") + ". Mínimo 60% (arts. 31, 32 y 36)."
      };
    }
    S.fase = "finRonda";
    render();
    difundir();
  }

  function ranking() {
    return activos().map((eq) => ({ equipo: eq, puntaje: puntajeFinal(eq) })).sort((a, b) => b.puntaje - a.puntaje);
  }
  function final() { S.fase = "final"; render(); difundir(); }

  /* ------------------------------ dibujo ------------------------------ */

  function urlJugador() {
    const u = new URL("jugar.html", location.href);
    u.search = "?sala=" + sala;
    return u.href;
  }

  function render() {
    $("sala-codigo").textContent = sala;
    const r = rondaActual();
    $("ronda-nombre").textContent = r ? `Ronda ${S.ronda + 1} de ${EV.rondas.length} · ${r.nombre}` : "Sala de espera";
    renderEquipos();
    const esc = $("escenario");
    esc.innerHTML = "";

    if (S.fase === "lobby") {
      const caja = nodo("div", "lobby");
      const qr = nodo("div", "qr");
      try {
        const q = qrcode(0, "M");
        q.addData(urlJugador());
        q.make();
        qr.innerHTML = q.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
      } catch (e) { qr.textContent = "No se pudo generar el QR"; }
      const info = nodo("div", "lobby-info");
      info.append(nodo("h1", "", C.titulo));
      info.append(nodo("p", "grande", "Escanea el código o entra a:"));
      info.append(nodo("p", "url", urlJugador()));
      info.append(nodo("p", "grande", "Código de la sala:"));
      info.append(nodo("div", "codigo-grande", sala));
      const n = Object.keys(S.jugadores).length;
      info.append(nodo("p", "suave", n ? `${n} jugador${n > 1 ? "es" : ""} conectado${n > 1 ? "s" : ""}` : "Esperando jugadores..."));
      info.append(boton("Empezar el juego ▶", "btn-principal btn-grande", siguiente));
      caja.append(qr, info);
      esc.append(caja);
      return;
    }

    if (S.fase === "intro") {
      const caja = nodo("div", "intro-ronda");
      caja.append(nodo("div", "paso", `Ronda ${S.ronda + 1} de ${EV.rondas.length}`));
      caja.append(nodo("h1", "", r.nombre));
      caja.append(nodo("p", "grande", r.descripcion));
      const tipos = { rapida: "⚡ Pregunta rápida", duelo: "⚔️ Duelo de conocimientos", caso: "🧭 Caso profesional" };
      const ul = nodo("ul", "lista-desafios");
      r.desafios.forEach((d) => ul.append(nodo("li", "", tipos[d.tipo] + (d.titulo ? " · " + d.titulo : ""))));
      caja.append(ul);
      caja.append(boton("Comenzar ronda ▶", "btn-principal btn-grande", siguiente));
      esc.append(caja);
      return;
    }

    if (S.fase === "desafio" || S.fase === "revelar") {
      const a = S.actual;
      const caja = nodo("div", "desafio");
      const cab = nodo("div", "desafio-cabecera");
      const tipos = { rapida: "⚡ Pregunta rápida: gana quien responda bien primero", duelo: "⚔️ Duelo: todos responden, puntos según el % de aciertos del equipo", caso: "🧭 Caso profesional: cada equipo decide por mayoría" };
      cab.append(nodo("div", "tipo-desafio", tipos[a.tipo]));
      if (S.fase === "desafio") {
        const rel = nodo("div", "reloj", Math.max(0, Math.ceil((a.termina - Date.now()) / 1000)));
        rel.id = "reloj";
        cab.append(rel);
      }
      caja.append(cab);
      caja.append(nodo("div", "desafio-titulo", a.titulo));
      if (a.personaje) caja.append(nodo("div", "personaje", a.personaje));
      caja.append(nodo("div", "desafio-texto", a.texto));
      const ops = nodo("div", "opciones-grandes n" + a.opciones.length);
      a.opciones.forEach((o, i) => {
        const d = nodo("div", "op-grande op" + i);
        if (S.fase === "revelar" && S.revelacion.correcta !== null) d.classList.add(i === S.revelacion.correcta ? "correcta" : "atenuada");
        d.append(nodo("span", "forma", FORMAS[i]), nodo("span", "", o));
        ops.append(d);
      });
      caja.append(ops);

      if (S.fase === "desafio") {
        const n = Object.keys(a.respuestas).length, total = Object.keys(S.jugadores).length;
        const pie = nodo("div", "pie-desafio");
        pie.append(nodo("span", "suave", `${n} de ${total} respuestas`));
        pie.append(boton("Revelar ahora", "btn-secundario corto", revelar));
        caja.append(pie);
      } else {
        const rev = S.revelacion;
        if (rev.tipo === "rapida") caja.append(nodo("div", "anuncio", rev.ganador ? `⚡ ${rev.ganador.nombre} (${S.equipos[rev.ganador.equipo].pj.nombre}) respondió primero` : "Nadie respondió correctamente"));
        if (rev.tipo === "caso") caja.append(nodo("div", "anuncio suave-anuncio", `Lo que mejor se ajusta al estatuto: "${a.opciones[rev.correcta]}"`));
        const t = nodo("div", "tarjeta-articulo");
        t.append(nodo("div", "art-titulo", "📜 " + rev.articulo));
        t.append(nodo("p", "", rev.explicacion));
        if (rev.extra) t.append(nodo("p", "", rev.extra));
        caja.append(t);
        caja.append(boton("Siguiente ▶", "btn-principal btn-grande", siguiente));
      }
      esc.append(caja);
      return;
    }

    if (S.fase === "finRonda") {
      const R = S.resumenRonda;
      const caja = nodo("div", "fin-ronda");
      caja.append(nodo("h1", "", R.titulo));
      const grid = nodo("div", "grid-equipos");
      Object.entries(R.filas).forEach(([eq, f]) => {
        const c = nodo("div", "tarjeta-resultado" + (f.ok === false ? " mal" : f.ok ? " bien" : ""));
        c.append(nodo("div", "res-equipo", `${S.equipos[eq].pj.icono} ${S.equipos[eq].pj.nombre}`));
        c.append(nodo("div", "res-titulo", f.titulo));
        c.append(nodo("p", "", f.texto));
        if (f.extra) c.append(nodo("p", "res-extra", f.extra));
        c.append(nodo("div", "res-art", "📜 " + f.articulo));
        grid.append(c);
      });
      caja.append(grid);
      caja.append(nodo("p", "suave", R.nota));
      caja.append(boton(S.ronda + 1 < EV.rondas.length ? "Siguiente ronda ▶" : "Ver resultados finales ▶", "btn-principal btn-grande", siguiente));
      esc.append(caja);
      return;
    }

    if (S.fase === "final") {
      const caja = nodo("div", "final-vivo");
      caja.append(nodo("h1", "", "🏆 Resultados finales"));
      const podio = nodo("div", "podio");
      ranking().forEach((x, i) => {
        const e = S.equipos[x.equipo];
        const p = nodo("div", "puesto p" + (i + 1));
        p.append(nodo("div", "medalla", ["🥇", "🥈", "🥉"][i] || ""));
        p.append(nodo("div", "res-equipo", `${e.pj.icono} ${e.pj.nombre}`));
        p.append(nodo("div", "res-titulo", `${x.puntaje} puntos`));
        const det = [e.oportunidad ? e.oportunidad.nombre : null, e.cargo, e.ascenso ? "Ascenso" : null].filter(Boolean).join(" · ");
        if (det) p.append(nodo("p", "suave", det));
        podio.append(p);
      });
      caja.append(podio);
      caja.append(nodo("p", "suave", "Puntaje = promedio de los 4 indicadores + bonos (vacante definitiva +5, cargo directivo +8, ascenso +5)."));
      caja.append(boton("Nueva partida", "btn-secundario", () => location.reload()));
      esc.append(caja);
    }
  }

  function renderEquipos() {
    const cont = $("equipos");
    cont.innerHTML = "";
    Object.entries(S.equipos).forEach(([id, e]) => {
      const c = nodo("div", "panel-equipo" + (S.fase !== "lobby" && !miembros(id).length && activos().length < 3 ? " vacio" : ""));
      const cab = nodo("div", "panel-cabecera");
      cab.append(nodo("span", "panel-icono", e.pj.icono));
      const t = nodo("div");
      t.append(nodo("div", "panel-nombre", e.pj.nombre), nodo("div", "panel-perfil", e.pj.perfil));
      cab.append(t);
      const ms = miembros(id);
      cab.append(nodo("span", "chip", `👥 ${ms.length}`));
      c.append(cab);
      const inds = nodo("div", "indicadores");
      IND.forEach((k) => {
        const f = nodo("div", "ind");
        f.append(nodo("span", "ind-icono", C.indicadores[k].icono));
        const b = nodo("div", "barra");
        const r = nodo("div", "barra-relleno ind-" + k);
        r.style.width = e.ind[k] + "%";
        b.append(r);
        f.append(b, nodo("span", "ind-valor", e.ind[k]));
        inds.append(f);
      });
      c.append(inds);
      const etiquetas = [e.oportunidad ? e.oportunidad.nombre : null, e.cargo ? "🏅 " + e.cargo : null, e.ascenso ? "⬆️ Ascenso" : null].filter(Boolean);
      if (etiquetas.length) {
        const ch = nodo("div", "chips");
        etiquetas.forEach((x) => ch.append(nodo("span", "chip", x)));
        c.append(ch);
      }
      if (S.fase === "lobby") {
        c.append(nodo("div", "panel-miembros", ms.length ? ms.map((j) => j.nombre).join(", ") : "Nadie todavía"));
      } else if (S.fase === "desafio") {
        const resp = ms.filter((j) => S.actual.respuestas[j.id]).length;
        c.append(nodo("div", "panel-miembros", `Respondieron ${resp} de ${ms.length}`));
      } else if (S.fase === "revelar" && S.revelacion.resultados[id]) {
        c.append(nodo("div", "panel-resultado", S.revelacion.resultados[id]));
      }
      cont.append(c);
    });
  }

  /* ------------------------------ arranque ------------------------------ */

  function arrancar() {
    const modo = Red.modo();
    $("modo-red").textContent = modo === "supabase" ? "🟢 En línea" : "🟡 Modo prueba (mismo navegador)";
    $("modo-red").title = modo === "supabase" ? "Conectado por Supabase Realtime" : "Sin servidor configurado en config.js: los jugadores deben abrir jugar.html en pestañas de este mismo navegador.";
    if (modo !== "supabase") $("aviso-modo").classList.remove("oculto");
    red = Red.conectar(sala, recibir, (e) => { if (e === "error") $("modo-red").textContent = "🔴 Sin conexión"; });
    render();
    setInterval(difundir, 3000);
  }

  arrancar();
  window.__presentador = { estado: () => S, siguiente, revelar, sala };
})();
