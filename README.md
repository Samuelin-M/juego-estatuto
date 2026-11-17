# Carrera Docente

Juego de competencia docente sobre el Estatuto de Profesionalización Docente (Decreto 1278 de 2002, artículos 8–40). Actividad de la clase de Ética, UIS.

Sigue la *Propuesta de dinámica* del grupo y las sugerencias del documento de ética: indicaciones al empezar, selección de personaje con la explicación de cada indicador, el concurso docente paso a paso (art. 7, convocatoria de la CNSC, inscripción y las cuatro etapas), situaciones inesperadas, evaluación anual y progresión profesional. Todo está dibujado en pixel art.

> Al cambiar archivos, sube el número `?v=` en las etiquetas `<script>` y `<link>` de `index.html` para que los celulares no usen una versión vieja guardada.

**Jugar:** https://samuelin-m.github.io/juego-estatuto/

## Preguntas y situaciones

Están en `contenido.js`, dentro de `bancos`, copiadas del PDF *Banco de preguntas* del grupo (cada una con su código: `APT-01`, `COL-D-1-01`, `CAR-C-4-02`…). Las fichas que en el PDF dicen "Por redactar" todavía no están; cuando las escriban se agregan con el mismo formato y el juego las usa solas.

| Banco | Dónde sale | Hay |
|---|---|---|
| `aptitudes`, `psicotecnica`, `entrevista` | Concurso docente (año 1) | 6 de cada una: 2 fáciles, 2 intermedias, 2 difíciles |
| `colegio` | Una situación de clase por año, según el cargo (docente, coordinador o rector) | 12 (una por año y cargo) |
| `cartas` | Dos situaciones inesperadas por año, según el cargo (se buscan en el mapa) | 30 |
| `secretaria` | Evaluación de competencias para ascender o reubicarse (años 4 y 5) | 2 |

- **Salen al azar**, nunca de un año más avanzado y sin repetirse mientras queden otras.
- **Entre más se repite algo, más difícil:** el concurso (1.er intento fáciles, 2.º intermedias, 3.º difíciles), la evaluación de competencias y las situaciones de cada cargo (cada año en el mismo cargo sube la dificultad, si hay de esa dificultad).
- **Preguntas** (concurso, colegio y Secretaría): la correcta lleva `correcta: true`.
- **Cartas (situaciones inesperadas): no hay respuesta correcta.** Cada opción tiene sus `efectos` sobre los indicadores: la que va con el estatuto sube el desempeño (y suele bajar la popularidad); la cómoda o popular sube la popularidad y baja el desempeño.
- **La evaluación anual no tiene preguntas** (arts. 32 a 34): sale de los indicadores, que cambian con lo que se decide en el colegio y en las cartas.
- **La Universidad no tiene preguntas:** solo sirve para formarse (pedagogía, especialización, maestría…).
- `mostrarCorrectas: true` pinta la correcta de verde y las demás de rojo (solo para probar).
- El tema de cada año (y sus artículos) está en `anios`, dentro de `contenido.js`.

## El juego

Es **un solo juego** (`juego.js`). El multijugador usa exactamente el mismo; solo le agrega jugadores, la lista de espera de cada año y el podio. Todo lo que se cambie en el juego o en `contenido.js` cambia en los dos.

Indicaciones → escoger personaje → concurso docente → convocatoria e inscripción → el pueblo, durante 5 años:

| Edificio | Qué pasa | Artículos |
|---|---|---|
| **Secretaría** | Concurso docente en 4 etapas: aptitudes, psicotécnica, valoración de antecedentes y entrevista → vacante, provisional o reemplazo. Después: evaluación de competencias (ascenso/reubicación) y concursos para coordinador y rector | 7–15, 10, 20–23, 35–36 |
| **Colegio** | Una situación de clase por año | Según el año |
| **Cartas** | Dos situaciones inesperadas por año que hay que buscar en el mapa | Según el año |
| **Universidad** | Formación: licenciatura, pedagogía, especialización, maestría, doctorado | 12, 21, 38 |
| **Rectoría** | Evaluación anual con la carpeta de evidencias del año (sin examen; 60% mínimo) | 12, 13, 31–36 |

Arriba a la derecha hay un menú para empezar una partida nueva o volver al menú.

### Multijugador (botón "Multijugador" del menú)
El mismo juego, con hasta 3 jugadores en el mismo pueblo, cada uno con un personaje distinto:

1. Uno crea la sala y comparte el código, el QR o el enlace; los demás se unen desde su celular y eligen personaje. Luego cada uno ve el concurso, la convocatoria y llega al pueblo, igual que en el individual.
2. Quien termina su año (después de la evaluación en la Rectoría) queda en **lista de espera** (puede seguir caminando) hasta que terminen los que están en ese mismo año; entonces pasan juntos al siguiente. Si alguien se queda quieto, el anfitrión puede seguir sin esperar. A quien entra tarde no se le espera.
3. Puntos para el podio (`multijugador` en `contenido.js`): acertar (100, 150 o 200 según la dificultad) + rapidez (hasta 50, sin límite de tiempo para responder), evaluaciones anuales aprobadas, cuánto mejora la carrera (indicadores, grado y cargo), orden de llegada de cada año (60, 30, 10) y resultado del concurso.
4. Cada uno ve a los demás en el mapa, con un globito de lo que están haciendo, y arriba los puntos de todos. A cada uno le salen sus propias preguntas y situaciones.
5. Al final, la pantalla de la carrera trae el podio. Desde el menú se puede salir, terminar ya, cancelar la partida para todos o jugar otra en la misma sala. Si se recarga la página, se retoma donde iba.

`multijugador.html` solo redirige al juego, para que sigan sirviendo los enlaces y QR viejos.

La conexión usa Supabase Realtime (configurado en `config.js`).

## Archivos

| Archivo | Qué es | ¿Se edita? |
|---|---|---|
| `contenido.js` | **Todo el contenido**: textos de la introducción, personajes, concurso, bancos de preguntas, formación, reglas y multijugador | **Sí** |
| `config.js` | Datos de Supabase para el multijugador | Ya está configurado |
| `mapa.js` | Mapa del pueblo y edificios | Solo para cambiar el mapa |
| `pixel.js`, `sprites.js` | Pixel art dibujado por código: personajes, íconos, mapa y edificios | No hace falta |
| `comun.js` | Sacar preguntas de los bancos y pintar las respuestas | No hace falta |
| `index.html`, `juego.js`, `estilos.css` | El juego y la interfaz | No hace falta |
| `multijugador.js`, `multijugador.css`, `red.js` | Lo que el multijugador le agrega al juego | No hace falta |
| `lib/` | Phaser 3.90, supabase-js 2.119, qrcode-generator 2.0 (MIT) y la fuente Jersey 10 (OFL) | No |

## Probar en el computador

Las páginas necesitan servirse por HTTP (no con doble clic). Desde la carpeta del proyecto:

```
python -m http.server 8000
```

y abrir `http://localhost:8000`.
