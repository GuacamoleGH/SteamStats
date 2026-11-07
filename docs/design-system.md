# Sistema de Diseño: SteamStats (Ecosistema GuacamoleGH)

> Documento de referencia visual y tokens de diseño para **SteamStats** (`steamstats.guacamolegh.es`), derivado del análisis directo de los cuatro repositorios del ecosistema:
> - [`GuacamoleGH/flags`](https://github.com/GuacamoleGH/flags)
> - [`GuacamoleGH/Hub`](https://github.com/GuacamoleGH/Hub)
> - [`GuacamoleGH/guacamolegh`](https://github.com/GuacamoleGH/guacamolegh) (portal principal)
> - [`GuacamoleGH/games`](https://github.com/GuacamoleGH/games)

---

## 1. Análisis del Lenguaje Visual del Ecosistema

Tras la inspección profunda de los repositorios de referencia, se identifica una identidad visual cohesionada, técnica, moderna y de temática *homelab / neón tecnológico*.

| Dimensión | Patrón en el Ecosistema | Aplicación en SteamStats |
| :--- | :--- | :--- |
| **Tema Base** | Modo oscuro profundo por defecto (*gama carbón*), con soporte para tema claro vía tokens CSS. | Fondo `#0c0e12` / `#080b11`, superficies `#12151b` y `#181d26`. |
| **Color Primario** | Verde Guacamole (`#00f59b` / `#10b981`). Simboliza dinamismo, estado activo y homelab. | Acento principal en títulos, botones primarios, badges de estado y gráficos. |
| **Color Secundario** | Turquesa / Cian Digital (`#00d9c4` / `#06b6d4`). | Gradientes con el primario, precios reducidos y métricas secundarias. |
| **Acento Steam** | Azul Vapor / Steam (`#1b2838`, `#2a475e`, `#66c0f4`). | Integrado armónicamente como color de superficie profunda y enlaces Steam. |
| **Tipografía** | Sans-serif limpia (`Inter`, `system-ui`) + Monospace técnica (`JetBrains Mono`, `ui-monospace`). | Interfaz general con `Inter`; horas de juego, SteamID64, precios y cronómetros con `JetBrains Mono`. |
| **Radios de Borde** | 6px (`sm`), 10px (`md`), 16px (`lg`), 9999px (`full`). | Bordes suaves de tarjetas (10px - 16px) y píldoras de estado (9999px). |
| **Sombras & Brillos**| Sombras sutiles con resplandor neón (`0 0 20px rgba(0, 245, 155, 0.2)`). | Elevación de tarjetas y hover de gráficos Recharts con glow verde sutil. |
| **Cabecera** | Cabecera pegajosa (`sticky top-0`) con fondo translúcido (`backdrop-blur-md`), logo oficial con texto `GuacamoleGH` y selector de tema/atajos. | Misma estructura de cabecera con botón de enlace directo al Hub. |
| **Pie de Página** | Minimalista con copyright año dinámico, mención a *homelab personal*, licencia y enlace a GitHub. | Footer estandarizado con enlace de vuelta al Hub (`hub.guacamolegh.es`) y repo. |

---

## 2. Tokens de Color y Variables CSS

### 2.1. Paleta de Modo Oscuro (Por Defecto)

```css
:root, [data-theme="dark"] {
  /* Fondos y Lienzos (Gama Carbón Profundo) */
  --bg-deep: #080b11;                /* Fondo ultraprofundo de la página */
  --bg-base: #0c0e12;                /* Fondo base de contenedores principales */
  --bg-surface: #12151b;             /* Superficie de paneles y barras */
  --bg-surface-card: #181d26;        /* Superficie de tarjetas e inputs */
  --bg-surface-card-hover: #1f2532;  /* Superficie al hacer hover */
  --bg-surface-elevated: #262d3d;    /* Modales, menús flotantes y popovers */
  --bg-surface-glass: rgba(18, 21, 27, 0.85); /* Superficie con blur */

  /* Bordes y Delimitadores */
  --border-subtle: #222a38;          /* Borde tenue estándar */
  --border-regular: rgba(255, 255, 255, 0.10); /* Borde de contraste medio */
  --border-hover: rgba(0, 245, 155, 0.35);    /* Borde verde al enfocar/hover */
  --border-focus: #00f59b;           /* Foco accesible */

  /* Acentos de Marca (Guacamole + Tecnología) */
  --accent-green: #00f59b;           /* Verde Neón Guacamole */
  --accent-green-hover: #00d486;     /* Verde hover */
  --accent-turquoise: #00d9c4;       /* Turquesa Digital */
  --accent-gradient: linear-gradient(135deg, #00f59b 0%, #00d9c4 100%);
  --accent-gradient-hover: linear-gradient(135deg, #00d486 0%, #00b8a6 100%);

  /* Tonos Temáticos de Steam (Integrados) */
  --steam-dark: #171a21;             /* Fondo clásico Steam */
  --steam-card: #1b2838;             /* Azul oscuro de biblioteca Steam */
  --steam-blue: #66c0f4;             /* Azul claro oficial de Steam */
  --steam-blue-glow: rgba(102, 192, 244, 0.25);

  /* Textos y Tipografía */
  --text-primary: #f0f4f8;           /* Blanco suave de alto contraste */
  --text-secondary: #94a3b8;         /* Gris slate-400 */
  --text-muted: #64748b;             /* Gris slate-500 */
  --text-accent: #00f59b;            /* Texto destacado en verde */

  /* Estados Semánticos */
  --status-success: #00f59b;         /* Éxito / Juego jugado */
  --status-warning: #f59e0b;         /* Alerta / Juego en pausa */
  --status-danger: #f43f5e;          /* Error / Pile of Shame / Perfil Privado */
  --status-info: #38bdf8;            /* Informativo / Próximo lanzamiento */

  /* Badges e Insignias */
  --badge-bg-green: rgba(0, 245, 155, 0.12);
  --badge-border-green: rgba(0, 245, 155, 0.28);
  --badge-text-green: #00f59b;

  --badge-bg-steam: rgba(102, 192, 244, 0.12);
  --badge-border-steam: rgba(102, 192, 244, 0.28);
  --badge-text-steam: #66c0f4;

  --badge-bg-danger: rgba(244, 63, 94, 0.12);
  --badge-border-danger: rgba(244, 63, 94, 0.28);
  --badge-text-danger: #fb7185;

  /* Sombras y Resplandores */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.35);
  --shadow-md: 0 4px 16px -2px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 12px 32px -4px rgba(0, 0, 0, 0.7);
  --shadow-glow: 0 0 24px -4px rgba(0, 245, 155, 0.22);
}
```

### 2.2. Paleta de Modo Claro (Soporte Preparado)

```css
[data-theme="light"] {
  --bg-deep: #f8fafc;
  --bg-base: #ffffff;
  --bg-surface: #f1f5f9;
  --bg-surface-card: #ffffff;
  --bg-surface-card-hover: #f8fafc;
  --bg-surface-elevated: #ffffff;
  --bg-surface-glass: rgba(255, 255, 255, 0.85);

  --border-subtle: #e2e8f0;
  --border-regular: #cbd5e1;
  --border-hover: rgba(5, 150, 105, 0.45);
  --border-focus: #059669;

  --accent-green: #059669;
  --accent-green-hover: #047857;
  --accent-turquoise: #0d9488;
  --accent-gradient: linear-gradient(135deg, #059669 0%, #0d9488 100%);

  --steam-dark: #0f172a;
  --steam-card: #e2e8f0;
  --steam-blue: #0284c7;

  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --text-accent: #059669;

  --badge-bg-green: rgba(5, 150, 105, 0.12);
  --badge-border-green: rgba(5, 150, 105, 0.28);
  --badge-text-green: #047857;

  --shadow-md: 0 4px 16px -2px rgba(0, 0, 0, 0.08);
  --shadow-glow: 0 0 20px -2px rgba(5, 150, 105, 0.18);
}
```

---

## 3. Tipografía y Escala de Espaciado

- **Fuente Sans Principal:** `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  - Utilizada para títulos, párrafos, etiquetas, botones y descripciones.
- **Fuente Monoespaciada:** `'JetBrains Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace`
  - Utilizada para SteamID64, horas de juego (`1.240,5 h`), euros (`€ 42,99`), conteos regresivos de rebajas y porcentajes del pile of shame.

### Escala de Radios
- `rounded-sm`: `6px` (badges pequeños, inputs de control)
- `rounded-md`: `10px` (botones, inputs principales, selectores)
- `rounded-lg`: `16px` (tarjetas de estadísticas, contenedores modales)
- `rounded-full`: `9999px` (avatares redondos de Steam, píldoras de estado)

---

## 4. Componentes Base del Ecosistema

### 4.1. Cabecera (Header)
- **Altura fija:** `64px` (o `70px`), pegajosa (`sticky top-0 z-50`).
- **Fondo:** `#0c0e12` con opacidad del 90% y desenfoque `backdrop-blur-md`.
- **Borde inferior:** `1px solid var(--border-subtle)` (`#222a38`).
- **Marca:** 
  - Logotipo del ecosistema + Texto: `Guacamole` en blanco + `GH` o `Stats` en Verde Guacamole (`#00f59b`).
  - Badge sutil con el nombre del servicio: `SteamStats`.
- **Enlace de regreso al Hub:** Botón visible en el extremo de la navegación con icono de cuadrícula/hub y texto *"Hub"* que enlaza directamente a `https://hub.guacamolegh.es`.
- **Buscador global rápido:** Input de búsqueda de SteamID con atajo de teclado (`/`).

### 4.2. Tarjetas de Estadísticas (Stats Cards)
- **Fondo:** `var(--bg-surface-card)` (`#181d26`).
- **Borde:** `1px solid var(--border-subtle)` (`#222a38`), pasando en hover a `var(--border-hover)`.
- **Transición:** `all 0.25s cubic-bezier(0.16, 1, 0.3, 1)`.
- **Composición interna:**
  - Título superior en `text-xs uppercase tracking-wider text-slate-400`.
  - Métrica principal en `text-2xl font-bold font-mono text-white`.
  - Indicador secundario en verde o rojo (ej: `% pile of shame` o diferencia en 2 semanas).
  - Icono semántico en caja tenue en la esquina superior derecha.

### 4.3. Botones (Buttons)
- **Primario (Gradiente Guacamole):**
  - Fondo: `var(--accent-gradient)` (`#00f59b` a `#00d9c4`).
  - Texto: Negro carbón (`#080b11`), `font-semibold`.
  - Sombra: `var(--shadow-glow)`.
  - Hover: Brillo aumentado, ligero escalado suave `scale-[1.02]`.
- **Secundario (Superficie Carbón):**
  - Fondo: `#181d26`, borde `#222a38`, texto `#f0f4f8`.
  - Hover: Fondo `#1f2532`, borde `#334155`.
- **Steam Action:**
  - Fondo: `#1b2838`, borde `#2a475e`, texto `#66c0f4`.
  - Hover: Fondo `#2a475e`, texto blanco.

### 4.4. Pie de Página (Footer)
- Estructura idéntica a `GuacamoleGH/main` y `GuacamoleGH/games`:
  - Izquierda: Logo `GuacamoleGH` y copyright dinámico: `© 2026 GuacamoleGH • Homelab personal`.
  - Centro/Derecha: Enlaces rápidos a `Hub`, `Games`, `Flags` y repositorio de GitHub `GuacamoleGH/SteamStats`.
  - Borde superior `1px solid #222a38`.

---

## 5. Configuración de Tailwind CSS

Esta configuración se aplicará en `tailwind.config.ts` para que todas las clases reflejen los tokens del ecosistema:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        guacamole: {
          50: '#e6fff4',
          100: '#c2ffe5',
          200: '#8affcf',
          300: '#47ffb4',
          400: '#00f59b', // Primario de marca
          500: '#00d486',
          600: '#00a668',
          700: '#007d4f',
          800: '#03623f',
          900: '#055136',
          950: '#002e1d',
        },
        turquoise: {
          400: '#00d9c4',
          500: '#00b8a6',
        },
        carbon: {
          deep: '#080b11',
          base: '#0c0e12',
          surface: '#12151b',
          card: '#181d26',
          hover: '#1f2532',
          elevated: '#262d3d',
          border: '#222a38',
        },
        steam: {
          dark: '#171a21',
          card: '#1b2838',
          border: '#2a475e',
          blue: '#66c0f4',
          glow: 'rgba(102, 192, 244, 0.25)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
      },
      boxShadow: {
        card: '0 4px 16px -2px rgba(0, 0, 0, 0.5)',
        glow: '0 0 24px -4px rgba(0, 245, 155, 0.25)',
        'glow-steam': '0 0 24px -4px rgba(102, 192, 244, 0.25)',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #00f59b 0%, #00d9c4 100%)',
        'steam-gradient': 'linear-gradient(135deg, #1b2838 0%, #2a475e 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 6. Accesibilidad (WCAG AA) y Ergonomía

1. **Contraste de Color:** Todos los pares de texto principal (`#f0f4f8`) y fondos (`#0c0e12`, `#181d26`) superan el ratio 7:1 (AAA). Los textos secundarios (`#94a3b8`) superan 4.5:1 (AA).
2. **Navegación por Teclado:**
   - Indicador `:focus-visible` con anillo `2px solid #00f59b` y desplazamiento `outline-offset: 3px`.
   - Atajo `/` o `Ctrl+K` para enfocar la barra de búsqueda de perfiles.
   - Tecla `Esc` para limpiar la búsqueda o cerrar modales.
3. **Formateo Numérico y Monetario:**
   - Siempre formateado bajo `Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })` y `Intl.NumberFormat('es-ES')` para horas y puntos XP.
