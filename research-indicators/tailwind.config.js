/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      // Mantener tus colores personalizados si los tienes
    },
    // Configurar las tipografías específicas del proyecto
    fontFamily: {
      'sans': ['Barlow', 'sans-serif'], // Default sans-serif
      'barlow': ['Barlow', 'sans-serif'],
      'inter': ['Inter', 'sans-serif'],
      'space-grotesk': ['Space Grotesk', 'sans-serif'],
      'material-symbols': ['Material Symbols Rounded', 'sans-serif'],
    },
  },
  plugins: [],
  // Mantenemos las utilidades de font-family habilitadas ahora
  corePlugins: {
    fontFamily: true,
  }
}
