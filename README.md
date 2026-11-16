# Carrera Docente

Juego de competencia docente sobre el Estatuto de Profesionalización Docente (Decreto 1278 de 2002, artículos 8–40). Actividad de la clase de Ética, UIS.

Sigue la *Propuesta de dinámica* del grupo y las sugerencias del documento de ética: indicaciones al empezar, selección de personaje con la explicación de cada indicador, el concurso docente paso a paso (art. 7, convocatoria de la CNSC, inscripción y las cuatro etapas), situaciones inesperadas, evaluación anual y progresión profesional. Todo está dibujado en pixel art.

> Al cambiar archivos, sube el número `?v=` en las etiquetas `<script>` y `<link>` de `index.html` y `multijugador.html` para que los celulares no usen una versión vieja guardada.

**Jugar:** https://samuelin-m.github.io/juego-estatuto/

## Preguntas y situaciones (lo que falta escribir)

Todas las preguntas están en `contenido.js`, dentro de `bancos`. Por ahora son **ejemplos** ("Pregunta 1", "Respuesta A", "Situación inesperada 1"…) para que el grupo escriba las definitivas:

| Banco | Para qué se usa |
|---|---|
| `aptitudes`, `psicotecnica`, `entrevista` | Una pregunta de cada una en el concurso docente |
| `estatuto` | Evaluación de competencias (individual) y preguntas del multijugador |
| `colegio` | Una situación de aula por año |
| `cartas` | Las situaciones inesperadas que aparecen en el mapa |

- La respuesta correcta se marca con `correcta: true`.
- **Modo prueba:** con `mostrarCorrectas: true` la correcta sale en verde y las incorrectas en rojo. Cuando estén las preguntas definitivas, cambiarlo a `false`.
- **Dificultad del concurso:** cada pregunta de `aptitudes`, `psicotecnica` y `entrevista` tiene `dificultad: 1, 2 o 3`. Si el jugador repite el concurso, le salen preguntas distintas y más difíciles (1.er intento → nivel 1, 2.º → nivel 2, del 3.º en adelante → nivel 3). **Hay que escribir preguntas más difíciles para los niveles 2 y 3.**
- En las situaciones (`colegio` y `cartas`), cada opción tiene sus `efectos` sobre los indicadores, la `consecuencia` y el artículo con su explicación.

## Modalidades

### Individual (`index.html`)
Indicaciones → escoger personaje → concurso docente (art. 7) → convocatoria e inscripción → el pueblo, durante 5 años:

| Edificio | Qué pasa | Artículos |
|---|---|---|
| **Secretaría** | Concurso docente en 4 etapas: aptitudes, psicotécnica, valoración de antecedentes y entrevista → vacante, provisional o reemplazo. Después: evaluación de competencias (ascenso/reubicación) y concursos para coordinador y rector | 7–15, 10, 20–23, 35–36 |
| **Colegio** | Una situación de aula por año | 29, 33, 34, 39 |
| **Cartas** | Dos situaciones inesperadas por año que aparecen en el mapa | 14, 36–40 |
| **Universidad** | Formación: licenciatura, pedagogía, especialización, maestría, doctorado | 12, 21, 38 |
| **Rectoría** | Evaluación anual (60% mínimo) | 12, 13, 31, 32, 36 |

### Multijugador (`multijugador.html`)
Hasta 3 jugadores en el mismo pueblo, cada uno con un personaje distinto:

1. Uno crea la sala y comparte el código, el QR o el enlace; los demás se unen desde su celular.
2. Cada uno elige personaje (no se pueden repetir) y el anfitrión empieza la partida.
3. Todos se ven caminar en el mapa y compiten por completar 6 procesos en orden: concurso → periodo de prueba → cartas → evaluación → formación → ascenso (15 preguntas, las mismas para todos).
4. Cada pregunta tiene 20 segundos: acierto = 100 puntos + hasta 50 por rapidez. Además hay bono por la oportunidad laboral del concurso (depende de los antecedentes del personaje) y por orden de llegada.
5. Al final, podio para todos.

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
