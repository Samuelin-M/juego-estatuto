/* ==========================================================================
   CONTENIDO DEL JUEGO — este es el archivo que el grupo edita.
   Lo usan los dos modos: el individual y el multijugador (ambos en el mapa).

   Basado en la "Propuesta de dinámica" del grupo y en el Decreto 1278 de 2002
   (Estatuto de Profesionalización Docente), artículos 8 a 40.

   PREGUNTAS: están en "bancos" (ver más abajo cuántas hacer de cada una).
   Por ahora son ejemplos ("Pregunta 1", "Respuesta A"...) para que el grupo
   escriba las definitivas. La correcta se marca con  correcta: true.

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

  // Años que dura una partida (en los dos modos)
  aniosDeJuego: 5,

  // Tema de cada año: las preguntas y situaciones de ese año tratan estos artículos
  anios: [
    { anio: 1, tema: "Ingreso al servicio", articulos: "Arts. 8–15" },
    { anio: 2, tema: "Carrera docente y escalafón", articulos: "Arts. 16–25" },
    { anio: 3, tema: "Evaluación y formación", articulos: "Arts. 26–34 y 38" },
    { anio: 4, tema: "Competencias, ascenso y reubicación", articulos: "Arts. 20–23, 35 y 36" },
    { anio: 5, tema: "Directivos, derechos y ética", articulos: "Arts. 10, 22, 37, 39 y 40" }
  ],

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
  // Pesos y puntaje mínimo tomados de los Acuerdos de la CNSC de octubre de 2026 para el
  // concurso de docentes (art. 13 de cada acuerdo, columna "Docente"):
  //   aptitudes y competencias básicas 55 % (eliminatoria, mínimo 60/100), psicotécnica 5 %,
  //   valoración de antecedentes 30 %, entrevista 10 %. Para directivos docentes el mínimo es 70/100.
  concurso: {
    // Orden de las etapas en la Secretaría ("antecedentes" no tiene pregunta: se calcula sola)
    orden: ["aptitudes", "psicotecnica", "antecedentes", "entrevista"],
    // Pruebas escritas: se presentan el mismo día. Las demás solo las presenta quien pasa la eliminatoria.
    escritas: ["aptitudes", "psicotecnica"],
    pesoAntecedentes: 0.30,
    pruebas: [
      // "minimo" la vuelve eliminatoria: con menos de eso no se sigue en el concurso
      { id: "aptitudes", nombre: "Prueba de aptitudes y competencias básicas", peso: 0.55, minimo: 60, banco: "aptitudes" },
      { id: "psicotecnica", nombre: "Prueba psicotécnica", peso: 0.05, banco: "psicotecnica" },
      { id: "entrevista", nombre: "Entrevista", peso: 0.10, banco: "entrevista" }
    ],
    // Lo que se muestra a quien no alcanza el mínimo de la prueba eliminatoria
    eliminado: {
      articulo: "Art. 9 · Prueba eliminatoria",
      explicacion: "La prueba de aptitudes y competencias básicas es eliminatoria: los docentes la aprueban con 60 de 100 y los directivos docentes con 70 de 100. Quien no la supera no sigue a la valoración de antecedentes ni a la entrevista, y no entra a la lista de elegibles."
    },
    // Según el puntaje del concurso se ofrece una oportunidad laboral (de mayor a menor).
    // Quien pasa la eliminatoria saca por lo menos 55 + 30 % de sus antecedentes, así que siempre queda en la lista.
    oportunidades: [
      {
        minimo: 75, tipo: "vacante", nombre: "Vacante definitiva", estado: "prueba",
        articulo: "Arts. 11 y 12 · Provisión de cargos y periodo de prueba",
        explicacion: "La vacante se provee con quien ocupa el primer lugar de la lista de elegibles, y quien la ocupa queda nombrado en periodo de prueba hasta terminar el año escolar (mínimo 4 meses)."
      },
      {
        minimo: 70, tipo: "provisional", nombre: "Nombramiento provisional", estado: "provisional",
        articulo: "Art. 13 · Nombramientos provisionales",
        explicacion: "Una vacante definitiva se puede cubrir de forma provisional mientras se provee en periodo de prueba. Para tener derechos de carrera hay que ganar el concurso y aprobar el periodo de prueba."
      },
      {
        minimo: 60, tipo: "reemplazo", nombre: "Reemplazo (vacante temporal)", estado: "provisional",
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
    // minimo 70: el puntaje mínimo de la prueba eliminatoria para directivos docentes (Acuerdos CNSC 2026)
    directivos: [
      { cargo: "Coordinador", aniosExperiencia: 5, minimo: 70, efectos: { experiencia: 5, popularidad: 3 },
        articulo: "Art. 10 · Requisitos para directivos", explicacion: "Para ser coordinador se necesita título de licenciado o profesional y 5 años de experiencia profesional." },
      { cargo: "Rector", aniosExperiencia: 6, minimo: 70, efectos: { experiencia: 8, popularidad: 5 },
        articulo: "Art. 10 · Requisitos para directivos", explicacion: "Para ser rector se necesita título de licenciado o profesional y 6 años de experiencia profesional." }
    ]
  },

  /* ======================= BANCOS DE PREGUNTAS ======================= */
  // Por ahora son EJEMPLOS ("Pregunta 1", "Respuesta A"...) para que el grupo
  // escriba las definitivas. Cada pregunta y situación lleva:
  //   anio:       en qué año de la carrera sale (1 a 5). Nunca sale en otro año.
  //   dificultad: 1 fácil, 2 intermedia, 3 difícil. En el multijugador las difíciles dan más puntos.
  //   opciones:   la correcta se marca con  correcta: true  (pueden ser 2, 3 o más opciones).
  //   articulo y explicacion: el artículo del estatuto y por qué esa es la respuesta.
  // Las situaciones (colegio y cartas) llevan además, en cada opción, sus "efectos"
  // sobre los indicadores y la "consecuencia" de esa decisión. Esos efectos son los
  // que luego cuentan en la evaluación anual (no hay examen: art. 32 a 34).
  //
  // CUÁNTAS HACER (para que a cada jugador le salgan distintas y de las tres dificultades):
  //   aptitudes, psicotecnica, entrevista: 6 de cada una (2 fáciles, 2 intermedias, 2 difíciles), año 1
  //   colegio:      3 por año (1 de cada dificultad)  → 15 en total
  //   cartas:       6 por año (2 de cada dificultad)  → 30 en total
  //   universidad:  3 (año 3, 1 de cada dificultad)
  //   secretaria:   3 por año en los años 4 y 5       → 6 en total
  bancos: {
    // CONCURSO DOCENTE (año 1): una pregunta de cada prueba.
    // En el modo individual, si se repite el concurso salen preguntas nuevas y más
    // difíciles: 1.er intento → fáciles; 2.º → intermedias; del 3.º en adelante → difíciles.
    aptitudes: [
      {
        anio: 1, dificultad: 1,
        texto: "Pregunta 1 (aptitudes · fácil): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: true },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        anio: 1, dificultad: 1,
        texto: "Pregunta 2 (aptitudes · fácil): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: true },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        anio: 1, dificultad: 2,
        texto: "Pregunta 3 (aptitudes · intermedia): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: true }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        anio: 1, dificultad: 2,
        texto: "Pregunta 4 (aptitudes · intermedia): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: true },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        anio: 1, dificultad: 3,
        texto: "Pregunta 5 (aptitudes · difícil): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: true },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        anio: 1, dificultad: 3,
        texto: "Pregunta 6 (aptitudes · difícil): aquí va el enunciado.",
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
        anio: 1, dificultad: 1,
        texto: "Pregunta 1 (psicotecnica · fácil): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: true },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        anio: 1, dificultad: 1,
        texto: "Pregunta 2 (psicotecnica · fácil): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: true },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        anio: 1, dificultad: 2,
        texto: "Pregunta 3 (psicotecnica · intermedia): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: true }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        anio: 1, dificultad: 2,
        texto: "Pregunta 4 (psicotecnica · intermedia): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: true },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        anio: 1, dificultad: 3,
        texto: "Pregunta 5 (psicotecnica · difícil): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: true },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        anio: 1, dificultad: 3,
        texto: "Pregunta 6 (psicotecnica · difícil): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: true }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      }
    ],
    entrevista: [
      {
        anio: 1, dificultad: 1,
        texto: "Pregunta 1 (entrevista · fácil): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: true },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        anio: 1, dificultad: 1,
        texto: "Pregunta 2 (entrevista · fácil): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: true },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        anio: 1, dificultad: 2,
        texto: "Pregunta 3 (entrevista · intermedia): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: true }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        anio: 1, dificultad: 2,
        texto: "Pregunta 4 (entrevista · intermedia): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: true },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        anio: 1, dificultad: 3,
        texto: "Pregunta 5 (entrevista · difícil): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: true },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        anio: 1, dificultad: 3,
        texto: "Pregunta 6 (entrevista · difícil): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: true }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      }
    ],
    // SITUACIONES EN EL COLEGIO: una por año.
    colegio: [
      {
        anio: 1, dificultad: 1, personaje: "Personaje de la situación",
        texto: "Situación en el colegio 1 (año 1 · fácil): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 1, dificultad: 2, personaje: "Personaje de la situación",
        texto: "Situación en el colegio 2 (año 1 · intermedia): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 1, dificultad: 3, personaje: "Personaje de la situación",
        texto: "Situación en el colegio 3 (año 1 · difícil): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 2, dificultad: 1, personaje: "Personaje de la situación",
        texto: "Situación en el colegio 4 (año 2 · fácil): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 2, dificultad: 2, personaje: "Personaje de la situación",
        texto: "Situación en el colegio 5 (año 2 · intermedia): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 2, dificultad: 3, personaje: "Personaje de la situación",
        texto: "Situación en el colegio 6 (año 2 · difícil): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 3, dificultad: 1, personaje: "Personaje de la situación",
        texto: "Situación en el colegio 7 (año 3 · fácil): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 3, dificultad: 2, personaje: "Personaje de la situación",
        texto: "Situación en el colegio 8 (año 3 · intermedia): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 3, dificultad: 3, personaje: "Personaje de la situación",
        texto: "Situación en el colegio 9 (año 3 · difícil): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 4, dificultad: 1, personaje: "Personaje de la situación",
        texto: "Situación en el colegio 10 (año 4 · fácil): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 4, dificultad: 2, personaje: "Personaje de la situación",
        texto: "Situación en el colegio 11 (año 4 · intermedia): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 4, dificultad: 3, personaje: "Personaje de la situación",
        texto: "Situación en el colegio 12 (año 4 · difícil): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 5, dificultad: 1, personaje: "Personaje de la situación",
        texto: "Situación en el colegio 13 (año 5 · fácil): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 5, dificultad: 2, personaje: "Personaje de la situación",
        texto: "Situación en el colegio 14 (año 5 · intermedia): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 5, dificultad: 3, personaje: "Personaje de la situación",
        texto: "Situación en el colegio 15 (año 5 · difícil): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      }
    ],
    // SITUACIONES INESPERADAS (cartas que se buscan en el mapa): dos por año.
    cartas: [
      {
        anio: 1, dificultad: 1, tipo: "Personal", titulo: "Situación inesperada 1",
        texto: "Situación inesperada 1 (año 1 · fácil): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 1, dificultad: 1, tipo: "Institucional", titulo: "Situación inesperada 2",
        texto: "Situación inesperada 2 (año 1 · fácil): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 1, dificultad: 2, tipo: "Laboral", titulo: "Situación inesperada 3",
        texto: "Situación inesperada 3 (año 1 · intermedia): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 1, dificultad: 2, tipo: "Personal", titulo: "Situación inesperada 4",
        texto: "Situación inesperada 4 (año 1 · intermedia): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 1, dificultad: 3, tipo: "Institucional", titulo: "Situación inesperada 5",
        texto: "Situación inesperada 5 (año 1 · difícil): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 1, dificultad: 3, tipo: "Laboral", titulo: "Situación inesperada 6",
        texto: "Situación inesperada 6 (año 1 · difícil): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 2, dificultad: 1, tipo: "Personal", titulo: "Situación inesperada 7",
        texto: "Situación inesperada 7 (año 2 · fácil): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 2, dificultad: 1, tipo: "Institucional", titulo: "Situación inesperada 8",
        texto: "Situación inesperada 8 (año 2 · fácil): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 2, dificultad: 2, tipo: "Laboral", titulo: "Situación inesperada 9",
        texto: "Situación inesperada 9 (año 2 · intermedia): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 2, dificultad: 2, tipo: "Personal", titulo: "Situación inesperada 10",
        texto: "Situación inesperada 10 (año 2 · intermedia): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 2, dificultad: 3, tipo: "Institucional", titulo: "Situación inesperada 11",
        texto: "Situación inesperada 11 (año 2 · difícil): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 2, dificultad: 3, tipo: "Laboral", titulo: "Situación inesperada 12",
        texto: "Situación inesperada 12 (año 2 · difícil): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 3, dificultad: 1, tipo: "Personal", titulo: "Situación inesperada 13",
        texto: "Situación inesperada 13 (año 3 · fácil): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 3, dificultad: 1, tipo: "Institucional", titulo: "Situación inesperada 14",
        texto: "Situación inesperada 14 (año 3 · fácil): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 3, dificultad: 2, tipo: "Laboral", titulo: "Situación inesperada 15",
        texto: "Situación inesperada 15 (año 3 · intermedia): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 3, dificultad: 2, tipo: "Personal", titulo: "Situación inesperada 16",
        texto: "Situación inesperada 16 (año 3 · intermedia): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 3, dificultad: 3, tipo: "Institucional", titulo: "Situación inesperada 17",
        texto: "Situación inesperada 17 (año 3 · difícil): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 3, dificultad: 3, tipo: "Laboral", titulo: "Situación inesperada 18",
        texto: "Situación inesperada 18 (año 3 · difícil): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 4, dificultad: 1, tipo: "Personal", titulo: "Situación inesperada 19",
        texto: "Situación inesperada 19 (año 4 · fácil): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 4, dificultad: 1, tipo: "Institucional", titulo: "Situación inesperada 20",
        texto: "Situación inesperada 20 (año 4 · fácil): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 4, dificultad: 2, tipo: "Laboral", titulo: "Situación inesperada 21",
        texto: "Situación inesperada 21 (año 4 · intermedia): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 4, dificultad: 2, tipo: "Personal", titulo: "Situación inesperada 22",
        texto: "Situación inesperada 22 (año 4 · intermedia): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 4, dificultad: 3, tipo: "Institucional", titulo: "Situación inesperada 23",
        texto: "Situación inesperada 23 (año 4 · difícil): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 4, dificultad: 3, tipo: "Laboral", titulo: "Situación inesperada 24",
        texto: "Situación inesperada 24 (año 4 · difícil): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 5, dificultad: 1, tipo: "Personal", titulo: "Situación inesperada 25",
        texto: "Situación inesperada 25 (año 5 · fácil): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 5, dificultad: 1, tipo: "Institucional", titulo: "Situación inesperada 26",
        texto: "Situación inesperada 26 (año 5 · fácil): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 5, dificultad: 2, tipo: "Laboral", titulo: "Situación inesperada 27",
        texto: "Situación inesperada 27 (año 5 · intermedia): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 5, dificultad: 2, tipo: "Personal", titulo: "Situación inesperada 28",
        texto: "Situación inesperada 28 (año 5 · intermedia): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 5, dificultad: 3, tipo: "Institucional", titulo: "Situación inesperada 29",
        texto: "Situación inesperada 29 (año 5 · difícil): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      },
      {
        anio: 5, dificultad: 3, tipo: "Laboral", titulo: "Situación inesperada 30",
        texto: "Situación inesperada 30 (año 5 · difícil): aquí va la situación.",
        opciones: [
          { texto: "Respuesta A", correcta: true, efectos: { desempeno: 8, popularidad: 4 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta B", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." },
          { texto: "Respuesta C", correcta: false, efectos: { desempeno: -6, popularidad: -3 }, consecuencia: "Aquí va lo que pasa por esta decisión.", articulo: "Art. —", explicacion: "Aquí va la explicación según el estatuto." }
        ]
      }
    ],
    // UNIVERSIDAD (formación, año 3 del multijugador).
    universidad: [
      {
        anio: 3, dificultad: 1,
        texto: "Pregunta 1 (universidad · año 3 · fácil): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: true },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        anio: 3, dificultad: 2,
        texto: "Pregunta 2 (universidad · año 3 · intermedia): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: true },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        anio: 3, dificultad: 3,
        texto: "Pregunta 3 (universidad · año 3 · difícil): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: true }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      }
    ],
    // SECRETARÍA (escalafón, ascenso, directivos: años 4 y 5). En el individual se usa
    // en la evaluación de competencias.
    secretaria: [
      {
        anio: 4, dificultad: 1,
        texto: "Pregunta 1 (secretaría · año 4 · fácil): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: true },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        anio: 4, dificultad: 2,
        texto: "Pregunta 2 (secretaría · año 4 · intermedia): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: true },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        anio: 4, dificultad: 3,
        texto: "Pregunta 3 (secretaría · año 4 · difícil): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: true }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        anio: 5, dificultad: 1,
        texto: "Pregunta 4 (secretaría · año 5 · fácil): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: true },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        anio: 5, dificultad: 2,
        texto: "Pregunta 5 (secretaría · año 5 · intermedia): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: true },
          { texto: "Respuesta C", correcta: false }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      },
      {
        anio: 5, dificultad: 3,
        texto: "Pregunta 6 (secretaría · año 5 · difícil): aquí va el enunciado.",
        opciones: [
          { texto: "Respuesta A", correcta: false },
          { texto: "Respuesta B", correcta: false },
          { texto: "Respuesta C", correcta: true }
        ],
        articulo: "Art. —",
        explicacion: "Aquí va la explicación de la respuesta correcta."
      }
    ]
  },

  /* ============================ MULTIJUGADOR ============================ */
  // Hasta 3 jugadores en el mismo mapa, cada uno con un personaje distinto.
  // Se juega por años, como el modo individual: cada uno hace las tareas de su
  // año (en orden) y, al terminar, espera a que todos terminen para pasar
  // juntos al año siguiente. Entre más rápido termine el año, más puntos.
  // A cada jugador le salen sus propias preguntas y situaciones.
  multijugador: {
    maxJugadores: 3,
    segundosPorPregunta: 20,
    puntosPorDificultad: [100, 150, 200],   // por acertar una pregunta o situación fácil, intermedia o difícil
    bonoRapidez: 50,                        // máximo, si se responde al instante
    bonoLlegadaAnio: [60, 30, 10],          // por terminar el año de 1.°, 2.° y 3.°
    bonoOportunidad: { vacante: 60, provisional: 30, reemplazo: 10, ninguna: 0 },
    cartasPorAnio: 2,
    esperaParaForzar: 45,                   // segundos de espera antes de que el anfitrión pueda pasar de año sin esperar
    duracionMaximaMin: 45,
    // Lo que hay que hacer cada año, en orden. La evaluación anual va al final y NO tiene
    // preguntas: sale de lo que se hizo en el año (arts. 32 a 34).
    tareasPorAnio: [
      ["concurso", "colegio", "cartas", "evaluacion"],
      ["colegio", "cartas", "evaluacion"],
      ["universidad", "colegio", "cartas", "evaluacion"],
      ["secretaria", "colegio", "cartas", "evaluacion"],
      ["secretaria", "colegio", "cartas", "evaluacion"]
    ],
    tareas: {
      concurso:    { nombre: "Concurso docente", edificio: "secretaria", articulos: "Arts. 8–13" },
      colegio:     { nombre: "Clase en el colegio", edificio: "colegio", articulos: "Según el tema del año" },
      cartas:      { nombre: "Situaciones inesperadas", articulos: "" },
      universidad: { nombre: "Formación en la universidad", edificio: "universidad", articulos: "Arts. 21 y 38" },
      secretaria:  { nombre: "Trámite en la Secretaría", edificio: "secretaria", articulos: "Arts. 10, 20–23, 35 y 36" },
      evaluacion:  { nombre: "Evaluación anual de desempeño", edificio: "rectoria", articulos: "Arts. 31 a 34" }
    }
  }
};
