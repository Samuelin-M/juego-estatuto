/* ==========================================================================
   COMÚN — lo que comparten el modo individual y el multijugador:
   sacar preguntas de los bancos y pintar las respuestas.
   ========================================================================== */

const Comun = (function () {
  const C = CONTENIDO;

  function banco(nombre) { return (C.bancos && C.bancos[nombre]) || []; }

  // Saca un elemento de un banco sin repetir los ya usados.
  //   usadas: lista de índices ya usados (se actualiza)
  //   nivel:  dificultad deseada (1, 2 o 3). Si ya no quedan de ese nivel, toma la
  //           más cercana, prefiriendo una más difícil. Sin nivel: cualquiera, al azar.
  //   r:      función de azar (0..1)
  //   anio:   año de la carrera. Solo salen preguntas de ese año; si el banco no tiene
  //           de ese año, de los años anteriores (nunca de años más avanzados).
  //   filtro: opcional, para quedarse solo con algunas (por ejemplo, las del cargo del jugador)
  function sacar(nombre, usadas, nivel, r, anio, filtro) {
    r = r || Math.random;
    const lista = banco(nombre);
    let base = lista.map((_, i) => i);
    if (filtro) base = base.filter((i) => filtro(lista[i]));
    if (anio) base = base.filter((i) => (lista[i].anio || 1) <= anio);
    if (!base.length) return null;
    if (anio) {
      const anioDe = (i) => lista[i].anio || anio;          // sin "anio" sirve para cualquier año
      const exactas = base.filter((i) => anioDe(i) === anio);
      if (exactas.length) base = exactas;
      else {
        const previas = base.filter((i) => anioDe(i) < anio);
        if (previas.length) {
          const masCercano = Math.max(...previas.map(anioDe));
          base = previas.filter((i) => anioDe(i) === masCercano);
        }
      }
    }
    let libres = base.filter((i) => !usadas.includes(i));
    if (!libres.length) {                                     // ya salieron todas: se pueden repetir
      for (let k = usadas.length - 1; k >= 0; k--) if (base.includes(usadas[k])) usadas.splice(k, 1);
      libres = base.slice();
    }
    if (nivel) {
      const dif = (i) => lista[i].dificultad || 1;
      const orden = [nivel];
      for (let d = 1; d <= 3; d++) orden.push(nivel + d, nivel - d);
      for (const n of orden) {
        const deEse = libres.filter((i) => dif(i) === n);
        if (deEse.length) { libres = deEse; break; }
      }
    }
    const i = libres[Math.floor(r() * libres.length) % libres.length];
    usadas.push(i);
    return Object.assign({ indice: i, banco: nombre }, lista[i]);
  }

  const NIVELES = { 1: "fácil", 2: "intermedia", 3: "difícil" };
  const nombreNivel = (d) => NIVELES[d] || NIVELES[1];

  // Elemento exacto de un banco (para que todos vean lo mismo en el multijugador)
  function item(nombre, indice) {
    const x = banco(nombre)[indice];
    return x ? Object.assign({ indice, banco: nombre }, x) : null;
  }

  // Puntaje de una opción: el "valor" que tenga, o 100 si es la correcta y 0 si no
  const valor = (op) => (op && op.valor !== undefined ? op.valor : op && op.correcta ? 100 : 0);
  const esCorrecta = (op) => !!(op && (op.correcta === true || (op.correcta === undefined && op.valor >= 100)));
  const correctaDe = (it) => (it && it.opciones || []).find(esCorrecta) || null;
  const tieneCorrecta = (it) => (it && it.opciones || []).some((o) => o.correcta !== undefined);

  // Un artículo cuenta como "descubierto" solo si ya tiene número (no "Art. —")
  const articuloReal = (a) => !!a && /\d/.test(a);

  // Botones de respuesta. En modo prueba (mostrarCorrectas) la correcta va en
  // verde y las demás en rojo. Solo deja responder una vez.
  function opciones(it, alElegir) {
    const cont = document.createElement("div");
    cont.className = "opciones respuestas";
    let hecho = false;
    const marcar = C.mostrarCorrectas && tieneCorrecta(it);
    (it.opciones || []).forEach((op, i) => {
      const b = document.createElement("button");
      b.className = "btn-opcion";
      if (marcar) b.classList.add(esCorrecta(op) ? "op-correcta" : "op-incorrecta");
      b.textContent = op.texto;
      b.onclick = () => {
        if (hecho) return;
        hecho = true;
        cont.querySelectorAll("button").forEach((x) => { x.disabled = true; });
        b.classList.add("elegida");
        alElegir(op, i);
      };
      cont.append(b);
    });
    return cont;
  }

  function avisoPrueba() {
    if (!C.mostrarCorrectas) return null;
    const p = document.createElement("p");
    p.className = "aviso-prueba";
    p.textContent = "Modo prueba: la respuesta correcta está en verde y las incorrectas en rojo.";
    return p;
  }

  return { banco, sacar, item, valor, esCorrecta, correctaDe, tieneCorrecta, articuloReal, opciones, avisoPrueba, nombreNivel };
})();
