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

### Checkpoint Material Target v2

Después del checkpoint `571e5f03535cfbd83fa6170cea859c13d9b88a81` se realizó un ensayo acotado basado en la nueva referencia local `references/lookdev/a_cinematic_high_detail_triptych_concept_art_cgi.png`. La referencia se usó para estudiar propiedades materiales y continuidad entre Agua y Vida; no se incorporó como textura, fondo ni collage.

El ensayo está preservado en `scripts/production/material-target-v2.py`. Reutiliza el mundo, las cámaras generales y la iluminación de Fase 2A.3. Genera únicamente stills desktop 03, 03.5 y 04; no contiene animación ni modifica los otros hero frames. Los renders, `.blend` y sidecars permanecen fuera del repositorio.

Se hicieron dos iteraciones, con 16 muestras porque el ruido no impedía evaluar la forma:

1. **Iteración 1.** Se reemplazó el modelo “membrana + objetos interiores” por una superficie de densidad conectada. La cámara ya podía avanzar por la misma escena entre los tres estados, pero el tejido se veía opaco, pesado y semejante a coral o hueso. Los filamentos superiores parecían tallos añadidos.
2. **Iteración 2.** Se redujo el espesor, se vinculó transmisión y roughness a una densidad local, se agregaron zonas claras y turbias y se probó una caústica proyectada. La continuidad espacial mejoró, pero la topología siguió dominando la lectura: paredes duras, cavidades amplias, bordes dentados y patrones de malla visibles. El resultado parece cerámica perforada antes que materia blanda organizada. En 03.5, los filamentos se distinguen de la caústica y no alcanzan la ambigüedad “¿luz u organización?”.

| Evaluación Material Target v2 | Juicio | Evidencia |
| --- | --- | --- |
| Frame 03 — Agua / Descenso | **NO** | Superficie y profundidad legibles, pero el reflejo permanece extendido y la caústica no conduce con precisión hacia la organización. |
| Frame 03.5 — Agua → Vida | **NO** | Comparte escena y material, pero se percibe un acercamiento a una forma ya creada; luz y filamento siguen siendo elementos distinguibles. |
| Frame 04 — Vida | **NO** | No hay cápsula con piedras, pero la superficie conectada se lee como coral, hueso o cerámica perforada. |
| Continuidad 03→03.5→04 | **CERCA** | El avance de cámara y la continuidad espacial funcionan; la materia todavía no transforma el fenómeno óptico en organización viva. |

El bloqueo principal está en la **construcción de la materia de Vida**. Más muestras sólo reducirían ruido de integración. Refinar el shader actual podría alterar color, brillo o translucidez, pero conservaría las paredes, cavidades y silueta que producen la lectura rígida. El problema es topológico y debe resolverse antes de volver a iluminar el hero frame.

El próximo ensayo artístico cambia de método: primero se construirá un **Material Lab aislado**, sin composición hero, para evaluar espesores blandos, densidad continua, pliegues, vesículas integradas, translucidez localizada y respuesta a la luz. Sólo un material que supere ese gate se llevará otra vez a 03/03.5/04.

**Fase 2A.3 continúa ABIERTA y NO APROBADA.** Este apartado registra el diagnóstico del ensayo; no sustituye los WebP de la galería ni declara ningún frame como hero aprobado.

### Checkpoint Material Lab

Después del ensayo Material Target v2 se aisló el problema de Vida en un laboratorio neutro, sin agua, continuidad narrativa, composición hero ni animación. `scripts/production/material-lab.py` compara tres construcciones bajo la misma cámara, escala aproximada, iluminación base y lógica material:

- **A — Density Field → Surface.** Una suma de densidades continuas se convierte en superficie al final. Evita perforaciones y separaciones entre contenedor y contenido.
- **B — Metaballs + Remesh.** Masas implícitas fusionadas se convierten en una única malla, con remesh suave y desplazamiento local.
- **C — Geometry Nodes Density.** Un mismo campo gobierna pliegues, espesor, desplazamiento y atributo óptico sobre una superficie continua.

Se produjeron exactamente dos stills por método, A1/A2, B1/B2 y C1/C2, a 1440×960, Cycles CPU, 16 muestras con denoise. La primera ronda reveló una iluminación excesiva que aplanaba las tres materias. La segunda corrigió esa condición común y acentuó las diferencias estructurales sin aumentar muestras. Los PNG y `.blend` permanecen fuera del repositorio en `C:/Users/AMIRANDA/.codex/production/humanidad-adolescente/phase2a3/material-lab/`; no se integran en la galería ni reemplazan hero frames.

| Método | Juicio | Diagnóstico |
| --- | --- | --- |
| A — Density Field → Surface | **NO** | Es la base estructural más prometedora: elimina mejor la carcasa perforada y permite una masa continua, espesores variables y futura constricción. Visualmente todavía se lee como pasta o cera moldeada; la organización interna no resulta visible. |
| B — Metaballs + Remesh | **NO** | La fusión implícita produce continuidad real, pero el volumen y la respuesta superficial se perciben como mineral, hueso o cerámica húmeda. |
| C — Geometry Nodes Density | **NO** | Densidad, pliegue y espesor comparten el mismo sistema, pero la forma conserva rigidez y apariencia plástica o fabricada. |

No existe técnica visualmente ganadora y ninguna alcanza el gate **CERCA**. A se conserva únicamente como **base técnica para el próximo estudio**; no se selecciona como material aprobado ni como dirección artística definitiva.

El resultado desplaza el diagnóstico: el bloqueo ya no es solamente la topología exterior. Una masa continua puede evitar cápsulas, perforaciones y objetos internos sin producir por sí sola materia viva organizada. La próxima prueba separará responsabilidades:

- **Geometría:** masa continua, blanda y apta para constricción.
- **Material/volumen:** organización interna perceptible mediante gradientes de densidad, regiones densas y translúcidas relacionadas, pliegues y filamentos conectados.

Más samples no resolverían la lectura cerosa, mineral o plástica observada. Esas lecturas provienen de la relación entre forma, espesor y organización óptica, no de ruido de render.

**Fase 2A.3 permanece ABIERTA y NO APROBADA.** El Material Lab es un checkpoint diagnóstico y reproducible; no autoriza integrar A en Frame 04 ni avanzar a Fase 2B.

### Checkpoint Material Lab v2 — organización interna

`scripts/production/material-lab-v2.py` retoma exclusivamente la masa continua del método A. La geometría exterior se suaviza para reducir ruido, bultos repetidos y relieve de roca. La complejidad se traslada a un medio volumétrico continuo dentro de esa masa; no se agregan esferas, organelas, piedras, curvas ni objetos interiores.

Se produjeron tres stills del mismo sistema, a 1440×960, Cycles CPU y 16 muestras con denoise:

1. **V1 — superficie fina + volumen sencillo: NO.** Conserva continuidad y suavidad, pero la dispersión uniforme produce una masa lechosa, próxima a cera o una pieza moldeada. La profundidad interna casi no se percibe.
2. **V2 — gradientes internos: NO.** Zonas claras y turbias aparecen en profundidad, aunque todavía se leen como nubes dentro de resina. El borde y los reflejos separan perceptualmente superficie e interior.
3. **V3 — filamentos integrados: NO.** Los filamentos son crestas del mismo campo escalar y aportan dirección. Visualmente parecen velos o fibras borrosas encapsuladas; la masa conserva apariencia de gel o plástico fabricado.

V4 no se produjo. El gate indicaba detenerse si V3 permanecía en **NO**, y no surgió un ajuste concreto capaz de llevar el sistema a **SÍ** dentro de una cuarta iteración.

| Criterio | V1 | V2 | V3 |
| --- | --- | --- | --- |
| Masa continua | Sí | Sí | Sí |
| Profundidad interna | Muy baja | Parcial | Parcial, con dirección |
| Organización surgida de la materia | No perceptible | Nubosidad interna | Se insinúa, pero no convence |
| Lectura húmeda y blanda | Cerosa | Húmeda, todavía rígida | Gel moldeado |
| Evita cera, plástico, piedra y coral | No | No | No |
| Superficie e interior pertenecen al mismo sistema | Técnicamente sí, perceptualmente no | Parcial | Parcial |
| Admite futura deformación y división | Potencialmente | Potencialmente | Potencialmente, deformando también el campo |
| **Juicio** | **NO** | **NO** | **NO** |

La capacidad de división es una evaluación estructural del método; no se produjo ni simuló animación.

El bloqueo principal pasa a ser la **integración perceptual de superficie y volumen**. El sistema ya contiene gradientes y flujo continuo, pero el límite óptico sigue pareciendo un recipiente y la organización queda encapsulada. Los filamentos necesitan relacionarse con regiones densas y claras mediante variaciones de nitidez, escala y continuidad que este ensayo no resolvió.

Decisión de pipeline: A se conserva como posible base geométrica porque ofrece una masa continua y deformable. El material volumétrico procedural actual no queda aprobado ni se escala mediante más samples o refinamientos del mismo shader. La próxima prueba deberá mantener separadas las responsabilidades de **geometría = masa continua** y **material/volumen = organización interna**, y superar este gate aislado antes de regresar a Frame 04.

Los PNG y `.blend` de V1, V2 y V3 permanecen fuera del repositorio en `C:/Users/AMIRANDA/.codex/production/humanidad-adolescente/phase2a3/material-lab-v2/`. No se incorporan en la galería, no reemplazan hero frames y no reabren Agua, 03.5 ni continuidad.

**Fase 2A.3 permanece ABIERTA y NO APROBADA.** Este checkpoint conserva el diagnóstico y la decisión de pipeline; no inicia Fase 2B.

### Checkpoint Living Matter — pipeline híbrido image-driven

Después de cerrar la vía procedural pura como estrategia principal se construyó un micro-shot aislado de siete segundos en `experiments/living-matter/`. El estudio usa dos imágenes de estado, L0 desorganizada y L2 organizada, como materia visual; WebGL 2 aporta correspondencia 2.5D, deformación, continuidad de cámara, respiración, desplazamiento por profundidad y partículas. No intenta reconstruir profundidad real ni generar una materia nueva íntegramente mediante shader.

`scripts/production/capture-living-matter.cjs` reproduce el plano de forma determinista a 1440×600 y 30 fps. Las fuentes L0, L2 y la referencia de luz/material se conservan en `references/living-matter/`. El MP4 y sus secuencias de frames permanecen fuera del repositorio en `C:/Users/AMIRANDA/.codex/production/humanidad-adolescente/phase2a3/`; no se integran en la aplicación, la galería de lookdev ni el Preview.

Se probaron dos variantes del mismo micro-shot. La Variante 2 fue seleccionada como mejor candidata porque conserva el foreground de L0 como capa estable y organiza el relevo de materia de forma localizada. Sobre esa variante se realizó una única corrección adicional en el tramo medio:

- correspondencia mediante diez líneas de control sobre pliegues y filamentos principales entre L0 y L2;
- menor superposición de filamentos mediante un relevo temporal más corto y una máscara espacial suave;
- continuidad del volumen central sin modificar cámara, iluminación, profundidad general, foreground, duración ni timing global.

El inicio y el final de la V2 corregida coinciden píxel a píxel con la V2 previa a la compresión del video. La exportación resultante conserva 1440×600, 30 fps, 210 frames y 7 segundos. Fue decodificada de extremo a extremo y reproducida en Chrome sin errores.

| Evaluación Living Matter | Juicio | Diagnóstico |
| --- | --- | --- |
| V2 corregida | **CERCA** | Los pliegues y líneas principales se corresponden mejor y disminuye la doble exposición del tramo medio. Algunos filamentos finos todavía aparecen o desaparecen mediante mezcla. |
| Continuidad morfológica | **CERCA** | El plano se percibe más como reorganización de una misma masa, pero el detalle fino aún revela parcialmente el relevo entre imágenes. |
| Pipeline híbrido image-driven | **CAMINO PRINCIPAL** | La combinación de imágenes dirigidas artísticamente con cámara, profundidad y deformación en Blender/WebGL merece avanzar como base para la futura construcción de Frame 04. |

La V2 corregida es la mejor candidata actual y valida el pipeline híbrido como camino principal. **No es arte final aprobado. Fase 2A.3 permanece ABIERTA y NO APROBADA globalmente.** Este checkpoint no autoriza animación adicional, integración en la experiencia, apertura de Fase 2B ni regreso automático al material procedural puro.

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

Validación del checkpoint Material Target v2:

- `npm run build`: aprobado nuevamente con Vite 5.4.21 y 1.586 módulos transformados; el ensayo no cambia los chunks de la aplicación.
- `scripts/production/material-target-v2.py`: sintaxis verificada. Su dependencia NumPy pertenece al runtime de Blender utilizado por el ensayo y no agrega una dependencia al frontend.
- Verificación mínima local: experiencia original aislada; 2A.2 con reduced-motion y avance manual; galería lookdev operativa en 320, 390, 768, 1440 y 1920 px; consola, excepciones de página y respuestas HTTP sin errores.
- Los nuevos renders, `.blend`, sidecars y capturas de verificación permanecen locales y excluidos. Este checkpoint versiona únicamente el script reproducible y el diagnóstico.

Validación del checkpoint Material Lab:

- `scripts/production/material-lab.py`: ejecutado de extremo a extremo en Blender 4.5.13 LTS para A1/A2, B1/B2 y C1/C2. Los seis renders concluyeron con 16 muestras; no se aumentaron samples ni se produjo material adicional.
- `npm run build`: aprobado con Vite 5.4.21 y 1.586 módulos transformados.
- Verificación local de aislamiento: experiencia original intacta y sin solicitudes de recursos 2A; Master Shot 2A.2 conserva reduced-motion y avance manual; galería lookdev operativa en 320, 390, 768, 1440 y 1920 px.
- Navegación, recursos HTTP, excepciones de página y consola: sin errores en la comprobación.
- Los PNG, `.blend` y capturas `.audit` permanecen locales y excluidos. El checkpoint versiona solamente el script del laboratorio y el diagnóstico.

La estabilidad técnica no modifica el gate artístico: **A = NO, B = NO, C = NO**. Fase 2A.3 continúa abierta y no aprobada.

Validación del checkpoint Material Lab v2:

- `scripts/production/material-lab-v2.py`: ejecutado de extremo a extremo en Blender 4.5.13 LTS para V1, V2 y V3. Los tres renders concluyeron con 16 muestras. V4 no fue generado.
- `npm run build`: aprobado con Vite 5.4.21 y 1.586 módulos transformados.
- Verificación mínima local: obra original intacta; Master Shot 2A.2 con reduced-motion y avance manual; galería lookdev operativa; consola, excepciones de página y respuestas HTTP sin errores.
- Los PNG, `.blend` y logs `.audit` permanecen locales y excluidos. El checkpoint versiona únicamente el script reproducible y el diagnóstico.
- La estabilidad técnica no cambia los juicios **V1 = NO, V2 = NO, V3 = NO** ni cierra Fase 2A.3.

Validación del checkpoint Living Matter híbrido:

- `npm run build`: aprobado con Vite 5.4.21 y 1.586 módulos transformados.
- `node scripts/smoke-phase1a.cjs`: 6 comprobaciones aprobadas; experiencia original, cronología, futuros, quiz, modal, 320 px, reduced-motion y consola sin regresiones.
- `node scripts/verify-master-shot.cjs --functional`: aprobado; 2A.2 conserva reproducción completa, sincronización, pausas por visibilidad, pérdida de contexto, fallback semántico y avance manual con reduced-motion. No se registraron errores de consola.
- La V2 corregida ya exportada fue decodificada de extremo a extremo y reproducida en Chrome; inicio y final se verificaron idénticos a la V2 anterior antes de compresión. No se generaron renders adicionales para este checkpoint.
- Las salidas MP4/JPEG/PNG y `.audit` permanecen locales y excluidas. Se versionan el estudio aislado, su capturador, las tres fuentes necesarias y este diagnóstico.
- La estabilidad técnica confirma la reproducibilidad del estudio; el gate artístico permanece en **CERCA** y Fase 2A.3 continúa abierta y no aprobada.
