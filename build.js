const { watch } = require("chokidar");
const { build } = require("esbuild");
const fs = require("fs-extra");
const servor = require("servor");
const babel = require("@babel/core");
const path = require("path");
const postcss = require("postcss");
const autoprefixer = require("autoprefixer");
const tailwindcss = require("tailwindcss");
var atImport = require("postcss-import");

const production = process.env.NODE_ENV == "production";

async function css() {
  let time1 = Date.now();
  let plugins = [atImport, tailwindcss, autoprefixer];

  fs.readFile("src/style.css", "utf8", async (err, x) => {
    let result = await postcss(plugins).process(x, {
      from: "style.css",
      to: "style.css",
    });

    fs.outputFile("dist/style.css", result.css);
    console.log("css", Date.now() - time1);
  });
}
async function js() {
  let time2 = Date.now();
  let output = await babel.transformFileAsync("./src/main.tsx", {
    sourceMaps: false,
    sourceFileName: "./src/main.tsx",
  });
  console.log("babel", Date.now() - time2);
  await build({
    stdin: { contents: output.code, resolveDir: path.resolve("./src") },
    outfile: "dist/main.js",
    bundle: true,
    format: "iife",
  });
  console.log("esbuild", Date.now() - time2);
}
function copy() {
  fs.copy("public/", "dist/");
}

if (!production) {
  watch("src/main.tsx").addListener("change", js);
  watch("src/style.css").addListener("change", css);
  watch("public/").on("change", copy);
}
if (production) {
  fs.rmSync("dist/", { recursive: true, force: true });
  fs.mkdirSync("dist/");
}

js();
css();
copy();

if (!production) {
  console.log("starting server, production: ", production);
  servor({
    root: "dist",
  });
}
