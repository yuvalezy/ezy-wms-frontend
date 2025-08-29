import {type Config} from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
    function({ addVariant }: any) {
      addVariant('hocus', '&:hover, &:focus');
    },
  ],
}
export default config
