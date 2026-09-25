/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        neoMain: 'var(--color-main, #b6ace4)',
        neoMint: 'var(--color-mint, #97ee88)',
        neoLemon: 'var(--color-lemon, #fed170)',
        neoSky: 'var(--color-sky, #88c5ee)',
        neoPink: 'var(--color-pink, #ff88a5)',
        neoBg: 'var(--color-page-bg, #f0eefc)',
      }
    }
  },
  safelist: [
    'bg-neoMain',
    'bg-neoMint',
    'bg-neoLemon',
    'bg-neoSky',
    'bg-neoPink',
    'bg-neoBg',
    'is-selected',
    'neo-badge-green',
    'neo-badge-red',
    'neo-badge-gray',
    'text-emerald-700',
    'text-rose-700',
    'text-emerald-900',
    'text-rose-900',
    'animate-spin'
  ],
  plugins: [],
};
