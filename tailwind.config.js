/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#FDF3EF',
          100: '#FAE1D6',
          200: '#F5C3AD',
          300: '#EFA084',
          400: '#E07D5D',
          500: '#C65D3B',  // Terracota principal
          600: '#A84D30',
          700: '#8A3D25',
          800: '#6C2E1A',
          900: '#4E200F',
        },
        olive: {
          50:  '#EEF3ED',
          100: '#D6E3D4',
          200: '#ADC7A9',
          300: '#85AB7E',
          400: '#6E9469',
          500: '#5E7C5A',  // Verde oliva principal
          600: '#4E6A4A',
          700: '#3E573B',
          800: '#2E452C',
          900: '#1E321D',
        },
        cream: {
          50:  '#FDFCFB',
          100: '#F4EFEA',  // Crema claro principal
          200: '#EDE4DB',
          300: '#E0D3C7',
          400: '#D3C2B3',
          500: '#C6B19F',
        },
        dark: '#2B2B2B',   // Gris oscuro textos
        whatsapp: {
          DEFAULT: '#25D366',
          hover:   '#1EBE57',
        },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body:    ['var(--font-body)'],
      },
    },
  },
  plugins: [],
}