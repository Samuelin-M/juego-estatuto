# Carrera Docente

Juego para recorrer un pueblo y construir una carrera docente según el Estatuto de Profesionalización Docente (Decreto 1278 de 2002, artículos 8–40). Actividad de la clase de Ética, UIS.

Se juega desde el celular: tocas el mapa para caminar y tocas un edificio para entrar.

## Archivos

| Archivo | Qué es | ¿Se edita? |
|---|---|---|
| `contenido.js` | Lo que pasa dentro de cada edificio: personajes, decisiones y artículos | **Sí, aquí va la historia** |
| `mapa.js` | El mapa del pueblo y dónde está cada edificio | Solo para cambiar el mapa |
| `index.html`, `estilos.css` | La página y su diseño | Casi nunca |
| `juego.js`, `sprites.js` | El motor del juego y los gráficos | No hace falta |
| `phaser.min.js` | La librería de juegos [Phaser](https://phaser.io) 3.90 (licencia MIT) | No |

## Edificios y artículos

1. **Secretaría de Educación**: el concurso (arts. 8–15)
2. **Colegio**: periodo de prueba y evaluación (arts. 12–14, 26–31)
3. **Universidad**: carrera y escalafón (arts. 16–25)
4. **Rectoría**: evaluación de desempeño, derechos y ética (arts. 32–40)

## Publicar en GitHub Pages

1. Sube **todos los archivos sueltos** a la raíz del repositorio (no la carpeta, no el .zip).
2. Ve a **Settings → Pages → Deploy from a branch → main / (root) → Save**.
3. Espera 1–2 minutos y abre `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

## Probar en el computador

Doble clic en `index.html`. En el computador también se puede caminar con las flechas o con WASD.
