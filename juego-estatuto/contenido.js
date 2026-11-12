/* ==========================================================================
   CONTENIDO DEL JUEGO
   Este es el ÚNICO archivo que hay que editar para cambiar la historia,
   las preguntas y los artículos. No hace falta tocar motor.js.

   CÓMO FUNCIONA
   - El juego es una lista de ESCENAS. Cada escena tiene un texto y opciones.
   - Al elegir una opción se muestra una tarjeta con el artículo que la explica
     y se cambia el puntaje (de 0 a 100; empieza en 50).
   - "siguiente" dice a qué escena se pasa después. Puede ser:
       * el id de otra escena:          siguiente: "concurso_2"
       * una decisión según el puntaje: siguiente: (e) => e.puntaje >= 60 ? "aprobo" : "no_aprobo"
       * "FIN" para terminar el juego.

   PLANTILLA PARA COPIAR Y PEGAR
   -------------------------------------------------------------------------
   mi_escena: {
     etapa: "Nombre de la etapa",
     icono: "📝",
     texto: "Lo que le pasa al jugador...",
     opciones: [
       {
         texto: "Lo que el jugador puede elegir",
         puntos: 10,                     // positivo suma, negativo resta
         articulo: "Art. 8",
         explicacion: "Qué dice el artículo y por qué esta opción suma o resta.",
         siguiente: "otra_escena"
       },
       // ...más opciones
     ]
   },
   -------------------------------------------------------------------------
   ========================================================================== */

const JUEGO = {
  titulo: "Carrera Docente",
  subtitulo: "Sobrevive al Estatuto de Profesionalización Docente (Decreto 1278 de 2002, arts. 8–40)",
  creditos: "Ética — UIS",
  puntajeInicial: 50,
  escenaInicial: "inicio",

  escenas: {

    /* ---------------- ETAPA 1: EL CONCURSO (arts. 8–11) ---------------- */
    // Contenido de EJEMPLO para probar el motor. El grupo lo reemplaza.

    inicio: {
      etapa: "Etapa 1 · El concurso",
      icono: "🎓",
      texto: "Te acabas de graduar y quieres trabajar como profe en un colegio público.\n\n¿Qué haces primero?",
      opciones: [
        {
          texto: "Le pido a un conocido de la Secretaría de Educación que me ubique.",
          puntos: -15,
          articulo: "Art. 8 · Concurso para ingreso",
          explicacion: "Al servicio educativo estatal se entra por concurso de méritos, no por contactos. Las plazas se asignan según la lista de elegibles.",
          siguiente: "concurso_pruebas"
        },
        {
          texto: "Me inscribo en la convocatoria del concurso docente.",
          puntos: 10,
          articulo: "Art. 8 · Concurso para ingreso",
          explicacion: "El concurso evalúa aptitudes, experiencia, competencias básicas, relaciones interpersonales y personalidad, y con eso se arma la lista de elegibles.",
          siguiente: "concurso_pruebas"
        }
      ]
    },

    concurso_pruebas: {
      etapa: "Etapa 1 · El concurso",
      icono: "📝",
      texto: "Llegan las pruebas del concurso. Un compañero te dice que no vale la pena prepararse para la prueba psicotécnica ni para la entrevista: \"lo único que cuenta es la de conocimientos\".",
      opciones: [
        {
          texto: "Le hago caso y solo estudio la parte de conocimientos.",
          puntos: -10,
          articulo: "Art. 9 · Etapas del concurso",
          explicacion: "El concurso tiene varias etapas: convocatoria, inscripción, pruebas de aptitudes, prueba psicotécnica, entrevista, valoración de antecedentes y clasificación. Todas cuentan.",
          siguiente: "concurso_lista"
        },
        {
          texto: "Me preparo para todas las pruebas.",
          puntos: 10,
          articulo: "Art. 9 · Etapas del concurso",
          explicacion: "Cada etapa del concurso aporta al resultado final, así que prepararse para todas es lo que más te acerca a la lista de elegibles.",
          siguiente: "concurso_lista"
        }
      ]
    },

    concurso_lista: {
      etapa: "Etapa 1 · El concurso",
      icono: "📋",
      texto: "Quedaste en la lista de elegibles. Te ofrecen una plaza en un municipio lejano, pero tú preferías una en la ciudad.",
      opciones: [
        {
          texto: "La rechazo y espero: seguro me ofrecen otra pronto.",
          puntos: -5,
          articulo: "Art. 11 · Provisión de cargos",
          explicacion: "Las vacantes se ofrecen en estricto orden de puntaje. Si rechazas, se nombra al siguiente de la lista, y la lista solo dura 2 años.",
          siguiente: (e) => e.puntaje >= 60 ? "aprobo_etapa1" : "no_aprobo_etapa1"
        },
        {
          texto: "La acepto: es mi oportunidad de entrar.",
          puntos: 10,
          articulo: "Art. 11 · Provisión de cargos",
          explicacion: "Las plazas se asignan en estricto orden de puntaje entre quienes están en la lista de elegibles, que tiene vigencia de 2 años.",
          siguiente: (e) => e.puntaje >= 60 ? "aprobo_etapa1" : "no_aprobo_etapa1"
        }
      ]
    },

    aprobo_etapa1: {
      etapa: "Etapa 1 · Resultado",
      icono: "✅",
      texto: "¡Lo lograste! Te nombran en periodo de prueba.\n\n(Aquí empezaría la Etapa 2: periodo de prueba, arts. 12–15.)",
      opciones: [
        {
          texto: "Continuar",
          puntos: 0,
          articulo: "Art. 12 · Nombramiento en periodo de prueba",
          explicacion: "El periodo de prueba va hasta el final del año escolar, con mínimo 4 meses de servicio, y termina con una evaluación de desempeño y competencias.",
          siguiente: "FIN"
        }
      ]
    },

    no_aprobo_etapa1: {
      etapa: "Etapa 1 · Resultado",
      icono: "❌",
      texto: "Tu puntaje no alcanzó para conseguir la plaza.\n\nPuedes volver a intentarlo en la próxima convocatoria.",
      opciones: [
        {
          texto: "Ver resultado",
          puntos: 0,
          articulo: "Art. 15 · Prohibición",
          explicacion: "Mientras haya una lista de elegibles vigente, las vacantes definitivas no se pueden llenar con nombramientos provisionales ni encargos.",
          siguiente: "FIN"
        }
      ]
    }

    /* ---------------- ETAPA 2: PERIODO DE PRUEBA (arts. 12–15) ---------- */
    /* ---------------- ETAPA 3: ESCALAFÓN (arts. 16–25) ------------------ */
    /* ---------------- ETAPA 4: EVALUACIÓN (arts. 26–36) ----------------- */
    /* ---------------- ETAPA 5: DERECHOS Y ÉTICA (arts. 37–40) ----------- */
    // Agregar aquí las escenas siguiendo la plantilla de arriba.
    // Recuerden poner una coma entre escena y escena.
  }
};
