# 🎨 Sistema de Diseño: SteamStats

> Basado en la identidad de marca del ecosistema GuacamoleGH (`flags`, `Hub`, `games`, `main`).  
> Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops

---

## 🎨 1. Paleta de Color (Gama Carbón y Neón Tecnológico)

### Modo Oscuro (Predeterminado)
- **Fondo Ultraprofundo:** `#080b11` (fondo general del viewport)
- **Fondo Base:** `#0c0e12` (contenedores principales y secciones)
- **Superficie de Tarjeta:** `#181d26` (tarjetas de estadísticas, inputs)
- **Superficie Hover:** `#1f2532`
- **Superficie Elevada / Modales:** `#262d3d`
- **Bordes Sutiles:** `#222a38`
- **Acento Primario (Verde Guacamole):** `#00f59b`
- **Acento Secundario (Turquesa Digital):** `#00d9c4`
- **Acento Gradiente:** `linear-gradient(135deg, #00f59b 0%, #00d9c4 100%)`
- **Acento Steam Integrado:**
  - Fondo oscuro Steam: `#171a21`
  - Azul biblioteca Steam: `#1b2838`
  - Azul claro / Enlaces: `#66c0f4`
- **Texto Principal:** `#f0f4f8`
- **Texto Secundario:** `#94a3b8`
- **Texto Muted:** `#64748b`
- **Éxito / Acierto:** `#00f59b` con resplandor `0 0 20px rgba(0, 245, 155, 0.25)`
- **Error / Alerta / Pile of Shame:** `#f43f5e`
- **Advertencia:** `#f59e0b`

---

## 📐 2. Tipografía y Radios

- **Tipografía Sans:** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Monospace (Horas, SteamIDs, Euros, Cronómetros):** `'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace`
- **Escala de Radios de Borde:**
  - `rounded-sm`: `6px` (badges pequeños, inputs de control)
  - `rounded-md`: `10px` (botones, inputs principales)
  - `rounded-lg`: `16px` (tarjetas de estadísticas, modales)
  - `rounded-full`: `9999px` (píldoras de estado, avatares redondos)

---

## 🧱 3. Componentes Base del Ecosistema

### 3.1. Cabecera (Header)
- Pegajosa (`sticky top-0 z-50`), altura `64px`.
- Fondo `#0c0e12` translúcido al 90% con `backdrop-blur-md`.
- Borde inferior `1px solid #222a38`.
- Marca: Logotipo GuacamoleGH con texto `Guacamole`<span style="color:#00f59b">GH</span> `SteamStats`.
- **Enlace de vuelta al Hub:** Botón visible con icono de cuadrícula que enlaza directamente a `https://hub.guacamolegh.es`.
- Input de búsqueda rápida con atajo `/`.

### 3.2. Tarjetas de Estadísticas (Stats Cards)
- Fondo `#181d26`, borde `1px solid #222a38`, hover en `#1f2532` y borde tenue verde.
- Métrica destacada en tipografía monoespaciada con etiqueta superior en gris pizarra.

### 3.3. Botones
- **Primario:** Fondo en gradiente `#00f59b` a `#00d9c4`, texto `#080b11`, fuente semibold y sombra sutil con glow.
- **Secundario:** Fondo `#181d26`, borde `#222a38`, texto `#f0f4f8`.
- **Steam:** Fondo `#1b2838`, borde `#2a475e`, texto `#66c0f4`.

### 3.4. Pie de Página (Footer)
- Estructura unificada: `© 2026 GuacamoleGH • Homelab personal`.
- Enlaces a `Hub` (`hub.guacamolegh.es`), otros proyectos y repositorio en GitHub.

---

## ♿ 4. Accesibilidad y Ergonomía

- Estándar WCAG AA cumplido en todos los pares de color.
- Anillo de enfoque `:focus-visible` con `2px solid #00f59b` y desplazamiento `outline-offset: 3px`.
- Atajos de teclado: `/` para buscar y `Esc` para cancelar o limpiar modales.
