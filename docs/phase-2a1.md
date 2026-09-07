# Fase 2A.1 — Visual Ceiling

## Auditoría previa a la implementación

Base: `6c223374e57e125da145342f94f5c7072038ff80`, rama `humanidad-adolescente-v2`. Se preservan los tres archivos modificados del ensayo anterior (continuidad Canvas, constricción, aceleración y llegada sticky). Las referencias de 2A están copiadas en `.audit/phase2a1-before`, fuera de Git.

Capacidades comprobadas en este entorno Windows:

- AMD Radeon 680M; Chrome usa WebGL mediante ANGLE/Direct3D11 sobre esa GPU, no SwiftShader. Textura máxima informada: 16384. Esto no certifica otros dispositivos.
- Blender: no localizado en PATH, Program Files/Blender Foundation ni registro de aplicaciones. No se realizó una búsqueda exhaustiva de instalaciones portables y no se instaló Blender.
- No hay conector de generación 3D ni paquetes `three` o `@gltf-transform/core` resolubles. Es posible escribir geometría/glTF procedural, pero no hay un pipeline artístico 3D ya preparado.
- FFmpeg disponible con libaom-av1, libsvtav1, libvpx-vp9 y libx264. Sharp y Playwright disponibles en el runtime externo de Codex; no se añaden al producto.
- Generación de imágenes disponible como herramienta, pero no implica capacidad de generar escenas 3D editables. No se necesita para este ensayo.

## Elección antes de implementar

| Enfoque | Aporte visual esperado | Coste / límite | Decisión del ensayo |
| --- | --- | --- | --- |
| Canvas 2D | Contorno, composición, tipografía | Volumen y cámara limitados | Conservar como fallback |
| WebGL directo + shaders | Campo con profundidad, iluminación y superficie orgánica continua | Coste por píxel; exige resolución adaptativa y recuperación | Ensayar para Existencia/Vida |
| Three.js | Cámaras, modelos, materiales y pipeline glTF | Nueva dependencia; no elimina el trabajo artístico del shader | Viable dentro del chunk diferido, innecesario para una única superficie procedural |
| Blender → render/video | Mayor control de simulación, iluminación y acabado | Instalación y trabajo de producción; vídeo menos flexible al scroll, transferencia y decodificación | No disponible; recomendación a contrastar, no superioridad medida |
| Secuencia de imágenes | Control por cuadro | Muchos recursos, memoria/transferencia elevada | No elegida |
| AV1/VP9/H.264 prerenderizado | Calidad consistente sin raymarch en runtime | Necesita renders fuente y alternativas de códec; seek no garantiza fluidez | Alternativa futura para un plano fijo, sin inventar pesos |

El ensayo no instala herramientas ni añade dependencias. Usa geometría implícita 3D en GLSL, no exporta modelos ni texturas. La membrana es una metáfora visual, no una simulación biológica. Astra conserva HTML/CSS, negro y lenguaje.

Referencias técnicas consultadas: [WebGL y resolución/recursos](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices), [disposal en Three.js](https://threejs.org/manual/en/cleanup.html), [responsive en Three.js](https://threejs.org/manual/en/responsive.html), [requisitos de Blender](https://www.blender.org/download/requirements/). Las decisiones artísticas son evaluación propia.

## Implementación y calidad

- `OriginsVisual.jsx`: selecciona GPU o Canvas. Importa el renderer después de montar el prototipo; reduced-motion inicial no solicita ese chunk. Fallo de carga, inicialización, enlace de shader o pérdida de contexto pasa a Canvas.
- `originsRenderer.js`: un triángulo, un programa, ningún framebuffer auxiliar/textura/modelo. Libera buffers, programa, shaders, contexto, RAF, observers y listeners. Cielo se dibuja por interacción; Vida tiene un objetivo de 30 Hz, sólo visible y con página activa. Se omite el cálculo del cielo al completar el descenso.
- `origins.frag`: estrellas distribuidas en cinco planos de profundidad con proyección perspectiva; polvo procedural en plano inclinado. No se presenta esto como una simulación volumétrica de una galaxia. La membrana sí tiene superficie implícita 3D, normales, iluminación, integración interior aproximada y constricción/separación continua. No es óptica físicamente exacta ni simulación biológica.
- `SceneCanvas.jsx`: se conserva el ensayo previo como alternativa deliberada de líneas finas. Existencia y Vida comparten el mismo canvas y contorno. Se conservan también los cambios previos de estructura → marcas → símbolos → lenguaje/código en la transición ya existente; no se añaden actos.
- `Phase2APrototype.jsx`/CSS: wrapper común para evitar el salto entre canvases; llegada de Astra sticky, con tiempos originales y avance por scroll para visitantes rápidos. No atrapa scroll ni modifica textos. Un salto directo con End/ancla todavía puede omitir visualmente Hola: se preserva la libertad de navegación.

| Nivel | Elección | Resolución y coste |
| --- | --- | --- |
| HIGH | Escritorio sin señales de bajo recurso | DPR máximo 1,15, máximo 1,8 millones de píxeles, hasta 72 pasos de superficie |
| MEDIUM | Ancho inicial <700, memoria declarada ≤4 GB, Save-Data o cuadros lentos | DPR inicial máximo 1, máximo 650.000 píxeles, 48 pasos |
| Fallback | WebGL no disponible/falla/contexto perdido | Canvas con DPR ≤1,5; mismo texto y recorrido, estética de contornos |
| Reduced motion | Preferencia del sistema, incluida actualización en vivo | Canvas estático por estado de scroll, sin bucle temporal ni parallax; Hola inmediato; no carga inicial del shader |

El descenso adaptativo observa 45 cuadros y baja resolución si más del 30% excede 48 ms; puede bajar hasta escala 0,6 y no oscila hacia arriba durante la escena. No mide directamente temperatura/batería ni promete reconocer todos los dispositivos débiles. El nivel inferior es una composición más gráfica; no intenta fingir el mismo volumen con una imagen rota.

## Comparación artística 2A → Visual Ceiling

| Momento | 2A base | Ensayo actual | Juicio crítico |
| --- | --- | --- | --- |
| Existencia | Puntos y halo diagonal 2D | Polvo con absorción, planos perspectivos y desplazamiento de cámara | Más profundidad y presencia; el campo todavía es procedural y reconociblemente abstracto |
| Escala | Disco que crece y cambio entre escenas | Horizonte oscuro que comparte geometría/material con la membrana, canvas continuo | Elimina el corte, pero expansión/reencuadre no equivale todavía a sentir 32 órdenes de magnitud |
| Vida | Siluetas con interiores regulares | Volumen, luz lateral, pliegues, constricción, dos formas con variación | Salto claro; todavía se percibe una materialidad algo gelatinosa y una división simplificada |
| Astra | Negro + cursor + Hola | Mismo minimalismo; aparición también por avance de scroll | Sigue siendo el momento más controlado; no requiere GPU ni más espectáculo |
| Móvil | Líneas orgánicas de bajo coste | Volumen recompuesto bajo el texto; título VIDA separado de las formas | Se sostiene en 320/390; bordes menos finos y algunos cruces transitorios imagen/texto durante el descenso requieren criterio de dirección artística |

Se corrigieron durante revisión: material verde/brillante demasiado temprano en el horizonte, competencia de una célula con VIDA en móvil y cálculo innecesario del cielo dentro de la escena de Vida. No se detectaron regresiones en la obra original.

**¿Esto ya empieza a sentirse ULTRA PREMIUM INTERESTELAR?** En volumen y contraste, empieza a acercarse. **Como experiencia completa, todavía no.** No se aprueba como arte final sólo porque compila. Falta una dirección de cámara que haga legible el cambio de escala, más riqueza óptica/interior sin apariencia de plástico y evaluación humana del ritmo. El laboratorio queda implementado y verificable; el objetivo artístico superior queda expresamente abierto.

## Peso y rendimiento medidos

Build: Vite 5.4.21, 1.580 módulos, sin cambios en dependencias.

| Recurso | 2A (bytes) | Visual Ceiling (bytes) | Gzip actual |
| --- | ---: | ---: | ---: |
| JS principal | 201.260 | 201.268 | 63.180 |
| CSS original | 25.915 | 25.915 | 5.494 |
| JS del prototipo | 10.986 | 13.591 | 5.362 |
| Renderer + shader | 0 | 9.286 | 4.057 |
| CSS del prototipo | 7.190 | 7.379 | 2.332 |

El prototipo añade respecto a 2A **11.891 bytes de JS y 189 de CSS**; aproximadamente 5,1 KB gzip adicionales. El JS principal sólo varía 8 bytes por referencias de chunks; el CSS original conserva su hash `index-CuQ8K7Vc.css`.

Total de recursos JS/CSS del recorrido GPU: **257.439 bytes sin compresión**, **80.425 bytes gzip calculados**, más HTML (aproximadamente 1,21 KB / 0,56 KB gzip). Modelos, texturas, vídeo y fuentes externas: **0 bytes**. El valor gzip es compresión local calculada, no una medición de la respuesta del CDN. Reduced-motion inicial evita los 9.286 bytes del renderer. La URL normal no solicita los chunks del prototipo.

Transferencia idealizada de unos 81 KB comprimidos: 65 ms a 10 Mbps o 432 ms a 1,5 Mbps, **sin** latencia, TLS, parseo, compilación de shaders ni colas de red. En una medición local adicional, la primera orden de dibujo GPU llegó a ~636 ms desde navegación; `networkidle`/load del HTML no prueban que el shader ya haya dibujado. No se midió carga real de CDN en una conexión móvil.

Última corrida instrumentada, Chrome 152 en Windows, Radeon 680M, 1,8 segundos de constricción por ancho:

| Viewport | Nivel/buffer | Cuadros | GPU mediana / p95 (ms por dibujo) | CPU TaskDuration total (ms) |
| --- | --- | ---: | ---: | ---: |
| 320×740 | Medium, 320×740 | 52 | 0,70 / 1,56 | 30,46 |
| 390×844 | Medium, 390×844 | 54 | 1,12 / 1,73 | 29,37 |
| 768×1024 | High, 768×1024 | 52 | 2,37 / 2,83 | 28,41 |
| 1440×900 | High, 1440×900 | 53 | 3,18 / 3,82 | 27,25 |
| 1920×1080 | High, 1789×1006 | 52 | 3,85 / 4,80 | 27,06 |

Mediana entre dibujos ~33,4 ms (objetivo 30 Hz); p95 de intervalos llegó a ~49,6 ms. Las consultas GPU usan `EXT_disjoint_timer_query`, descartan resultados disjoint y sólo instrumentan el verificador. CPU es TaskDuration vía CDP, **no porcentaje del procesador**. Son muestras cortas, no benchmark certificado: otras corridas de este mismo ensayo dieron hasta ~19 ms de GPU mediana en 1920; carga concurrente/caché/estado de la GPU afectan el resultado. No se midieron vatios, temperatura ni uso global de GPU. Los viewports móviles usan esta misma Radeon, no hardware de teléfono.

## Verificaciones ejecutadas

```text
npm run build
node scripts/verify-phase2a.cjs
node scripts/verify-visual-ceiling.cjs
node scripts/smoke-phase1a.cjs
node .audit/phase2a-original-visual.cjs after
git diff --check
```

- Verificador 2A: seis grupos aprobados; 55 inspecciones de clipping en 320/390/768/1440/1920, textos esperados intactos, 20 capturas, navegación/selección/salto de foco, campo deshabilitado, negro/cursor/Hola y consola sin errores ni advertencias.
- Verificador Visual Ceiling: aprobado y proceso cerrado con código 0; 40 capturas en cinco anchos, `gl.getError()=0`, pausa oculta/fuera de viewport, cambio de reduced-motion con disposal, fallback por WebGL no disponible y pérdida real de contexto mediante la extensión de test. Reduced-motion no descarga renderer; igualdad del frame Canvas en el límite Existencia/Vida.
- Pruebas adicionales locales: fallo simulado de enlace de shader activa fallback; intervalos RAF artificialmente lentos activan Medium (prueba del mecanismo, no hardware lento real); 25 capturas adicionales de transición y comparación de VIDA.
- Original: seis grupos smoke aprobados, sin consola; **15/15 capturas idénticas píxel a píxel** (cinco anchos, inicio/resultado/modal). No se repitieron los 145 estados de 1A.
- Inspección visual real: láminas de cinco anchos, desktop/móvil antes/después, estados de descenso/constricción/separación, transición conservada y reducido. La ausencia de overflow horizontal no fue el único criterio.
- El verificador se adaptó al canvas compartido e instrumenta tanto Canvas como WebGL. La composición de láminas se separó del proceso de verificación después de observar cierres pendientes al combinar ambas tareas en el runtime externo; el verificador final termina correctamente. No se agregó Sharp/Playwright al proyecto.

Referencias locales, excluidas del commit:

- `.audit/phase2a1-before/`: 2A base.
- `.audit/visual-ceiling/{320|390|768|1440|1920}-{opening|descent|horizon|membrane|constriction|division|hello|reduced}.png`.
- `.audit/visual-ceiling/{390|1440}-before-after.png`: columna izquierda 2A, derecha Visual Ceiling; misma portada y ancla VIDA.
- `.audit/visual-ceiling/*-review.png`, `*-existence-0.96.png`, `*-acceleration-*.png`, `report.json`.
- `.audit/phase2a-original-after/`: comparación de obra original.

## Tecnología recomendada y límites del cierre

Recomiendo una arquitectura híbrida: HTML/CSS para lenguaje y accesibilidad; WebGL para escenas donde profundidad/translucidez hacen una diferencia; Canvas o arte estático deliberado como alternativa. **No hace falta introducir Three.js para este ensayo.** Si la obra final necesita una cámara real atravesando varios escenarios, geometrías editables o GLB, entonces Three.js sería una herramienta razonable para organizar esa producción, dentro de un módulo diferido.

Blender merece un ensayo posterior acotado a un plano de membrana con iluminación y simulación más cuidadas, para compararlo con este shader. No puedo afirmar que ya produzca un resultado superior: no estuvo disponible ni se generaron renders/GLB. Su eventual instalación y los pesos del pipeline deberán documentarse antes de usarlo. Vídeo prerenderizado podría elevar un plano fijo, pero no se recomienda sustituir todo el recorrido por una secuencia pesada sin medir seek, decodificación y variantes móviles.

Pendientes físicos: Safari/iOS, Android y GPU de gama baja, DPR alto real, cambios de barras/viewport, gestos y velocidad de lectura humana, temperatura/batería y lectores de pantalla. Pendientes artísticos: descenso de escala convincente y material celular definitivo. Ninguno se presenta como aprobado por la emulación.

Se persiste como **ensayo Visual Ceiling evaluable**, no como aprobación del arte final. Sólo `humanidad-adolescente-v2`, sin merge, producción, nuevos actos, OpenAI ni backend. El SHA final y Preview READY se comprueban después del push. Fin de esta tarea; no se inicia 2B.

## Verificación mínima de cierre — 07/09/2026

Se retomó exactamente el estado evaluado, sin nuevos ajustes visuales. Rama confirmada: `humanidad-adolescente-v2`. Build aprobado nuevamente con los mismos hashes de recursos de la evaluación final; diff sin errores de whitespace. Se preservan las pruebas completas ya aprobadas, sin repetir sus matrices.

Comprobación mínima sobre ese build, salida 0 y consola sin errores/advertencias: URL original aislada, query del prototipo, WebGL activo, Canvas cuando WebGL no existe, reduced-motion inicial/en vivo, Hola inmediato y ausencia de descarga de shader bajo reduced-motion inicial. Pérdida real de contexto: pasa a Canvas y conserva la respuesta seleccionada. Recarga posterior: se crea un contexto WebGL funcional.

**Límite explícito de restauración:** tras perder el contexto el componente GPU se desmonta y permanece en Canvas durante esa visita. No hay reactivación automática de WebGL por `webglcontextrestored`; la recuperación GPU comprobada requiere recargar. Esto es el comportamiento del ensayo que se cierra, no una prueba de restauración transparente. No se incorporó esa funcionalidad al persistir.

El reporte mínimo queda en `.audit/visual-ceiling/closure-check.json`, local y excluido del commit. Se guardan diez archivos versionables (código del prototipo, verificadores y documentación). No se incluyen capturas, `.audit`, dependencias ni archivos de build.
