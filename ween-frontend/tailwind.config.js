// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx}', // Adjusted for your file structure
  ],
  theme: {
    extend: {
      colors: {
        coolBlue: '#00AEFF',  // Custom colors you mentioned
        coolCyan: '#00FFFF',
        coolGreen: '#00DE94',
        coolLightGreen: '#00FF52',
      },
    },
  },
  plugins: [],
}
