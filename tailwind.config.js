module.exports = {
  future: {
    // removeDeprecatedGapUtilities: true,
    // purgeLayersByDefault: true,
  },
  purge: {
    mode: "all",
    preserveHtmlElements: false,
    content: ["./src/**/*.tsx", "./public/index.html"],
  },
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
};
