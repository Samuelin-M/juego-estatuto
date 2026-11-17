/* ==========================================================================
   CONTENIDO DEL JUEGO — este es el archivo que el grupo edita.
   Es un solo juego: el multijugador usa este mismo contenido.

   Basado en la "Propuesta de dinámica" del grupo y en el Decreto 1278 de 2002
   (Estatuto de Profesionalización Docente), artículos 8 a 40.

   PREGUNTAS Y SITUACIONES: están en "bancos", copiadas del PDF "Banco de
   preguntas" del grupo. En las preguntas, la correcta lleva  correcta: true.
   ENCICLOPEDIA: en "articulos" están los artículos 8 a 40 explicados (los
   consulta el bibliotecario del pueblo).

   INDICADORES (de 0 a 100): experiencia, formacion, popularidad, desempeno.
   "efectos" suma o resta a esos indicadores, por ejemplo:
       efectos: { desempeno: 10, popularidad: -5 }
   ========================================================================== */

const CONTENIDO = {
  titulo: "Carrera Docente",
  subtitulo: "Juego de competencia docente sobre el Estatuto de Profesionalización Docente (Decreto 1278 de 2002, arts. 8–40).",
  creditos: "Ética · UIS",

  // Para probar: true pinta la respuesta correcta de verde y las incorrectas de rojo.
  // Con las preguntas definitivas va en false.
  mostrarCorrectas: false,

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

  // ENCICLOPEDIA DEL ESTATUTO (la consulta el bibliotecario del pueblo): artículos 8 a 40 del
  // Decreto Ley 1278 de 2002 explicados en pocas palabras, según el texto vigente.
  // Las preguntas y situaciones muestran la explicación de los artículos que citan.
  capitulos: [
    { nombre: "Ingreso al servicio", desde: 8, hasta: 15 },
    { nombre: "Carrera y escalafón docente", desde: 16, hasta: 25 },
    { nombre: "Evaluación", desde: 26, hasta: 36 },
    { nombre: "Derechos, formación y ética", desde: 37, hasta: 40 }
  ],
  articulos: [
    { num: 8, titulo: "Concurso para ingreso al servicio educativo estatal",
      texto: "El concurso evalúa las aptitudes, la experiencia, las competencias básicas, las relaciones interpersonales y las condiciones de personalidad de los aspirantes. Con él se decide quién entra a la lista de elegibles y en qué puesto, para tener siempre de dónde llenar las vacantes." },
    { num: 9, titulo: "Etapas del concurso",
      texto: "Si no hay lista de elegibles, la entidad territorial abre un concurso público con estas etapas: convocatoria; inscripción; verificación de requisitos; prueba de aptitudes y competencias básicas (escoge a los más idóneos); publicación de resultados; prueba psicotécnica, entrevista y valoración de antecedentes; clasificación, y lista de elegibles en orden de puntaje." },
    { num: 10, titulo: "Requisitos especiales para los directivos docentes",
      texto: "Para concursar como director rural se pide título de normalista superior, licenciado o profesional y 4 años de experiencia; para coordinador, título de licenciado o profesional y 5 años; para rector, título de licenciado o profesional y 6 años." },
    { num: 11, titulo: "Provisión de cargos",
      texto: "Una vacante se llena con quien ocupa el primer lugar de la lista de elegibles. Solo si esa persona no acepta, se sigue en estricto orden de puntaje, y quien rechaza el nombramiento sale de la lista. Las listas de elegibles valen por 2 años." },
    { num: 12, titulo: "Nombramiento en período de prueba",
      texto: "Quien gana el concurso queda en período de prueba hasta terminar el año escolar (si trabajó por lo menos 4 meses). Al final se evalúan su desempeño y sus competencias: si aprueba, adquiere los derechos de carrera y entra al escalafón; si no, sale del servicio y puede volver a concursar. Los profesionales que no son licenciados deben acreditar, al terminar el período de prueba, que cursan o terminaron un posgrado en educación o un programa de pedagogía." },
    { num: 13, titulo: "Nombramientos provisionales",
      texto: "Para llenar un cargo de forma temporal se nombra en provisionalidad a alguien que cumpla los requisitos: en vacantes temporales, mientras el titular está separado del cargo (usando la lista de elegibles vigente), o en vacantes definitivas, hasta que llegue alguien del concurso. Para tener derechos de carrera hay que ganar el concurso y aprobar el período de prueba." },
    { num: 14, titulo: "Encargos",
      texto: "Hay encargo cuando alguien que ya trabaja en propiedad asume temporalmente otro empleo vacante. Los cargos directivos vacantes pueden cubrirse por encargo con personal de carrera mientras dura la ausencia del titular o mientras se hace el concurso." },
    { num: 15, titulo: "Prohibición",
      texto: "No se puede llenar con un provisional ni con un encargo un cargo vacante de manera definitiva si hay lista de elegibles vigente; quien lo haga responde disciplinaria y patrimonialmente. Cuando se agota la lista, hay que convocar un nuevo concurso dentro de los 4 meses siguientes." },
    { num: 16, titulo: "Carrera docente",
      texto: "Es el régimen legal que ampara el ejercicio de la profesión docente en el sector estatal. Se basa en el carácter profesional de los educadores, en su idoneidad y en sus competencias; garantiza igualdad de acceso y toma el mérito como base para entrar, permanecer, ser promovido y ascender." },
    { num: 17, titulo: "Administración y vigilancia de la carrera docente",
      texto: "La carrera busca atraer y retener a los educadores más idóneos, promover su desarrollo profesional y una remuneración justa, y exige una conducta intachable y un desempeño satisfactorio. La administran las entidades territoriales certificadas, que resuelven los reclamos en primera instancia; la segunda instancia es la Comisión Nacional del Servicio Civil." },
    { num: 18, titulo: "Ingreso a la carrera",
      texto: "Tienen los derechos de la carrera docente los educadores estatales que ganan el concurso, aprueban el período de prueba y quedan inscritos en el Escalafón Docente." },
    { num: 19, titulo: "Escalafón docente",
      texto: "Es el sistema que clasifica a docentes y directivos según su formación, experiencia, responsabilidad, desempeño y competencias, en grados y niveles que se alcanzan durante la vida laboral y que definen el salario. La idoneidad reúne los conocimientos, habilidades, actitudes, aptitudes, rendimiento y valores necesarios para enseñar." },
    { num: 20, titulo: "Estructura del escalafón docente",
      texto: "Tiene 3 grados, según la formación académica, y cada grado tiene 4 niveles salariales (A, B, C y D). Quien aprueba el período de prueba empieza en el nivel A de su grado y, después de 3 años de servicio, puede subir de nivel o de grado si saca en la evaluación de competencias el puntaje del artículo 36." },
    { num: 21, titulo: "Requisitos para inscripción y ascenso en el escalafón",
      texto: "Grado 1: ser normalista superior. Grado 2: ser licenciado en educación, o profesional con un programa de pedagogía o una especialización en educación. Grado 3: ser licenciado o profesional con maestría o doctorado en un área afín. En todos hay que haber sido nombrado por concurso y aprobar el período de prueba (o, para ascender, la evaluación de competencias)." },
    { num: 22, titulo: "Escalafón de directivos docentes",
      texto: "Los directivos, al aprobar su concurso y su período de prueba, se inscriben en el grado que corresponde a su título, o conservan el que tenían si ya eran docentes del Estado. Pasar a un cargo directivo significa una mejor remuneración." },
    { num: 23, titulo: "Inscripción y ascenso en el escalafón docente",
      texto: "Cada entidad territorial lleva el registro de inscripciones y ascensos. Los ascensos y las reubicaciones de nivel se dan cuando la entidad convoca a la evaluación de competencias y se obtiene el puntaje del artículo 36, y nunca pueden superar el presupuesto disponible." },
    { num: 24, titulo: "Exclusión del escalafón",
      texto: "Se sale del escalafón por las causas generales de retiro del servicio o por una evaluación de desempeño no satisfactoria. La exclusión por evaluación no satisfactoria trae el retiro del servicio." },
    { num: 25, titulo: "Reingreso al servicio y al escalafón docente",
      texto: "Quien fue destituido por orden judicial o fallo disciplinario solo puede volver cuando termine su inhabilidad (o después de 3 años como mínimo), presentando de nuevo el concurso y el período de prueba, y empieza en el nivel A. Quien no aprobó el período de prueba o salió por evaluación no satisfactoria puede concursar en la siguiente convocatoria. El directivo que no aprueba, o que no quiere seguir, vuelve a ser docente si ya lo era." },
    { num: 26, titulo: "Evaluación",
      texto: "La carrera docente va unida a la evaluación permanente: cada educador responde por su desempeño y debe someterse a la evaluación. Esta verifica que se mantengan la idoneidad, la calidad y la eficiencia que justifican seguir en el cargo, ascender o subir de nivel." },
    { num: 27, titulo: "Tipos de evaluación",
      texto: "Hay por lo menos tres: la evaluación del período de prueba, la evaluación ordinaria anual de desempeño y la evaluación de competencias." },
    { num: 28, titulo: "Objetivos de la evaluación",
      texto: "La evaluación busca estimular el compromiso y la formación continua, conocer los méritos del educador frente a los estudiantes y la comunidad, detectar necesidades de capacitación, premiar el buen desempeño con estímulos y decidir con bases objetivas quién sigue, asciende, sube de nivel o sale del servicio." },
    { num: 29, titulo: "Principios de la evaluación",
      texto: "Objetividad, confiabilidad, universalidad, pertinencia, transparencia, participación (autoridades, superiores, colegas, consejo directivo, padres y estudiantes) y concurrencia con los logros de los estudiantes o, para los directivos, con los resultados de la institución." },
    { num: 30, titulo: "Alcance de la evaluación",
      texto: "Evalúa por lo menos la preparación profesional, el compromiso y las competencias, la aplicación al trabajo, la responsabilidad, la formación alcanzada, la calidad del desempeño, los logros de los estudiantes y los méritos excepcionales." },
    { num: 31, titulo: "Evaluación de período de prueba",
      texto: "Al terminar el año académico se evalúan el desempeño y las competencias de quienes entraron ese año (si trabajaron al menos 4 meses). Con 60 % o más quedan inscritos en el escalafón según sus títulos; con menos, los docentes salen del servicio y los directivos que ya eran docentes de carrera vuelven a la docencia." },
    { num: 32, titulo: "Evaluación de desempeño",
      texto: "Mide cuánto cumple el docente o directivo con sus funciones y con los resultados. Se hace al terminar cada año escolar a quien haya trabajado más de 3 meses; la hace el rector o director, y a los rectores los evalúa su superior jerárquico." },
    { num: 33, titulo: "Instrumentos de evaluación de desempeño",
      texto: "Se pueden usar, entre otros: observación de clases, evaluaciones de superiores y colegas, encuestas a padres y estudiantes, análisis de los logros de los estudiantes, evaluación del consejo directivo, autoevaluación y evaluación de los directivos por parte de los docentes." },
    { num: 34, titulo: "Aspectos a evaluar en el desempeño",
      texto: "Estrategias pedagógicas y de evaluación, didáctica del área, resolución de problemas, conocimiento del plan de estudios, actitud hacia los alumnos, manejo de las relaciones del grupo y de la disciplina, compromiso institucional, interés por mejorar la calidad y logro de resultados. Para los directivos también cuentan el liderazgo, la eficiencia, la organización y los resultados de la institución." },
    { num: 35, titulo: "Evaluación de competencias",
      texto: "La competencia es una característica de la persona que se relaciona con su buen desempeño en el trabajo. La evaluación de competencias es voluntaria, para los inscritos en el escalafón que quieren ascender de grado o subir de nivel; la convoca la entidad territorial cuando lo considere, sin que pasen más de 6 años entre una y otra." },
    { num: 36, titulo: "Resultados y consecuencias de las evaluaciones",
      texto: "Desempeño: el docente con menos de 60 % dos años seguidos sale del escalafón y del servicio; el directivo que venía de la docencia estatal vuelve a ser docente. Competencias: con más de 80 % se es candidato a ascender o a subir de nivel, en estricto orden de puntaje y según el presupuesto. Las evaluaciones de desempeño admiten recursos de reposición y apelación." },
    { num: 37, titulo: "Derechos",
      texto: "Además de los de todo servidor público, los docentes y directivos tienen derecho a una remuneración acorde con su formación y desempeño, a asociarse libremente, a permanecer en el cargo mientras su trabajo y su conducta sean satisfactorios, a participar en el gobierno escolar y a las licencias por enfermedad y maternidad." },
    { num: 38, titulo: "Formación y capacitación docente",
      texto: "La formación y actualización de los educadores en servicio debe mejorar la calidad de la educación y su crecimiento profesional, sobre todo con profesionalización y especialización para desempeñarse mejor." },
    { num: 39, titulo: "Principios y valores de la profesión docente",
      texto: "La profesión docente se basa en la dignidad de todo ser humano y sus derechos fundamentales, el autodesarrollo, la autonomía, la comunicación y la solidaridad, y destaca valores como la responsabilidad, la honestidad, el conocimiento, la justicia, el respeto y la transparencia." },
    { num: 40, titulo: "Marco ético de la profesión docente",
      texto: "La docencia entiende la educación como un bien público, centrada en los estudiantes y al servicio de la Nación y la sociedad. Exige idoneidad académica y moral, permite el crecimiento personal y social del educador y del estudiante, y requiere compromiso con los contextos socioculturales donde se enseña." }
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
  // Escritos por el grupo (PDF "Banco de preguntas", 16 nov 2026). Cada ficha lleva su código del PDF.
  // Salen al azar, nunca de un año más avanzado, y no se repiten mientras queden otras.
  //   anio:       en qué año sale (si no hay de ese año, sale una del año anterior más cercano)
  //   dificultad: 1 fácil, 2 intermedia, 3 difícil. Entre más veces se hace lo mismo (repetir el
  //               concurso, otro año de clases en el mismo cargo…), más difíciles salen.
  //   cargo:      en colegio y cartas: Docente, Coordinador o Rector (el cargo que tenga el jugador)
  //   opciones:   en las preguntas, la correcta lleva  correcta: true
  //   efectos:    lo que cambia en los indicadores al escoger esa opción (cuenta para la evaluación anual)
  //   articulo / explicacion: lo que se muestra después de responder
  // Las fichas que en el PDF dicen "Por redactar" no están: cuando las escriban, se agregan aquí
  // con el mismo formato (el juego ya las usa solas).
  bancos: {
    // CONCURSO DOCENTE (año 1): una pregunta de cada prueba. Si se repite el concurso salen
    // preguntas nuevas y más difíciles: 1.er intento → fáciles; 2.º → intermedias; 3.º en adelante → difíciles.
    aptitudes: [
      {
        codigo: "APT-01", anio: 1, dificultad: 1,
        texto: "Durante una clase, un docente nota que varios estudiantes no comprenden el tema explicado. ¿Qué debería hacer el docente?",
        opciones: [
          { texto: "Continuar con el tema para no retrasar las clases. El docente debe cumplir con su planificación.", correcta: false },
          { texto: "Explicar nuevamente utilizando otros ejemplos. Cada estudiante aprende a su propio ritmo.", correcta: true },
          { texto: "Dejar una actividad adicional para la casa. La práctica individual ayuda a reforzar lo aprendido.", correcta: false }
        ],
        articulo: "Art. 34 · Estrategias pedagógicas"
      },
      {
        codigo: "APT-02", anio: 1, dificultad: 1,
        texto: "Cuatro pintores de brocha gorda pintan una casa en 6 días. ¿Cuántos días demorarán 12 pintores en pintar una casa igual a ésta, si mantienen ese ritmo?",
        opciones: [
          { texto: "2 días", correcta: true },
          { texto: "4 días", correcta: false },
          { texto: "6 días", correcta: false },
          { texto: "12 días", correcta: false }
        ],
        articulo: "Art. 9, lit. d · Razonamiento matemático"
      },
      {
        codigo: "APT-03", anio: 1, dificultad: 2,
        texto: "Los 3/5 de la mitad de mi edad son 12 años. Entonces, tengo",
        opciones: [
          { texto: "20 años.", correcta: false },
          { texto: "40 años.", correcta: true },
          { texto: "60 años.", correcta: false },
          { texto: "80 años.", correcta: false }
        ],
        articulo: "Art. 9, lit. d · Razonamiento matemático"
      },
      {
        codigo: "APT-04", anio: 1, dificultad: 2,
        texto: "Un estudiante obtiene una calificación baja en una evaluación y afirma que el examen fue demasiado difícil. ¿Cuál debería ser la primera acción del docente?",
        opciones: [
          { texto: "Revisar los errores del estudiante y explicarle cómo mejorar. La evaluación también permite identificar dificultades.", correcta: true },
          { texto: "Mantener la calificación sin discutirla. Las evaluaciones deben conservar su objetividad.", correcta: false },
          { texto: "Darle otra oportunidad con una evaluación más sencilla. Es importante que el estudiante no pierda la motivación.", correcta: false }
        ],
        articulo: "Art. 34 · Habilidades de evaluación"
      },
      {
        codigo: "APT-05", anio: 1, dificultad: 3,
        texto: "En una institución educativa se propone realizar un proyecto grupal. Sin embargo, algunos estudiantes no participan y dejan todo el trabajo a sus compañeros. ¿Qué estrategia debería implementar el docente?",
        opciones: [
          { texto: "Permitir que los estudiantes más responsables terminen el trabajo. Así se garantiza la entrega del proyecto.", correcta: false },
          { texto: "Asignar una calificación grupal sin hacer distinciones. Todos pertenecen al mismo equipo.", correcta: false },
          { texto: "Distribuir responsabilidades y hacer seguimiento a la participación. Cada estudiante debe contribuir al aprendizaje colectivo.", correcta: true }
        ],
        articulo: "Art. 34 · Manejo del grupo"
      },
      {
        codigo: "APT-06", anio: 1, dificultad: 3,
        texto: "El triplo de la suma de dos números es 63, y el número mayor es 6 veces el menor. Entonces, el número mayor es",
        opciones: [
          { texto: "9", correcta: false },
          { texto: "18", correcta: true },
          { texto: "27", correcta: false },
          { texto: "42", correcta: false }
        ],
        articulo: "Art. 9, lit. d · Razonamiento matemático"
      }
    ],

    psicotecnica: [
      {
        codigo: "PSI-01", anio: 1, dificultad: 1,
        texto: "Durante una reunión de docentes, un compañero critica públicamente una de tus estrategias de enseñanza. ¿Cómo reaccionarías?",
        opciones: [
          { texto: "Escucharía su opinión y analizaría si sus observaciones pueden ayudarme a mejorar.", correcta: true },
          { texto: "Le explicaría por qué considero que mi estrategia es correcta, sin cambiar mi decisión.", correcta: false },
          { texto: "Ignoraría sus comentarios y evitaría trabajar con él en futuras actividades.", correcta: false }
        ],
        articulo: "Art. 39 · Respeto y comunicación entre colegas"
      },
      {
        codigo: "PSI-02", anio: 1, dificultad: 1,
        texto: "Usted percibe que una estudiante es introvertida y su actitud la aísla del resto de sus compañeros. ¿Qué estrategia emplearía para facilitarle la integración al grupo?",
        opciones: [
          { texto: "Aumentaría la frecuencia de actividades en las que los estudiantes expongan y trabajen en grupo.", correcta: true },
          { texto: "Persuadiría a la estudiante para que participe en el grupo de teatro del colegio.", correcta: false },
          { texto: "La designaría como líder de un pequeño grupo de trabajo, de acuerdo con sus fortalezas académicas.", correcta: false }
        ],
        articulo: "Art. 34 · Relaciones dentro del grupo"
      },
      {
        codigo: "PSI-03", anio: 1, dificultad: 2,
        texto: "En el salón de clases hay un estudiante con bajo rendimiento, y cada vez que pregunta o solicita una explicación es ridiculizado por un grupo de estudiantes. ¿Cómo le haría saber a este grupo que su comportamiento es inadecuado?",
        opciones: [
          { texto: "Explicaría que esta es una falta que se sanciona de acuerdo con el Manual de convivencia.", correcta: false },
          { texto: "Le llamaría la atención al grupo de estudiantes frente a la clase y le exigiría que se excusara ante su compañero.", correcta: false },
          { texto: "Preguntaría frente a la clase, ¿cómo se sentirían ustedes si fueran ridiculizados?", correcta: true }
        ],
        articulo: "Art. 39 · Dignidad y respeto del estudiante"
      },
      {
        codigo: "PSI-04", anio: 1, dificultad: 2,
        texto: "Los estudiantes de grado 11.º deben presentar por parejas un proyecto de investigación escolar como requisito de grado. Si usted es el encargado de guiarlos en este proceso, ¿qué estrategia usaría para supervisar el trabajo de los estudiantes?",
        opciones: [
          { texto: "Organizaría un cronograma con tiempos y tareas específicos.", correcta: false },
          { texto: "Programaría tutorías para revisar los avances del proyecto.", correcta: true },
          { texto: "Tomaría tiempo de mi clase para monitorearlos.", correcta: false }
        ],
        articulo: "Art. 34 · Seguimiento pedagógico"
      },
      {
        codigo: "PSI-05", anio: 1, dificultad: 3,
        texto: "Usted nota que en la institución educativa se presentan agresiones verbales entre grupos de estudiantes que pertenecen a barras de diferentes equipos de fútbol. En este contexto, ¿qué actividad consideraría pertinente para propiciar la sana convivencia entre los estudiantes?",
        opciones: [
          { texto: "Prohibir el uso de objetos afines a equipos de fútbol y obligaría a ocultar tatuajes relacionados con favoritismos deportivos para evitar señalamientos.", correcta: false },
          { texto: "Organizar un partido con estudiantes hinchas de distintos equipos y fomentaría su integración asignándolos a un mismo equipo.", correcta: true },
          { texto: "Emplear el tiempo de algunas clases para ver partidos de los equipos de fútbol, siempre y cuando los estudiantes se abstengan de emitir agresiones verbales.", correcta: false }
        ],
        articulo: "Art. 39 · Respeto y convivencia"
      },
      {
        codigo: "PSI-06", anio: 1, dificultad: 3,
        texto: "El colegio ofrece proyectos para el manejo del tiempo libre con énfasis en música, danzas y artes. Los docentes deben realizar la distribución de los estudiantes para cada énfasis. ¿Qué propuesta haría para efectuar esa distribución?",
        opciones: [
          { texto: "Nombrar a dos estudiantes por curso, con quienes tomaría decisiones respecto a la distribución de sus compañeros y luego publicaría las listas.", correcta: false },
          { texto: "Presentar una muestra de lo producido en cada énfasis con docentes y estudiantes vinculados, para que los estudiantes se inscriban de acuerdo con sus intereses.", correcta: true },
          { texto: "Realizar audiciones con coordinación para evaluar las habilidades de los estudiantes y a partir de ello construiría el listado de cada énfasis.", correcta: false }
        ],
        articulo: "Art. 40 · Práctica centrada en los estudiantes"
      }
    ],

    entrevista: [
      {
        codigo: "ENT-01", anio: 1, dificultad: 1,
        texto: "Durante la entrevista, uno de los evaluadores te pregunta: ¿Cuál consideras que es el principal propósito de un docente dentro de la sociedad?",
        opciones: [
          { texto: "Transmitir conocimientos y garantizar que los estudiantes obtengan buenos resultados académicos.", correcta: false },
          { texto: "Contribuir a la formación integral de los estudiantes, promoviendo el aprendizaje y su desarrollo como personas.", correcta: true },
          { texto: "Mantener el orden en el aula y asegurar que los estudiantes cumplan las normas establecidas.", correcta: false }
        ],
        articulo: "Art. 40 · Sentido de la profesión docente"
      },
      {
        codigo: "ENT-02", anio: 1, dificultad: 1,
        texto: "El entrevistador te pregunta cómo actuarías si descubrieras que tus métodos de enseñanza no están dando los resultados esperados. ¿Qué responderías?",
        opciones: [
          { texto: "Mantendría mi metodología, pues considero que los estudiantes deben adaptarse a las exigencias del docente.", correcta: false },
          { texto: "Revisaría los resultados y buscaría nuevas estrategias para mejorar el aprendizaje de mis estudiantes.", correcta: true },
          { texto: "Consultaría con otros docentes para conocer sus experiencias y aplicar alguna de sus metodologías.", correcta: false }
        ],
        articulo: "Art. 34 · Mejora de las estrategias de enseñanza"
      },
      {
        codigo: "ENT-03", anio: 1, dificultad: 2,
        texto: "Durante la entrevista, te preguntan cómo contribuirías a una institución educativa que recibe estudiantes con diferentes condiciones sociales, culturales y económicas. ¿Cuál sería tu respuesta?",
        opciones: [
          { texto: "Aplicaría las mismas estrategias y exigencias para todos, garantizando que reciban una educación igualitaria.", correcta: false },
          { texto: "Buscaría conocer las características de los estudiantes y adaptaría mis estrategias para favorecer su participación y aprendizaje.", correcta: true },
          { texto: "Me concentraría en los estudiantes que tengan mejores condiciones para alcanzar los objetivos académicos de la institución.", correcta: false }
        ],
        articulo: "Art. 40 · Compromiso con los contextos socioculturales"
      },
      {
        codigo: "ENT-04", anio: 1, dificultad: 2,
        texto: "Situación de una docente. Algunos estudiantes manifiestan preocupación por una docente que presenta cambios en su comportamiento, posibles señales de maltrato físico y dificultades en el desarrollo de sus clases. ¿Cuál debería ser su primera actuación ante esta situación?",
        opciones: [
          { texto: "Informar a las directivas sobre la situación para que determinen las medidas institucionales correspondientes.", correcta: false },
          { texto: "Escuchar a los estudiantes, valorar la situación y buscar un acercamiento confidencial con la docente.", correcta: true },
          { texto: "Citar a los familiares de la docente para conocer posibles situaciones personales que expliquen su comportamiento.", correcta: false },
          { texto: "Realizar una observación de las clases para determinar si las dificultades pedagógicas están relacionadas con su situación personal.", correcta: false }
        ],
        articulo: "Art. 39 · Dignidad y solidaridad con una colega"
      },
      {
        codigo: "ENT-05", anio: 1, dificultad: 3,
        texto: "Situación de intoxicación escolar. Después del descanso, varios estudiantes presentan síntomas de intoxicación. Al indagar, usted descubre que algunos consumieron brownies que un compañero llevó al colegio y que, al parecer, contienen marihuana. ¿Cuál debería ser su actuación ante esta situación?",
        opciones: [
          { texto: "Informar a las directivas sobre la situación y esperar sus indicaciones antes de intervenir.", correcta: false },
          { texto: "Atender la situación de los estudiantes afectados y comunicar lo sucedido a las directivas.", correcta: true },
          { texto: "Dialogar con el estudiante que llevó los brownies para conocer el origen de la sustancia.", correcta: false },
          { texto: "Reunir al grupo para reflexionar sobre los riesgos del consumo de sustancias psicoactivas.", correcta: false }
        ],
        articulo: "Art. 39 y art. 40 · Responsabilidad y cuidado del estudiante"
      },
      {
        codigo: "ENT-06", anio: 1, dificultad: 3,
        texto: "¿Qué lo motiva a querer desempeñarse como docente?",
        opciones: [
          { texto: "La estabilidad laboral y la posibilidad de obtener mejores condiciones económicas a través de la carrera docente", correcta: false },
          { texto: "La posibilidad de contribuir a la formación integral de los estudiantes, promoviendo valores, pensamiento crítico y compromiso social.", correcta: true },
          { texto: "El interés por transmitir los conocimientos adquiridos durante mi formación académica y cumplir con los contenidos establecidos en el currículo.", correcta: false }
        ]
      }
    ],

    // SITUACIONES DEL COLEGIO: una por año, según el cargo (docente, coordinador o rector).
    // La correcta sube el desempeño y la popularidad; las demás los bajan.
    colegio: [
      {
        codigo: "COL-D-1-01", cargo: "Docente", anio: 1, dificultad: 1,
        texto: "Usted ha observado que en uno de sus grupos se presentan constantemente discusiones entre estudiantes. A pesar de haber llamado la atención en varias ocasiones, la situación continúa afectando el desarrollo de las clases. ¿Cómo debería proceder?",
        opciones: [
          { texto: "Aplicar las mismas medidas disciplinarias a todos los estudiantes involucrados, sin revisar las circunstancias de cada situación.", correcta: false, efectos: { desempeno: -6, popularidad: -3 } },
          { texto: "Identificar las causas de los conflictos y aplicar estrategias que permitan mejorar las relaciones y la convivencia del grupo.", correcta: true, efectos: { desempeno: 8, popularidad: 4 } },
          { texto: "Evitar intervenir para no interrumpir el desarrollo de los contenidos académicos.", correcta: false, efectos: { desempeno: -6, popularidad: -3 } }
        ],
        articulo: "Art. 34 · Manejo de las relaciones del grupo"
      },
      {
        codigo: "COL-D-2-01", cargo: "Docente", anio: 2, dificultad: 1,
        texto: "En su institución se ha implementado una plataforma digital para apoyar las actividades académicas. Usted tiene dificultades para utilizarla y algunos estudiantes han manifestado problemas con las actividades asignadas. ¿Cómo debería actuar?",
        opciones: [
          { texto: "Continuar utilizando únicamente los métodos anteriores y evitar la plataforma.", correcta: false, efectos: { desempeno: -6, popularidad: -3 } },
          { texto: "Buscar orientación y participar en actividades de capacitación que le permitan aprender a utilizar adecuadamente la herramienta.", correcta: true, efectos: { desempeno: 8, popularidad: 4 } },
          { texto: "Dejar que los estudiantes se encarguen de resolver los problemas de la plataforma.", correcta: false, efectos: { desempeno: -6, popularidad: -3 } }
        ],
        articulo: "Art. 38 · Formación y actualización profesional"
      },
      {
        codigo: "COL-D-3-01", cargo: "Docente", anio: 3, dificultad: 1,
        texto: "Al finalizar el año escolar, usted lleva cuatro meses trabajando en la institución. Sin embargo, todavía no ha recibido información sobre su evaluación de desempeño. Un compañero le comenta que únicamente deben evaluar a quienes llevan más de seis meses trabajando en el colegio. ¿Qué debería hacer?",
        opciones: [
          { texto: "Esperar hasta cumplir seis meses, pues ese es el tiempo mínimo exigido.", correcta: false, efectos: { desempeno: -6, popularidad: -3 } },
          { texto: "Consultar el procedimiento de evaluación, teniendo en cuenta que el estatuto contempla la evaluación de quienes hayan servido en el establecimiento por un término superior a tres meses durante el año académico.", correcta: true, efectos: { desempeno: 8, popularidad: 4 } },
          { texto: "Solicitar que lo excluyan de la evaluación, pues no ha trabajado durante todo el año escolar.", correcta: false, efectos: { desempeno: -6, popularidad: -3 } }
        ],
        articulo: "Art. 32 · Tiempo mínimo para la evaluación anual de desempeño"
      },
      {
        codigo: "COL-D-4-01", cargo: "Docente", anio: 4, dificultad: 1,
        texto: "Al revisar los resultados del período, usted descubre que una parte considerable de sus estudiantes no alcanzó los objetivos de aprendizaje establecidos. El rector le solicita analizar la situación y proponer acciones para mejorar los resultados. ¿Qué debería hacer?",
        opciones: [
          { texto: "Revisar los resultados, identificar las dificultades y establecer estrategias de mejoramiento para sus estudiantes.", correcta: true, efectos: { desempeno: 8, popularidad: 4 } },
          { texto: "Atribuir los resultados exclusivamente a la falta de compromiso de los estudiantes.", correcta: false, efectos: { desempeno: -6, popularidad: -3 } },
          { texto: "Mantener la planeación sin modificaciones, pues considera que los contenidos ya fueron explicados.", correcta: false, efectos: { desempeno: -6, popularidad: -3 } }
        ],
        articulo: "Art. 30 y art. 34 · Resultados y mejoramiento del desempeño docente"
      },
      {
        codigo: "COL-D-5-01", cargo: "Docente", anio: 5, dificultad: 1,
        texto: "En una reunión institucional se informa que se elegirá un representante de los docentes para participar en uno de los órganos del gobierno escolar. Algunos compañeros le sugieren no involucrarse porque consideran que estas actividades no hacen parte de las responsabilidades de un profesor. ¿Qué debería hacer?",
        opciones: [
          { texto: "Participar en el proceso de elección o postularse como representante si está interesado.", correcta: true, efectos: { desempeno: 8, popularidad: 4 } },
          { texto: "Evitar involucrarse, ya que las decisiones institucionales corresponden exclusivamente al rector.", correcta: false, efectos: { desempeno: -6, popularidad: -3 } },
          { texto: "Participar únicamente si recibe una compensación económica por asumir esa responsabilidad.", correcta: false, efectos: { desempeno: -6, popularidad: -3 } }
        ],
        articulo: "Art. 37, lit. d · Participación en el gobierno escolar"
      },
      {
        codigo: "COL-C-2-01", cargo: "Coordinador", anio: 2, dificultad: 1,
        texto: "Al revisar los resultados institucionales, usted observa que varios grupos presentan dificultades en sus procesos académicos y que los índices de promoción han disminuido. El rector le solicita colaborar en la revisión de la situación y en la búsqueda de alternativas de mejoramiento. ¿Qué debería hacer?",
        opciones: [
          { texto: "Considerar que los resultados académicos son responsabilidad exclusiva de los docentes y no involucrarse.", correcta: false, efectos: { desempeno: -6, popularidad: -3 } },
          { texto: "Analizar la información disponible y colaborar en la identificación de estrategias que permitan mejorar los resultados institucionales.", correcta: true, efectos: { desempeno: 8, popularidad: 4 } },
          { texto: "Modificar los registros de promoción para mejorar los indicadores de la institución.", correcta: false, efectos: { desempeno: -6, popularidad: -3 } }
        ],
        articulo: "Art. 34, par. · Organización y eficiencia en la gestión directiva"
      },
      {
        codigo: "COL-C-3-01", cargo: "Coordinador", anio: 3, dificultad: 1,
        texto: "El rector está realizando la evaluación anual de desempeño de los docentes y le solicita información sobre uno de ellos. Durante el año, usted ha observado que el profesor cumple adecuadamente con sus clases, pero también ha recibido reportes sobre algunas dificultades en la organización de sus actividades institucionales. ¿Cómo debería actuar?",
        opciones: [
          { texto: "Compartir la información que conoce, procurando que sea objetiva y que incluya tanto los aspectos positivos como las dificultades observadas.", correcta: true, efectos: { desempeno: 8, popularidad: 4 } },
          { texto: "Informar únicamente sobre las dificultades para que el rector tenga razones suficientes para asignar una calificación baja.", correcta: false, efectos: { desempeno: -6, popularidad: -3 } },
          { texto: "Negarse a colaborar, pues considera que no tiene ninguna responsabilidad en los procesos de evaluación.", correcta: false, efectos: { desempeno: -6, popularidad: -3 } }
        ],
        articulo: "Art. 26 · Apoyo de los superiores en la evaluación permanente"
      },
      {
        codigo: "COL-C-4-01", cargo: "Coordinador", anio: 4, dificultad: 1,
        texto: "Durante la organización de las actividades académicas de la institución, usted descubre que varias actividades programadas por diferentes áreas se realizarán al mismo tiempo y que algunos grupos tendrán dificultades para participar en todas ellas. ¿Cómo debería proceder?",
        opciones: [
          { texto: "Reunirse con los docentes responsables, revisar la programación y coordinar los ajustes necesarios para evitar cruces entre las actividades.", correcta: true, efectos: { desempeno: 8, popularidad: 4 } },
          { texto: "Modificar unilateralmente los horarios y comunicar los cambios una vez estén establecidos.", correcta: false, efectos: { desempeno: -6, popularidad: -3 } },
          { texto: "Permitir que cada área resuelva los inconvenientes por su cuenta, pues la organización de sus actividades es responsabilidad de los docentes.", correcta: false, efectos: { desempeno: -6, popularidad: -3 } }
        ]
      },
      {
        codigo: "COL-C-5-01", cargo: "Coordinador", anio: 5, dificultad: 1,
        texto: "Durante el seguimiento a las actividades institucionales, usted observa que algunos docentes no están cumpliendo los acuerdos establecidos en las reuniones de área. Esta situación está generando diferencias en la manera de desarrollar las actividades con los estudiantes. ¿Qué debería hacer?",
        opciones: [
          { texto: "Informar inmediatamente al rector y dejar que él se encargue de resolver la situación.", correcta: false, efectos: { desempeno: -6, popularidad: -3 } },
          { texto: "Dialogar con los docentes, recordar los acuerdos establecidos e identificar las dificultades que están impidiendo su cumplimiento. Posteriormente, realizar seguimiento a los compromisos.", correcta: true, efectos: { desempeno: 8, popularidad: 4 } },
          { texto: "Permitir que cada docente trabaje según su propio criterio, aunque esto implique apartarse de los acuerdos institucionales.", correcta: false, efectos: { desempeno: -6, popularidad: -3 } }
        ]
      },
      {
        codigo: "COL-R-3-01", cargo: "Rector", anio: 3, dificultad: 1,
        texto: "Al iniciar el período académico, usted establece una nueva organización de los horarios para mejorar el desarrollo de las actividades escolares. Sin embargo, varios docentes manifiestan su inconformidad y se niegan a cumplir el nuevo horario. ¿Cómo debería proceder?",
        opciones: [
          { texto: "Mantener la decisión sin escuchar las observaciones de los docentes, pues la organización de los horarios es responsabilidad exclusiva de la rectoría.", correcta: false, efectos: { desempeno: -6, popularidad: -3 } },
          { texto: "Escuchar las inquietudes de los docentes, explicar las razones de la reorganización y revisar si es necesario realizar ajustes que no afecten el funcionamiento institucional.", correcta: true, efectos: { desempeno: 8, popularidad: 4 } },
          { texto: "Retirar la propuesta y permitir que cada docente organice libremente sus horarios.", correcta: false, efectos: { desempeno: -6, popularidad: -3 } }
        ],
        articulo: "Art. 34, par. · Liderazgo y resultados en la evaluación directiva"
      },
      {
        codigo: "COL-R-4-01", cargo: "Rector", anio: 4, dificultad: 1,
        texto: "Durante una revisión de los recursos institucionales, usted descubre que algunos docentes están utilizando equipos y materiales del colegio para actividades personales que no tienen relación con sus funciones. ¿Qué debería hacer?",
        opciones: [
          { texto: "Recordar las normas sobre el uso de los recursos institucionales, establecer medidas de seguimiento y garantizar que estos se destinen a las actividades propias del colegio.", correcta: true, efectos: { desempeno: 8, popularidad: 4 } },
          { texto: "Permitir que continúen utilizándolos, siempre que los devuelvan en buen estado.", correcta: false, efectos: { desempeno: -6, popularidad: -3 } },
          { texto: "Prohibir temporalmente el uso de todos los recursos institucionales para evitar que se repita la situación.", correcta: false, efectos: { desempeno: -6, popularidad: -3 } }
        ]
      },
      {
        codigo: "COL-R-5-01", cargo: "Rector", anio: 5, dificultad: 1,
        texto: "La institución está organizando una salida pedagógica para varios grupos. Durante la planeación, usted descubre que algunos estudiantes no podrán participar debido a las condiciones económicas de sus familias. ¿Qué debería hacer?",
        opciones: [
          { texto: "Buscar alternativas para que todos los estudiantes puedan participar, gestionando los apoyos necesarios y procurando que las condiciones económicas no se conviertan en un impedimento.", correcta: true, efectos: { desempeno: 8, popularidad: 4 } },
          { texto: "Mantener la actividad tal como fue planeada, pues la participación depende de las posibilidades de cada familia.", correcta: false, efectos: { desempeno: -6, popularidad: -3 } },
          { texto: "Cancelar la salida pedagógica para evitar diferencias entre los estudiantes.", correcta: false, efectos: { desempeno: -6, popularidad: -3 } }
        ],
        articulo: "Art. 40 · Educación como bien público y práctica centrada en estudiantes"
      }
    ],

    // SITUACIONES INESPERADAS (cartas): dos por año, según el cargo. No hay respuesta correcta:
    // cada decisión tiene sus efectos. La que va con el estatuto sube el desempeño (+6) y baja un poco
    // la popularidad (−2); la cómoda o popular sube la popularidad (+4) y baja el desempeño (−6).
    cartas: [
      {
        codigo: "CAR-D-1-01", cargo: "Docente", anio: 1, dificultad: 1,
        texto: "Un directivo amigo suyo le comenta que un docente de la institución está próximo a retirarse definitivamente y le ofrece ocupar su cargo mediante un encargo. Sin embargo, usted sabe que existe una lista vigente de elegibles para esa vacante. ¿Qué decide hacer?",
        opciones: [
          { texto: "Aceptar la propuesta de su amigo y asumir el cargo.", efectos: { desempeno: -6, popularidad: 4 } },
          { texto: "Rechazar la propuesta y solicitar que se respete el proceso de selección establecido.", efectos: { desempeno: 6, popularidad: -2 } }
        ],
        articulo: "Art. 14 y art. 15 · Encargo con lista de elegibles vigente"
      },
      {
        codigo: "CAR-D-1-02", cargo: "Docente", anio: 1, dificultad: 1,
        texto: "Suponga que una estudiante, visiblemente afectada, acusa a un colega suyo de acosarla mediante medios digitales. Como evidencia, presenta capturas de pantalla de conversaciones de WhatsApp. Sin embargo, existen sospechas de que dichas imágenes pudieron ser manipuladas mediante herramientas de inteligencia artificial. ¿Cómo actuaría ante esta situación?",
        opciones: [
          { texto: "Hacer pública la acusación y las capturas de pantalla para alertar a la comunidad educativa y prevenir posibles situaciones similares.", efectos: { popularidad: 4, desempeno: -6 } },
          { texto: "Remitir el caso a las directivas para evaluar las evidencias y determinar las acciones correspondientes.", efectos: { popularidad: -2, desempeno: 6 } }
        ]
      },
      {
        codigo: "CAR-D-2-01", cargo: "Docente", anio: 2, dificultad: 1,
        texto: "Usted observa que algunos compañeros llegan tarde con frecuencia y omiten explicar ciertos temas del programa académico, afectando la formación de los estudiantes. Además, nota que estas prácticas comienzan a normalizarse entre el personal docente. ¿Qué decide hacer?",
        opciones: [
          { texto: "Aprovechar la situación y \"relajarse\", total no habrá consecuencias.", efectos: { desempeno: -6, popularidad: 4 } },
          { texto: "Mantener el cumplimiento de sus responsabilidades y comunicar la situación a las directivas para que se tomen las medidas correspondientes.", efectos: { desempeno: 6, popularidad: -2 } }
        ],
        articulo: "Art. 17 · Primera instancia de una reclamación de carrera",
        explicacion: "Sí hay consecuencias. El artículo 17 explica que la carrera docente se orientará a retener a los servidores más idóneos."
      },
      {
        codigo: "CAR-D-2-02", cargo: "Docente", anio: 2, dificultad: 1,
        texto: "Usted tiene a su cargo un curso de 30 estudiantes. Observa que 20 comprenden los temas con facilidad y están listos para continuar, mientras que los otros 10 requieren explicaciones adicionales. ¿Qué decisión tomaría?",
        opciones: [
          { texto: "Continuar con los nuevos contenidos, priorizando el ritmo de aprendizaje de la mayoría, aunque algunos estudiantes tengan dificultades para seguir las clases.", efectos: { desempeno: -6, popularidad: 4 } },
          { texto: "Dedicar más tiempo a reforzar los temas vistos, procurando que todos puedan comprenderlos, aunque esto implique ralentizar el avance del curso", efectos: { desempeno: 6, popularidad: -2 } }
        ]
      },
      {
        codigo: "CAR-D-3-01", cargo: "Docente", anio: 3, dificultad: 1,
        texto: "La secretaría de educación ofrece una capacitación sobre nuevas metodologías de enseñanza. Sin embargo, considera que su experiencia profesional es suficiente y que participar le quitaría tiempo. ¿Qué decide hacer?",
        opciones: [
          { texto: "Participar en la capacitación para actualizar sus conocimientos y mejorar su práctica docente.", efectos: { formacion: 5, desempeno: 4 } },
          { texto: "Rechazar la capacitación porque considera que puede aprender nuevas metodologías por su cuenta.", efectos: { desempeno: -4 } }
        ],
        articulo: "Art. 38 · Actualización docente"
      },
      {
        codigo: "CAR-D-3-03", cargo: "Docente", anio: 3, dificultad: 2,
        texto: "Un estudiante publica un video en el que usted le grita durante una clase por utilizar lenguaje ofensivo. El video se viraliza y las directivas le solicitan explicaciones. ¿Qué decide hacer?",
        opciones: [
          { texto: "Defender su actuación y justificar el llamado de atención.", efectos: { desempeno: -6, popularidad: -2 } },
          { texto: "Ofrecer disculpas públicamente por la forma en que se dirigió al estudiante.", efectos: { desempeno: 5, popularidad: 2 } }
        ],
        articulo: "Art. 39 · Respeto en el trato al estudiante"
      },
      {
        codigo: "CAR-D-4-01", cargo: "Docente", anio: 4, dificultad: 1,
        texto: "Al finalizar el año escolar, recibe una evaluación de desempeño con una calificación baja. Considera que algunos criterios fueron aplicados incorrectamente y que no se tuvieron en cuenta varias de sus actividades. ¿Qué decide hacer?",
        opciones: [
          { texto: "Presentar un recurso de reposición o apelación para solicitar la revisión de la evaluación.", efectos: { desempeno: 6, popularidad: -2 } },
          { texto: "Aceptar la calificación y esperar hasta la siguiente evaluación para mejorar su desempeño.", efectos: { desempeno: -6, popularidad: 4 } }
        ],
        articulo: "Art. 36, par. · Recursos contra la evaluación de desempeño"
      },
      {
        codigo: "CAR-D-4-02", cargo: "Docente", anio: 4, dificultad: 1,
        texto: "Usted se entera de que algunos directivos de la institución, amigos cercanos suyos, tienen contactos en la Secretaría de Educación que expiden certificados de formación y experiencia de manera irregular. Estos le proponen gestionar documentos similares para que usted pueda acreditar requisitos que le permitan acceder a un ascenso o una mejor reubicación salarial. ¿Qué decide hacer?",
        opciones: [
          { texto: "Aceptar la propuesta, aprovechando los contactos y las facilidades que le ofrecen, considerando que esto representa una oportunidad para mejorar sus condiciones laborales.", efectos: { desempeno: -6, popularidad: 4 } },
          { texto: "Rechazar la propuesta y abstenerse de participar en cualquier trámite que implique presentar documentos o certificaciones que no correspondan a la realidad.", efectos: { desempeno: 6, popularidad: -2 } }
        ],
        articulo: "Art. 21 · Títulos que permiten aspirar a otro grado"
      },
      {
        codigo: "CAR-D-5-01", cargo: "Docente", anio: 5, dificultad: 1,
        texto: "Usted es elegido como representante de los docentes ante uno de los órganos del gobierno escolar. Sin embargo, un directivo considera innecesaria su participación y le pide que no asista a las reuniones. ¿Qué decide hacer?",
        opciones: [
          { texto: "Respetar la decisión del directivo para evitar problemas dentro de la institución.", efectos: { desempeno: -6, popularidad: 4 } },
          { texto: "Defender su derecho a participar en el gobierno escolar como representante de los docentes.", efectos: { desempeno: 6, popularidad: -2 } }
        ],
        articulo: "Art. 37, lit. d · Participación en el gobierno escolar"
      },
      {
        codigo: "CAR-D-5-02", cargo: "Docente", anio: 5, dificultad: 1,
        texto: "Una compañera docente obliga a un estudiante con sobrepeso a recibir clases sentado en el suelo. Usted presencia lo sucedido. ¿Qué decide hacer?",
        opciones: [
          { texto: "Denunciar la actuación de su compañera ante las directivas.", efectos: { desempeno: 6, popularidad: -2 } },
          { texto: "Hablar directamente con ella para resolver el problema sin involucrar a las directivas.", efectos: { desempeno: -6, popularidad: 4 } }
        ],
        articulo: "Art. 39 · Dignidad y respeto"
      },
      {
        codigo: "CAR-D-5-03", cargo: "Docente", anio: 5, dificultad: 2,
        texto: "Un compañero le pide modificar las calificaciones de algunos estudiantes para evitar problemas con los padres de familia. Le asegura que nadie descubrirá el cambio. ¿Qué decide hacer?",
        opciones: [
          { texto: "Negarse a modificar las calificaciones y mantener los resultados obtenidos por los estudiantes.", efectos: { desempeno: 6, popularidad: -2 } },
          { texto: "Aceptar modificar algunas calificaciones para evitar conflictos con las familias.", efectos: { desempeno: -6, popularidad: 4 } }
        ],
        articulo: "Art. 39 · Honestidad y transparencia en las calificaciones"
      },
      {
        codigo: "CAR-D-5-04", cargo: "Docente", anio: 5, dificultad: 2,
        texto: "La rectora establece normas estrictas sobre el aspecto personal de los estudiantes, prohibiendo el cabello largo, los piercings y los tintes. Usted considera que algunas medidas afectan la libre expresión de los jóvenes. ¿Qué decide hacer?",
        opciones: [
          { texto: "Apoyar las normas establecidas por la rectoría.", efectos: { desempeno: -6, popularidad: 4 } },
          { texto: "Manifestar su desacuerdo y defender la libre expresión de los estudiantes.", efectos: { desempeno: 6, popularidad: -2 } }
        ],
        articulo: "Art. 39 · Dignidad y respeto de derechos"
      },
      {
        codigo: "CAR-D-5-05", cargo: "Docente", anio: 5, dificultad: 3,
        texto: "Un compañero docente le confiesa que mantiene acercamientos románticos con algunas de sus alumnas, quienes también han manifestado interés por él. Le pide que no revele esta situación. ¿Qué decide hacer?",
        opciones: [
          { texto: "Informar de la situación a las directivas del colegio.", efectos: { desempeno: 6, popularidad: -2 } },
          { texto: "Guardar silencio y dejar pasar la situación.", efectos: { desempeno: -6, popularidad: 4 } }
        ],
        articulo: "Art. 39 y art. 40 · Dignidad e idoneidad moral"
      },
      {
        codigo: "CAR-D-5-06", cargo: "Docente", anio: 5, dificultad: 3,
        texto: "Durante una clase, usted aborda las manifestaciones sociales del país y expone su posición frente a ellas. Un padre de familia lo acusa de adoctrinar a sus estudiantes y exige explicaciones al colegio. ¿Qué decide hacer?",
        opciones: [
          { texto: "Defender la libertad de abordar temas sociales y políticos en clase.", efectos: { desempeno: 4, popularidad: -4 } },
          { texto: "Evitar tratar temas políticos para prevenir nuevos conflictos.", efectos: { desempeno: -3, popularidad: 4 } }
        ],
        articulo: "Art. 40 · Práctica docente y contexto sociocultural"
      },
      {
        codigo: "CAR-C-2-01", cargo: "Coordinador", anio: 2, dificultad: 1,
        texto: "Usted es el coordinador de una institución educativa y participa en el proceso de evaluación del desempeño docente. Uno de los profesores, amigo cercano de su familia, ha presentado incumplimientos recurrentes, como llegar tarde y no desarrollar algunos contenidos del programa. Su desempeño ha sido insatisfactorio y lo excluiría del escalafón docente. El profesor le pide que intervenga para evitar recibir una calificación insatisfactoria debido a su relación personal. ¿Qué decide hacer?",
        opciones: [
          { texto: "Interceder ante el rector para que se le asigne una calificación favorable, teniendo en cuenta su relación personal y las posibles consecuencias laborales.", efectos: { desempeno: -6, popularidad: 4 } },
          { texto: "Presentar un informe objetivo sobre el desempeño del docente, sustentado en las evidencias disponibles, dejando que la evaluación siga los procedimientos institucionales.", efectos: { desempeno: 6, popularidad: -2 } }
        ],
        articulo: "Art. 24 · Causales de exclusión del escalafón"
      },
      {
        codigo: "CAR-C-2-02", cargo: "Coordinador", anio: 2, dificultad: 1,
        texto: "Un docente que anteriormente fue retirado del cargo de coordinador por bajo rendimiento solicita participar en el proceso para ocupar una nueva vacante. Argumenta que su experiencia previa le permite desempeñar nuevamente esa función. Usted debe decidir entre:",
        opciones: [
          { texto: "Respaldar su aspiración ante la Secretaría de Educación, destacando su experiencia y los aprendizajes obtenidos.", efectos: { desempeno: -6, popularidad: 4 } },
          { texto: "Abstenerse de intervenir en su postulación, dado que no es elegible para el cargo.", efectos: { desempeno: 6, popularidad: -2 } }
        ],
        articulo: "Art. 25 · Reingreso por concurso tras la exclusión"
      },
      {
        codigo: "CAR-C-3-01", cargo: "Coordinador", anio: 3, dificultad: 1,
        texto: "El rector le solicita observar una clase de un docente para aportar información sobre su desempeño. Sin embargo, el docente es un amigo cercano y le pide que informe únicamente aspectos positivos de su trabajo. ¿Qué decide hacer?",
        opciones: [
          { texto: "Realizar la observación con objetividad y entregar información basada en lo que realmente evidenció.", efectos: { desempeno: 6, popularidad: -2 } },
          { texto: "Resaltar principalmente los aspectos positivos para evitar perjudicar a su compañero.", efectos: { desempeno: -6, popularidad: 4 } }
        ],
        articulo: "Art. 29, lit. a, y art. 33 · Objetividad y observación de clase"
      },
      {
        codigo: "CAR-C-3-03", cargo: "Coordinador", anio: 3, dificultad: 2,
        texto: "Durante el acompañamiento a los docentes, identifica que uno de ellos presenta dificultades para manejar su grupo. El docente reconoce el problema, pero manifiesta que no sabe cómo solucionarlo. ¿Qué decide hacer?",
        opciones: [
          { texto: "Recomendarle estrategias de mejoramiento y promover su participación en actividades de capacitación.", efectos: { desempeno: 6, popularidad: -2 } },
          { texto: "Informar al rector sobre las dificultades y esperar que él determine qué medidas tomar.", efectos: { desempeno: -6, popularidad: 4 } }
        ],
        articulo: "Art. 28, lits. a y c, y art. 38 · Mejora y capacitación"
      },
      {
        codigo: "CAR-C-3-05", cargo: "Coordinador", anio: 3, dificultad: 3,
        texto: "El rector le solicita aportar información sobre el desempeño de un docente con quien mantiene una buena relación. El docente le pide que destaque únicamente sus aspectos positivos, aunque usted sabe que algunos aspectos de su trabajo necesitan mejorar. ¿Qué decide hacer?",
        opciones: [
          { texto: "Entregar una valoración objetiva, basada en las evidencias de su trabajo, aunque pueda afectar la relación con su compañero.", efectos: { desempeno: 6, popularidad: -2 } },
          { texto: "Destacar principalmente los aspectos positivos porque considera que también deben reconocerse sus esfuerzos.", efectos: { desempeno: -6, popularidad: 4 } }
        ],
        articulo: "Art. 26, art. 29, lit. a, y art. 33 · Aporte objetivo de evidencias"
      },
      {
        codigo: "CAR-C-4-01", cargo: "Coordinador", anio: 4, dificultad: 1,
        texto: "La institución participará en un concurso intercolegial que exige proyectos sostenibles representativos de su contexto cultural. Algunos docentes proponen seleccionar únicamente estudiantes con alto rendimiento académico para garantizar la calidad del proyecto, mientras otros defienden la participación de todos los interesados.",
        opciones: [
          { texto: "Seleccionar estudiantes destacados y delegarles la formulación del proyecto.", efectos: { desempeno: -6, popularidad: 4 } },
          { texto: "Promover espacios de participación para construir colectivamente el proyecto y distribuir responsabilidades.", efectos: { desempeno: 6, popularidad: -2 } }
        ],
        articulo: "Art. 35 · Liderazgo y dirección como competencias directivas"
      },
      {
        codigo: "CAR-C-4-02", cargo: "Coordinador", anio: 4, dificultad: 1,
        texto: "Un grupo de estudiantes organiza una manifestación para expresar su inconformidad frente a cambios administrativos y académicos implementados por la rectoría. La protesta afecta el desarrollo de las clases y algunos docentes solicitan la intervención del coordinador. Ante esta situación, usted debe decidir entre:",
        opciones: [
          { texto: "Intervenir para restablecer las actividades académicas, solicitando a los estudiantes suspender la manifestación y utilizar los mecanismos institucionales para presentar sus inconformidades.", efectos: { desempeno: 6, popularidad: -2 } },
          { texto: "Respetar la manifestación pacífica de los estudiantes, reconociendo su derecho a expresar libremente sus inconformidades.", efectos: { popularidad: 4, desempeno: -6 } }
        ]
      },
      {
        codigo: "CAR-C-5-01", cargo: "Coordinador", anio: 5, dificultad: 1,
        texto: "Después de varios años como coordinador, recibe una propuesta para ocupar el cargo de rector sin participar en un concurso. Le aseguran que su experiencia es suficiente para asumir la responsabilidad. ¿Qué decide hacer?",
        opciones: [
          { texto: "Aceptar el cargo porque ya cuenta con experiencia en funciones directivas.", efectos: { desempeno: -6, popularidad: 4 } },
          { texto: "Solicitar que se respete el procedimiento de selección y participar en el concurso correspondiente si cumple los requisitos.", efectos: { desempeno: 6, popularidad: -2 } }
        ],
        articulo: "Art. 8 y art. 10, lit. c · Concurso y requisitos para rector"
      },
      {
        codigo: "CAR-C-5-02", cargo: "Coordinador", anio: 5, dificultad: 1,
        texto: "Un docente falta reiteradamente a sus clases sin presentar justificación. Ante esta situación, el coordinador decide imponerle una sanción económica equivalente a dos salarios mínimos legales mensuales vigentes. Esta actuación es:",
        opciones: [
          { texto: "Correcta, pues las ausencias injustificadas deben ser sancionadas.", efectos: { desempeno: -6, popularidad: 4 } },
          { texto: "Incorrecta, se está extralimitando en sus funciones.", efectos: { desempeno: 6, popularidad: -2 } }
        ]
      },
      {
        codigo: "CAR-R-3-01", cargo: "Rector", anio: 3, dificultad: 1,
        texto: "Al finalizar el año escolar, descubre que varios docentes todavía no han sido evaluados. Algunos llevan más de tres meses trabajando en la institución y usted considera que realizar todas las evaluaciones tomará demasiado tiempo. ¿Qué decide hacer?",
        opciones: [
          { texto: "Realizar las evaluaciones correspondientes antes de finalizar el proceso académico.", efectos: { desempeno: 6, popularidad: -2 } },
          { texto: "Evaluar únicamente a los docentes que considera más importantes para el funcionamiento de la institución.", efectos: { desempeno: -6, popularidad: 4 } }
        ],
        articulo: "Art. 32 · Evaluación anual y tiempo mínimo servido"
      },
      {
        codigo: "CAR-R-3-03", cargo: "Rector", anio: 3, dificultad: 2,
        texto: "Durante la evaluación de desempeño de un docente, recibe comentarios positivos de varios padres de familia. Sin embargo, las observaciones de clase y los resultados de sus estudiantes muestran algunas dificultades importantes. ¿Qué decide hacer?",
        opciones: [
          { texto: "Asignar una calificación favorable porque la mayoría de los padres está satisfecha con el docente.", efectos: { desempeno: -6, popularidad: 4 } },
          { texto: "Considerar diferentes instrumentos y evidencias para realizar una evaluación objetiva.", efectos: { desempeno: 6, popularidad: -2 } }
        ],
        articulo: "Art. 29 y art. 33 · Objetividad y uso de varias evidencias"
      },
      {
        codigo: "CAR-R-3-05", cargo: "Rector", anio: 3, dificultad: 3,
        texto: "Al finalizar el año, la institución presenta bajos resultados académicos y un aumento en la deserción escolar. Usted considera que estos resultados no reflejan todo el trabajo realizado durante su gestión. ¿Qué decide hacer?",
        opciones: [
          { texto: "Presentar evidencias de su gestión, incluyendo las acciones de liderazgo, organización y mejoramiento institucional, junto con los resultados obtenidos.", efectos: { desempeno: 6, popularidad: -2 } },
          { texto: "Justificar los resultados negativos argumentando que el rendimiento académico depende principalmente del trabajo de los docentes.", efectos: { desempeno: -6, popularidad: 4 } }
        ],
        articulo: "Art. 34, par. · Liderazgo, retención y resultados"
      },
      {
        codigo: "CAR-R-4-01", cargo: "Rector", anio: 4, dificultad: 1,
        texto: "Casualmente, usted observa a una persona aparentemente en situación de vulnerabilidad que ingresó a la institución con un supuesto permiso del rector. Esta persona recorre los salones contando una historia personal y solicitando contribuciones económicas a los estudiantes. Tiempo después, la encuentra realizando la misma actividad en otra institución educativa. Como coordinador, usted debe decidir entre:",
        opciones: [
          { texto: "Confrontar a la persona y cuestionar su actuación, manifestándole su preocupación por la utilización de los estudiantes para obtener beneficios económicos.", efectos: { desempeno: 6, popularidad: -2 } },
          { texto: "Abstenerse de involucrarse, evitando generar problemas.", efectos: { desempeno: -6, popularidad: 4 } }
        ]
      },
      {
        codigo: "CAR-R-4-02", cargo: "Rector", anio: 4, dificultad: 1,
        texto: "En una conversación informal entre docentes, algunos comentan su interés en postularse al cargo de coordinador. Durante la conversación, varios manifiestan que un docente con estudios de maestría sería más apto para desempeñar el cargo y menosprecian la trayectoria de otro compañero que, aunque es normalista superior, cuenta con una amplia experiencia y una hoja de vida destacada. Estas afirmaciones son:",
        opciones: [
          { texto: "Correctas, pues para optar al cargo de coordinador se requiere mínimo estudio de maestría.", efectos: { desempeno: -6, popularidad: 4 } },
          { texto: "Erradas, una persona con formación de normalista superior puede optar al cargo.", efectos: { desempeno: 6, popularidad: -2 } }
        ],
        articulo: "Art. 21 · Afinidad de una maestría o doctorado con el cargo"
      },
      {
        codigo: "CAR-R-5-01", cargo: "Rector", anio: 5, dificultad: 1,
        texto: "Un docente cercano a usted solicita que su evaluación de desempeño sea favorable, aunque no haya cumplido satisfactoriamente varias de sus responsabilidades. Le recuerda que ambos mantienen una buena amistad desde hace años. ¿Qué decide hacer?",
        opciones: [
          { texto: "Realizar la evaluación de acuerdo con las evidencias y los criterios establecidos.", efectos: { desempeno: 6, popularidad: -2 } },
          { texto: "Otorgar una calificación favorable para conservar una buena relación con el docente.", efectos: { desempeno: -6, popularidad: 4 } }
        ],
        articulo: "Art. 29, lit. a, y art. 39 · Objetividad frente al favoritismo"
      },
      {
        codigo: "CAR-R-5-02", cargo: "Rector", anio: 5, dificultad: 1,
        texto: "Una estudiante perteneciente a una comunidad indígena manifiesta, junto con sus padres, que algunos docentes le exigen responder exclusivamente en español durante las clases, sin permitirle expresarse en su lengua materna. Los padres consideran que esta situación desconoce su identidad cultural y constituye una forma de discriminación. Ante esta situación, usted, como coordinador, decide:",
        opciones: [
          { texto: "Respaldar a los docentes, considerando que el castellano es el idioma oficial de Colombia y debe ser priorizado en las actividades académicas.", efectos: { desempeno: -6, popularidad: 4 } },
          { texto: "Respaldar a la estudiante y a sus padres, reconociendo su derecho a expresar su identidad cultural y lingüística en el entorno educativo.", efectos: { desempeno: 6, popularidad: -2 } }
        ]
      }
    ],

    // SECRETARÍA: la pregunta de la evaluación de competencias (ascenso o reubicación), años 4 y 5.
    secretaria: [
      {
        codigo: "SEC-4-01", anio: 4, dificultad: 1,
        texto: "¿Cuál de los siguientes es el organismo encargado de elegir al contralor General de la República?",
        opciones: [
          { texto: "El Congreso de la República.", correcta: true },
          { texto: "La Corte Constitucional.", correcta: false },
          { texto: "La Presidencia de la República.", correcta: false }
        ],
        articulo: "Art. 36, num. 2 · Puntaje superior al 80 % y condición de candidato",
        explicacion: "Según el artículo 36, numeral 2, quienes obtienen más del 80 % en la evaluación de competencias son candidatos a ascender en el escalafón o a reubicarse en un nivel salarial superior, si reúnen los requisitos."
      },
      {
        codigo: "SEC-5-01", anio: 5, dificultad: 1,
        texto: "Para realizar el seguimiento del avance de un proyecto a mediano plazo en la institución, usted prefiere:",
        opciones: [
          { texto: "Encargarse de revisar personalmente cada producto del proyecto para tener un mayor control sobre cómo se está desarrollando.", correcta: false },
          { texto: "Delegar en una persona de confianza el seguimiento del mismo para tener tiempo de desarrollar otras actividades.", correcta: false },
          { texto: "Crear criterios de cumplimiento en el equipo de trabajo para hacer un seguimiento indirecto del proyecto.", correcta: true }
        ],
        articulo: "Art. 23 · Límite presupuestal de ascensos y reubicaciones"
      }
    ]
  },

  /* ============================ MULTIJUGADOR ============================ */
  // Es el mismo juego del modo individual (lo que se cambie arriba cambia en los dos).
  // Solo agrega: hasta 3 jugadores en el mismo mapa, cada uno con un personaje distinto
  // y sus propias preguntas; al terminar un año se espera a los demás para pasar juntos
  // al siguiente; y estos puntos para el podio.
  multijugador: {
    maxJugadores: 3,
    puntosPorDificultad: [100, 150, 200],   // por acertar una pregunta o situación fácil, intermedia o difícil
    bonoRapidez: 50,                        // máximo, si se responde al instante…
    segundosPorPregunta: 20,                // …y baja hasta 0 en estos segundos (no hay límite para responder)
    bonoLlegadaAnio: [60, 30, 10],          // por terminar el año de 1.°, 2.° y 3.°
    bonoOportunidad: { vacante: 60, provisional: 30, reemplazo: 10, ninguna: 0 },
    puntosPorCarrera: 5,                    // × lo que sube el puntaje de carrera desde el inicio (indicadores, grado y cargo)
    // La evaluación anual aprobada suma su porcentaje (por ejemplo, 72% → 72 puntos)
    esperaParaForzar: 45,                   // segundos de espera antes de que el anfitrión pueda seguir sin esperar
    duracionMaximaMin: 60
  }
};
