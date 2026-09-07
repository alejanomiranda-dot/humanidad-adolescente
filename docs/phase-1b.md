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

## Fase 1B.3A

Estado: completada. Base: `8131cc35d4652171738be5a0b39f5c6520835798`, rama `humanidad-adolescente-v2`.

### Objetivo, archivos y responsabilidades movidas

Se crea `src/hooks/useTimeline.js`, un hook específico de Humanidad Adolescente que importa directamente `stages`. Se modifican únicamente `src/App.jsx` y este documento; no se cambian componentes, datos, estilos, dependencias ni scripts de pruebas existentes.

El hook contiene el estado de etapa actual, autoplay, visibilidad de cronología/página, movimiento reducido e indicación inicial de swipe; las referencias de cronología y comienzo táctil; los dos efectos de observación y reproducción; y los manejadores de navegación, teclado, gestos y scroll/foco al iniciar el recorrido.

Se trasladaron literalmente las declaraciones, efectos y manejadores: se conservan los listeners y su limpieza, IntersectionObserver, visibilitychange, matchMedia, cálculo sobre todos los textos de la etapa a 180 palabras por minuto con mínimo de 30 segundos, límites de navegación y parada en la última etapa. También se conservan los filtros de teclado, el umbral horizontal mayor que 50 px y que 1,5 veces el desplazamiento vertical, los controles/multitouch y el foco con preventScroll.

### Interfaz del hook

`useTimeline()` no recibe argumentos y devuelve:

- Estado consumido por la vista: `currentStage`, `autoPlay`, `reducedMotion`, `showScrollHint`.
- Control existente de reproducción: `setAutoPlay`.
- Referencia: `timelineRef`.
- Manejadores: `navigateStage`, `handleTimelineKeyDown`, `handleTouchStart`, `handleTouchEnd`, `handleTouchCancel`, `scrollToTimeline`.

No se exponen `setCurrentStage`, las banderas internas de visibilidad ni la referencia táctil. Se mantiene `setAutoPlay` para conservar sin cambios los callbacks existentes del botón y las pausas por interacción. El único cambio en JSX es conectar `onTouchCancel={handleTouchCancel}`; su cuerpo sigue siendo la misma asignación a null que antes estaba escrita en línea. No se agrega Context, memoización ni una abstracción genérica.

### Responsabilidades conservadas y líneas

`App.jsx` pasa de **747 a 678 líneas**, una reducción neta de **69 líneas (9,2 %)**, excluyendo líneas vacías finales. El hook tiene 106 líneas.

Permanecen en `App.jsx` la composición y el JSX de todas las secciones, `quizResult`, compartir, modal, portapapeles, URLs y la lógica de foco del diálogo. El botón general de volver al inicio también permanece allí y consume `reducedMotion` del hook como antes consumía ese estado local. Las conexiones en JSX que pausan o alternan autoplay se conservan para minimizar el diff; todo su estado y efectos residen en el hook. No se extrae lógica de otras secciones ni se cambian props públicas de los componentes.

### Verificaciones y resultados

- `npm run build`: aprobado, Vite 5.4.21 y 1.572 módulos. JS 198,81 kB (gzip 62,34 kB); CSS 25,92 kB (gzip 5,49 kB). El CSS sigue siendo `index-CuQ8K7Vc.css`, idéntico al de la base.
- `node scripts/smoke-phase1a.cjs`: 6 grupos aprobados, sin errores de ejecución ni advertencias/errores de consola capturados.
- `node scripts/verify-phase1a.cjs --functional`: 4 grupos aprobados, sin errores de consola. Incluye seis etapas por teclado, foco visible y contenido oculto; tres recorridos completos del quiz y portapapeles/fallback; mínimo de lectura de 30 segundos, avance automático, pausa por interacción, salida real del viewport, visibilitychange simulado, ausencia de reanudación automática, parada/desactivación en última etapa y cambio de reduced-motion en vivo; swipes sintéticos izquierda/derecha, vertical/diagonal, multitouch, cancelación y comienzo sobre botones.
- Comprobación adicional de cronología: 7 grupos aprobados. En movimiento normal y reducido se probaron los seis dots, anterior/siguiente por todo el recorrido, límites desactivados, descarte de la indicación de swipe y filtros de flechas en inputs/textarea/select/contenteditable/slider y con todos los modificadores. Se comprobó el retorno de foco al salir de una etapa y las pausas independientes por foco y pointerdown. El CTA desplaza realmente la página hasta la cronología y recibe foco con preventScroll; se registró la llamada smooth/auto correspondiente. Los controles editables fueron sondas temporales del DOM de prueba, sin cambios de aplicación.
- Comparación visual contra el build estable anterior: **15 de 15 capturas AFTER idénticas píxel a píxel a BEFORE**, en 320, 390, 768, 1440 y 1920 px. Para cada ancho: página completa inicial, página completa con última etapa/futuros/resultado y modal. Se estabilizaron las capturas con movimiento reducido; su comportamiento dinámico se comprobó por separado.
- Comparación de código: los bloques trasladados permanecen idénticos y el JSX completo coincide exactamente al revertir únicamente la conexión de cancelación táctil. Revisión del diff y `git diff --check` aprobados.

No se detectaron regresiones ni fueron necesarias correcciones funcionales. Las pruebas se ejecutaron sobre el build local en Chrome para Windows con Playwright externo, sin agregar dependencias al proyecto. Las capturas, comparadores y comprobaciones complementarias quedan en `.audit/phase1b3a-*`, excluidos de Git; los reportes existentes también permanecen locales.

Se mantienen las limitaciones físicas de Fase 1A: iPhone/Safari y Android/Chrome para arbitraje de swipe/scroll, inercia y multitouch; suspensión real de pestaña/app y bloqueo de pantalla; permisos de portapapeles y apertura de compositores de apps instaladas. La emulación y visibilitychange simulado no sustituyen esas pruebas. No se afirma ejecución del navegador sobre el Preview remoto.

### Persistencia y límite

Se entrega mediante commit y push a `humanidad-adolescente-v2`; el Preview READY y su SHA exacto se comprueban después del push y se informan en la entrega. `main` permanece intacta y no hay promoción a producción. La tarea termina en 1B.3A, sin avanzar a compartir/modal (1B.3B) ni a expansión editorial.

## Fase 1B.3B

Estado: completada. Base: `9858d80e9b16564173f130fd424bcf71016e2def`, rama `humanidad-adolescente-v2`.

### Hook, archivos y responsabilidades

Se crea `src/hooks/useSharing.js`. Se modifican únicamente `src/App.jsx` y este documento. El hook es específico de Humanidad Adolescente y recibe `quizResult` para construir el texto completo del resultado y el texto breve existente para X. Importa `projectShareText` desde el módulo de contenido existente.

Se trasladan referencias y estado del diálogo, feedback de compartir, apertura/cierre, captura y restauración del foco del trigger, showModal/close, bloqueo/restauración del overflow del body, scrollTop inicial del textarea, focus trap, clipboard.writeText y fallback con foco/selección. También se trasladan la URL basada en origin + pathname, las cuatro URLs sociales y window.open con los mismos parámetros. Los cuerpos del efecto y las funciones existentes se conservan literalmente; los callbacks que estaban en línea pasan a funciones con el mismo cuerpo.

### Interfaz pública

`useSharing(quizResult)` devuelve:

- Referencias: `shareDialogRef`, `shareTextRef`.
- Datos para la vista: `shareStatus`, `resultShareText`, `resultTweetText`, `shareUrl`.
- Acciones: `shareProject`, `copyResult`, `openShareModal`, `closeShareModal`.
- Eventos del diálogo: `handleShareDialogKeyDown`, `handleShareDialogCancel`, `handleShareDialogClick`.

La visibilidad interna, sus setters y `shareTriggerRef` no se exponen. Abrir conserva el mismo orden: registrar trigger, limpiar feedback y activar el modal. Escape sigue conectado a onCancel con preventDefault; el backdrop conserva la comparación entre target y currentTarget. No se agrega una abstracción genérica, Context, memoización ni dependencias.

### Responsabilidades conservadas y líneas

`App.jsx` pasa de **678 a 632 líneas**, una reducción neta de **46 líneas (6,8 %)**, excluyendo líneas vacías finales. El hook tiene 88 líneas.

Permanecen en `App.jsx` el estado `quizResult` y su reinicio, la composición y todo el JSX visual, incluido el diálogo. La lógica de preguntas/puntuación sigue en `QuizComponent`; la cronología sigue en `useTimeline`. Los callbacks que seleccionan plataforma y el stopPropagation del contenedor interior permanecen como conexiones directas en JSX, evitando wrappers adicionales. No se cambian textos, URLs, ARIA, clases, componentes ni contenido editorial.

El JSX completo coincide con la base al revertir sólo cinco sustituciones de conexión: apertura, cancel, backdrop, cierre y referencia al texto breve de X. No hay reestructuración visual.

### Verificaciones y regresiones

- `npm run build`: aprobado, Vite 5.4.21 y 1.573 módulos. JS 199,33 kB (gzip 62,48 kB); CSS 25,92 kB (gzip 5,49 kB). El CSS generado conserva el archivo `index-CuQ8K7Vc.css` de la base.
- `node scripts/smoke-phase1a.cjs`: 6 grupos aprobados, sin errores de ejecución ni advertencias/errores de consola capturados.
- `node scripts/verify-phase1a.cjs --functional`: 4 grupos aprobados, incluyendo cronología, teclado, autoplay, reduced-motion, gestos sintéticos, tres resultados del quiz y portapapeles/fallback. Sin errores de consola capturados.
- Comprobación adicional de compartir a 320 px: 5 grupos aprobados. Para cada uno de los tres resultados se comparó el texto completo exacto del textarea y la copia real al portapapeles; se comprobó denegación simulada con foco y selección completa; se verificaron Tab/Shift+Tab en ambos extremos y recorrido dentro del diálogo, foco inicial, scrollTop inicial y reinicio de feedback al reabrir después de éxito y fallo.
- Se probaron cierre por botón, Escape y clic real en backdrop, permanencia del modal al hacer clic dentro, restauración de foco al trigger con preventScroll y restauración de tres valores previos de overflow del body: vacío, scroll y auto. El bloqueo mientras está abierto es hidden.
- URLs de X/WhatsApp del modal comprobadas exactamente para cada resultado; las cuatro plataformas del footer conservan el texto/URL del proyecto y sus parámetros originales. Se verificaron encodeURIComponent, exclusión de query/hash de shareUrl, `_blank` y `noopener,noreferrer,width=600,height=400`. Todas las llamadas a window.open se interceptaron: no se publicaron ni enviaron mensajes, ni se abrieron compositores reales.
- Comparación visual: **15 de 15 capturas AFTER idénticas píxel a píxel a BEFORE**, en 320, 390, 768, 1440 y 1920 px. En cada ancho se comparó página completa inicial, página completa con última etapa/futuros/resultado y modal, estabilizadas con movimiento reducido.
- Comparación de código, revisión del diff y `git diff --check`, incluido el diff agregado: aprobados.

No se detectaron regresiones ni fueron necesarias correcciones funcionales. Las comprobaciones de navegador se ejecutaron sobre el build local en Chrome para Windows con Playwright externo. Los scripts existentes no se modificaron. Capturas, comparadores y pruebas complementarias permanecen locales en `.audit/phase1b3b-*`, excluidos de Git.

Se mantienen las limitaciones físicas de Fase 1A: permisos/selección manual de portapapeles móvil y apertura de compositores en apps instaladas, gestos táctiles e inercia, y suspensión real de pestaña/app. No se afirma compatibilidad probada en Safari/Firefox ni ejecución de navegador sobre el Preview remoto.

## Cierre Fase 1B

La Fase 1B concluye con extracción incremental de responsabilidades, preservando la experiencia original:

| Subfase | Responsabilidad separada | App.jsx antes | App.jsx después | Reducción neta |
| --- | --- | ---: | ---: | ---: |
| 1B.1 | Contenido y datos estáticos en seis módulos de `src/content/` | 1.332 | 1.004 | 328 |
| 1B.2 | Cinco componentes existentes en `src/components/` | 1.004 | 747 | 257 |
| 1B.3A | Cronología, autoplay, visibilidad y gestos en `useTimeline` | 747 | 678 | 69 |
| 1B.3B | Compartir, portapapeles y comportamiento del modal en `useSharing` | 678 | 632 | 46 |

Reducción acumulada de `App.jsx`, comparada contra `f4eab6e`: **1.332 → 632 líneas; 700 líneas menos (52,6 %)**. Se excluyen líneas vacías finales en todos los conteos. Esta cifra mide la responsabilidad retirada de App.jsx; el código se distribuyó en módulos, no se eliminó funcionalidad.

Arquitectura resultante:

- `src/content/`: etapas, futuros, quiz, configuración de avatares, reflexiones y datos compartidos.
- `src/components/`: Avatar, AdultAvatar, TimelineStage, FutureCard y QuizComponent, con sus props y comportamiento originales.
- `src/hooks/useTimeline.js`: lógica específica de cronología y reproducción.
- `src/hooks/useSharing.js`: lógica específica de compartir y diálogo, consumiendo el resultado del quiz.
- `src/App.jsx`: composición de la experiencia, JSX de secciones/modal, estilos existentes en línea y estado del resultado del quiz; conecta los módulos anteriores.

Se conserva Vite + React, JavaScript y Tailwind con las dependencias existentes. No se agregaron backend, IA, capítulos ni cambios editoriales; las copias antiguas y la deuda fuera de alcance permanecen. La única adaptación del ejecutor de pruebas realizada en 1B fue el soporte de `--functional` como primer argumento, documentado en 1B.1.

La entrega se persiste mediante commit y push a `humanidad-adolescente-v2`. El Preview READY, su correspondencia exacta con el SHA final y el árbol limpio se verifican después del push y se informan en la entrega. `main` permanece intacta, sin merge ni promoción a producción. La tarea termina aquí; no se inicia Fase 2.
