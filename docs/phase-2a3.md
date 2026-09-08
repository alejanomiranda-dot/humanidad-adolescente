# Fase 2A.3 — Lookdev / Art Bible

Base: `5f3371f98d631e82c2ca2bdf7b143e5839b159d7`, rama `humanidad-adolescente-v2`. Estudio de imágenes estáticas aislado en `?prototype=phase2a&study=lookdev`. No modifica la obra original ni el Master Shot 2A.2.

## Regla de dirección

Una misma familia de curvas de luz atraviesa las escalas: punto, filo, reflejo, caústica, filamento, membrana, filamento liberado, trazo, símbolo y estructura. Es una regla interna de producción. No se agrega esa explicación a la narrativa del visitante.

El criterio de continuidad es morfológico: ¿podemos llegar del estado anterior al siguiente moviendo cámara, luz, material y forma sin usar un fundido? Una paleta compartida, por sí sola, no aprueba 03→04 ni 06→07.

Prioridad de trabajo: 03/04/07 en conjunto; luego constricción/descendientes/orden; cosmos al final. No se produce animación ni una segunda secuencia de 26 segundos. Las pruebas iniciales usan stills 1440×810, Cycles 16 muestras con denoise; se posponen renders largos hasta aprobar los problemas principales.

## Referencias del usuario

Se inspeccionaron los tres PNG locales y se identificaron por su contenido:

- 03 Agua: `references/lookdev/a_cinematic_ultra_detailed_sci_fi_abstract_landsc_1.png`.
- 04 Vida: `references/lookdev/a_cinematic_ultra_detailed_macro_underwater_sci_f_2.png`.
- 07 Vida→Información: `references/lookdev/wide_cinematic_sci_fi_macro_micro_scene_dark_deep_3.png`.

Se toman negros azul petróleo, iluminación cálida localizada, profundidad por capas y densidad interior. No se usan como textura, collage ni fondo del render, ni se copia su composición literalmente. La referencia de Vida tiene reflejos vítreos marcados: se conserva su riqueza, pero no se considera que ese aspecto apruebe automáticamente el material solicitado. Los originales quedan preservados localmente y excluidos del commit; los renders se generan con geometría propia.

## Biblia y producción

Fuente de parámetros: `scripts/production/lookdev-art-bible.json`. Escena: `scripts/production/lookdev.py`. Blender portable 4.5.13 LTS ya validado, Cycles CPU, AgX, RGB 16 bits. Sin assets externos ni nuevas dependencias del producto.

La superficie usa coordenadas compartidas `(u,v)` y un parámetro de cierre. La lámina se curva y envuelve; los filamentos conservan sus coordenadas sobre ella. La constricción aplica el mismo campo a membrana e interiores. Las descendientes comparten el lenguaje y distribuyen masas internas diferentes. La extensión hacia trazos debe salir de esos mismos puntos, no de tipografía superpuesta.

La escala física del escenario se reduce junto con posiciones, luces, distancias de bump y densidad del medio para que la profundidad de campo provenga de la cámara. Dirección fría rasante y fuente cálida transmitida constantes. La exposición y el tratamiento de highlights se ajustan para el conjunto; no se aplica un color grade independiente a cada imagen.

Primeras iteraciones descartadas: la lámina parecía una cinta, la membrana una bolsa de fibras, el volumen levantaba demasiado los negros y algunas líneas internas formaban un enrejado. Esas imágenes son evidencia de trabajo, no hero frames aprobados. Se corrigieron escala de textura, direcciones de los pliegues, relación cámara/medio y deformación de la región que se libera.

## Decisiones de la versión de revisión

- AgX, exposición −0,65 EV, sin LUT por plano ni grano añadido. Negro azul petróleo; highlights fríos y dorados localizados. Bloom Fog Glow muy reducido: umbral 2,5 y fuerza 0,06.
- Cámara desktop 48 mm en las escalas próximas, 70 mm para la vista distante. Apertura f/4,5. Cámara, objetos y luces se escalan físicamente a 0,05; la profundidad de campo no es una capa de desenfoque en HTML.
- Fuente fría rasante, luz cálida transmitida, rebote suave y luz dentro del medio. Mismo conjunto de luces; cambian la distancia y el encuadre. Medio volumétrico de baja densidad con absorción y partículas a distintas profundidades.
- Tejido: roughness 0,32, transmisión 0,45, IOR 1,30, subsurface, dos escalas de relieve y una distribución de poros. El agua usa una variante más transmisiva de la superficie. Las líneas cálidas todavía tienen un carácter demasiado literal: no son una simulación física de caústicas.
- La membrana está formada por tiras contiguas. Sus puntos y caras se conservan al extenderse y estrecharse; no se eliminan caras para hacer aparecer líneas. Las normales coincidentes se igualan para evitar bandas entre tiras. El cierre polar se corrige para no producir una punta abierta accidental.
- La densidad interior pasó de agregados grandes que parecían piedras a partículas menores e irregularidades suspendidas. Esta corrección reduce esa lectura, pero no certifica un material biológico definitivo.
- Las descendientes tienen semillas internas diferentes. La constricción y el estiramiento se aplican también a interiores y filamentos. No hay simulación de conservación de masa: es una deformación de lookdev.

No se cambió ninguna dependencia, configuración de Vite/Tailwind, contenido editorial, componente original ni el código de 2A.2. El único cambio en el arranque es la selección lazy de la galería bajo el query completo.

## Cámaras y archivos

El checkpoint conserva los ocho encuadres horizontales a 1440×810 y las cinco cámaras verticales ya producidas a 810×1440 para 03, 04, 05, 07 y 08. Las verticales cambian posición, focal, punto de enfoque e inclinación; no son un recorte del desktop. Las versiones verticales de 03/04 preceden al diagnóstico final y se conservan como evidencia de encuadre, no como material aprobado. No se generan nuevas porque el gate desktop no pasó.

Los PNG RGB de 16 bits, escenas `.blend`, sidecars de render y estudios descartados permanecen fuera del repositorio en `C:/Users/AMIRANDA/.codex/production/humanidad-adolescente/phase2a3/`. Los originales suministrados tampoco se publican. `.audit` conserva solamente comprobaciones locales. El checkpoint web usa `review-01` para 01/02/05/06/07/08 y sus cámaras verticales, y `water-life-attempt-2` para los desktop 03/04 que sostienen el diagnóstico actual.

Reproducción con el Blender portable ya instalado, sin instalar librerías en el proyecto:

```text
blender --background --python scripts/production/lookdev.py -- --output OUTSIDE_REPO --frames 03,04,07,05,06,08,01,02 --samples 16
blender --background --python scripts/production/lookdev.py -- --output OUTSIDE_REPO --frames 03,04,05,07,08 --mobile --samples 16
node scripts/production/export-lookdev.cjs OUTSIDE_REPO --before .audit/phase2a2
```

El exportador utiliza Sharp del runtime externo de auditoría, convierte a WebP calidad 94 y verifica las dimensiones. No retoca los renders. `public/media/phase2a3/manifest.json` registra dimensiones, peso, hash de cada imagen, muestras, tiempo de render y hashes del script/configuración. Las comparaciones son capturas de 2A.2, convertidas a WebP calidad 90; incluyen su encuadre e interfaz anteriores y no se presentan como renders equivalentes.

## Galería aislada

Ruta: `?prototype=phase2a&study=lookdev`. Ocho botones de selección, cámara horizontal/vertical, apertura de la imagen a resolución completa, comparación con 2A.2 y revisión del fotograma vecino en los pares 03/04 y 06/07. El tablero carga inicialmente sólo el hero seleccionado. Las comparaciones se montan al solicitarlas. No reproduce video, WebGL ni animación.

`?prototype=phase2a` sigue abriendo el Master Shot 2A.2. `?prototype=phase2a&study=webgl` conserva el ensayo anterior. `?study=lookdev` sin prototype abre la experiencia original.

## Evaluación artística

### Dos iteraciones acotadas de Agua y Vida

Se hicieron exactamente dos iteraciones nuevas de cada desktop después de la revisión conjunta inicial; no se produjo animación ni se continuó con cámaras mobile:

1. **Intento 1.** Se incorporó un límite agua/aire a una escena compartida. En 03 volvió a leerse la superficie, pero como una línea demasiado tenue en un plano vacío y oscuro. En 04 se sustituyó la cápsula con piedras por una masa continua plegada; la silueta mejoró, pero el tejido quedó demasiado liso, opaco y oscuro.
2. **Intento 2.** Se reforzaron capas de profundidad, volumen, iluminación bajo la superficie, microrelieve y porosidad geométrica. En 03 ya existen superficie, foreground, midground, background y pérdida gradual de contraste. El reflejo superior sigue demasiado ancho y duro; falta que se convierta en caústica y conduzca a Vida. En 04 la silueta no es una cápsula ni contiene piedras separadas, pero los huecos rectangulares y el espesor rígido introducen una carcasa perforada. La materia todavía no expresa intercambio, fragilidad ni continuidad húmeda.

El segundo intento se renderizó con 32 muestras para separar ruido de Cycles de un problema de diseño. La imagen más limpia conserva exactamente los mismos defectos de silueta, poros y distribución del highlight. Más muestras reducirían ruido Monte Carlo, pero no cambiarían topología, shader, iluminación ni composición. El bloqueo es **material + forma**, no resolución de render.

### Gate del checkpoint

| Evaluación | Juicio | Evidencia |
| --- | --- | --- |
| Frame 03 — Agua / Descenso | **NO** | Mejora la lectura submarina, pero conserva apariencia procedural; superficie, reflejo y caústica no alcanzan el objetivo. |
| Frame 04 — Vida | **NO** | Rompe la cápsula y elimina las piedras flotantes, pero introduce una carcasa porosa/rígida insuficientemente biológica. |
| Continuidad 03→04 | **CERCA** | Es el mismo medio, objeto y rig de luz vistos mediante avance de cámara; falta que la luz de 03 se transforme perceptualmente en estructura interna de 04. |

06→07 conserva la base geométrica común ya obtenida y no fue reabierto en este ajuste acotado. Ningún otro plano se reevalúa como aprobado a partir de estos resultados.

**Fase 2A.3 permanece ABIERTA y NO APROBADA.** Este commit es un checkpoint técnico/artístico reproducible, no el cierre de la dirección de arte ni autorización para animar.

## Validación y persistencia

Checkpoint verificado el 08/09/2026:

- `npm run build`: aprobado con Vite 5.4.21, 1.586 módulos transformados.
- Experiencia original: conserva `#timeline`; no solicita chunks ni imágenes de lookdev. `?study=lookdev` sin `prototype=phase2a` también permanece en la obra original.
- Master Shot 2A.2: conserva reduced-motion y avance manual; no solicita recursos de 2A.3.
- Galería aislada: probada en 320, 390, 768, 1440 y 1920 px. Cambia entre los ocho desktop, usa las variantes verticales ya existentes, permite navegación con flechas y carga las comparaciones sólo al abrirlas. No hay canvas, video ni animación en este tablero.
- Consola, excepciones de página y respuestas HTTP 4xx/5xx: ninguna durante la verificación.
- Assets versionados: 13 WebP de render, 6 WebP comparativos y manifiesto, 631.733 bytes en total. No se incluyen referencias originales, PNG, `.blend`, sidecars, `.audit`, `__pycache__` ni `.pyc`.
- `git diff --check`: aprobado antes del commit.

Que el build y la galería funcionen sólo demuestra estabilidad técnica; no altera los juicios **NO / NO / CERCA** ni cierra Fase 2A.3. El SHA y Preview READY se confirman después del push.
