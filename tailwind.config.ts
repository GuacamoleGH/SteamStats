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
          400: '#00f59b', // Primario de marca GuacamoleGH
          500: '#00d486',
          600: '#00a668',
          700: '#007d4f',
          800: '#03623f',
          900: '#055136',
          950: '#002e1d',
        },
        turquoise: {
          300: '#4effee',
          400: '#00d9c4', // Acento secundario digital
          500: '#00b8a6',
          600: '#009485',
        },
        carbon: {
          deep: '#080b11',
          base: '#0c0e12',
          surface: '#12151b',
          card: '#181d26',
          hover: '#1f2532',
          elevated: '#262d3d',
          border: '#222a38',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#12151b',
          950: '#080b11',
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
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'ui-monospace', 'monospace'],
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
