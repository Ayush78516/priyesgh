/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#002b5b",
        "accent-teal": "#00a6a6",
        "soft-bg": "#f2f9ff",
        highlight: "#38b6ff",
        "text-dark": "#012a4a",
        "light-gray": "#e8f4f8",
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  }
}
