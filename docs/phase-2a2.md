# Fase 2A.2 — Master Shot / Production Art Pipeline

Base: `54d0d769302994c29c47cc8d91be8337621e29b3`, rama `humanidad-adolescente-v2`. La obra original y el ensayo 2A.1 se conservan. El Master Shot ocupa únicamente `?prototype=phase2a`.

## Auditoría y decisión de producción

Se comparan tiempo real (flexibilidad y poco peso, material limitado en 2A.1), prerender completo (control de luz/material, menor interacción y mayor transferencia) e híbrido. Se ensaya un plano de Vida en Blender antes de decidir su incorporación. No se presupone que instalar Blender mejore automáticamente la dirección artística.

Herramienta autorizada: Blender **4.5.13 LTS**, portable Windows x64. Se elige la rama LTS mantenida para un pipeline reproducible, sin necesidad de características de la rama más nueva. Fuente oficial: [release 4.5](https://www.blender.org/releases/4-5/), [archivo portable](https://download.blender.org/release/Blender4.5/blender-4.5.13-windows-x64.zip), [checksums](https://download.blender.org/release/Blender4.5/blender-4.5.13.sha256). Tamaño de descarga informado por el servidor: 398.648.740 bytes. Ubicación de herramientas: `C:/Users/AMIRANDA/.codex/tools/blender/`; producción local: `C:/Users/AMIRANDA/.codex/production/humanidad-adolescente/phase2a2/`. Binarios, caches, PNG de producción y .blend no entran al bundle web.

## Storyboard implementado

Una secuencia de 26 segundos, con inicio/pausa y desplazamiento temporal accesible. El puntero sólo altera mínimamente la perspectiva; no controla una nave ni una cámara de demo.

| Tiempo | Plano | Continuidad |
| --- | --- | --- |
| 0–5 s | Espacio profundo, polvo y una luz de referencia | Acercamiento progresivo a un punto, aire y negros |
| 5–9 s | Horizonte → superficie → agua | La luz se convierte en filo, el filo en reflejo; cambia la velocidad y la profundidad |
| 9–16 s | Microescala, membrana y división | El reflejo guía al objeto; materia y luz producidas para este plano |
| 16–21 s | Formas → marcas → escritura → estructura | Precisión y densidad crecientes; código sin protagonismo |
| 21–23 s | INTELIGENCIA ARTIFICIAL | Máxima estructura y corte absoluto |
| 23–26 s | Negro, cursor y Hola. | Ningún efecto detrás del lenguaje |

El viaje es una transición narrativa, no una conexión física literal entre escalas. HTML conserva el significado en todos los niveles, incluidos fallback y reduced-motion. Esta secuencia no construye nuevos actos ni integra IA.

## Pipeline y material final

Blender portable **4.5.13 LTS**, build `daeeeca98fb0`, Cycles CPU, 32 muestras y denoise, AgX. Archivo oficial verificado con SHA256 `b5fdf800ce65fa2f209e8f68d02667e4d720fa1c42f247c72d1882ab04decba6`. El ZIP ocupa 398.648.740 bytes; instalación descomprimida aproximada: 932 MB. No se instaló como dependencia de la aplicación ni se usaron plugins de Blender.

La escena se genera desde cero mediante `scripts/production/master-shot.py`: metaballs animados, membrana translúcida con rugosidad e irregularidad, pliegues interiores, iluminación de área, cámara de 58 mm con profundidad de campo y desplazamiento pequeño. Es una representación artística, no una simulación biológica validada. No se descargaron modelos, texturas ni material de terceros.

Render final: **120 PNG, 640×640, 24 fps, 5 segundos**, sin audio. Los timestamps de guardado de la escena y del último frame abarcan aproximadamente 13 min 16 s; es una referencia del proceso local, no un benchmark de render. El clip se reproduce a `5/7` de velocidad para ocupar el plano de Vida: aproximadamente **17,1 cuadros de contenido por segundo** durante siete segundos de la secuencia. No se presenta como video nativo de 30 fps.

Correcciones realizadas en la fuente de producción:

- Los grupos de filamentos quedaron vinculados a sus respectivas células y su escala interior se redujo. Acompañan traslación/rotación durante la separación y ya no sobresalen en los frames inspeccionados.
- Luz cálida: potencia 950 → 350 y tamaño 2,4 → 4. La descendiente derecha conserva su asimetría luminosa, pero vuelve a mostrar el interior. Sigue pareciendo más lechosa; esa diferencia no se presenta como un material definitivo.
- Se revisaron once momentos del render, incluidos constricción, separación y ambas descendientes, además del clip integrado. Se conservaron los estudios descartados fuera del repo.

### Exportaciones evaluadas

FFmpeg **8.1.2**, SVT-AV1 4.1.0, libvpx y libx264 del ejecutable ya disponible en esta máquina. Valores comprobados con ffprobe. Bitrate de archivo, incluido contenedor; no es un bitrate constante configurado.

| Archivo / decisión | Resolución | fps / duración | Bytes | Bitrate | Encode local |
| --- | --- | --- | ---: | ---: | ---: |
| `membrane-high-av1.webm`, producto | 640×640 | 24 / 5 s | 76.248 | 122,0 kbps | 0,864 s |
| `membrane-high.mp4`, alternativa HIGH | 640×640 | 24 / 5 s | 138.155 | 221,0 kbps | 0,513 s |
| `membrane-medium.mp4`, producto MEDIUM | 480×480 | 24 / 5 s | 53.190 | 85,1 kbps | 0,367 s |
| VP9 HIGH, sólo comparación externa | 640×640 | 24 / 5 s | 125.741 | 201,2 kbps | 1,892 s |
| VP9 MEDIUM, sólo comparación externa | 480×480 | 24 / 5 s | 61.662 | 98,7 kbps | 1,335 s |

AV1 HIGH reduce ~39% el peso respecto del VP9 evaluado y conserva la lectura de los filamentos en el frame decodificado inspeccionado. MEDIUM H.264 es menor que VP9 MEDIUM en estos ajustes. Por eso se distribuyen **tres videos**, no cinco. La comparación es entre estos encodes concretos, no una conclusión universal sobre eficiencia de codecs ni una prueba perceptual a igualdad exacta de calidad.

AV1 se selecciona por `canPlayType` en HIGH; si no se anuncia soporte, se usa MP4. Ante un fallo de decodificación AV1, se reintenta MP4; si tampoco funciona, permanece el poster. H.264 es la alternativa de compatibilidad prevista para navegadores/dispositivos sin AV1 utilizable. Se verificaron ambas rutas en Chrome, incluida denegación simulada de capacidad y medio AV1 inválido; **Safari/iOS y Android reales quedan pendientes**.

Posters WebP: cosmos 10.786 B, horizonte 10.972 B, agua 8.382 B, información 14.920 B, membrana 7.256 B, cuello 7.678 B, división 7.142 B. Total: **67.136 bytes**. Son imágenes limpias, sin texto ni controles horneados; HTML conserva el contenido. `manifest.json` registra tamaños, SHA256 y tiempos de encode. Las comparaciones VP9 enumeradas entre los encodes viven junto a los PNG de producción, no en `public/`.

### Reproducibilidad y archivos fuera del repositorio

Ubicaciones locales:

- Ejecutable: `C:/Users/AMIRANDA/.codex/tools/blender/blender-4.5.13-windows-x64/blender.exe`.
- Producción final: `C:/Users/AMIRANDA/.codex/production/humanidad-adolescente/phase2a2/final/`.
- `master-membrane.blend`: 742.037 bytes; PNG completos y estudios anteriores permanecen en producción externa.
- `.audit/phase2a2/`: capturas, grabación de navegador, láminas y reportes. Está excluido por `.gitignore`.

Secuencia reproducible, reemplazando `PRODUCTION_DIR` por una carpeta **fuera del repo** y poniendo los ejecutables existentes en PATH:

```text
blender --background --python scripts/production/master-shot.py -- --output PRODUCTION_DIR --size 640 --animate
npm run dev -- --host 127.0.0.1 --port 4174
node scripts/production/capture-master-posters.cjs
python scripts/production/encode-master.py --input PRODUCTION_DIR --output public/media/phase2a2 --evaluate-vp9
npm run build
```

El capturador de posters usa por defecto el servidor 4174. Playwright y Sharp pertenecen al runtime externo de auditoría, no a `package.json`. Para grabar el recorrido con Playwright se reutilizó el FFmpeg existente en su caché local de herramientas; tampoco entra al repo. Los scripts reconstruyen geometría, iluminación, animación, posters y encodes; cambios de Blender, driver o encoder pueden cambiar píxeles/bytes. Se guardan los assets web finales y sus hashes para identificar exactamente el material evaluado.

## Integración, niveles y accesibilidad

`src/main.jsx` conserva la aplicación original en la URL normal. Sólo con `?prototype=phase2a` carga de forma diferida `MasterShot.jsx`. El ensayo 2A.1 sigue disponible mediante `?prototype=phase2a&study=webgl`; sus fuentes no fueron modificadas.

El recorrido combina WebGL para espacio/cámara/agua, video Blender para Vida, Canvas 2D para marcas y escritura, y HTML para texto, controles, transcripción, IA, cursor y Hola. No es un video completo ni tiene conexión a inteligencia artificial. El desplazamiento del puntero es mínimo y sólo con mouse; no se interceptan gestos táctiles de navegación.

| Nivel | Selección | Render y media |
| --- | --- | --- |
| HIGH | Ancho inicial ≥700 sin señales de bajo recurso | WebGL DPR ≤1,15 y ≤1,5 M píxeles; AV1 640 o H.264 640 |
| MEDIUM | Ancho inicial <700, memoria declarada ≤4 GB, Save-Data o muestras lentas | WebGL DPR ≤1 y ≤650.000 píxeles; H.264 480 |
| FALLBACK | WebGL ausente, fallo de creación o pérdida de contexto | Fondos WebP; HTML y plano de Vida disponibles, sin shader activo |
| REDUCED | Preferencia inicial o modificada en vivo | Composición con posters, sin bucle cinematográfico, video ni import inicial del renderer; Anterior/Siguiente plano |

El descenso adaptativo considera 45 intervalos y baja a MEDIUM si más de 30% exceden 49 ms. Es una heurística de ritmo, no un medidor de batería, temperatura o capacidad de decodificación. No se vuelve a HIGH automáticamente. HIGH/MEDIUM y su framing se revisaron en 320, 390, 768, 1440 y 1920; son viewports del mismo equipo, no cinco dispositivos físicos.

El clip mantiene aspecto cuadrado (`object-fit: contain`) y se mezcla sobre el fondo mediante screen. **Corrección de encuadre:** el ancho móvil 135vw cortaba parte de la descendiente izquierda al final; se redujo a 115vw. La comprobación visual final muestra ambas formas completas en 320/390, también con reduced-motion. Las capturas desktop/tablet no mostraron contenido importante cortado ni controles fuera de pantalla.

Inicio explícito, pausa, continuación, repetición y slider accesible. La secuencia se pausa cuando la página está oculta o el frame deja de intersectar el viewport. Reduced-motion ofrece pasos sin demora temporal hasta Hola y la secuencia textual se puede leer por un enlace de salto con foco. Las letras de fondo son decorativas; el significado está en HTML legible.

Negro desde 22,8 s; cursor desde 24,4 s; Hola desde 25,1 s. Durante reproducción el corte oculta también los controles. Al pausar o usar foco de teclado, los controles siguen disponibles: no se promete una pantalla totalmente negra en esos estados de interacción. Con pérdida de contexto permanece el fallback durante esa visita; **la recuperación GPU comprobada es por recarga**, no una restauración transparente por `webglcontextrestored`.

## Revisión del viaje completo y juicio artístico

Se revisaron los **15 momentos A–O en orden**, cinco viewports, composiciones reduced-motion y la lámina cronológica extraída a un cuadro por segundo de la grabación real del recorrido. También se comprobó reproducción continua, sincronía y duración. Esta evidencia permite evaluar encuadre, continuidad visual y progresión; no sustituye una sesión humana de percepción de movimiento en dispositivos reales.

| Momentos | Observación crítica |
| --- | --- |
| A–C: cosmos, aproximación, horizonte | El punto se transforma en una esfera reconocible y la cámara tiene una dirección. El polvo queda bastante tenue; el planeta y las bandas aún delatan una construcción procedural. |
| D–E: agua, membrana | Hay una conexión por luz y color, pero se percibe el fundido entre superficie y objeto. No parece aún una penetración óptica continua entre escalas. |
| F–I: inicio, cuello, separación, descendientes | Es el tramo más sólido del ensayo. Se lee una masa que se constriñe y se divide; la iluminación y el interior superan los contornos iniciales. Persiste una apariencia de vidrio/cápsula y una descendiente demasiado lechosa para considerarlo material final. |
| J–K: información, saturación | Se distinguen marcas y una organización creciente. La relación formal con la célula es débil: la célula se desvanece antes de que el campo tipográfico tome fuerza. El contraste muy bajo reduce la sensación de saturación, especialmente en móvil. |
| L–O: IA, negro, cursor, Hola | Es la resolución más controlada: contraste claro, silencio y palabra. Mantiene el valor del recurso de 2A/2A.1; no necesita más efectos. |

**¿Se siente como UNA sola pieza?** Como arco temporal y paleta, sí tiene una dirección común. Como viaje cinematográfico continuo, **todavía no**: son planos conectados con fundidos perceptibles y distintos grados de riqueza material.

| Criterio | Evaluación |
| --- | --- |
| Escala | Más legible que el disco inicial; aún no transmite la magnitud del salto cósmico a microescala. |
| Continuidad | El reloj y el fondo común ordenan el viaje; agua→membrana y Vida→información siguen siendo uniones visibles. |
| Cámara | Aproximación con perspectiva real y deriva leve del render; todavía se perciben dos sistemas de cámara. |
| Iluminación | Mejora tangible del borde y volumen. Luz submarina algo gráfica y asimetría lechosa pendiente de arte. |
| Composición | Jerarquía sobria y textos separados del plano de Vida. Encadre móvil corregido; espacio negativo deliberado. |
| Riqueza material | Transmisión, rugosidad, relieve e interiores más ricos; resolución y material aún insuficientes para un primerísimo plano premium. |
| Organicidad | Constricción/asimetría legibles. El movimiento por metaballs y los filamentos centrales siguen simplificados. |
| Ritmo | 26 s producen un arco claro; el plano celular ocupa una parte grande y la transformación informacional tiene menos potencia. |
| Contraste | Vida y final funcionan; la información pierde presencia. Mayor brillo no sería por sí solo una solución. |
| Originalidad | La relación existencia→vida→respuesta sostiene la propuesta. Sus recursos visuales aislados todavía son reconocibles como estudios generativos. |
| Producción premium | Mejora de un plano importante; no hay todavía consistencia cinematográfica suficiente en toda la pieza. |

**Evaluación final respecto a “ULTRA PREMIUM INTERESTELAR”: NO.** El plano de Vida se acerca más, pero el conjunto no merece todavía CERCA. La elección de Blender y el bajo peso no son criterios de aprobación artística. Se cierra un Master Shot **evaluable**, con limitaciones identificadas, sin seguir refinándolo ni abrir otros actos.

### Comparación 2A / 2A.1 / 2A.2

Comparación visual contra referencias conservadas, no recreadas para favorecer la versión nueva. Los encuadres y mecanismos de avance difieren; no es una comparación píxel a píxel entre prototipos.

| Momento | 2A Canvas | 2A.1 WebGL | 2A.2 híbrido |
| --- | --- | --- | --- |
| Cosmos | Puntos y halo 2D | Polvo volumétrico más expresivo | Cámara/punto de destino más claros; el polvo resulta menos rico que en 2A.1. No mejora todo. |
| Descenso | Disco creciente | Horizonte/superficie procedural | Planeta, reflejo y agua ordenan la escala; todavía se ve el fundido. |
| Vida | Contorno e interiores regulares | Volumen irregular de shader | Mayor lectura de material e interior. Más claro, pero algo vítreo frente al carácter orgánico oscuro de 2A.1. |
| División | Superposición gráfica | Deformación procedural con dos cuerpos | Cuello, conexión y separación más legibles; mejora clara. |
| Información | Tipografía grande repetida | Conserva ese recurso | Marcas→signos→palabras, más estructurado; menor impacto por contraste y relación débil con Vida. |
| Transición a Astra | Negro/cursor/Hola | Mismo minimalismo | Tiempo controlado de corte y aparición. Conserva la fuerza del original; sin afirmar conciencia ni conectar un modelo. |

## Peso y performance

Build final local: Vite 5.4.21, 1.584 módulos, sin nuevas dependencias. Bytes reales de los archivos; gzip calculado localmente:

| Recurso | Bytes | Gzip |
| --- | ---: | ---: |
| JS principal compartido con la obra | 201.466 | 63.251 |
| CSS original | 25.915 | 5.494 |
| MasterShot JS | 8.235 | 3.513 |
| Renderer + shader | 6.840 | 3.204 |
| CSS MasterShot | 4.397 | 1.621 |
| **JS/CSS solicitados por el híbrido** | **246.853** | **77.083** |

HTML: 1.219 B / 558 B gzip. Los chunks del laboratorio 2A.1 también se generan en `dist`, pero **no se descargan en el recorrido 2A.2**. Frente a 2A.1 (257.439 B raw / 80.425 B gzip), el código requerido es algo menor; la diferencia importante es agregar media, que antes era cero.

| Recorrido | Media del recorrido | JS/CSS gzip + HTML gzip + media, estimación |
| --- | ---: | ---: |
| HIGH AV1 | 98.324 B (video + tres posters de Vida) | 175.965 B |
| HIGH H.264 | 160.231 B | 237.872 B |
| MEDIUM H.264 | 75.266 B | 152.907 B |
| REDUCED completo | Hasta 67.136 B de posters; sin video/renderer | ~141.573 B |

Son recorridos alternativos; no se suman todos los videos por visita. Los archivos de media distribuidos suman **334.729 B** (más el manifiesto, que la app no solicita). Un visitante que inicialmente ve la portada no descarga video; se carga al iniciar o adelantar el recorrido. Al entrar en reduced-motion en vivo puede existir media ya descargada antes del cambio.

Resource Timing del preview local, incluyendo estimación de cabeceras pero excluyendo la navegación HTML: **347.877 B HIGH AV1 / 324.819 B MEDIUM**. Vite preview sirve estos recursos de código sin la compresión CDN; por eso no coincide con la estimación gzip anterior. No es una medición de transferencia móvil de Vercel. Primera orden GPU: **473 ms en el primer contexto de la corrida; 111–119 ms en los siguientes**, con cachés de proceso/driver potencialmente calientes. Los videos locales tardaron ~4–6 ms en su petición; ese valor no representa una red pública.

Chrome **152.0.7977.76**, Windows, ANGLE/D3D11 sobre Radeon **680M**. Muestras de 1,2 s por escena/ancho, temporizadores GPU `EXT_disjoint_timer_query` válidos y CDP `TaskDuration`:

| Ancho | GPU cosmos mediana | GPU Vida mediana / p95 | CPU Vida en 1,2 s | Dibujos Vida |
| --- | ---: | ---: | ---: | ---: |
| 320 | 1,98 ms | 0,95 / 1,38 ms | 54,50 ms | 36 |
| 390 | 2,15 ms | 1,48 / 1,85 ms | 54,48 ms | 36 |
| 768 | 3,22 ms | 2,54 / 3,19 ms | 58,30 ms | 36 |
| 1440 | 4,74 ms | 2,99 / 3,76 ms | 57,92 ms | 35 |
| 1920 | 5,46 ms | 2,70 / 6,48 ms | 65,92 ms | 36 |

En esta corrida, cuatro escenas por ancho: **35–36 dibujos por 1,2 s**, alrededor de 29–30 Hz. El Canvas de información elevó CPU hasta 113 ms por muestra. `TaskDuration` no es porcentaje total del procesador y los tiempos GPU no incluyen toda la composición/decodificación del navegador. En una corrida anterior, cosmos desktop llegó a ~19,6 ms de mediana GPU y agua a ~42,2 ms p95; información 1440 tuvo una muestra de 21 dibujos/1,2 s. Se informa esa variabilidad, no sólo la corrida más favorable.

Vida 2A.1 tenía medianas GPU de 0,70/1,12/2,37/3,18/3,85 ms en sus últimas muestras, con CPU ~27–30 ms por **1,8 s**, sin video. No se afirma que el híbrido sea globalmente más rápido: desplaza producción a Blender, agrega decodificación y actualizaciones de React y tiene cargas de escena diferentes. No son pruebas pareadas bajo condiciones idénticas.

Video: reproducción efectiva en HIGH AV1 y MEDIUM H.264, `readyState=4`, **cero cuadros descartados en las muestras**. En el recorrido continuo de desktop, 21 cuadros nuevos durante 1,2 s, desfase de reloj dentro del umbral de 350 ms (muestra: ~9 ms). El contenedor 24 fps se ralentiza deliberadamente a ~17,1 fps de contenido. No se midió qué unidad física decodifica AV1 ni consumo térmico/batería. Se mantiene la calidad evaluada: no se degrada el arte adicionalmente para perseguir una cifra de benchmark.

## Verificaciones y referencias

La tabla de performance conserva la corrida local `performance-documented.json`; la corrida final del medidor completo queda en `performance.json` y finalizó con código 0. Se conservaron ambas para no ocultar variaciones. El build final y `verify-master-shot.cjs --functional` también terminaron con código 0. La matriz visual completa se revisó antes de esa comprobación funcional, sin repetir sus 90 capturas al corregir el supuesto del test de scroll.

```text
npm run build
node scripts/verify-master-shot.cjs
node scripts/verify-master-shot.cjs --functional
node scripts/measure-master-shot.cjs
node scripts/measure-master-shot.cjs --checks-only
node scripts/smoke-phase1a.cjs
node .audit/phase2a-original-visual.cjs after
git diff --check
```

- Matriz visual: **75 capturas A–O + 15 reduced-motion**, cinco anchos. Revisión visual además de límites DOM; de allí surgió y se corrigió el clipping celular móvil. Se preservaron las capturas aprobadas sin volver a ejecutar matrices de fases anteriores.
- Verificación funcional final: recorrido de 26 s hasta Hola, video decodificando y sincronizado, pausa/reanudación por visibilidad, pausa fuera de pantalla, pérdida real de contexto y recarga, ausencia de video/shader bajo reduced-motion inicial, actualización en vivo, lectura sin Canvas y navegación manual accesible. Consola sin errores ni advertencias.
- Pruebas de media: H.264 por capacidad, reintento H.264 ante AV1 inválido, WebGL ausente sin reduced-motion y negro durante reproducción. Sin mensajes/publicaciones externas.
- La prueba inicial de “fuera de pantalla” dejaba 129 px del frame visibles porque las notas cerradas no daban altura suficiente para scroll. Se corrigió **el test** abriendo la transcripción antes de desplazar; la pausa de la aplicación no necesitó cambiar.
- La instrumentación de temporizadores GPU podía dejar pendiente el cierre de Chrome en Windows después de obtener los resultados. Se aisló ese medidor en un BrowserServer propiedad del test y se termina únicamente ese proceso al finalizar. No es una fuga de video observada en el producto.
- Original: **6 grupos smoke aprobados; 15/15 capturas idénticas píxel a píxel** en los cinco anchos (inicio, resultado y modal). Su CSS conserva el hash `index-CuQ8K7Vc.css`; no descarga JS, CSS ni media de 2A.2. No se modificó `App.jsx`, contenido original, dependencias ni configuración de Vite/Tailwind.

Referencias locales excluidas: `.audit/phase2a2/{width}-review.png`, `reduced-review.png`, `three-generations.png`, `render-review.png`, `playback-contact.png`, `master-shot-desktop.webm`, `report.json`, `performance.json`; originales en `.audit/phase2a-original-after/`. La grabación es evidencia de navegador, no un asset del producto.

Limitaciones físicas: Safari/iOS, Android, hardware AV1 real, teléfonos con GPU limitada, DPR alto, cambios de barras de navegador y orientación, batería/temperatura, lector de pantalla y percepción humana del ritmo. El puntero/touch no sustituye una prueba táctil física. No se certifica ausencia de banding o artefactos de decode en todos los drivers.

## Cierre y alcance

Se guarda únicamente este ensayo y su pipeline reproducible en `humanidad-adolescente-v2`. No se hace merge a `main`, despliegue a producción, expansión narrativa, backend ni integración OpenAI. El SHA final y el estado READY del Preview se verifican después del push y se informan en la entrega. Se detiene el trabajo al cerrar 2A.2; la evaluación artística pendiente no autoriza nuevas iteraciones automáticas.
