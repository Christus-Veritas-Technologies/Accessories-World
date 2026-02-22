/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1E40AF',
          'primary-light': '#3B82F6',
          'primary-dark': '#1E3A5F',
          secondary: '#F97316',
          'secondary-light': '#FB923C',
          'secondary-dark': '#EA580C',
          accent: '#0EA5E9',
          'accent-light': '#38BDF8',
        },
      },
      fontFamily: {
        sans: ['Atkinson', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
