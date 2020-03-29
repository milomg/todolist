import resolve from "@rollup/plugin-node-resolve";
import babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";

const extensions = [".js", ".jsx", ".ts", ".tsx"];

const plugins = [
  babel({
    exclude: "node_modules/**",
    presets: ["solid", "@babel/typescript"],
    extensions: extensions,
  }),
  resolve({ extensions: extensions }),
];

if (process.env.production) {
  plugins.push(terser());
}

export default {
  input: "src/main.tsx",
  output: {
    file: "dist/main.js",
    format: "iife",
  },
  plugins,
};