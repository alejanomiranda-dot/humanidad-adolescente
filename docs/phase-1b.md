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

## Fase 1B.2

Estado: completada. Base: `7e5d8645abea400cf973a7f93a204294be298fbc`, rama `humanidad-adolescente-v2`.

### Objetivo y archivos

Extraer los cinco componentes existentes de forma mecánica, preservando sus props, defaults, estado local, textos, clases, SVG, atributos de accesibilidad y orden de renderizado.

Archivos creados:

- `src/components/Avatar.jsx`
- `src/components/AdultAvatar.jsx`
- `src/components/TimelineStage.jsx`
- `src/components/FutureCard.jsx`
- `src/components/QuizComponent.jsx`

Archivos modificados: `src/App.jsx` y este documento. No se modifican contenido, estilos, dependencias ni scripts de pruebas.

Se utiliza una carpeta plana para estos cinco componentes. Cada archivo conserva el cuerpo del componente original y agrega únicamente sus imports y una exportación por defecto. La extracción se realizó en tres grupos: avatares, tarjetas y quiz, con compilación después de cada grupo. Se eliminaron cinco espacios finales heredados en líneas de los componentes movidos para que el diff agregado también supere `git diff --check`; no se modificaron cadenas ni expresiones.

### Responsabilidades y reducción

`App.jsx` pasa de **1.004 a 747 líneas**, una reducción neta de **257 líneas (25,6 %)**, excluyendo líneas vacías finales.

`HumanityAdolescence` conserva la composición de la página, el estado global, los efectos, referencias, autoplay, visibilidad, navegación, gestos, resultado, compartir y manejo de foco del modal. Su cuerpo completo permanece idéntico al de la base, normalizando únicamente finales de línea.

No quedan otros componentes nombrados que corresponda extraer en este alcance. Las secciones y el modal escritos directamente en el JSX permanecen en `App.jsx`: convertirlos en componentes requeriría definir nuevas interfaces y trasladar dependencias del estado compartido. No se extraen hooks ni se modifica esa lógica.

### Verificaciones

- `npm run build`: aprobado después de cada grupo y en el estado final. Vite 5.4.21, 1.571 módulos; JS 198,40 kB (gzip 62,23 kB), CSS 25,92 kB (gzip 5,49 kB). El CSS generado conserva el archivo `index-CuQ8K7Vc.css` de la base.
- `node scripts/smoke-phase1a.cjs`: 6 grupos aprobados, sin errores de ejecución ni advertencias/errores de consola capturados.
- `node scripts/verify-phase1a.cjs --functional`: 4 grupos aprobados. Incluye teclado y foco visible, los tres resultados del quiz, copia efectiva y fallback, autoplay y pausas por interacción/visibilidad, movimiento reducido y gestos sintéticos. Sin errores de consola capturados.
- Comparación directa contra `7e5d864`: los cinco cuerpos extraídos son idénticos salvo finales de línea y los espacios finales indicados; el cuerpo completo de `HumanityAdolescence` es idéntico. Se mantienen textos, props, defaults, clases, SVG y estructura funcional.
- Comparación visual local: **15 de 15 capturas AFTER idénticas píxel a píxel a BEFORE**, en 320, 390, 768, 1440 y 1920 px. Para cada ancho se comparó la página completa inicial, la página completa con cronología final/futuros/resultado y el modal. Esto incluye portada, cronología, futuros, quiz, resultado y modal. Movimiento reducido se utilizó para estabilizar las capturas; autoplay y movimiento reducido también se verificaron funcionalmente.
- `git diff --check` y revisión del diff agregado: aprobados. Los cambios representan movimiento de componentes e imports, sin transformaciones funcionales.

No se detectaron regresiones visuales ni funcionales. Las capturas, comparadores y reportes permanecen locales en `.audit/phase1b2-*` y `.audit/verification/`, excluidos de Git. Las pruebas de navegador se ejecutaron sobre el build local; no se presentan como pruebas de ejecución del Preview remoto. Se mantienen las limitaciones de dispositivos físicos y compatibilidad documentadas en Fase 1A: los gestos sintéticos y la emulación responsive no sustituyen un dispositivo físico ni la hoja nativa de compartir de cada sistema operativo.

### Cierre

Se entrega mediante commit y push a `humanidad-adolescente-v2`. Después del push se comprueba que el Preview esté READY y asociado exactamente al SHA final, informado en la entrega. No se modifica `main` ni se promueve a producción. La tarea termina en 1B.2; no se avanza a extracción de hooks o lógica (1B.3).
