import { walk } from "https://deno.land/std@0.198.0/fs/walk.ts";
import { defineConfig } from "vite";

import commonjs from "vite-plugin-commonjs";
import { minify } from "terser";
function minifyBundles() {
  return {
    name: "minifyBundles",
    async generateBundle(options, bundle) {
      for (let key in bundle) {
        if (bundle[key].type == "chunk" && key.endsWith(".js")) {
          const minifyCode = await minify(bundle[key].code, {
            sourceMap: false,
          });
          bundle[key].code = minifyCode.code;
        }
      }
      return bundle;
    },
  };
}

const files = [];
for await (const x of (walk("./src/", { "exts": [".js"] }))) {
  files.push("./" + x.path);
}

console.log(files);

export default defineConfig({
  // appType: 'custom',
  // css: {
  //   devSourcemap: true,
  //   postcss: {
  //     plugins: [
  //       autoprefixer
  //     ],
  //   }
  // },
  // build: {
  //   target: ['es2015'],
  //   outDir: 'dist',
  //   emptyOutDir: true,
  //   cssCodeSplit: true,
  //   sourcemap: false,
  //   lib: {
  //     formats: ['es'],
  //     entry: [

  //       "./mod.ts"
  //       // resolve(__dirname, 'src/scripts/main.js'),
  //       // resolve(__dirname, 'src/scripts/critical.js'),
  //     ],
  //     fileName: '[name]',
  //   },
  // },
  // plugins: [
  //   commonjs(),
  //   minifyBundles()
  // ]

  plugins: [
    minifyBundles(),
    // nodePolyfills({
    //   // To exclude specific polyfills, add them to this list.
    //   exclude: [
    //     'fs', // Excludes the polyfill for `fs` and `node:fs`.
    //   ],
    //   // Whether to polyfill specific globals.
    //   globals: {
    //     Buffer: true, // can also be 'build', 'dev', or false
    //     global: true,
    //     process: true,
    //   },
    //   // Whether to polyfill `node:` protocol imports.
    //   protocolImports: true,
    // }),
    // commonjs({

    //   "dynamic": {

    //     "loose": true,

    //   }

    // }),

    // minifyBundles()
    // minifyEs()
  ],

  resolve: {
    alias: {
      // "xxx": "./bsv/mod.js"
    },
  },

  // optimizeDeps: {
  //   // include: ["./bsv/bsv-old/index.js"]
  // },
  build: {
    outDir: "./dist",
    minify: false,

    lib: {
      entry: files.slice(0, 10),

      formats: ["es"],
      // fileName: (format) => ({
      //   es: `${"x"}.js`,
      //   esm: `${"x"}.min.js`,

      // }),

      // "formats": ["es"],
      // entry: [

      //   "./mod.ts"

      //   // "./bsv/bsv-old/lib/"
      //   // "./bsv/bsv-old/lib/script/index.js"
      // ]
    },

    target: "esnext",

    sourcemap: true,

    rollupOptions: {
      external: [
        "sinon",

        "chai",
        "buffer",
        "node:crypto",
        "assert",
        "buffer",
        "safe-buffer",
        "process",
        "base64-js",
        "bs58",
        "inherits",
        "assert",
        "crypto",
        "bn.js",
        "elliptic",
        "hash.js",
      ],
      "preserveEntrySignatures": "strict",

      // input: "./mod.ts",
      output: {
        compact: true,
        "esModule": true,
        preserveModules: true,
        format: "esm",
      },
    },
  },
});
