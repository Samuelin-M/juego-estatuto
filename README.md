# Carrera Docente

Juego de competencia docente sobre el Estatuto de Profesionalización Docente (Decreto 1278 de 2002, artículos 8–40). Actividad de la clase de Ética, UIS.

Sigue la *Propuesta de dinámica* del grupo y las sugerencias del documento de ética: indicaciones al empezar, selección de personaje con la explicación de cada indicador, el concurso docente paso a paso (art. 7, convocatoria de la CNSC, inscripción y las cuatro etapas), situaciones inesperadas, evaluación anual y progresión profesional. Todo está dibujado en pixel art.

> Al cambiar archivos, sube el número `?v=` en las etiquetas `<script>` y `<link>` de `index.html` y `multijugador.html` para que los celulares no usen una versión vieja guardada.

**Jugar:** https://samuelin-m.github.io/juego-estatuto/

## Preguntas y situaciones (lo que falta escribir)

Todo está en `contenido.js`, dentro de `bancos`. Por ahora son **ejemplos** ("Pregunta 1", "Respuesta A", "Situación inesperada 1"…) para que el grupo escriba las definitivas. Cada pregunta y situación lleva el **año** en que sale (1 a 5, nunca sale en otro año) y su **dificultad** (1 fácil, 2 intermedia, 3 difícil).

| Banco | Dónde sale | Cuántas hacer |
|---|---|---|
| `aptitudes`, `psicotecnica`, `entrevista` | Concurso docente (año 1) | 6 de cada una: 2 fáciles, 2 intermedias, 2 difíciles |
| `colegio` | Una situación de clase por año | 3 por año (una de cada dificultad) → 15 |
| `cartas` | Dos situaciones inesperadas por año (se buscan en el mapa) | 6 por año (dos de cada dificultad) → 30 |
| `universidad` | Formación, año 3 del multijugador | 3 (una de cada dificultad) |
| `secretaria` | Escalafón y directivos, años 4 y 5 (en el individual, evaluación de competencias) | 3 por año → 6 |

- La respuesta correcta se marca con `correcta: true`. Pueden tener 2, 3 o más opciones.
- **Modo prueba:** con `mostrarCorrectas: true` la correcta sale en verde y las incorrectas en rojo. Cuando estén las preguntas definitivas, cambiarlo a `false`.
- **La evaluación anual no tiene preguntas** (así es en la realidad, arts. 32 a 34): sale de lo que se hizo en el año. Por eso los `efectos` de cada opción de las situaciones (colegio y cartas) son los que suben o bajan la evaluación.
- En el modo individual, si el jugador repite el concurso, le salen preguntas nuevas y más difíciles.
- El tema de cada año (y sus artículos) está en `anios`, dentro de `contenido.js`.

## Modalidades

### Individual (`index.html`)
Indicaciones → escoger personaje → concurso docente → convocatoria e inscripción → el pueblo, durante 5 años:

| Edificio | Qué pasa | Artículos |
|---|---|---|
| **Secretaría** | Concurso docente en 4 etapas: aptitudes, psicotécnica, valoración de antecedentes y entrevista → vacante, provisional o reemplazo. Después: evaluación de competencias (ascenso/reubicación) y concursos para coordinador y rector | 7–15, 10, 20–23, 35–36 |
| **Colegio** | Una situación de clase por año | Según el año |
| **Cartas** | Dos situaciones inesperadas por año que hay que buscar en el mapa | Según el año |
| **Universidad** | Formación: licenciatura, pedagogía, especialización, maestría, doctorado | 12, 21, 38 |
| **Rectoría** | Evaluación anual con la carpeta de evidencias del año (sin examen; 60% mínimo) | 12, 13, 31–36 |

Arriba a la derecha hay un menú para empezar una partida nueva o volver al menú.

### Multijugador (`multijugador.html`)
Hasta 3 jugadores en el mismo pueblo, cada uno con un personaje distinto, viven los 5 años al mismo tiempo:

1. Uno crea la sala y comparte el código, el QR o el enlace; los demás se unen desde su celular y eligen personaje.
2. Cada año hay tareas en orden (`multijugador.tareasPorAnio`): año 1 concurso, colegio, cartas y evaluación; año 3 suma la universidad; años 4 y 5 suman la Secretaría.
3. Quien termina su año queda en **lista de espera** (puede seguir caminando) hasta que todos terminen; entonces pasan juntos al año siguiente. Si alguien se queda quieto, el anfitrión puede pasar de año sin esperar.
4. Puntos: acertar (100, 150 o 200 según la dificultad) + rapidez (hasta 50), evaluación anual, orden de llegada de cada año (60, 30, 10) y resultado del concurso.
5. Cada uno ve a los demás en el mapa, con un globito de lo que están haciendo. A cada uno le salen sus propias preguntas y situaciones.
6. Al final, podio. Desde el menú se puede salir, cancelar la partida para todos o jugar otra en la misma sala.

La conexión usa Supabase Realtime (configurado en `config.js`).

## Archivos

| Archivo | Qué es | ¿Se edita? |
|---|---|---|
| `contenido.js` | **Todo el contenido**: textos de la introducción, personajes, concurso, bancos de preguntas, formación, reglas y multijugador | **Sí** |
| `config.js` | Datos de Supabase para el multijugador | Ya está configurado |
| `mapa.js` | Mapa del pueblo y edificios | Solo para cambiar el mapa |
| `pixel.js`, `sprites.js` | Pixel art dibujado por código: personajes, íconos, mapa y edificios | No hace falta |
| `comun.js` | Sacar preguntas de los bancos y pintar las respuestas | No hace falta |
| `index.html`, `juego.js`, `estilos.css` | Modo individual e interfaz | No hace falta |
| `multijugador.*`, `red.js` | Multijugador | No hace falta |
| `lib/` | Phaser 3.90, supabase-js 2.119, qrcode-generator 2.0 (MIT) y la fuente Jersey 10 (OFL) | No |

## Probar en el computador

Las páginas necesitan servirse por HTTP (no con doble clic). Desde la carpeta del proyecto:

```
python -m http.server 8000
```

y abrir `http://localhost:8000`.
