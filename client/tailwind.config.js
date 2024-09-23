/** @type {import('tailwindcss').Config} */
import flowbite from 'flowbite-react/tailwind'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    flowbite.content()
  ],
  darkmode: 'class',
  theme: {
    extend: {
      fontFamily: {
        raleway: ['"Raleway"', ...defaultTheme.fontFamily.sans],
        montserrat: ['"Montserrat"', ...defaultTheme.fontFamily.sans]
      },
      backgroundImage: {
        bgLogin: 'url(/background.svg)',
        bgRegister: 'url(/backgroundRegister.svg)',
        employeeBanner: 'url(/banner-employeePage.svg)',
        darkEmployeeBanner: 'url(/banner-employeePage-dark.svg)'
      },
      gridTemplateColumns: {
        responsive: 'repeat(auto-fill, minmax(384px, 1fr))',
        'responsive-sm': 'repeat(auto-fill, minmax(320px, 1fr))'
      }
    }
  },
  plugins: [
    flowbite.plugin()
  ]
}
