# Fase 1B.1 — extracción de contenido y datos

Estado: completada. Base: `f4eab6e8ac140f8d14e0b80d854a7391f0c56d01`, rama `humanidad-adolescente-v2`.

## Objetivo y alcance

Reducir la responsabilidad de `src/App.jsx` moviendo únicamente estructuras estáticas a módulos JavaScript. Se preservan todas las cadenas, valores, claves y orden. No se extraen componentes ni hooks; no hay cambios editoriales, de diseño, de dependencias, de framework ni nuevas funcionalidades.

## Archivos y datos extraídos

| Archivo nuevo | Contenido que estaba en App.jsx |
| --- | --- |
| `src/content/stages.js` | Las seis etapas y sus textos, edades, logros, heridas y riesgos. |
| `src/content/futures.js` | Los tres futuros, colores y perspectivas. |
| `src/content/quiz.js` | Las cinco preguntas, opciones, valores y los tres textos de resultado. |
| `src/content/avatars.js` | La configuración existente de tamaños, proporciones y colores de avatares. |
| `src/content/reflections.js` | Las listas de señales de madurez y acciones personales, comunitarias e institucionales. |
| `src/content/shared.js` | El orden compartido de perspectivas y el texto existente para compartir el proyecto. |

Archivos modificados: `src/App.jsx` y `scripts/verify-phase1a.cjs`. Este documento es nuevo.

`App.jsx` pasa de **1.332 a 1.004 líneas**, una reducción neta de **328 líneas (24,6 %)**, excluyendo líneas vacías finales. Conserva los mismos componentes, estado, efectos, manejadores, JSX y estilos; importa los datos que consume.

## Decisiones

- Módulos con exportaciones nombradas e importaciones directas, sin agregar una capa de carga ni dependencias entre contenidos.
- Se mantienen en el componente la puntuación, los umbrales `1.5` y `2.5` y la lógica del quiz. Cada resultado se copia desde su dato estático para seguir entregando un objeto nuevo por cálculo, como antes.
- Se conservan los párrafos y encabezados escritos directamente en JSX, los SVG, los estilos y las expresiones que dependen de estado o del navegador. Moverlos exigiría una transformación adicional ajena a esta extracción de estructuras de datos.
- No se elimina ninguna copia antigua. No se cambian props, claves React, clases CSS, textos ni su orden.

## Verificaciones ejecutadas

- `npm run build`: aprobado, Vite 5.4.21. JS 198,40 kB (gzip 62,22 kB); CSS 25,92 kB (gzip 5,49 kB). El CSS generado conserva exactamente el archivo `index-CuQ8K7Vc.css` de la base.
- `node scripts/smoke-phase1a.cjs`: 6 grupos aprobados, sin errores de ejecución ni advertencias/errores de consola capturados.
- `node scripts/verify-phase1a.cjs --functional`: 4 grupos aprobados, sin errores de consola. Incluye teclado, los tres resultados del quiz, copia efectiva y fallback, autoplay/visibilidad/movimiento reducido y gestos sintéticos. Este modo no repite los 145 estados de layout de Fase 1A.
- Comprobación de extracción: 13 comparaciones de datos aprobaron igualdad exacta de valores, cadenas y orden respecto de la base. Revertir únicamente los reemplazos de extracción reconstruye el `App.jsx` original exactamente, normalizando sólo finales de línea.
- Comparación visual adicional de 15 capturas por versión en 320, 390, 768, 1440 y 1920 px: página completa inicial, página completa con etapa final/futuros/resultado y modal. Se usó movimiento reducido para comparar estados estáticos. Las 15 conservan dimensiones; 12 coinciden píxel a píxel. Tres capturas completas del resultado presentan variaciones de color de hasta 4/255 por canal, sin desplazamiento del contenido. Variaciones de la misma magnitud se reprodujeron entre capturas repetidas del mismo build. No se detectó una regresión visual atribuible a la extracción; no se afirma igualdad binaria de todas las capturas.
- `git diff --check`: aprobado. El diff de la aplicación es movimiento de datos e importaciones/referencias, sin reescritura de contenido.

Las capturas, utilidades temporales de comparación y reportes permanecen en `.audit/phase1b-*`, excluidos de Git. Se mantienen las limitaciones de dispositivos físicos y compatibilidad documentadas en `phase-1a.md`; esta fase no amplía esa cobertura.

## Única desviación necesaria

El verificador preexistente interpretaba `--functional` como URL si era el primer argumento. Se ajustó una línea de selección de URL para admitir exactamente `node scripts/verify-phase1a.cjs --functional`, conservando el argumento opcional de URL y todas las aserciones. Es un ajuste del ejecutor de pruebas; no modifica comportamiento de la aplicación.

## Persistencia y límite

Se entrega mediante commit y push a `humanidad-adolescente-v2`; el estado READY y el SHA del Preview se verifican después del push y se informan en la entrega. No se modifica `main`, no se promueve a producción y no se avanza a separación de componentes.
