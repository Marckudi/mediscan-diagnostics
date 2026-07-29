# AstraMedical · Reels para Instagram

Tres vídeos promocionales verticales (**1080×1920, 9:16, H.264 MP4**) listos para
subir a Instagram Reels / Stories, TikTok o YouTube Shorts. Se generan a partir de
HTML animado con la identidad de AstraMedical y se graban a MP4 con Chromium + ffmpeg.

> **Nota clínica:** todas las piezas incluyen el aviso *«Herramienta de apoyo · No
> sustituye el criterio médico»*, en línea con el propio disclaimer de la app.

## Vídeos generados (`dist/`)

| Archivo | Concepto | Duración |
|---|---|---|
| `astramedical-reel-1.mp4` | **El fin de las salas de espera** — gancho del problema → cómo funciona en 3 pasos → CTA | ~16 s |
| `astramedical-reel-2.mp4` | **Míralo funcionando** — demo de la app (subir consulta → IA analiza → informe) | ~17 s |
| `astramedical-reel-3.mp4` | **Antes vs. ahora** — manifiesto de marca con las 4 ventajas clave | ~14 s |

## Textos sugeridos para publicar

**Reel 1 — El fin de las salas de espera**
> ¿Otra vez semanas de espera por una simple consulta? ⏳ Con AstraMedical describes
> tu caso, la IA lo analiza y recibes un informe al instante. Menos colas, mejor
> atención. 👉 astramedical.vercel.app

**Reel 2 — Míralo funcionando**
> Cuidarte en 30 segundos, sin cita y sin sala de espera. Sube una foto o describe
> tus síntomas y AstraMedical te da un triaje clínico asistido por IA. 🩺✨
> Pruébalo → astramedical.vercel.app

**Reel 3 — Antes vs. ahora**
> Antes: semanas para una cita. Ahora: orientación en segundos. ⚡ Triaje con IA,
> disponible 24/7, para evitar visitas innecesarias y cuidar tu salud a tu ritmo.
> astramedical.vercel.app

**Hashtags (mézclalos, no los uses todos a la vez):**
`#AstraMedical #saluddigital #telemedicina #esalud #healthtech #IAenmedicina`
`#inteligenciaartificial #atenciónalpaciente #saludinteligente #bienestar`
`#innovaciónsanitaria #medicina #atenciónprimaria`

## Cómo regenerar o editar

Requisitos: Node ≥ 18. Chromium y ffmpeg se resuelven vía npm (no hay descargas externas).

```bash
cd marketing/instagram-reels
npm install          # playwright-core + @ffmpeg-installer/ffmpeg
npm run record       # graba los 3 → dist/*.mp4
node record.mjs reel-2   # graba solo uno
```

- **Textos, colores y escenas:** edita `src/reel-*.html`. Cada `<section class="scene" data-dur="3600">`
  es una escena; `data-dur` son milisegundos.
- **Estilos compartidos:** `src/base.css` (tokens de marca, tipografía, animaciones).
- **Motor de tiempos:** `src/reel.js` (secuencia de escenas + barra de progreso).
- **Previsualizar en el navegador:** abre `src/reel-1.html` directamente (se reproduce en bucle).

### Tipografías
Manrope y Inter (`src/fonts/`, licencia SIL Open Font License). Van embebidas para que
el render sea idéntico en cualquier máquina.

## ¿Quieres vídeo con IA fotorrealista (locución, actores, escenas reales)?

Estos Reels son 100 % animación de marca (sin coste). Si más adelante quieres piezas
generadas con IA de vídeo (voz en off, planos realistas, subtítulos automáticos),
requiere créditos del generador de vídeo; se puede montar sobre estos mismos guiones.
