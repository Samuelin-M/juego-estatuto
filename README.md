# Carrera Docente

Juego de competencia docente sobre el Estatuto de Profesionalización Docente (Decreto 1278 de 2002, artículos 8–40). Actividad de la clase de Ética, UIS.

Sigue la *Propuesta de dinámica* del grupo: tres personajes, cuatro indicadores (experiencia, formación, popularidad y desempeño), concurso docente, evaluación anual, situaciones inesperadas, progresión profesional y dos modalidades de juego (individual y multijugador).

> Al cambiar archivos, sube el número `?v=` en las etiquetas `<script>` y `<link>` de `index.html` y `multijugador.html` para que los celulares no usen una versión vieja guardada.

**Jugar:** https://samuelin-m.github.io/juego-estatuto/

## Modalidades

### 🗺️ Individual (`index.html`)
Cada jugador, desde su celular, elige un personaje y recorre el pueblo durante 5 años:

| Edificio | Qué pasa | Artículos |
|---|---|---|
| **Secretaría** | Concurso docente: 3 pruebas + antecedentes → vacante, provisional o reemplazo. Después: evaluación de competencias (ascenso/reubicación) y concursos para coordinador y rector | 8–15, 10, 20–23, 35–36 |
| **Colegio** | Una situación de aula por año | 29, 33, 34, 39 |
| **Cartas 🃏** | Dos situaciones inesperadas por año que aparecen en el mapa | 14, 36–40 |
| **Universidad** | Formación: licenciatura, pedagogía, especialización, maestría, doctorado | 12, 21, 38 |
| **Rectoría** | Evaluación anual (60% mínimo) | 12, 13, 31, 32, 36 |

### 🏁 Multijugador (`multijugador.html`)
Hasta 3 jugadores en el mismo pueblo, cada uno con un personaje distinto:

1. Uno crea la sala y comparte el código, el QR o el enlace; los demás se unen desde su celular.
2. Cada uno elige personaje (no se pueden repetir) y el anfitrión empieza la partida.
3. Todos se ven caminar en el mapa y compiten por completar 6 procesos en orden: concurso → periodo de prueba → cartas → evaluación → formación → ascenso (15 preguntas).
4. Cada pregunta tiene 20 segundos: acierto = 100 puntos + hasta 50 por rapidez. Además hay bono por la oportunidad laboral del concurso (depende de los antecedentes del personaje) y por orden de llegada.
5. Al final, podio para todos.

La conexión usa Supabase Realtime (configurado en `config.js`).

## Archivos

| Archivo | Qué es | ¿Se edita? |
|---|---|---|
| `contenido.js` | **Todo el contenido**: personajes, concurso, situaciones, cartas, formación, reglas, preguntas y rondas del modo en vivo | **Sí** |
| `config.js` | Datos de Supabase para el multijugador | Ya está configurado |
| `mapa.js` | Mapa del pueblo y edificios | Solo para cambiar el mapa |
| `index.html`, `juego.js`, `sprites.js` | Modo individual | No hace falta |
| `multijugador.*`, `red.js` | Multijugador | No hace falta |
| `lib/` | Librerías: Phaser 3.90, supabase-js 2.119, qrcode-generator 2.0 (todas MIT) | No |

## Probar en el computador

Las páginas necesitan servirse por HTTP (no con doble clic). Desde la carpeta del proyecto:

```
python -m http.server 8000
```

y abrir `http://localhost:8000`.
