# Fase 2A — prototipo de lenguaje visual

Base: `e828ff342ace7c5294016eeb01ffa4678f1cf3a7`, rama `humanidad-adolescente-v2`.

Estado: prototipo implementado y verificado localmente, listo para evaluación visual. No representa una aprobación artística definitiva ni la construcción de la obra completa. El commit y su Preview READY se identifican en la entrega, tras el push.

## Concepto visual

La interfaz evoluciona junto con la conciencia: primero espacio y escala, después organización y variación, finalmente lenguaje y quietud. Negro profundo, blanco cálido, azul casi negro, turquesa/verde y pequeños acentos ámbar. Sin tarjetas, avatares, robots, burbujas de chat, imágenes, video ni audio.

Tres voces con fuentes locales: sans del sistema para cosmos/narración, Georgia para las dos preguntas/reflexiones editoriales y monospace para Astra, anotaciones y signos. No se solicitan fuentes externas. El copy narrativo suministrado se conserva; sólo se agregan etiquetas funcionales de prototipo, navegación y campo no disponible.

## Arquitectura temporal y aislamiento

- La entrada normal conserva `App`, sin cambios en `App.jsx`, sus componentes, hooks ni contenido.
- `src/main.jsx` comprueba exactamente `prototype=phase2a`. Sólo en ese caso solicita el módulo con `React.lazy`; no se agrega router.
- `src/prototypes/phase2a/Phase2APrototype.jsx`: estructura semántica, respuestas temporales, preferencia de movimiento, llegada de Astra y campo deshabilitado.
- `src/prototypes/phase2a/SceneCanvas.jsx`: tres representaciones Canvas 2D, progreso derivado del scroll natural, observación y limpieza de recursos.
- `src/prototypes/phase2a/phase2a.css`: estilos exclusivos con prefijo `p2-`, cargados con el módulo del prototipo. No modifica selectores globales de la experiencia original.
- `tailwind.config.cjs`: excluye `src/prototypes` del escaneo de utilidades. El laboratorio tiene CSS propio; esta exclusión evita que palabras de su JavaScript alteren el CSS común. No se cambia la versión ni el tema de Tailwind.
- `scripts/verify-phase2a.cjs`: verificación reproducible sobre el build, usando el mismo Playwright externo y Chrome que las pruebas de Fase 1.

Para retirar el laboratorio: eliminar su carpeta y verificador, retirar la selección condicional de `main.jsx` y la exclusión del escaneo. No hay datos persistidos, contratos de backend ni estado compartido con la obra original que migrar.

## Comportamiento de las escenas

### Existencia

Campo de 430 estrellas deterministas, con capas de tamaño/luminosidad y una concentración galáctica diagonal. El puntero desplaza las capas hasta unos pocos píxeles y el scroll cambia ligeramente la perspectiva. No hay movimiento continuo de estrellas en reposo.

El texto inicial da paso a MATERIA, ENERGÍA, ESPACIO y TIEMPO con distintas posiciones, tamaños aparentes y tonos. Luego aparecen el observador ausente y la pregunta editorial. Las tres respuestas son botones con `aria-pressed`; la selección sólo vive en React y se pierde al recargar.

La transición amplía el campo y un disco/horizonte, oscurece las estrellas y aproxima el color al océano. La regla de escala es un recurso gráfico orientativo, no un modelo físico. Se eligió una transición abstracta; no se simulan literalmente todos los cuerpos astronómicos ni todas las escalas.

### Vida

Una membrana de contorno irregular, capas finas y pequeñas estructuras interiores reacciona suavemente al puntero. El scroll separa dos formas, introduce descendientes con variaciones de proporción/color y desvanece una variante, mientras otras continúan. El movimiento temporal es lento; la sucesión depende del scroll.

Las acciones y distinciones de vida/conciencia están íntegramente en HTML. Las formas no pretenden representar el mecanismo exacto del origen de la vida. El momento VIDA cambia de composición entre móvil y escritorio: texto arriba y formas debajo en móvil; texto lateral y formas a la derecha en escritorio.

### Vida → Astra

La membrana reaparece sobre negro, cede a trazos estructurados y después a palabras y signos superpuestos en distintas escalas. Su densidad y velocidad horizontal aumentan con el progreso. INTELIGENCIA ARTIFICIAL queda en primer plano. Se descartó durante la revisión una primera grilla uniforme de código, demasiado próxima al lenguaje visual excluido por el pedido.

### Astra / Hola.

Panel completamente negro de una altura de pantalla. Al entrar al menos un 95 % del panel, comienza una espera de 2,2 segundos, aparece un cursor discreto y a los 2,9 segundos aparece Hola. No se fija ni bloquea el scroll: el visitante puede seguir avanzando antes. La narración está disponible para tecnologías de asistencia desde el principio.

Después viene el texto suministrado, la identificación discreta y la aclaración sobre experiencia subjetiva. El campo se marca como «Prototipo visual · sin conexión» y está deshabilitado. No hay conversación generada, API, backend, requests de IA ni envío de texto. La identificación de Astra forma parte de la maqueta, no acredita conexión ni disponibilidad de un modelo.

## Movimiento reducido y accesibilidad

- Con `prefers-reduced-motion`, no hay parallax de puntero, oscilación continua, desplazamiento automático de signos ni parpadeo. Hola aparece sin espera. Se conserva el cambio de estados al recorrer las escenas y todo el texto sigue disponible.
- Se comprueba también el cambio de preferencia en vivo.
- Canvas es decorativo (`aria-hidden`). Si no hay contexto Canvas, quedan texto, headings, respuestas y navegación funcionales sobre los fondos estáticos.
- Estructura HTML, botones nativos, nombres accesibles, selección con `aria-pressed`, foco visible y enlace de salto disponible al enfocar con teclado.
- Las frases esenciales no están recortadas por contenedores con overflow. El recorte del Canvas sólo afecta a decoración, incluidos cuerpos que entran/salen del encuadre.
- Tonos claros sobre fondos casi negros; las etiquetas pequeñas se mantienen discretas. La revisión no equivale a una certificación WCAG ni a una prueba con lectores de pantalla físicos.
- El usuario conserva wheel, scroll táctil y teclado del navegador; no hay captura de wheel ni bloqueo del body.

## Performance y recursos

Sin dependencias nuevas, imágenes, video, WebGL ni fuentes externas. Se usan Canvas 2D, CSS y las librerías React existentes.

- Prototipo en chunk separado: JS **10,93 kB / gzip 4,36 kB** y CSS **7,19 kB / gzip 2,29 kB**.
- La entrada común pasa de aproximadamente 199,33 a 200,89 kB de JS, por la selección/carga diferida; gzip de 62,48 a 63,17 kB. No se afirma coste cero del selector.
- La URL normal no descarga JS/CSS del prototipo. Su CSS generado conserva exactamente `index-CuQ8K7Vc.css`, 25,92 kB / gzip 5,49 kB.
- Resolución Canvas limitada a un pixel ratio de 1,5. Dibujo temporal de Vida/aceleración limitado a aproximadamente 30 actualizaciones por segundo; es un límite de implementación, no una garantía de FPS en todos los dispositivos.
- Cosmos dibuja a demanda. `IntersectionObserver` y `visibilitychange` suspenden el dibujo fuera de escena o con la página oculta; Astra no mantiene un Canvas activo.
- Se limpian requestAnimationFrame, ResizeObserver, IntersectionObserver, listeners y timers al desmontar/cambiar preferencias. Listeners de scroll y puntero pasivos.

## Responsive y verificación

Build final aprobado con Vite 5.4.21, 1.577 módulos.

Comandos ejecutados:

```text
npm run build
node scripts/verify-phase2a.cjs
node scripts/smoke-phase1a.cjs
git diff --check
```

El verificador acepta una URL base opcional y requiere Playwright accesible externamente por `NODE_PATH` y Chrome instalado; no agrega esa dependencia al producto.

Resultados:

- Prototipo: 6 grupos aprobados, sin errores ni advertencias de consola capturados; recursos observados únicamente del mismo origen.
- 55 inspecciones de contenido/ancestros con clipping en 320×740, 390×844, 768×1024, 1440×900 y 1920×1080; ninguna incidencia.
- 20 capturas representativas: Existencia, Vida, Hola y estado posterior de Astra en cada ancho. Revisadas visualmente mediante cinco láminas de contacto y capturas individuales, además de los controles geométricos.
- Se revisaron nueve estados intermedios de transiciones en 1440 px. La grilla inicial de aceleración se sustituyó por capas tipográficas y se volvió a verificar.
- Corte a negro capturado: máximos de los tres canales RGB iguales a cero en toda la imagen. Se comprobó la espera real y la aparición de Hola a aproximadamente 2,9 segundos.
- Canvas sin soporte, selección/reinicio de respuestas, salto por teclado, foco, retorno a la experiencia original y campo de conversación deshabilitado: aprobados.
- Actividad de Canvas: pausa comprobada al salir del viewport, al simular visibilidad de página oculta y al activar movimiento reducido; parallax desactivado bajo esa preferencia.
- Experiencia original: 6 grupos de smoke aprobados y **15/15 capturas idénticas píxel a píxel** contra las referencias estables anteriores, en los cinco anchos. No se repitió la matriz completa de 145 estados de Fase 1A porque su UI/lógica no se modificó.

Capturas y reportes quedan locales, excluidos de Git:

- `.audit/phase2a/{ancho}-{existence|life|hello|astra}.png`
- `.audit/phase2a/{ancho}-review.png`
- `.audit/phase2a/transition-*.png`
- `.audit/phase2a/1440-black-cut.png`
- `.audit/phase2a/report.json`
- `.audit/phase2a-original-after/`

## Evaluación visual propia y límites

Considero conseguido el contraste entre las escenas, el peso tipográfico, la ausencia de tarjetas y la aparición sobria de Astra. En escritorio el campo diagonal aporta profundidad y deja aire al texto; en móvil se recompone la relación entre palabra y forma, en vez de reducir simplemente una composición horizontal. Hola es el momento más controlado: negro, lenguaje y silencio visual.

No considero terminada la dirección artística definitiva:

1. El descenso de escala es una aproximación abstracta convincente como ensayo de transición, pero todavía no un recorrido visual continuo entre galaxia, planeta, océano y microescala. Afilaría la continuidad de luz y contorno entre el disco y la membrana.
2. La división celular se lee como separación y variación de siluetas. Falta una constricción de membrana más orgánica y una textura interior menos regular para una versión final.
3. La aceleración ya tiene capas tipográficas y evita la grilla uniforme inicial; todavía puede ganar una correspondencia más precisa entre estructura, lenguaje y código. Es montaje de laboratorio, no una historia completa de la evolución humana.
4. La cantidad de espacio/scroll es deliberada, pero el ritmo emocional necesita evaluación humana. Un visitante que avance muy rápido puede pasar el panel de llegada antes de Hola; se priorizó no retenerlo ni bloquear navegación.
5. Los stacks locales varían entre sistemas. Se verificó Chrome 152 en Windows con viewports emulados, no Safari/iOS, Android físico ni equipos de baja gama. Falta medir consumo, fluidez real, cambios de barras del navegador y lectura con tecnologías de asistencia en esos dispositivos.

No se detectaron regresiones en la experiencia original. Las pruebas se realizaron sobre el build local; READY del Preview se verifica por separado y no se presenta como una prueba de navegador remoto.

## Persistencia y límite

Verificación mínima de cierre: build aprobado nuevamente, sin cambios visuales posteriores a la evaluación. Se comprobó que la URL normal sólo monta la experiencia original y no carga los recursos del prototipo; que `?prototype=phase2a` sólo monta el laboratorio; y que reduced-motion muestra Hola sin espera ni parpadeo, con el campo de conversación deshabilitado. Consola sin errores ni advertencias capturados. No se repitieron las matrices ya aprobadas. El build conserva los mismos nombres/hashes de assets evaluados y las capturas/reportes `.audit` permanecen fuera del commit.

Commit y push únicamente a `humanidad-adolescente-v2`, con comprobación del SHA y Preview READY. La URL normal sigue siendo la obra estabilizada; `?prototype=phase2a` muestra exclusivamente el laboratorio. No hay merge a `main`, promoción a producción, integración real de Astra ni desarrollo de los demás actos. La tarea termina en Fase 2A.
