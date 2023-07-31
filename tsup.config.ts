import type { Options } from 'tsup'
export default <Options>{
  entryPoints: [
    'packages/*/*.ts',

    // 'packages/bvm/*.civet',

    // 'mod.civet',
    // "plugins/*.civet"
  ],

  esbuildPlugins: [
    // civetPlugin({

    //   js: false,
      
    //   // next: deep,
    // }),
  ],


  
  clean: true,
  format: ['esm'],
  dts: true,
  bundle:false,
  // minify: false,
  // treeshake: false,
  // bundle: false,
  target: 'esnext',
  outDir: './packages/vite-plugin/dist',
  // // esbuildPlugins: [civetPlugin({
  // //   "js": false,
  // //   "next": deepkit({
  // //     reflection: true
  // //   }),
  // //   inlineMap: true
  // // })],
  splitting: true,
  skipNodeModulesBundle: true,
  // sourcemap: false,
}
