/* ==========================================================================
   COMÚN — lo que comparten el modo individual y el multijugador:
   sacar preguntas de los bancos y pintar las respuestas.
   ========================================================================== */

const Comun = (function () {
  const C = CONTENIDO;

  function banco(nombre) { return (C.bancos && C.bancos[nombre]) || []; }

  // Saca un elemento de un banco sin repetir los ya usados.
  //   usadas: lista de índices ya usados (se actualiza)
  //   nivel:  dificultad deseada (1, 2 o 3). Si ya no quedan de ese nivel,
  //           toma el más cercano, prefiriendo uno más difícil.
  //   r:      función de azar (0..1). En el multijugador es la misma para todos.
  function sacar(nombre, usadas, nivel, r) {
    r = r || Math.random;
    const lista = banco(nombre);
    if (!lista.length) return null;
    const todos = lista.map((_, i) => i);
    let libres = todos.filter((i) => !usadas.includes(i));
    if (!libres.length) { usadas.length = 0; libres = todos.slice(); }
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

  return { banco, sacar, item, valor, esCorrecta, correctaDe, tieneCorrecta, articuloReal, opciones, avisoPrueba };
})();
