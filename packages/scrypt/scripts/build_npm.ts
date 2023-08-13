import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./src/mod.js"],
  outDir: "./npm",

  test: false,

  "declaration": false,
  "esModule": true,
  "scriptModule": false,
  "skipSourceOutput": true,

  "typeCheck": false,
  shims: {
    // see JS docs for overview and more options
    // deno: true,
  },
  package: {
    "module": "./src/mod.js",

    "types": "./index.d.ts",

    // package.json properties
    name: "@kitto/scrypt",
    version: Deno.args[0],
    description: "Your package.",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/username/repo.git",
    },
    bugs: {
      url: "https://github.com/username/repo/issues",
    },
  },
  postBuild() {
    // steps to run after building and before running the tests
    // Deno.copyFileSync("LICENSE", "npm/LICENSE");
    // Deno.copyFileSync("README.md", "npm/README.md");
  },
});
