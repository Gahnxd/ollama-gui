import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#ffffff',
        'secondary': '#b2b2b2',
        'background': '#000000',
        'surface': '#1a1a1a',
        'accent': '#ff0033',
        'accent-light': '#ff3355',
        'accent-dark': '#cc0022',
      },
      fontFamily: {
        mono: ['Roboto Mono', 'monospace'],
      },
      keyframes: {
        glitch: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
      },
      animation: {
        glitch: 'glitch 0.3s linear infinite',
      },
    },
  },
  plugins: [],
};
export default config;
