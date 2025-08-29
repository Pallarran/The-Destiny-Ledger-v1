/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        panel: "var(--panel)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        gold: "var(--gold)",
        emerald: "var(--emerald)",
        border: "var(--border)",
        danger: "var(--danger)"
      },
      borderRadius: {
        xl: "var(--radius)"
      },
      boxShadow: {
        etched: "var(--shadow)"
      },
      fontFamily: {
        'serif': ['Cinzel', 'Cormorant Garamond', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}