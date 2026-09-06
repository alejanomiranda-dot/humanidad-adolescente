# Fase 1A: estabilización de la versión actual

- Repositorio: `alejanomiranda-dot/humanidad-adolescente`.
- Rama de trabajo: `humanidad-adolescente-v2`.
- Commit base: `40c6b2881443883a52bef4ed0136f0a5ecc5d1e5` (22/11/2025).
- Fecha de inicio de la verificación: 06/09/2026.
- Base instalada con `npm install --no-fund`, sin modificar rangos de `package.json`.
- Build previo a los cambios: correcto, Vite 5.4.21.
- La instalación inicial resuelve los rangos existentes. No existía lockfile; se conserva el generado para reproducir esta línea de base. No se agregó una dependencia de aplicación.
- Referencias visuales previas: `.audit/before/`, generadas con `scripts/capture-phase1a.cjs` a 320, 390, 768, 1440 y 1920 px (25 capturas y métricas). Son artefactos locales conservados y excluidos de Git.
- Referencias posteriores del checkpoint: `.audit/checkpoint/1440-hero.png`, `1440-share-dialog.png`, `320-hero.png` y `smoke.json`. La comparación posterior completa en los cinco anchos todavía está pendiente.

## Alcance

Correcciones aisladas de funcionamiento, responsive y accesibilidad. Sin nuevos capítulos, IA, backend, TypeScript, migración de framework ni reorganización estructural de App.jsx. Las copias antiguas se conservan.

## Checkpoint compilable de Fase 1A

Se persiste el estado actual por pedido de Ale antes de continuar. La fase NO se declara completamente validada.

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

### Pendiente para cerrar Fase 1A

- Comparación visual completa después de los cambios en 320, 390, 768, 1440 y 1920 px, incluyendo todas las etapas, tarjetas y modal. Las pruebas mínimas de 320 px no certifican todo el responsive.
- Validación exhaustiva del autoplay: tiempos, salida/entrada de viewport, pestaña en segundo plano y última etapa.
- Pruebas táctiles y de gestos en dispositivos reales.
- Prueba real de portapapeles, fallback por denegación y composición social sin publicar.
- Revisión completa de contraste, foco y movimiento reducido, y comprobación en otros navegadores.
- Verificar el despliegue Vercel Preview que pueda generarse con el push. No hubo despliegue manual ni promoción a producción.
- Conclusión de regresiones sólo después de completar esa matriz; la prueba mínima actual no encontró errores pendientes.

### Repetir las comprobaciones

Usar `npm ci`, `npm run build` y `npm run preview -- --host 127.0.0.1 --port 4173`.
Los scripts requieren Playwright disponible en un runtime externo y Chrome instalado; no se incluyó en `package.json`.
En este equipo se usó `NODE_PATH=C:\Users\AMIRANDA\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules`.
Ejecutar `node scripts/smoke-phase1a.cjs` y, para la matriz visual completa, `node scripts/capture-phase1a.cjs after`.

## Pendientes editoriales (sin cambios en esta fase)

- Revisar la relación entre la cronología que comienza en 50.000 a.C. y la evolución de la especie, incluido el fuego.
- Revisar el fundamento de la ventana de 200 a 500 años para la madurez colectiva.
- Revisar el encuadre del quiz como reflexión y su lenguaje de clasificación personal.
- Unificar voseo/tuteo y revisar el encuadre de colonización dentro de los logros.
- Hacer explícito el carácter metafórico de las edades y añadir fuentes en una fase editorial.

## Deuda de dependencias preexistente

`npm audit` informa dos paquetes afectados: Vite (severidad alta) y esbuild (moderada). Los avisos involucran herramientas/servidores de desarrollo. No se ejecutó `npm audit fix`, no se actualizó Vite ni se cambiaron las dependencias declaradas, por el alcance acordado. Esto no constituye una certificación de seguridad del proyecto.
