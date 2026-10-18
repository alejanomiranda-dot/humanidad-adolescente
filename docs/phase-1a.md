# Fase 1A: estabilización de la versión actual

Estado: cierre técnico de Fase 1A, con la cobertura y las limitaciones físicas documentadas abajo. La versión original queda estabilizada y verificable como base para 2.0. No se inicia Fase 1B.

- Repositorio: `alejanomiranda-dot/humanidad-adolescente`.
- Rama de trabajo: `humanidad-adolescente-v2`.
- Commit base: `40c6b2881443883a52bef4ed0136f0a5ecc5d1e5` (22/11/2025).
- Fecha de inicio de la verificación: 06/09/2026.
- Base instalada con `npm install --no-fund`, sin modificar rangos de `package.json`.
- Build previo a los cambios: correcto, Vite 5.4.21.
- La instalación inicial resuelve los rangos existentes. No existía lockfile; se conserva el generado para reproducir esta línea de base. No se agregó una dependencia de aplicación.
- Referencias visuales previas: `.audit/before/`, generadas con `scripts/capture-phase1a.cjs` a 320, 390, 768, 1440 y 1920 px (25 capturas y métricas). Son artefactos locales conservados y excluidos de Git.
- Checkpoint conservado: `8c3a76ce5865c0a8b37625de3b9f12bed72af17a`.
- Referencias finales: `.audit/after/` (25 capturas), `.audit/verification/` (140 capturas de estados y reportes) y `.audit/comparison/` (comparaciones BEFORE/AFTER y vistas de conjunto). Los artefactos `.audit` permanecen locales, excluidos del commit.

## Alcance

Correcciones aisladas de funcionamiento, responsive y accesibilidad. Sin nuevos capítulos, IA, backend, TypeScript, migración de framework ni reorganización estructural de App.jsx. Las copias antiguas se conservan.

## Checkpoint compilable de Fase 1A

El checkpoint `8c3a76c` conservó la implementación antes de completar la matriz de validación. Las comprobaciones de cierre siguientes reemplazan el estado pendiente de ese checkpoint.

### Implementado

- Separación de las animaciones de entrada y flotación para recuperar el avatar de portada.
- Etapas inactivas con `hidden`, nombres accesibles de controles y foco visible.
- Ajustes aislados de títulos, tarjetas, pestañas y botones en anchos pequeños.
- Metadatos trasladados al HTML inicial; tarjeta social `summary` sin prometer una imagen inexistente.
- Corrección de X y eliminación del control sin implementación de sonido.
- Compartir el resultado real mediante X/WhatsApp o copiar el texto; las redes que sólo aceptan compartir URL siguen disponibles para compartir el proyecto desde el footer.
- Diálogo nativo con nombre/descripción accesibles, bloqueo del fondo, ciclo de Tab, Escape y restauración del foco.
- Movimiento reducido sin contenido transparente ni animaciones; autoplay deshabilitado bajo esa preferencia.
- Autoplay con tiempo estimado de lectura, pausa por interacción/visibilidad y finalización en la última etapa.
- Flechas limitadas a la cronología, ignorando campos editables y modificadores.
- Gestos que distinguen el eje predominante, cancelación y múltiples contactos.
- Única corrección del ensayo: `en un mundo que sí lo es` pasa a `en un mundo finito`.
- `.gitignore`, lockfile y scripts de verificación sin añadir dependencias al proyecto.

### Verificado en este checkpoint

- `npm run build`: correcto con Vite 5.4.21; bundle JS 198,22 kB (gzip 62,33 kB), CSS 25,89 kB (gzip 5,49 kB).
- `scripts/smoke-phase1a.cjs`: seis grupos de comprobaciones aprobados en Chrome headless, sin errores ni advertencias de consola capturados.
- Un único `head`, metadatos sociales, avatar visible y ausencia del control de sonido.
- Navegación hacia adelante/atrás; foco inicial en cronología; Tab no entra en etapas ocultas.
- Pestaña Heridas en futuros; recorrido completo del quiz con resultado Adultez emergente y reinicio.
- Flechas fuera de cronología sin efecto sobre la etapa.
- Modal: apertura, resultado real, ciclo de Tab, cierre con Escape y retorno al disparador.
- URLs de X y WhatsApp contienen el resultado real; X del footer apunta a la intención correcta. Se interceptó `window.open` durante el test: NO se publicaron mensajes.
- Títulos dentro del viewport de 320 px; avatar visible y autoplay deshabilitado bajo reduced-motion.
- La prueba detectó un problema del ciclo de Tab del modal; se corrigió y volvió a pasar.

## Cierre verificado — 06/09/2026

### Resultados

- `npm run build`: aprobado, Vite 5.4.21. JS 198,24 kB (gzip 62,34 kB), CSS 25,92 kB (gzip 5,49 kB), HTML 1,21 kB. Sin cambios de dependencias ni de `package.json` en el cierre.
- Smoke existente: 6 grupos aprobados sobre el build final, sin errores de ejecución ni advertencias/errores de consola capturados.
- `node scripts/verify-phase1a.cjs`: 9 grupos y 145 estados de layout aprobados en Chrome 152.0.7977.76 headless sobre el build de producción servido localmente. Sin errores de consola ni de ejecución capturados.
- Matriz de 320×740, 390×844, 768×1024, 1440×900 y 1920×1080: seis etapas × tres perspectivas, tres estados de futuros, cinco preguntas, resultado y modal en cada ancho. Se comprobaron rectángulos de texto contra los límites de pantalla y ancestros con overflow, y solapamientos entre botones. Se excluyen correctamente el texto `sr-only` y el fondo inerte del diálogo.
- Comparación visual BEFORE/AFTER revisada en los cinco anchos: portada, cronología, futuros, quiz, madurez, acciones y footer. Se conservaron la identidad, el orden y el ensayo. Los cambios de espaciado corresponden a la reserva para la indicación táctil, al ajuste de controles y a evitar el recorte de las tarjetas. En 320 px los controles pueden ocupar varias filas y el CTA de portada requiere scroll; siguen siendo accesibles y no están ocultos por overflow.
- Cronología: seis etapas accesibles con flechas y controles, una sola etapa visible, tres perspectivas por etapa. Futuros: las tres perspectivas de las tres tarjetas cambian correctamente.
- Teclado: recorrido por las secciones, seis etapas, 20 botones con nombre y foco visible, exclusión de etapas ocultas, flechas con modificadores ignoradas y flechas fuera de cronología sin efecto. Un recorrido completo del quiz se respondió con Enter; se verificaron los tres resultados y el reinicio.
- Modal: nombre y descripción accesibles; Tab y Shift+Tab permanecen dentro en todos los anchos; cierre por botón, fondo y Escape; foco restaurado al disparador. El texto abre desde el inicio y puede desplazarse para leer/copiar el resultado completo.
- Autoplay: no avanza antes del mínimo de 30 segundos, avanza con reloj controlado, se pausa al interactuar con perspectivas, al salir realmente la cronología del viewport y ante `visibilitychange` simulado. No se reanuda solo al volver; se detiene y deshabilita en la sexta etapa. El reloj acelerado permite comprobar los temporizadores sin sustituir la lógica de la aplicación.
- Reduced-motion: activación en vivo detiene autoplay, elimina las animaciones y el scroll suave; conserva el avatar visible y permite navegación manual. El smoke también verifica la carga inicial con esta preferencia.
- Compartir: texto y URLs incluyen el resultado real. Copia efectiva al portapapeles de Chrome y lectura de comprobación; se normalizan CRLF de Windows sólo en la aserción del test. Denegación simulada: mensaje de fallback, foco y selección del texto completo. Los destinos X/WhatsApp se interceptaron para comprobar su composición sin publicar ni enviar mensajes.
- Gestos: pruebas sintéticas de izquierda/derecha (incluido origen x=0), movimiento vertical/diagonal, varios contactos, cancelación y comienzo sobre controles. Comprobación adicional mediante entrada táctil del protocolo de Chrome: swipe horizontal cambia etapa; swipe vertical desplaza la página 335 px sin cambiar etapa.
- Contraste medido en los botones sociales del footer en estado normal: X 6,98:1; Facebook 5,17:1; WhatsApp 7,79:1; LinkedIn 6,70:1. La cobertura de accesibilidad es funcional y visual; no equivale a una certificación WCAG completa.

### Dos regresiones corregidas durante el cierre

1. **Indicación táctil recortada a 320 px.** La animación `bounce` interfería con el centrado por transformación; la línea sin quiebres introducida en Fase 1A salía de pantalla. Se centra con `inset-x-0` y `justify-center`, preservando la animación y el texto. Comprobado visualmente y mediante límites de texto/overflow en el estado inicial.
2. **Modal mostrando inicialmente el final del resultado a 320 px.** El enfoque inicial del diálogo desplazaba el textarea. Se restablece `scrollTop = 0` al abrir, después de ubicar el foco en el botón. El verificador comprueba `scrollTop === 0` en los cinco anchos; el fallback mantiene la selección completa.

No quedaron otras regresiones detectadas dentro de la matriz ejecutada. El cierre sólo cambia esas dos líneas de comportamiento/presentación de la aplicación, amplía las verificaciones y documenta el resultado.

### Límites y comprobaciones en dispositivos físicos

- Confirmar en iPhone/Safari y Android/Chrome la convivencia entre swipe horizontal, scroll vertical con inercia, multitouch, gestos del sistema y áreas seguras. La emulación no reproduce el hardware ni todas las decisiones del navegador móvil.
- Confirmar suspensión real de pestaña/app, bloqueo de pantalla y retorno desde segundo plano. La salida del viewport se probó realmente; el evento de visibilidad de documento se simuló de forma explícita.
- Confirmar permisos y selección/copia manual del portapapeles móvil, y apertura del compositor en las apps instaladas de X/WhatsApp, sin necesidad de enviar una publicación.
- Probar lectura con VoiceOver/TalkBack en el dispositivo. La revisión automatizada de foco y semántica no sustituye la experiencia con lector de pantalla.

Cobertura de navegador ejecutada: Chrome en Windows, con viewports y movimiento reducido emulados. No se afirma validación en Safari/Firefox ni en dispositivos físicos. Estas limitaciones quedan registradas y no se sustituyen por una afirmación de compatibilidad universal.

### Entrega y archivos del cierre

- Rama exclusiva: `humanidad-adolescente-v2`; sin merge a `main` ni promoción a producción.
- Preview de rama: https://humanidad-adolescente-git-humanidad-adolescente-v2-alejano910.vercel.app/ . Puede requerir autenticación de Vercel. El SHA y el estado READY del deployment final se verifican después del push y se informan en la entrega.
- Archivos versionables del cierre: `src/App.jsx`, `scripts/capture-phase1a.cjs`, `scripts/verify-phase1a.cjs` y `docs/phase-1a.md`.
- Se conserva `.audit/` local. Los scripts regeneran las capturas AFTER y sus reportes; las referencias BEFORE existentes corresponden al commit base y no se sobrescriben.

### Repetir las comprobaciones

Usar `npm ci`, `npm run build` y `npm run preview -- --host 127.0.0.1 --port 4173`.
Los scripts requieren Playwright disponible en un runtime externo y Chrome instalado; no se incluyó en `package.json`.
En este equipo se usó `NODE_PATH=C:\Users\AMIRANDA\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules`.
Ejecutar `node scripts/smoke-phase1a.cjs` y, para la matriz visual completa, `node scripts/capture-phase1a.cjs after`.
Ejecutar `node scripts/verify-phase1a.cjs` para la verificación final completa. Acepta una URL como primer argumento; `--functional` permite repetir sólo los flujos cuando no hubo cambios de layout. Ejecutar las verificaciones de portapapeles sin otros procesos de captura simultáneos para mantener el documento activo.

## Pendientes editoriales (sin cambios en esta fase)

- Revisar la relación entre la cronología que comienza en 50.000 a.C. y la evolución de la especie, incluido el fuego.
- Revisar el fundamento de la ventana de 200 a 500 años para la madurez colectiva.
- Revisar el encuadre del quiz como reflexión y su lenguaje de clasificación personal.
- Unificar voseo/tuteo y revisar el encuadre de colonización dentro de los logros.
- Hacer explícito el carácter metafórico de las edades y añadir fuentes en una fase editorial.

## Deuda de dependencias preexistente

`npm audit` informa dos paquetes afectados: Vite (severidad alta) y esbuild (moderada). Los avisos involucran herramientas/servidores de desarrollo. No se ejecutó `npm audit fix`, no se actualizó Vite ni se cambiaron las dependencias declaradas, por el alcance acordado. Esto no constituye una certificación de seguridad del proyecto.
