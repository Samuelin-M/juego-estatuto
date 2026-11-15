/* ==========================================================================
   CONTENIDO DEL JUEGO — este es el archivo que el grupo edita.
   Lo usan los dos modos: el individual (mapa) y el en vivo (presentador + celulares).

   Basado en la "Propuesta de dinámica" del grupo y en el Decreto 1278 de 2002
   (Estatuto de Profesionalización Docente), artículos 8 a 40.

   INDICADORES (de 0 a 100): experiencia, formacion, popularidad, desempeno.
   "efectos" suma o resta a esos indicadores, por ejemplo:
       efectos: { desempeno: 10, popularidad: -5 }
   ========================================================================== */

const CONTENIDO = {
  titulo: "Carrera Docente",
  subtitulo: "Juego de competencia docente sobre el Estatuto de Profesionalización Docente (Decreto 1278 de 2002, arts. 8–40).",
  creditos: "Ética · UIS",

  // Años de servicio que dura una partida individual
  aniosDeJuego: 5,

  indicadores: {
    experiencia: { nombre: "Experiencia", icono: "⏳", descripcion: "Tiempo y trayectoria en el ejercicio docente." },
    formacion:   { nombre: "Formación",   icono: "🎓", descripcion: "Preparación académica y estudios realizados." },
    popularidad: { nombre: "Popularidad", icono: "⭐", descripcion: "Reconocimiento entre estudiantes y comunidad educativa." },
    desempeno:   { nombre: "Desempeño",   icono: "📈", descripcion: "Calidad del trabajo y cumplimiento de las responsabilidades docentes." }
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
  // Propuesta 2.1: tres preguntas, una por cada componente evaluativo del concurso.
  // La valoración de antecedentes sale del perfil del personaje (experiencia y formación).
  concurso: {
    pesoAntecedentes: 0.3,
    componentes: [
      {
        id: "aptitudes",
        nombre: "Prueba de aptitudes y competencias básicas",
        peso: 0.3,
        personaje: "📝 Prueba escrita",
        texto: "Pregunta de la prueba: después de tu explicación, la mitad del curso no entendió el tema de fracciones. ¿Qué haces?",
        opciones: [
          { texto: "Cambio de estrategia: uso material concreto y ejemplos de la vida diaria, y verifico quién va entendiendo.", valor: 100, comentario: "Muestra estrategias pedagógicas y de evaluación, dos de los aspectos que mide el estatuto." },
          { texto: "Repito la misma explicación, pero más despacio.", valor: 55, comentario: "Le pones voluntad, pero sin cambiar de estrategia." },
          { texto: "Sigo con el siguiente tema; el que no entendió que estudie en casa.", valor: 15, comentario: "Deja de lado la responsabilidad por los resultados de los estudiantes." }
        ]
      },
      {
        id: "psicotecnica",
        nombre: "Prueba psicotécnica",
        peso: 0.2,
        personaje: "🧠 Prueba psicotécnica",
        texto: "En una reunión, un compañero presenta como suyo un proyecto que hicieron juntos. ¿Cómo reaccionas?",
        opciones: [
          { texto: "Hablo con él en privado y luego aclaramos juntos la autoría ante el equipo.", valor: 100, comentario: "Manejo maduro del conflicto y buenas relaciones interpersonales." },
          { texto: "Lo confronto ahí mismo delante de todos.", valor: 40, comentario: "Defiendes tu trabajo, pero escalas el conflicto." },
          { texto: "No digo nada, pero dejo de colaborar con él.", valor: 30, comentario: "Evitas el conflicto, pero dañas el trabajo en equipo." }
        ]
      },
      {
        id: "entrevista",
        nombre: "Entrevista",
        peso: 0.2,
        personaje: "🧑‍💼 Jurado de la entrevista",
        texto: "¿Por qué quiere ser docente del sector oficial?",
        opciones: [
          { texto: "Porque la educación es un bien público y quiero aportar al desarrollo de mis estudiantes y de mi comunidad.", valor: 100, comentario: "Coincide con el marco ético de la profesión docente (art. 40)." },
          { texto: "Por la estabilidad: en lo público no lo echan a uno.", valor: 45, comentario: "La estabilidad existe, pero solo mientras el desempeño sea satisfactorio (art. 37, literal c)." },
          { texto: "Porque se trabaja poco y hay muchas vacaciones.", valor: 10, comentario: "Muestra poco compromiso con la función docente." }
        ]
      }
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

  /* ======================= SITUACIONES EN EL COLEGIO ======================= */
  // Una por año en el modo individual. También sirven como "caso profesional" en vivo.
  colegio: [
    {
      id: "rendimiento",
      personaje: "👨‍🏫 Coordinador",
      texto: "Los resultados de tu curso en la prueba externa salieron por debajo del promedio del colegio.",
      opciones: [
        { texto: "Analizo los resultados y armo un plan de refuerzo con los temas débiles.", efectos: { desempeno: 10, popularidad: 3 }, consecuencia: "Al final del periodo el curso mejora.", articulo: "Art. 34 · Aspectos a evaluar", explicacion: "Entre los aspectos que se evalúan al docente están sus estrategias pedagógicas y el logro de resultados." },
        { texto: "Es culpa de los estudiantes, que no estudian.", efectos: { desempeno: -10, popularidad: -5 }, consecuencia: "Nada cambia y el coordinador lo anota.", articulo: "Art. 29 · Principios de la evaluación", explicacion: "Por el principio de concurrencia, el desempeño del docente se valora junto con los logros de sus estudiantes." }
      ]
    },
    {
      id: "disciplina",
      personaje: "🧒 Estudiante de 8°",
      texto: "Un estudiante interrumpe la clase todos los días con chistes y ruido.",
      opciones: [
        { texto: "Hablo con él a solas, acordamos reglas y le doy un rol en la clase.", efectos: { desempeno: 8, popularidad: 6 }, consecuencia: "Se vuelve tu monitor. La clase fluye mejor.", articulo: "Art. 34 · Aspectos a evaluar", explicacion: "El manejo de la disciplina y la actitud frente a los estudiantes hacen parte de la evaluación del docente." },
        { texto: "Lo saco del salón cada vez que molesta.", efectos: { desempeno: -4, popularidad: -6 }, consecuencia: "Se pierde clases y su comportamiento empeora.", articulo: "Art. 39 · Principios y valores", explicacion: "La profesión docente se basa en el reconocimiento de la dignidad humana y los derechos de los estudiantes." },
        { texto: "Lo ignoro, ya se cansará.", efectos: { desempeno: -6, popularidad: -2 }, consecuencia: "Otros estudiantes empiezan a imitarlo.", articulo: "Art. 34 · Aspectos a evaluar", explicacion: "El manejo de la disciplina es uno de los aspectos que mide la evaluación." }
      ]
    },
    {
      id: "padres",
      personaje: "👩 Madre de familia",
      texto: "Varios papás se quejan de que nadie les explica cómo van sus hijos.",
      opciones: [
        { texto: "Organizo una reunión y les comparto cómo va cada estudiante.", efectos: { popularidad: 10, desempeno: 4 }, consecuencia: "Los papás quedan contentos.", articulo: "Art. 33 · Instrumentos de evaluación", explicacion: "Las encuestas a padres y estudiantes son uno de los instrumentos para evaluar al docente." },
        { texto: "Eso le toca a la coordinación, no a mí.", efectos: { popularidad: -10 }, consecuencia: "Las quejas llegan a la rectoría.", articulo: "Art. 29 · Principios de la evaluación", explicacion: "Por el principio de participación, en la evaluación participan también los padres de familia y los estudiantes." }
      ]
    },
    {
      id: "feria",
      personaje: "👨‍🏫 Coordinador",
      texto: "El colegio organiza una feria científica como parte de su Proyecto Educativo Institucional y te piden apoyarla.",
      opciones: [
        { texto: "Me apunto y guío los proyectos de mis estudiantes.", efectos: { desempeno: 6, popularidad: 8, experiencia: 3 }, consecuencia: "Uno de tus grupos gana un premio regional.", articulo: "Art. 34 · Aspectos a evaluar", explicacion: "El compromiso con la institución y el conocimiento de su currículo son aspectos que se evalúan." },
        { texto: "Prefiero no meterme, ya tengo suficiente trabajo.", efectos: { desempeno: -3, popularidad: -4 }, consecuencia: "La feria sale adelante sin tu curso.", articulo: "Art. 34 · Aspectos a evaluar", explicacion: "El compromiso institucional también hace parte de la evaluación." }
      ]
    },
    {
      id: "inclusion",
      personaje: "👧 Estudiante con dificultades de aprendizaje",
      texto: "Una estudiante tiene diagnóstico de dislexia y le va mal en tus evaluaciones escritas.",
      opciones: [
        { texto: "Ajusto la forma de evaluarla: oral, con más tiempo y apoyos visuales.", efectos: { desempeno: 8, popularidad: 6 }, consecuencia: "Sus notas reflejan lo que de verdad sabe.", articulo: "Art. 34 · Aspectos a evaluar", explicacion: "Se evalúan las habilidades pedagógicas y de evaluación del docente." },
        { texto: "Las reglas son iguales para todos.", efectos: { desempeno: -6, popularidad: -4 }, consecuencia: "La estudiante se desmotiva.", articulo: "Art. 39 · Principios y valores", explicacion: "La profesión se basa en el reconocimiento de la dignidad humana y la justicia." }
      ]
    },
    {
      id: "observacion",
      personaje: "🧔 Rector",
      texto: "El rector te avisa que la otra semana va a observar una de tus clases.",
      opciones: [
        { texto: "Preparo una clase activa, como siempre intento hacerlo.", efectos: { desempeno: 8 }, consecuencia: "El rector sale con buena impresión.", articulo: "Art. 33 · Instrumentos de evaluación", explicacion: "Las guías de observación de clase son uno de los instrumentos de la evaluación de desempeño." },
        { texto: "Hago lo mismo de siempre: dictar y copiar.", efectos: { desempeno: -5 }, consecuencia: "El rector anota varias recomendaciones.", articulo: "Art. 33 · Instrumentos de evaluación", explicacion: "La observación de clase se usa para evaluar al docente." }
      ]
    }
  ],

  /* ======================= CARTAS: SITUACIONES INESPERADAS ======================= */
  // Propuesta 2.3. En el modo individual aparecen 2 por año en el mapa.
  cartas: [
    {
      id: "regalo", tipo: "Institucional", titulo: "Un regalo sospechoso",
      texto: "El papá de un estudiante que va perdiendo te ofrece un celular nuevo \"por tu buena labor\", justo antes de las notas finales.",
      opciones: [
        { texto: "Lo rechazo con amabilidad y le explico cómo puede ayudar a su hijo.", efectos: { desempeno: 6, popularidad: 4 }, consecuencia: "El papá entiende y su hijo empieza a recuperarse.", articulo: "Art. 39 · Principios y valores", explicacion: "Los valores de la profesión docente incluyen la honestidad, la justicia y la transparencia." },
        { texto: "Lo acepto, no tiene nada de malo.", efectos: { desempeno: -12, popularidad: -10 }, consecuencia: "Otros papás se enteran y llega una queja formal.", articulo: "Art. 40 · Marco ético", explicacion: "La profesión docente exige idoneidad académica y moral." }
      ]
    },
    {
      id: "incapacidad", tipo: "Personal", titulo: "Te enfermas",
      texto: "Amaneces con fiebre alta y el médico te da tres días de incapacidad.",
      opciones: [
        { texto: "Tomo la incapacidad y dejo guías para mis cursos.", efectos: { desempeno: 2 }, consecuencia: "Te recuperas y vuelves con energía.", articulo: "Art. 37 · Derechos", explicacion: "Los docentes tienen derecho a licencias por enfermedad y maternidad según el régimen de seguridad social." },
        { texto: "Voy a trabajar enfermo para no quedar mal.", efectos: { desempeno: -6, popularidad: -2 }, consecuencia: "Contagias a medio salón y tardas más en recuperarte.", articulo: "Art. 37 · Derechos", explicacion: "Las licencias por enfermedad son un derecho, no un favor." }
      ]
    },
    {
      id: "sindicato", tipo: "Laboral", titulo: "Invitación del sindicato",
      texto: "Unos compañeros te invitan a afiliarte al sindicato de docentes. Otro te dice que eso \"te puede perjudicar\".",
      opciones: [
        { texto: "Me informo y decido libremente si me afilio.", efectos: { popularidad: 4, experiencia: 2 }, consecuencia: "Tomas una decisión informada.", articulo: "Art. 37 · Derechos", explicacion: "Los docentes tienen derecho a asociarse libremente." },
        { texto: "Me da miedo, mejor ni pregunto.", efectos: { popularidad: -2 }, consecuencia: "Te quedas sin saber cuáles son tus derechos.", articulo: "Art. 37 · Derechos", explicacion: "La libre asociación es un derecho de los docentes; ejercerlo no puede perjudicarte." }
      ]
    },
    {
      id: "consejo", tipo: "Institucional", titulo: "Elecciones al Consejo Directivo",
      texto: "Se abren elecciones para el representante de los docentes en el Consejo Directivo del colegio.",
      opciones: [
        { texto: "Me postulo.", efectos: { popularidad: 8, experiencia: 4, desempeno: -2 }, consecuencia: "Ganas. Más reuniones, pero también más voz en las decisiones.", articulo: "Art. 37 · Derechos", explicacion: "Los docentes tienen derecho a participar en el gobierno escolar, directamente o por medio de sus representantes." },
        { texto: "Voto, pero no me postulo.", efectos: { popularidad: 1 }, consecuencia: "Apoyas a un compañero que sale elegido.", articulo: "Art. 37 · Derechos", explicacion: "La participación en el gobierno escolar también se ejerce eligiendo representantes." }
      ]
    },
    {
      id: "capacitacion", tipo: "Laboral", titulo: "Curso gratuito",
      texto: "La Secretaría ofrece un curso virtual gratuito sobre herramientas digitales para enseñar.",
      opciones: [
        { texto: "Me inscribo y lo termino.", efectos: { formacion: 8, desempeno: 3 }, consecuencia: "Empiezas a usar nuevas herramientas en clase.", articulo: "Art. 38 · Formación y capacitación", explicacion: "La capacitación de los docentes en servicio debe mejorar la calidad de la educación y su desarrollo profesional." },
        { texto: "No tengo tiempo.", efectos: {}, consecuencia: "Todo sigue igual.", articulo: "Art. 38 · Formación y capacitación", explicacion: "La actualización docente busca aprender nuevas técnicas y herramientas para un mejor desempeño." }
      ]
    },
    {
      id: "encargo", tipo: "Laboral", titulo: "Un encargo",
      texto: "El coordinador se va de licencia por dos meses y el rector te pide cubrir su cargo mientras regresa.",
      opciones: [
        { texto: "Acepto el encargo.", efectos: { experiencia: 6, desempeno: 3, popularidad: -2 }, consecuencia: "Aprendes mucho de la gestión del colegio.", articulo: "Art. 14 · Encargos", explicacion: "Un cargo directivo vacante temporalmente se puede proveer por encargo con personal de carrera mientras dura la situación del titular." },
        { texto: "Prefiero seguir solo con mis clases.", efectos: {}, consecuencia: "Otro compañero asume el encargo.", articulo: "Art. 14 · Encargos", explicacion: "El encargo es una designación temporal para asumir un cargo vacante." }
      ]
    },
    {
      id: "reclamo", tipo: "Laboral", titulo: "Una calificación injusta",
      texto: "En tu evaluación aparece un aspecto mal calificado con datos que no son ciertos.",
      opciones: [
        { texto: "Presento un recurso de reposición con pruebas.", efectos: { desempeno: 5 }, consecuencia: "Te corrigen la calificación en menos de 15 días hábiles.", articulo: "Art. 36 · Resultados y consecuencias", explicacion: "La evaluación de desempeño admite recurso de reposición y de apelación, que deben resolverse en 15 días hábiles." },
        { texto: "Me quejo en redes sociales.", efectos: { popularidad: -6, desempeno: -3 }, consecuencia: "Se arma un problema y la calificación no cambia.", articulo: "Art. 36 · Resultados y consecuencias", explicacion: "Para estar en desacuerdo con una evaluación existen los recursos de reposición y apelación." }
      ]
    },
    {
      id: "redes", tipo: "Institucional", titulo: "Datos expuestos",
      texto: "Un compañero publica en un grupo de WhatsApp de papás las notas y problemas personales de un estudiante.",
      opciones: [
        { texto: "Le pido que lo borre y lo informo a la coordinación.", efectos: { desempeno: 5, popularidad: 3 }, consecuencia: "El mensaje se borra y el colegio ajusta sus reglas.", articulo: "Art. 39 · Principios y valores", explicacion: "La profesión docente se basa en el respeto de la dignidad humana y los derechos fundamentales." },
        { texto: "No es asunto mío.", efectos: { popularidad: -4 }, consecuencia: "El estudiante deja de ir al colegio por unos días.", articulo: "Art. 39 · Principios y valores", explicacion: "El respeto y la responsabilidad son valores de la profesión docente." }
      ]
    },
    {
      id: "investigacion", tipo: "Laboral", titulo: "Grupo de investigación",
      texto: "Una universidad te invita a un grupo de investigación sobre enseñanza de las matemáticas.",
      opciones: [
        { texto: "Acepto, aunque me quite tiempo.", efectos: { formacion: 6, experiencia: 3, popularidad: -2 }, consecuencia: "Publicas tu primer artículo.", articulo: "Art. 38 · Formación y capacitación", explicacion: "La formación de los docentes debe orientarse a su profesionalización y especialización." },
        { texto: "No por ahora.", efectos: {}, consecuencia: "Sigues con tu rutina.", articulo: "Art. 38 · Formación y capacitación", explicacion: "La formación continua mejora el desempeño docente." }
      ]
    },
    {
      id: "privado", tipo: "Personal", titulo: "Oferta de un colegio privado",
      texto: "Un colegio privado te ofrece un poco más de sueldo si te vas con ellos.",
      opciones: [
        { texto: "Me quedo: en lo público mi sueldo puede crecer con formación y buen desempeño.", efectos: { experiencia: 2 }, consecuencia: "Sigues construyendo tu carrera.", articulo: "Art. 37 · Derechos", explicacion: "Los docentes tienen derecho a un sistema de remuneración acorde con su formación académica y su desempeño." },
        { texto: "Lo pienso, pero pido un aumento en el colegio público.", efectos: { popularidad: -3 }, consecuencia: "Te explican que el sueldo depende del grado y el nivel del escalafón.", articulo: "Art. 19 · Escalafón docente", explicacion: "El escalafón determina la asignación salarial según grado y nivel." }
      ]
    }
  ],

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

  /* ===================== PREGUNTAS DE CONOCIMIENTO ===================== */
  // Para la pregunta rápida y el duelo del modo en vivo. "correcta" es la posición (0 = primera).
  preguntas: [
    { id: "grados", texto: "¿Cuántos grados tiene el Escalafón Docente?", opciones: ["2", "3", "4", "14"], correcta: 1, articulo: "Art. 20", explicacion: "El escalafón tiene tres grados, definidos por la formación académica." },
    { id: "niveles", texto: "¿Cuántos niveles salariales tiene cada grado del escalafón?", opciones: ["3", "4 (A, B, C y D)", "5", "6"], correcta: 1, articulo: "Art. 20", explicacion: "Cada grado tiene cuatro niveles salariales: A, B, C y D." },
    { id: "prueba60", texto: "¿Qué resultado mínimo se necesita en la evaluación del periodo de prueba?", opciones: ["50%", "60%", "70%", "80%"], correcta: 1, articulo: "Art. 31", explicacion: "Con 60% o más, el docente queda inscrito en el escalafón; con menos, sale del servicio." },
    { id: "dosanios", texto: "¿Qué pasa si un docente saca menos de 60% en la evaluación anual dos años seguidos?", opciones: ["Le bajan el sueldo", "Lo trasladan de colegio", "Lo excluyen del escalafón y sale del servicio", "Nada, solo es una advertencia"], correcta: 2, articulo: "Art. 36", explicacion: "Dos evaluaciones anuales consecutivas por debajo de 60% llevan a la exclusión del escalafón y al retiro del servicio." },
    { id: "competencias80", texto: "¿Qué resultado en la evaluación de competencias permite aspirar a un ascenso?", opciones: ["Más de 60%", "Más de 70%", "Más de 80%", "100%"], correcta: 2, articulo: "Art. 36", explicacion: "Con más de 80% se es candidato a ascenso o reubicación salarial." },
    { id: "tresanios", texto: "¿Cuántos años de servicio se necesitan para subir de nivel o de grado?", opciones: ["1 año", "2 años", "3 años", "5 años"], correcta: 2, articulo: "Art. 20", explicacion: "Se puede subir de nivel o ascender de grado después de tres años de servicio, con el puntaje requerido en competencias." },
    { id: "rector6", texto: "¿Cuántos años de experiencia profesional se piden para ser rector?", opciones: ["4", "5", "6", "10"], correcta: 2, articulo: "Art. 10", explicacion: "Rector: 6 años. Coordinador: 5 años. Director rural: 4 años." },
    { id: "lista2", texto: "¿Cuánto tiempo está vigente una lista de elegibles?", opciones: ["1 año", "2 años", "3 años", "Indefinidamente"], correcta: 1, articulo: "Art. 11", explicacion: "Las listas de elegibles tienen vigencia de dos años desde su publicación." },
    { id: "quienevalua", texto: "¿Quién hace la evaluación anual de desempeño de un docente?", opciones: ["El Ministerio de Educación", "El rector o director del establecimiento", "Los estudiantes", "La Comisión Nacional del Servicio Civil"], correcta: 1, articulo: "Art. 32", explicacion: "La evaluación de desempeño la hace el rector o director; a los rectores los evalúa su superior." },
    { id: "seisanios", texto: "Como máximo, ¿cada cuánto debe hacerse la evaluación de competencias?", opciones: ["Cada 2 años", "Cada 3 años", "Cada 6 años", "Cada 10 años"], correcta: 2, articulo: "Art. 35", explicacion: "Se hace cuando la entidad territorial lo considere, pero nunca con más de seis años entre una y otra." },
    { id: "meses4", texto: "¿Cuántos meses mínimos en el cargo se necesitan para que se evalúe el periodo de prueba?", opciones: ["2", "3", "4", "6"], correcta: 2, articulo: "Arts. 12 y 31", explicacion: "El periodo de prueba se evalúa si el docente lleva al menos cuatro meses en el cargo." },
    { id: "grado3", texto: "¿Qué título se necesita para el Grado 3 del escalafón?", opciones: ["Normalista superior", "Licenciatura", "Especialización", "Maestría o doctorado"], correcta: 3, articulo: "Art. 21", explicacion: "El Grado 3 exige, además de licenciatura o título profesional, una maestría o un doctorado." },
    { id: "rechazo", texto: "¿Qué pasa si alguien rechaza el nombramiento en una vacante definitiva?", opciones: ["Nada, sigue primero en la lista", "Lo retiran de la lista de elegibles", "Le bajan puntos", "Lo nombran en otra ciudad"], correcta: 1, articulo: "Art. 11", explicacion: "Quien no acepta el nombramiento es retirado de la lista de elegibles." },
    { id: "recurso15", texto: "¿En cuánto tiempo deben resolverse los recursos contra una evaluación de desempeño?", opciones: ["5 días hábiles", "15 días hábiles", "30 días", "6 meses"], correcta: 1, articulo: "Art. 36", explicacion: "Los recursos de reposición y apelación deben resolverse dentro de los 15 días hábiles siguientes." }
  ],

  /* ============================ MODO EN VIVO ============================ */
  // Rondas para el modo competitivo (propuesta, modalidad 2).
  // Tipos de desafío:
  //   "rapida": pregunta rápida, gana el equipo de quien responde bien primero
  //   "duelo":  todos responden; puntos según el % de aciertos de cada equipo
  //   "caso":   situación con opciones; cada equipo decide por mayoría
  //             ref: "carta:ID" o "colegio:ID"
  // Las preguntas se toman de "preguntas" (pregunta: "ID") o de los
  // componentes del concurso (ref: "concurso:ID"; la correcta es la de mayor valor).
  enVivo: {
    segundos: 20,
    rondas: [
      {
        nombre: "Concurso docente",
        descripcion: "Tres duelos, uno por cada componente del concurso. Al final, cada equipo recibe una oportunidad laboral según su puntaje.",
        desafios: [
          { tipo: "duelo", ref: "concurso:aptitudes", indicador: "formacion" },
          { tipo: "duelo", ref: "concurso:psicotecnica", indicador: "desempeno" },
          { tipo: "duelo", ref: "concurso:entrevista", indicador: "popularidad" }
        ],
        alFinal: "oportunidades"
      },
      {
        nombre: "Evaluación anual",
        descripcion: "Un caso en el aula y una pregunta rápida. Luego el rector evalúa a cada personaje.",
        desafios: [
          { tipo: "caso", ref: "colegio:disciplina" },
          { tipo: "rapida", pregunta: "prueba60", indicador: "desempeno" }
        ],
        alFinal: "evaluacion"
      },
      {
        nombre: "Situaciones inesperadas",
        descripcion: "Cartas con situaciones laborales, personales o institucionales.",
        desafios: [
          { tipo: "caso", ref: "carta:regalo" },
          { tipo: "caso", ref: "carta:reclamo" },
          { tipo: "rapida", pregunta: "quienevalua", indicador: "popularidad" }
        ]
      },
      {
        nombre: "Progresión profesional",
        descripcion: "Solo hay una plaza de coordinador: la gana el equipo más rápido. Luego, un duelo por el ascenso.",
        desafios: [
          { tipo: "rapida", pregunta: "rector6", premio: "Coordinador", indicador: "experiencia", titulo: "Plaza de coordinador" },
          { tipo: "duelo", pregunta: "competencias80", indicador: "formacion", premio: "ascenso", titulo: "Evaluación de competencias" }
        ],
        alFinal: "evaluacion"
      }
    ]
  }
};
