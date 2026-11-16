/* ==========================================================================
   CONTENIDO DEL JUEGO — este es el archivo que el grupo edita.
   Lo usan los dos modos: el individual y el multijugador (ambos en el mapa).

   Basado en la "Propuesta de dinámica" del grupo y en el Decreto 1278 de 2002
   (Estatuto de Profesionalización Docente), artículos 8 a 40.

   PREGUNTAS: están en "bancos". Por ahora son marcadores ("Pregunta 1",
   "Respuesta A"...) para que el grupo escriba las definitivas. Cada
   pregunta tiene opciones y se marca la correcta con  correcta: true.

   INDICADORES (de 0 a 100): experiencia, formacion, popularidad, desempeno.
   "efectos" suma o resta a esos indicadores, por ejemplo:
       efectos: { desempeno: 10, popularidad: -5 }
   ========================================================================== */

const CONTENIDO = {
  titulo: "Carrera Docente",
  subtitulo: "Juego de competencia docente sobre el Estatuto de Profesionalización Docente (Decreto 1278 de 2002, arts. 8–40).",
  creditos: "Ética · UIS",

  // TEMPORAL, PARA PROBAR: pinta la respuesta correcta de verde y las
  // incorrectas de rojo. Cuando estén las preguntas definitivas → false.
  mostrarCorrectas: true,

  // Años de servicio que dura una partida individual
  aniosDeJuego: 5,

  indicadores: {
    experiencia: { nombre: "Experiencia", icono: "⏳", descripcion: "Tiempo y trayectoria en el ejercicio docente." },
    formacion:   { nombre: "Formación",   icono: "🎓", descripcion: "Preparación académica y estudios realizados." },
    popularidad: { nombre: "Popularidad", icono: "⭐", descripcion: "Reconocimiento entre estudiantes y comunidad educativa." },
    desempeno:   { nombre: "Desempeño",   icono: "📈", descripcion: "Calidad del trabajo y cumplimiento de las responsabilidades docentes." }
  },

  /* ============================ INTRODUCCIÓN ============================ */
  // Textos del documento de sugerencias del grupo (etica.pdf).
  introduccion: {
    indicacion: "Tomarás el lugar de una persona que desea ingresar al estatuto docente. Presentarás el concurso docente y a lo largo de tu carrera abordarás diversas situaciones problemáticas que deberás sortear para llevar una carrera exitosa.",
    seleccion: "Escoge un personaje",
    concurso: {
      titulo: "Concurso docente",
      texto: "Para ingresar al servicio educativo estatal debes superar el concurso docente, según el artículo 7. El concurso se abre cuando no hay un listado de elegibles. ¡Tienes suerte! Ahora mismo hay una convocatoria abierta."
    },
    convocatoria: {
      titulo: "Convocatoria e inscripción",
      emisor: "Comisión Nacional del Servicio Civil – CNSC",
      texto: "La Comisión Nacional del Servicio Civil - CNSC, informa a los interesados en participar en el Proceso de Selección No. 2150 a 2237 de 2021 y 2316 de 2022 Directivos Docentes y Docentes, que a partir del 21 de abril de 2022, inicia la etapa de Adquisición de Derechos de Participación e Inscripciones a dicho proceso.",
      boton: "Inscribirse"
    },
    inscrito: "¡Felicidades! Cumples con los requisitos. Dirígete a la Secretaría de Educación para continuar con el proceso.",
    estructura: {
      titulo: "Estructura del concurso",
      texto: "El concurso tiene cuatro etapas:",
      etapas: [
        { nombre: "Aptitudes", descripcion: "una prueba escrita que evalúa tus habilidades numéricas y verbales." },
        { nombre: "Psicotécnica", descripcion: "evalúa tus actitudes, motivaciones e intereses frente a situaciones propias de la vida escolar." },
        { nombre: "Valoración de antecedentes", descripcion: "se puntúan tu formación y tu experiencia." },
        { nombre: "Entrevista", descripcion: "una conversación para valorar tus competencias como docente." }
      ]
    }
  },

  /* ============================== PERSONAJES ============================== */
  // Basados en los tres grados del escalafón (art. 21).
  personajes: [
    {
      id: "lucia",
      nombre: "Lucía",
      icono: "👩‍🏫",
      perfil: "Normalista superior",
      descripcion: "Lleva 4 años enseñando en un colegio privado. Mucha experiencia y buena relación con los estudiantes, pero poca formación universitaria.",
      titulo: "normalista",
      aniosExperiencia: 4,
      indicadores: { experiencia: 60, formacion: 25, popularidad: 60, desempeno: 55 },
      colores: { pelo: "#2b1a10", camisa: "#d8573d" },
      nota: "Entra al escalafón en el Grado 1 (art. 21)."
    },
    {
      id: "andres",
      nombre: "Andrés",
      icono: "👨‍🎓",
      perfil: "Licenciado recién graduado",
      descripcion: "Acaba de terminar su licenciatura. Tiene la pedagogía fresca y muchas ganas, pero casi nada de experiencia.",
      titulo: "licenciado",
      aniosExperiencia: 0,
      indicadores: { experiencia: 15, formacion: 50, popularidad: 55, desempeno: 55 },
      colores: { pelo: "#4a2f1d", camisa: "#3d7dd8" },
      nota: "Entra al escalafón en el Grado 2 (art. 21)."
    },
    {
      id: "valentina",
      nombre: "Valentina",
      icono: "👩‍🔬",
      perfil: "Ingeniera con maestría (no licenciada)",
      descripcion: "Ingeniera con maestría que quiere enseñar matemáticas. Sabe muchísimo de su área, pero no tiene formación en pedagogía.",
      titulo: "profesional",
      maestria: true,
      aniosExperiencia: 2,
      indicadores: { experiencia: 35, formacion: 75, popularidad: 45, desempeno: 52 },
      colores: { pelo: "#8a5a2b", camisa: "#2f8f6f" },
      nota: "Como no es licenciada, antes de terminar el periodo de prueba debe acreditar un programa de pedagogía o un posgrado en educación (art. 12, parágrafo 1)."
    }
  ],

  /* ============================ CONCURSO DOCENTE ============================ */
  // Se hace una pregunta de cada prueba, tomada de su banco (ver "bancos" más abajo).
  // Valor de cada respuesta: 100 si es correcta, 0 si no (o el "valor" que se le ponga).
  // La valoración de antecedentes sale del perfil del personaje (experiencia y formación).
  concurso: {
    // Orden de las etapas en la Secretaría ("antecedentes" no tiene pregunta: se calcula sola)
    orden: ["aptitudes", "psicotecnica", "antecedentes", "entrevista"],
    pesoAntecedentes: 0.3,
    pruebas: [
      { id: "aptitudes", nombre: "Prueba de aptitudes y competencias básicas", peso: 0.3, banco: "aptitudes" },
      { id: "psicotecnica", nombre: "Prueba psicotécnica", peso: 0.2, banco: "psicotecnica" },
      { id: "entrevista", nombre: "Entrevista", peso: 0.2, banco: "entrevista" }
    ],
    // Según el puntaje del concurso se ofrece una oportunidad laboral (de mayor a menor)
    oportunidades: [
      {
        minimo: 70, tipo: "vacante", nombre: "Vacante definitiva", estado: "prueba",
        articulo: "Arts. 11 y 12 · Provisión de cargos y periodo de prueba",
        explicacion: "La vacante se provee con quien ocupa el primer lugar de la lista de elegibles, y quien la ocupa queda nombrado en periodo de prueba hasta terminar el año escolar (mínimo 4 meses)."
      },
      {
        minimo: 55, tipo: "provisional", nombre: "Nombramiento provisional", estado: "provisional",
        articulo: "Art. 13 · Nombramientos provisionales",
        explicacion: "Una vacante definitiva se puede cubrir de forma provisional mientras se provee en periodo de prueba. Para tener derechos de carrera hay que ganar el concurso y aprobar el periodo de prueba."
      },
      {
        minimo: 40, tipo: "reemplazo", nombre: "Reemplazo (vacante temporal)", estado: "provisional",
        articulo: "Art. 13, literal a · Vacantes temporales",
        explicacion: "Cuando el titular de un cargo se separa temporalmente, se nombra un provisional usando la lista de elegibles vigente. No aceptar no saca a nadie de la lista."
      },
      {
        minimo: 0, tipo: "ninguna", nombre: "Sin plaza", estado: "aspirante",
        articulo: "Art. 11 · Provisión de cargos",
        explicacion: "Las plazas se asignan en estricto orden de puntaje. Puedes volver a presentarte en el siguiente concurso."
      }
    ]
  },

  /* ============================ EVALUACIÓN ANUAL ============================ */
  // Propuesta 2.2. La hace el rector al final de cada año (art. 32).
  evaluacionAnual: {
    minimo: 60,
    pesos: { desempeno: 0.55, popularidad: 0.30, formacion: 0.10, experiencia: 0.05 },
    // Cuánto sube la experiencia por cada año de servicio
    experienciaPorAnio: 6
  },

  /* ========================= FORMACIÓN (Universidad) ========================= */
  // soloTitulo: solo aparece para ese tipo de personaje · requiere: título previo necesario
  formacion: [
    {
      id: "licenciatura", nombre: "Licenciatura en educación", anios: 2, efectos: { formacion: 18 }, costoAnual: { popularidad: -1 },
      otorga: "licenciatura", soloTitulo: "normalista",
      articulo: "Art. 21 · Requisitos del Grado 2",
      explicacion: "Para el Grado 2 se necesita ser licenciado en educación, o profesional con un programa de pedagogía o una especialización en educación."
    },
    {
      id: "pedagogia", soloTitulo: "profesional", nombre: "Programa de pedagogía", anios: 1, efectos: { formacion: 10, desempeno: 3 },
      otorga: "pedagogia",
      articulo: "Art. 12, parágrafo 1 · Periodo de prueba",
      explicacion: "Los profesionales que no son licenciados deben acreditar, al terminar el periodo de prueba, que cursan o terminaron un posgrado en educación o un programa de pedagogía."
    },
    {
      id: "especializacion", nombre: "Especialización en educación", anios: 1, efectos: { formacion: 12 },
      otorga: "pedagogia", requiere: "pregrado",
      articulo: "Art. 21 · Requisitos del Grado 2",
      explicacion: "Para el Grado 2, un profesional no licenciado necesita un programa de pedagogía o una especialización en educación."
    },
    {
      id: "maestria", nombre: "Maestría", anios: 2, efectos: { formacion: 20 }, costoAnual: { desempeno: -2, popularidad: -2 },
      otorga: "maestria", requiere: "pregrado",
      articulo: "Art. 21 · Requisitos del Grado 3",
      explicacion: "Para el Grado 3 se necesita una maestría o un doctorado en un área afín o fundamental para la enseñanza."
    },
    {
      id: "doctorado", nombre: "Doctorado", anios: 3, efectos: { formacion: 25 }, costoAnual: { desempeno: -3, popularidad: -2 },
      otorga: "doctorado", requiere: "maestria",
      articulo: "Art. 21 · Requisitos del Grado 3",
      explicacion: "El doctorado también cumple el requisito de formación del Grado 3."
    }
  ],

  /* ===================== PROGRESIÓN PROFESIONAL (Secretaría) ===================== */
  // Propuesta 2.4: formación, ascenso, reubicación y cargos directivos.
  progresion: {
    competencias: {
      aniosMinimos: 3,   // art. 20: 3 años de servicio para subir de nivel o de grado
      umbral: 80,        // art. 36: más de 80% para ser candidato al ascenso
      pesos: { formacion: 0.4, desempeno: 0.35, experiencia: 0.25 },
      articulo: "Arts. 35 y 36 · Evaluación de competencias",
      explicacion: "La evaluación de competencias es voluntaria. Con más de 80%, el docente es candidato a reubicarse en un nivel salarial superior o a ascender de grado, en estricto orden de puntaje y según el presupuesto disponible."
    },
    directivos: [
      { cargo: "Coordinador", aniosExperiencia: 5, minimo: 70, efectos: { experiencia: 5, popularidad: 3 },
        articulo: "Art. 10 · Requisitos para directivos", explicacion: "Para ser coordinador se necesita título de licenciado o profesional y 5 años de experiencia profesional." },
      { cargo: "Rector", aniosExperiencia: 6, minimo: 75, efectos: { experiencia: 8, popularidad: 5 },
        articulo: "Art. 10 · Requisitos para directivos", explicacion: "Para ser rector se necesita título de licenciado o profesional y 6 años de experiencia profesional." }
    ]
  },

  bancos: {
    // Concurso docente: se toma una pregunta de cada banco.
    // DIFICULTAD: si el jugador repite el concurso, le salen preguntas distintas
    // y más difíciles. 1.er intento → dificultad 1; 2.º → 2; del 3.º en adelante → 3.
    // ¡Recuerden escribir preguntas más difíciles para los niveles 2 y 3!
    aptitudes: [
      {
        dificultad: 1,
        texto: "Pregunta 1 (aptitudes · nivel 1, fácil): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: true }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        dificultad: 1,
        texto: "Pregunta 2 (aptitudes · nivel 1, fácil): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: true },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        dificultad: 2,
        texto: "Pregunta 3 (aptitudes · nivel 2, media): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: true },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        dificultad: 2,
        texto: "Pregunta 4 (aptitudes · nivel 2, media): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: true },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        dificultad: 3,
        texto: "Pregunta 5 (aptitudes · nivel 3, difícil): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: true },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        dificultad: 3,
        texto: "Pregunta 6 (aptitudes · nivel 3, difícil): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: true }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      }
    ],
    psicotecnica: [
      {
        dificultad: 1,
        texto: "Pregunta 1 (psicotécnica · nivel 1, fácil): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: true },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        dificultad: 1,
        texto: "Pregunta 2 (psicotécnica · nivel 1, fácil): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: true },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        dificultad: 2,
        texto: "Pregunta 3 (psicotécnica · nivel 2, media): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: true }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        dificultad: 2,
        texto: "Pregunta 4 (psicotécnica · nivel 2, media): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: true }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        dificultad: 3,
        texto: "Pregunta 5 (psicotécnica · nivel 3, difícil): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: true },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        dificultad: 3,
        texto: "Pregunta 6 (psicotécnica · nivel 3, difícil): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: true },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      }
    ],
    entrevista: [
      {
        dificultad: 1,
        texto: "Pregunta 1 (entrevista · nivel 1, fácil): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: true },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        dificultad: 1,
        texto: "Pregunta 2 (entrevista · nivel 1, fácil): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: true },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        dificultad: 2,
        texto: "Pregunta 3 (entrevista · nivel 2, media): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: true },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        dificultad: 2,
        texto: "Pregunta 4 (entrevista · nivel 2, media): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: true },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        dificultad: 3,
        texto: "Pregunta 5 (entrevista · nivel 3, difícil): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: true }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        dificultad: 3,
        texto: "Pregunta 6 (entrevista · nivel 3, difícil): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: true }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      }
    ],
    // Preguntas sobre el estatuto (multijugador y evaluación de competencias)
    estatuto: [
      {
        texto: "Pregunta 1 (estatuto): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: true },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        texto: "Pregunta 2 (estatuto): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: true },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        texto: "Pregunta 3 (estatuto): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: true }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        texto: "Pregunta 4 (estatuto): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: true },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        texto: "Pregunta 5 (estatuto): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: true }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        texto: "Pregunta 6 (estatuto): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: true },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        texto: "Pregunta 7 (estatuto): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: true },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        texto: "Pregunta 8 (estatuto): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: true },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        texto: "Pregunta 9 (estatuto): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: true }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        texto: "Pregunta 10 (estatuto): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: true },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      }
    ],
    // Situaciones en el colegio (una por año en el modo individual)
    colegio: [
      {
        personaje: "Personaje de la situación",
        texto: "Situación en el colegio 1: aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        personaje: "Personaje de la situación",
        texto: "Situación en el colegio 2: aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        personaje: "Personaje de la situación",
        texto: "Situación en el colegio 3: aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        personaje: "Personaje de la situación",
        texto: "Situación en el colegio 4: aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        personaje: "Personaje de la situación",
        texto: "Situación en el colegio 5: aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        personaje: "Personaje de la situación",
        texto: "Situación en el colegio 6: aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      }
    ],
    // Situaciones inesperadas (cartas del mapa)
    cartas: [
      {
        tipo: "Laboral", titulo: "Situación inesperada 1",
        texto: "Situación inesperada 1: aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        tipo: "Personal", titulo: "Situación inesperada 2",
        texto: "Situación inesperada 2: aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        tipo: "Institucional", titulo: "Situación inesperada 3",
        texto: "Situación inesperada 3: aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        tipo: "Laboral", titulo: "Situación inesperada 4",
        texto: "Situación inesperada 4: aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        tipo: "Personal", titulo: "Situación inesperada 5",
        texto: "Situación inesperada 5: aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        tipo: "Institucional", titulo: "Situación inesperada 6",
        texto: "Situación inesperada 6: aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        tipo: "Laboral", titulo: "Situación inesperada 7",
        texto: "Situación inesperada 7: aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        tipo: "Personal", titulo: "Situación inesperada 8",
        texto: "Situación inesperada 8: aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        tipo: "Institucional", titulo: "Situación inesperada 9",
        texto: "Situación inesperada 9: aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        tipo: "Laboral", titulo: "Situación inesperada 10",
        texto: "Situación inesperada 10: aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      }
    ]
  },

  /* ============================ MULTIJUGADOR ============================ */
  // Hasta 3 jugadores en el mismo mapa, cada uno con un personaje distinto.
  // Compiten por completar los procesos en orden respondiendo preguntas.
  // "preguntas" es la lista de bancos de los que se saca cada pregunta
  // (todos los jugadores reciben las mismas, en el mismo orden).
  multijugador: {
    maxJugadores: 3,
    segundosPorPregunta: 20,
    puntosAcierto: 100,
    bonoRapidez: 50,              // máximo, si se responde al instante
    bonoLlegada: [100, 60, 30],   // por terminar de 1°, 2° y 3°
    bonoOportunidad: { vacante: 60, provisional: 30, reemplazo: 10, ninguna: 0 },
    duracionMaximaMin: 15,
    procesos: [
      { id: "concurso", edificio: "secretaria", nombre: "Concurso docente", articulos: "Arts. 7–15", concurso: true,
        preguntas: ["aptitudes", "psicotecnica", "entrevista"] },
      { id: "prueba", edificio: "colegio", nombre: "Periodo de prueba", articulos: "Arts. 12, 31, 33 y 34",
        preguntas: ["colegio", "colegio", "estatuto"] },
      { id: "cartas", tipo: "cartas", nombre: "Situaciones inesperadas", articulos: "Arts. 36–40",
        preguntas: ["cartas", "cartas"] },
      { id: "evaluacion", edificio: "rectoria", nombre: "Evaluación anual", articulos: "Arts. 32–36",
        preguntas: ["estatuto", "estatuto"] },
      { id: "formacion", edificio: "universidad", nombre: "Formación", articulos: "Arts. 21 y 38",
        preguntas: ["estatuto", "cartas"] },
      { id: "ascenso", edificio: "secretaria", nombre: "Ascenso en el escalafón", articulos: "Arts. 10, 20 y 36",
        preguntas: ["estatuto", "estatuto", "estatuto"] }
    ]
  }
};
