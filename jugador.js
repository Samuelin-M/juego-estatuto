/* ==========================================================================
   MODO EN VIVO — CELULAR DEL JUGADOR
   Se une a una sala, elige equipo (personaje) y responde los desafíos.
   ========================================================================== */

(function () {
  const C = CONTENIDO;
  const IND = Object.keys(C.indicadores);
  const $ = (id) => document.getElementById(id);
  const FORMAS = ["▲", "◆", "●", "■"];

  const guardar = (k, v) => { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } };
  const leer = (k) => { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } };

  const yo = leer("cd-jugador") || { id: "j" + Math.random().toString(36).slice(2, 10) };
  let red = null;
  let ultimo = null;          // último estado recibido
  const respuestas = {};      // clave del desafío → opción elegida
  let temporizador = null;
  let vigia = null;

  function nodo(tag, clase, texto) {
    const n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto !== undefined && texto !== null) n.textContent = texto;
    return n;
  }
  const pj = (id) => C.personajes.find((p) => p.id === id);
  const pantalla = () => { const p = $("pantalla-jugador"); p.innerHTML = ""; return p; };

  /* ------------------------------ unirse ------------------------------ */

  function formulario(mensaje) {
    const p = pantalla();
    const params = new URLSearchParams(location.search);
    const caja = nodo("div", "unirse");
    caja.append(nodo("h1", "", "Unirme a la partida"));
    if (mensaje) caja.append(nodo("div", "alerta", mensaje));
    if (Red.modo() !== "supabase") caja.append(nodo("p", "suave pequeno-texto", "Modo prueba: solo funciona si el presentador está abierto en otra pestaña de este mismo navegador."));

    caja.append(nodo("label", "etiqueta", "Código de la sala"));
    const sala = nodo("input", "campo codigo");
    sala.maxLength = 4; sala.placeholder = "ABCD"; sala.autocapitalize = "characters";
    sala.value = (params.get("sala") || yo.sala || "").toUpperCase();
    caja.append(sala);

    caja.append(nodo("label", "etiqueta", "Tu nombre"));
    const nombre = nodo("input", "campo");
    nombre.maxLength = 20; nombre.placeholder = "Ej: Laura"; nombre.value = yo.nombre || "";
    caja.append(nombre);

    caja.append(nodo("label", "etiqueta", "Elige tu equipo"));
    const equipos = nodo("div", "elegir-equipo");
    let elegido = yo.equipo || null;
    C.personajes.forEach((x) => {
      const b = nodo("button", "btn-equipo" + (elegido === x.id ? " elegido" : ""));
      b.append(nodo("span", "pj-icono", x.icono));
      const t = nodo("div");
      t.append(nodo("div", "pj-nombre", x.nombre), nodo("div", "pj-perfil", x.perfil));
      b.append(t);
      b.onclick = () => {
        elegido = x.id;
        equipos.querySelectorAll(".btn-equipo").forEach((e) => e.classList.remove("elegido"));
        b.classList.add("elegido");
      };
      equipos.append(b);
    });
    caja.append(equipos);

    const entrar = nodo("button", "btn-principal btn-grande", "Entrar");
    entrar.onclick = () => {
      const s = sala.value.trim().toUpperCase();
      const n = nombre.value.trim();
      if (s.length !== 4) return formulario("Escribe el código de 4 letras que aparece en la pantalla.");
      if (!n) return formulario("Escribe tu nombre.");
      if (!elegido) return formulario("Elige un equipo.");
      Object.assign(yo, { sala: s, nombre: n, equipo: elegido });
      guardar("cd-jugador", yo);
      conectar();
    };
    caja.append(entrar);
    p.append(caja);
  }

  function conectar() {
    if (red) red.cerrar();
    ultimo = null;
    esperando("Conectando con la sala " + yo.sala + "…");
    red = Red.conectar(yo.sala, recibir, (e) => {
      if (e === "conectado") {
        red.enviar({ t: "unir", id: yo.id, nombre: yo.nombre, equipo: yo.equipo });
        red.enviar({ t: "hola", id: yo.id });
      }
      if (e === "error") esperando("Problema de conexión. Reintentando…");
    });
    clearTimeout(vigia);
    vigia = setTimeout(() => { if (!ultimo) formulario(`No encontramos la sala ${yo.sala}. Revisa el código y que el presentador tenga la sala abierta.`); }, 8000);
    const eq = pj(yo.equipo);
    $("j-equipo").textContent = `${eq.icono} ${eq.nombre}`;
    $("j-equipo").classList.remove("oculto");
  }

  /* ------------------------------ estados ------------------------------ */

  function recibir(m) {
    if (!m || m.t !== "estado" || m.sala !== yo.sala) return;
    const primeraVez = !ultimo;
    ultimo = m;
    clearTimeout(vigia);
    if (primeraVez || !(m.equipos && m.equipos[yo.equipo] && m.equipos[yo.equipo].miembros)) {
      // por si el presentador se reinició: volver a anunciarse
      red.enviar({ t: "unir", id: yo.id, nombre: yo.nombre, equipo: yo.equipo });
    }
    dibujar();
  }

  function esperando(texto) {
    const p = pantalla();
    const c = nodo("div", "espera");
    c.append(nodo("div", "girando", "⏳"), nodo("p", "grande", texto));
    p.append(c);
  }

  function resumenEquipo(m) {
    const e = m.equipos && m.equipos[yo.equipo];
    const x = pj(yo.equipo);
    const c = nodo("div", "mi-equipo");
    c.append(nodo("div", "panel-nombre", `${x.icono} Equipo ${x.nombre}`));
    if (!e) return c;
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
    const etq = [e.oportunidad, e.cargo ? "🏅 " + e.cargo : null, e.ascenso ? "⬆️ Ascenso" : null].filter(Boolean);
    if (etq.length) { const ch = nodo("div", "chips"); etq.forEach((t) => ch.append(nodo("span", "chip", t))); c.append(ch); }
    return c;
  }

  function dibujar() {
    const m = ultimo;
    const p = pantalla();
    clearInterval(temporizador);
    if (m.ronda) $("j-titulo").textContent = `Ronda ${m.ronda.numero}/${m.ronda.total} · ${m.ronda.nombre}`;

    if (m.fase === "lobby") {
      const c = nodo("div", "espera");
      c.append(nodo("div", "icono-grande", pj(yo.equipo).icono));
      c.append(nodo("h2", "", `¡Listo, ${yo.nombre}!`));
      c.append(nodo("p", "grande", "Espera a que el presentador empiece el juego."));
      p.append(c, resumenEquipo(m));
      p.append(cambiarEquipo());
      return;
    }

    if (m.fase === "intro") {
      const c = nodo("div", "espera");
      c.append(nodo("div", "paso", `Ronda ${m.ronda.numero} de ${m.ronda.total}`));
      c.append(nodo("h2", "", m.ronda.nombre));
      c.append(nodo("p", "grande", "👀 Mira la pantalla"));
      p.append(c, resumenEquipo(m));
      return;
    }

    if (m.fase === "desafio" && m.desafio) {
      const d = m.desafio;
      const elegida = respuestas[d.clave];
      const cab = nodo("div", "j-cabecera");
      const tipos = { rapida: "⚡ Pregunta rápida", duelo: "⚔️ Duelo", caso: "🧭 Caso profesional" };
      cab.append(nodo("span", "tipo-desafio", tipos[d.tipo]));
      const rel = nodo("span", "reloj pequeno-reloj", d.restante);
      cab.append(rel);
      p.append(cab);
      let restante = d.restante;
      const inicio = Date.now();
      temporizador = setInterval(() => { rel.textContent = Math.max(0, restante - Math.floor((Date.now() - inicio) / 1000)); }, 500);

      p.append(nodo("div", "j-pregunta", d.texto));
      if (elegida === undefined) {
        const ops = nodo("div", "j-opciones");
        d.opciones.forEach((o, i) => {
          const b = nodo("button", "j-op op" + i);
          b.append(nodo("span", "forma", FORMAS[i]), nodo("span", "", o));
          b.onclick = () => {
            respuestas[d.clave] = i;
            red.enviar({ t: "resp", id: yo.id, clave: d.clave, op: i });
            if (navigator.vibrate) { try { navigator.vibrate(30); } catch (e) { /* nada */ } }
            dibujar();
          };
          ops.append(b);
        });
        p.append(ops);
      } else {
        const c = nodo("div", "enviada op" + elegida);
        c.append(nodo("div", "forma grande-forma", FORMAS[elegida]));
        c.append(nodo("p", "", "Respuesta enviada: " + d.opciones[elegida]));
        c.append(nodo("p", "suave", "Espera a que se revele el resultado…"));
        p.append(c);
      }
      return;
    }

    if (m.fase === "revelar" && m.desafio && m.revelar) {
      const d = m.desafio, r = m.revelar;
      const elegida = respuestas[d.clave];
      const c = nodo("div", "resultado-j");
      if (d.tipo === "caso") {
        const dec = r.decisiones && r.decisiones[yo.equipo];
        c.classList.add("neutro");
        c.append(nodo("div", "icono-grande", "🧭"));
        c.append(nodo("h2", "", dec !== undefined ? "Tu equipo decidió:" : "Tu equipo no respondió"));
        if (dec !== undefined) c.append(nodo("p", "grande", d.opciones[dec]));
        if (r.resultados && r.resultados[yo.equipo]) c.append(nodo("p", "suave", r.resultados[yo.equipo]));
      } else {
        const bien = elegida === r.correcta;
        c.classList.add(elegida === undefined ? "neutro" : bien ? "bien" : "mal");
        c.append(nodo("div", "icono-grande", elegida === undefined ? "⏱️" : bien ? "✅" : "❌"));
        c.append(nodo("h2", "", elegida === undefined ? "No alcanzaste a responder" : bien ? "¡Correcto!" : "Incorrecto"));
        if (!bien) c.append(nodo("p", "", "Respuesta correcta: " + d.opciones[r.correcta]));
        if (r.ganador && r.ganador.nombre === yo.nombre && r.ganador.equipo === yo.equipo) c.append(nodo("p", "grande", "⚡ ¡Fuiste el más rápido!"));
        if (r.resultados && r.resultados[yo.equipo]) c.append(nodo("p", "suave", r.resultados[yo.equipo]));
      }
      if (r.articulo) {
        const t = nodo("div", "tarjeta-articulo");
        t.append(nodo("div", "art-titulo", "📜 " + r.articulo));
        t.append(nodo("p", "", r.explicacion));
        c.append(t);
      }
      p.append(c, resumenEquipo(m));
      return;
    }

    if (m.fase === "finRonda") {
      const c = nodo("div", "espera");
      c.append(nodo("h2", "", "Fin de la ronda"));
      c.append(nodo("p", "grande", "👀 Mira los resultados en la pantalla"));
      p.append(c, resumenEquipo(m));
      return;
    }

    if (m.fase === "final" && m.final) {
      const pos = m.final.findIndex((x) => x.equipo === yo.equipo);
      const c = nodo("div", "espera");
      c.append(nodo("div", "icono-grande", ["🥇", "🥈", "🥉"][pos] || "🎓"));
      c.append(nodo("h2", "", `Tu equipo quedó de ${pos + 1}°`));
      c.append(nodo("p", "grande", `${m.final[pos].puntaje} puntos`));
      p.append(c, resumenEquipo(m));
      return;
    }

    esperando("Esperando al presentador…");
  }

  function cambiarEquipo() {
    const b = nodo("button", "btn-secundario", "Cambiar nombre o equipo");
    b.onclick = () => formulario();
    return b;
  }

  // Si el celular bloqueó la pantalla o cambió de app, al volver se pide el estado actual
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && red && yo.sala) {
      red.enviar({ t: "unir", id: yo.id, nombre: yo.nombre, equipo: yo.equipo });
      red.enviar({ t: "hola", id: yo.id });
    }
  });

  /* ------------------------------ arranque ------------------------------ */

  const params = new URLSearchParams(location.search);
  if (yo.sala && yo.nombre && yo.equipo && (!params.get("sala") || params.get("sala").toUpperCase() === yo.sala)) conectar();
  else formulario();

  window.__jugador = { yo, estado: () => ultimo };
})();
