module.exports = {
  mount: {
    public: "/",
    src: "/_dist_",
  },
  plugins: [
    "@snowpack/plugin-typescript",
    ["@snowpack/plugin-babel", { input: [".js", ".jsx", ".ts", ".tsx"] }],
    ["@snowpack/plugin-build-script", { cmd: "postcss", input: [".css"], output: [".css"] }],
    "@snowpack/plugin-optimize",
  ],
  installOptions: {
    externalPackage: ["solid-js/types"],
    installTypes: true,
  },
};
