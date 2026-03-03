/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#DC2626',
          'primary-light': '#EF4444',
          'primary-dark': '#991B1B',
          secondary: '#111111',
          'secondary-light': '#1F2937',
          'secondary-dark': '#000000',
          accent: '#DC2626',
          'accent-light': '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
