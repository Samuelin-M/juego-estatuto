/* ==========================================================================
   MOTOR DEL JUEGO — no es necesario editar este archivo.
   Lee las escenas de contenido.js y las va mostrando.
   ========================================================================== */

(function () {
  const $pantalla = document.getElementById("pantalla");
  const $hud = document.getElementById("hud");

  let estado;

  function nuevoEstado(nombre) {
    return {
      nombre: nombre || "Profe",
      puntaje: JUEGO.puntajeInicial ?? 50,
      grado: "Sin escalafón",
      anio: 0,
      articulosVistos: [],
      escenaActual: JUEGO.escenaInicial
    };
  }

  // ---------- utilidades ----------
  function limitar(n) { return Math.max(0, Math.min(100, n)); }

  function el(tag, props = {}, hijos = []) {
    const nodo = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => {
      if (k === "class") nodo.className = v;
      else if (k === "texto") nodo.textContent = v;
      else if (k.startsWith("on")) nodo.addEventListener(k.slice(2), v);
      else nodo.setAttribute(k, v);
    });
    hijos.forEach(h => h && nodo.appendChild(h));
    return nodo;
  }

  function limpiar() {
    $pantalla.innerHTML = "";
    // reinicia la animación de entrada
    $pantalla.style.animation = "none";
    void $pantalla.offsetWidth;
    $pantalla.style.animation = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------- HUD ----------
  function actualizarHud(etapa) {
    $hud.classList.remove("oculto");
    document.getElementById("hud-etapa").textContent = etapa || "";
    document.getElementById("hud-puntaje").textContent = estado.puntaje;
    document.getElementById("hud-grado").textContent = estado.grado;
    document.getElementById("hud-anio").textContent = "Año " + estado.anio;
    const relleno = document.getElementById("barra-relleno");
    relleno.style.width = estado.puntaje + "%";
    relleno.style.background =
      estado.puntaje >= 60 ? "var(--bien)" : estado.puntaje >= 40 ? "var(--acento)" : "var(--mal)";
  }

  // ---------- pantallas ----------
  function pantallaInicio() {
    $hud.classList.add("oculto");
    limpiar();
    const input = el("input", { type: "text", placeholder: "Tu nombre (opcional)", maxlength: "30" });
    $pantalla.append(
      el("div", { class: "icono-escena", texto: "🍎" }),
      el("h1", {}, [document.createTextNode(JUEGO.titulo)]),
      el("p", { class: "subtitulo", texto: JUEGO.subtitulo }),
      el("p", { class: "narracion", texto: "Toma decisiones como un docente recién graduado. Cada decisión está regulada por un artículo del estatuto. Necesitas mínimo 60 puntos para seguir avanzando." }),
      input,
      el("button", {
        class: "btn-principal",
        texto: "Empezar",
        onclick: () => {
          estado = nuevoEstado(input.value.trim());
          mostrarEscena(estado.escenaActual);
        }
      }),
      el("p", { class: "pie", texto: JUEGO.creditos })
    );
  }

  function mostrarEscena(id) {
    const escena = JUEGO.escenas[id];
    if (!escena) {
      mostrarError(`No existe la escena "${id}". Revisa contenido.js.`);
      return;
    }
    estado.escenaActual = id;
    actualizarHud(escena.etapa);
    limpiar();

    const opciones = el("div", { class: "opciones" });
    escena.opciones.forEach(op => {
      opciones.appendChild(el("button", {
        class: "btn-opcion",
        texto: op.texto,
        onclick: () => elegir(escena, op)
      }));
    });

    $pantalla.append(
      escena.icono ? el("div", { class: "icono-escena", texto: escena.icono }) : null,
      el("p", { class: "narracion", texto: personalizar(escena.texto) }),
      opciones
    );
  }

  function personalizar(texto) {
    return (texto || "").replaceAll("{nombre}", estado.nombre);
  }

  function elegir(escena, op) {
    const puntos = op.puntos || 0;
    estado.puntaje = limitar(estado.puntaje + puntos);
    if (op.cambios) {
      if (op.cambios.grado) estado.grado = op.cambios.grado;
      if (typeof op.cambios.anio === "number") estado.anio += op.cambios.anio;
    }
    if (op.articulo && !estado.articulosVistos.includes(op.articulo)) {
      estado.articulosVistos.push(op.articulo);
    }
    actualizarHud(escena.etapa);
    mostrarTarjeta(escena, op, puntos);
  }

  function mostrarTarjeta(escena, op, puntos) {
    limpiar();
    let claseEfecto = "neutro", textoEfecto = "Sin cambio en el puntaje";
    if (puntos > 0) { claseEfecto = "positivo"; textoEfecto = `+${puntos} puntos`; }
    if (puntos < 0) { claseEfecto = "negativo"; textoEfecto = `${puntos} puntos`; }

    const tarjeta = el("div", { class: "tarjeta-articulo" }, [
      el("div", { class: "art-titulo", texto: "📜 " + (op.articulo || "Estatuto docente") }),
      el("p", { texto: op.explicacion || "" }),
      el("span", { class: "efecto " + claseEfecto, texto: textoEfecto })
    ]);

    $pantalla.append(
      escena.opciones.length > 1 ? el("p", { class: "respuesta-elegida", texto: op.texto }) : null,
      tarjeta,
      el("button", {
        class: "btn-principal",
        texto: "Continuar",
        onclick: () => avanzar(op)
      })
    );
  }

  function avanzar(op) {
    let sig = op.siguiente;
    if (typeof sig === "function") sig = sig(estado);
    if (!sig || sig === "FIN") pantallaFinal();
    else mostrarEscena(sig);
  }

  function pantallaFinal() {
    actualizarHud("Fin del recorrido");
    limpiar();
    const aprobo = estado.puntaje >= 60;
    const lista = el("ul", { class: "lista-articulos" },
      estado.articulosVistos.map(a => el("li", { texto: a })));

    $pantalla.append(
      el("div", { class: "icono-escena", texto: aprobo ? "🏆" : "📚" }),
      el("h2", { texto: aprobo ? `¡Bien, ${estado.nombre}!` : `Sigue intentando, ${estado.nombre}` }),
      el("p", { class: "narracion", texto: `Terminaste con ${estado.puntaje} puntos. ` +
        (aprobo ? "Cumpliste lo que exige el estatuto." : "No alcanzaste el 60% que exige el estatuto.") }),
      el("p", { class: "subtitulo", texto: "Artículos que recorriste:" }),
      lista,
      el("button", { class: "btn-principal", texto: "Jugar de nuevo", onclick: pantallaInicio })
    );
  }

  function mostrarError(msg) {
    limpiar();
    $pantalla.append(
      el("h2", { texto: "Ups" }),
      el("p", { texto: msg }),
      el("button", { class: "btn-principal", texto: "Volver al inicio", onclick: pantallaInicio })
    );
  }

  pantallaInicio();
})();
