/* ==========================================================================
   RED DEL MODO EN VIVO
   Conecta al presentador con los jugadores por un canal identificado con el
   código de la sala.
     - Con Supabase configurado (config.js): funciona entre dispositivos.
     - Sin configurar: usa BroadcastChannel (solo pestañas del mismo navegador),
       útil para probar el juego en un solo computador.
   ========================================================================== */

const Red = (function () {
  function supabaseListo() {
    return !!(typeof CONFIG_EN_VIVO !== "undefined" && CONFIG_EN_VIVO.supabaseUrl && CONFIG_EN_VIVO.supabaseClave && window.supabase);
  }

  function conectar(sala, alRecibir, alEstado) {
    const nombreCanal = "carrera-docente-" + sala;
    const pendientes = [];
    let listo = false;
    const avisar = (e) => { if (alEstado) alEstado(e); };

    if (supabaseListo()) {
      const cliente = window.supabase.createClient(CONFIG_EN_VIVO.supabaseUrl, CONFIG_EN_VIVO.supabaseClave, {
        realtime: { params: { eventsPerSecond: 20 } }
      });
      const canal = cliente.channel(nombreCanal, { config: { broadcast: { self: false, ack: false } } });
      canal.on("broadcast", { event: "m" }, ({ payload }) => alRecibir(payload));
      canal.subscribe((estado) => {
        if (estado === "SUBSCRIBED") {
          listo = true;
          while (pendientes.length) canal.send({ type: "broadcast", event: "m", payload: pendientes.shift() });
          avisar("conectado");
        } else if (estado === "CHANNEL_ERROR" || estado === "TIMED_OUT" || estado === "CLOSED") {
          listo = false;
          avisar("error");
        }
      });
      return {
        modo: "supabase",
        enviar(m) { if (listo) canal.send({ type: "broadcast", event: "m", payload: m }); else pendientes.push(m); },
        cerrar() { cliente.removeChannel(canal); }
      };
    }

    // Modo prueba: pestañas del mismo navegador
    const bc = new BroadcastChannel(nombreCanal);
    bc.onmessage = (e) => alRecibir(e.data);
    setTimeout(() => avisar("conectado"), 0);
    return {
      modo: "local",
      enviar(m) { bc.postMessage(m); },
      cerrar() { bc.close(); }
    };
  }

  return { conectar, modo: () => (supabaseListo() ? "supabase" : "local") };
})();
