# Carrera Docente

Juego de competencia docente sobre el Estatuto de Profesionalización Docente (Decreto 1278 de 2002, artículos 8–40). Actividad de la clase de Ética, UIS.

Sigue la *Propuesta de dinámica* del grupo: tres personajes, cuatro indicadores (experiencia, formación, popularidad y desempeño), concurso docente, evaluación anual, situaciones inesperadas, progresión profesional y dos modalidades de juego.

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

### 📺 En vivo (`presentador.html` + `jugar.html`)
El presentador proyecta la pantalla con un código QR, los estudiantes se unen desde el celular a uno de los tres equipos (personajes), y compiten en 4 rondas con tres tipos de desafío: **pregunta rápida**, **duelo de conocimientos** y **caso profesional**.

> ⚠️ Para que los celulares se conecten hace falta configurar Supabase en `config.js`. Mientras tanto funciona en **modo prueba**: el presentador y los jugadores deben ser pestañas del mismo navegador.

## Archivos

| Archivo | Qué es | ¿Se edita? |
|---|---|---|
| `contenido.js` | **Todo el contenido**: personajes, concurso, situaciones, cartas, formación, reglas, preguntas y rondas del modo en vivo | **Sí** |
| `config.js` | Datos de Supabase para el modo en vivo | Una vez |
| `mapa.js` | Mapa del pueblo y edificios | Solo para cambiar el mapa |
| `index.html`, `juego.js`, `sprites.js` | Modo individual | No hace falta |
| `presentador.*`, `jugar.html`, `jugador.js`, `red.js`, `en-vivo.css` | Modo en vivo | No hace falta |
| `lib/` | Librerías: Phaser 3.90, supabase-js 2.119, qrcode-generator 2.0 (todas MIT) | No |

## Probar en el computador

Las páginas necesitan servirse por HTTP (no con doble clic). Desde la carpeta del proyecto:

```
python -m http.server 8000
```

y abrir `http://localhost:8000`.
