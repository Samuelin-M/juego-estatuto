/* ==========================================================================
   CONTENIDO — lo que pasa dentro de cada edificio.
   Este es el archivo que el grupo edita. No hace falta tocar los demás archivos.

   Cada edificio tiene ESCENAS. Cada escena tiene un personaje que habla
   y opciones. Al elegir, cambia el puntaje y se "descubre" un artículo.

   Campos de una opción:
     texto        lo que el jugador elige
     puntos       suma (+) o resta (−) al puntaje
     consecuencia (opcional) qué pasa en la historia por esa decisión
     articulo     ej. "Art. 8 · Concurso"
     explicacion  qué dice el artículo, en palabras sencillas
     cambios      (opcional) { grado: "Grado 2 · Nivel A", anio: 1 }
     siguiente    id de otra escena, o:
                    "SALIR"      → termina el edificio y vuelve al mapa
                    "REINTENTAR" → empieza el edificio otra vez
                  También puede decidir según el puntaje:
                    (e) => e.puntaje >= 60 ? "aprobo" : "no_aprobo"

   PLANTILLA PARA COPIAR
   -------------------------------------------------------------------------
   mi_escena: {
     personaje: "🧑‍🏫 Nombre",
     texto: "Lo que dice o lo que pasa...",
     opciones: [
       { texto: "...", puntos: 10, consecuencia: "...",
         articulo: "Art. X · Tema", explicacion: "...", siguiente: "otra_escena" }
     ]
   },
   ========================================================================== */

const CONTENIDO = {
  titulo: "Carrera Docente",
  subtitulo: "Recorre el pueblo y construye tu carrera según el Estatuto de Profesionalización Docente (Decreto 1278 de 2002, arts. 8–40).",
  creditos: "Ética · UIS",
  puntajeInicial: 50,

  edificios: {

    /* ================= 1. SECRETARÍA: el concurso (arts. 8–15) ================= */
    secretaria: {
      nombre: "Secretaría de Educación",
      icono: "🏛️",
      articulos: "Ingreso al servicio · Arts. 8–15",
      inicio: "llegada",
      escenas: {
        llegada: {
          personaje: "👩‍💼 Funcionaria de la Secretaría",
          texto: "¡Buenos días! ¿Viene por un puesto de docente? Ya abrió la convocatoria del concurso.\n\nAunque le cuento que mucha gente viene más bien a \"hablar con alguien\"...",
          opciones: [
            {
              texto: "Quiero inscribirme en el concurso.",
              puntos: 10,
              consecuencia: "Llenas el formulario y quedas inscrito para las pruebas.",
              articulo: "Art. 8 · Concurso para ingreso",
              explicacion: "Al servicio educativo estatal se entra por concurso de méritos. El concurso evalúa aptitudes, experiencia, competencias básicas, relaciones interpersonales y personalidad, y con eso se arma la lista de elegibles.",
              siguiente: "pruebas"
            },
            {
              texto: "¿Y con quién habría que hablar?",
              puntos: -15,
              consecuencia: "La funcionaria te mira raro. Igual terminas inscribiéndote, pero ya quedaste con mala fama.",
              articulo: "Art. 8 · Concurso para ingreso",
              explicacion: "No hay atajos: las plazas se asignan por mérito a partir de la lista de elegibles que sale del concurso.",
              siguiente: "pruebas"
            }
          ]
        },

        pruebas: {
          personaje: "🧑 Otro aspirante en la fila",
          texto: "Psst... yo solo estudié la prueba de conocimientos. La psicotécnica y la entrevista son puro relleno, no cuentan.",
          opciones: [
            {
              texto: "Le hago caso y me relajo con las demás pruebas.",
              puntos: -10,
              consecuencia: "En la entrevista te quedas en blanco.",
              articulo: "Art. 9 · Etapas del concurso",
              explicacion: "El concurso tiene varias etapas: convocatoria, inscripción, pruebas de aptitudes y competencias, prueba psicotécnica, entrevista, valoración de antecedentes y lista de elegibles. Todas cuentan.",
              siguiente: "plaza"
            },
            {
              texto: "Mejor me preparo para todas.",
              puntos: 10,
              consecuencia: "Te va bien en la entrevista y en la psicotécnica.",
              articulo: "Art. 9 · Etapas del concurso",
              explicacion: "Cada etapa del concurso aporta al resultado final, desde la convocatoria hasta la lista de elegibles.",
              siguiente: "plaza"
            }
          ]
        },

        plaza: {
          personaje: "👩‍💼 Funcionaria de la Secretaría",
          texto: "Quedó en la lista de elegibles. Hay una plaza disponible... en un municipio a cuatro horas de aquí.",
          opciones: [
            {
              texto: "La rechazo y espero una en la ciudad.",
              puntos: -5,
              consecuencia: "La plaza pasa al siguiente de la lista. Te toca esperar.",
              articulo: "Art. 11 · Provisión de cargos",
              explicacion: "Las vacantes se ofrecen en estricto orden de puntaje. Si rechazas, nombran al siguiente de la lista, y la lista solo dura 2 años.",
              siguiente: (e) => e.puntaje >= 60 ? "aprobado" : "no_aprobado"
            },
            {
              texto: "La acepto, es mi oportunidad.",
              puntos: 10,
              consecuencia: "Firmas el nombramiento.",
              articulo: "Art. 11 · Provisión de cargos",
              explicacion: "Las plazas se asignan en estricto orden de puntaje entre quienes están en la lista de elegibles, que tiene vigencia de 2 años.",
              siguiente: (e) => e.puntaje >= 60 ? "aprobado" : "no_aprobado"
            }
          ]
        },

        aprobado: {
          personaje: "👩‍💼 Funcionaria de la Secretaría",
          texto: "¡Felicitaciones! Queda nombrado en periodo de prueba. Preséntese en el Colegio.",
          opciones: [
            {
              texto: "¡Vamos al Colegio!",
              puntos: 0,
              articulo: "Art. 12 · Periodo de prueba",
              explicacion: "Quien pasa el concurso es nombrado en periodo de prueba hasta terminar el año escolar, con mínimo 4 meses de servicio. Al final lo evalúan.",
              cambios: { grado: "Periodo de prueba" },
              siguiente: "SALIR"
            }
          ]
        },

        no_aprobado: {
          personaje: "👩‍💼 Funcionaria de la Secretaría",
          texto: "Lo siento, su puntaje no le alcanzó para obtener la plaza esta vez.",
          opciones: [
            {
              texto: "Me presento otra vez al concurso.",
              puntos: 0,
              articulo: "Art. 15 · Prohibición",
              explicacion: "Mientras exista una lista de elegibles vigente, las vacantes definitivas no se pueden llenar con nombramientos provisionales ni encargos. Hay que pasar el concurso.",
              siguiente: "REINTENTAR"
            }
          ]
        }
      }
    },

    /* ================= 2. COLEGIO: periodo de prueba (arts. 12–14, 26–31) ================= */
    // CONTENIDO DE EJEMPLO: completar con más situaciones de clase.
    colegio: {
      nombre: "Colegio",
      icono: "🏫",
      articulos: "Periodo de prueba y evaluación · Arts. 12–14, 26–31",
      inicio: "primer_dia",
      escenas: {
        primer_dia: {
          personaje: "👨‍🏫 Coordinador",
          texto: "Bienvenido. Este año está en periodo de prueba. Al final del año escolar lo evaluamos.\n\nPor cierto, los papás de 7°B se quejan de que nadie les explica cómo van sus hijos.",
          opciones: [
            {
              texto: "Organizo una reunión con los papás.",
              puntos: 10,
              consecuencia: "Los papás quedan contentos y te ponen buena nota en la encuesta.",
              articulo: "Art. 33 · Instrumentos de evaluación",
              explicacion: "Para evaluar a un docente se usan observación de clase, encuestas a padres y estudiantes, autoevaluación y revisión de superiores y colegas.",
              siguiente: "evaluacion"
            },
            {
              texto: "Eso no es mi problema, yo solo doy clase.",
              puntos: -10,
              consecuencia: "Las quejas llegan a la coordinación.",
              articulo: "Art. 33 · Instrumentos de evaluación",
              explicacion: "La opinión de padres y estudiantes también hace parte de la evaluación del docente.",
              siguiente: "evaluacion"
            }
          ]
        },
        evaluacion: {
          personaje: "👨‍🏫 Coordinador",
          texto: "Terminó el año escolar. Llegó la evaluación de su periodo de prueba.",
          opciones: [
            {
              texto: "Ver mi resultado",
              puntos: 0,
              articulo: "Art. 31 · Evaluación del periodo de prueba",
              explicacion: "Con 60% o más, el docente queda inscrito en el Escalafón. Con menos de 60%, queda por fuera del servicio.",
              siguiente: (e) => e.puntaje >= 60 ? "aprobo" : "no_aprobo"
            }
          ]
        },
        aprobo: {
          personaje: "👨‍🏫 Coordinador",
          texto: "¡Superó el periodo de prueba! Como es licenciado, entra al Escalafón en el Grado 2, Nivel A.",
          opciones: [
            {
              texto: "Seguir",
              puntos: 0,
              articulo: "Art. 21 · Requisitos de inscripción",
              explicacion: "Grado 1: normalista superior. Grado 2: licenciado o profesional con formación en pedagogía. Grado 3: además, maestría o doctorado.",
              cambios: { grado: "Grado 2 · Nivel A", anio: 1 },
              siguiente: "SALIR"
            }
          ]
        },
        no_aprobo: {
          personaje: "👨‍🏫 Coordinador",
          texto: "Lo siento: no alcanzó el 60% en la evaluación del periodo de prueba.",
          opciones: [
            {
              texto: "Intentar el año otra vez",
              puntos: 0,
              articulo: "Art. 31 · Evaluación del periodo de prueba",
              explicacion: "Con menos de 60%, el docente queda por fuera del servicio.",
              siguiente: "REINTENTAR"
            }
          ]
        }
      }
    },

    /* ================= 3. UNIVERSIDAD: escalafón (arts. 16–25) ================= */
    // CONTENIDO DE EJEMPLO
    universidad: {
      nombre: "Universidad",
      icono: "🎓",
      articulos: "Carrera y escalafón · Arts. 16–25",
      inicio: "maestria",
      escenas: {
        maestria: {
          personaje: "👩‍🎓 Asesora de posgrados",
          texto: "Ya lleva un tiempo como docente. ¿Ha pensado en hacer una maestría? Le sirve para ascender en el escalafón.",
          opciones: [
            {
              texto: "Sí, me inscribo en la maestría.",
              puntos: 10,
              consecuencia: "Pasan tres años de clases los sábados... y te gradúas.",
              articulo: "Art. 20 · Estructura del escalafón",
              explicacion: "El escalafón tiene tres grados según la formación, y cada grado tiene cuatro niveles salariales (A a D). Para subir se necesitan 3 años de servicio y el puntaje requerido en la evaluación de competencias.",
              cambios: { grado: "Grado 3 · Nivel A", anio: 3 },
              siguiente: "SALIR"
            },
            {
              texto: "No, estoy bien así.",
              puntos: 0,
              consecuencia: "Sigues dando clase. Pasan tres años.",
              articulo: "Art. 20 · Estructura del escalafón",
              explicacion: "Sin un nuevo título solo se puede subir de nivel (A a D) dentro del mismo grado, con 3 años de servicio y buena evaluación de competencias.",
              cambios: { grado: "Grado 2 · Nivel B", anio: 3 },
              siguiente: "SALIR"
            }
          ]
        }
      }
    },

    /* ================= 4. RECTORÍA: evaluación, derechos y ética (arts. 32–40) ================= */
    // CONTENIDO DE EJEMPLO
    rectoria: {
      nombre: "Rectoría",
      icono: "🗂️",
      articulos: "Evaluación de desempeño, derechos y ética · Arts. 32–40",
      inicio: "dilema",
      escenas: {
        dilema: {
          personaje: "🧔 Rector",
          texto: "Profe, el hijo de un concejal perdió su materia. El papá me pidió el favor de que \"revisemos\" esa nota...",
          opciones: [
            {
              texto: "La nota se queda como está.",
              puntos: 10,
              consecuencia: "El rector suspira, pero respeta tu decisión.",
              articulo: "Art. 39 · Principios y valores",
              explicacion: "La labor docente se basa en la dignidad humana, la autonomía y la solidaridad, con valores como la responsabilidad, la honestidad, la justicia, el respeto y la transparencia.",
              siguiente: "SALIR"
            },
            {
              texto: "Bueno, por esta vez la cambio.",
              puntos: -20,
              consecuencia: "Otros estudiantes se enteran y la confianza en ti se derrumba.",
              articulo: "Art. 40 · Marco ético",
              explicacion: "La educación es un bien público centrado en el estudiante, y exige idoneidad académica y moral a quien la ejerce.",
              siguiente: "SALIR"
            }
          ]
        }
      }
    }
  }
};
