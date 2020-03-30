import resolve from "@rollup/plugin-node-resolve";
import babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";
import copy from "rollup-plugin-copy";
import serve from "rollup-plugin-serve";
import postcss from "rollup-plugin-postcss";
import autoprefixer from "autoprefixer";
import purgecss from "@fullhuman/postcss-purgecss";
import atImport from "postcss-import";
const extensions = [".js", ".jsx", ".ts", ".tsx"];

const plugins = [
  babel({
    exclude: "node_modules/**",
    presets: ["solid", "@babel/typescript"],
    extensions: extensions,
  }),
  resolve({ extensions: extensions }),
  copy({
    targets: [{ src: "public/**/*", dest: "dist" }],
  }),
  postcss({
    plugins: [
      atImport(),
      purgecss({
        content: ["./public/*.html", "./src/**/*.tsx", "./src/**/*.ts"],
      }),
      autoprefixer(),
    ],
  }),
];

if (process.env.production) {
  plugins.push(terser());
} else {
  plugins.push(serve("dist"));
}

export default {
  input: "src/main.tsx",
  output: {
    file: "dist/main.js",
    format: "iife",
  },
  plugins,
};
