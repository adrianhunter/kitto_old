export default {
  "exports": {
    ".": "./dist/mod.js",
    "./*.ts": "./dist/*.js",
    "./package.json": "./package.json"
  },

  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "concurrently 'vite preview' 'pnpm start-proxy'",
    "start-proxy": "cd workspace && PATH=$(pwd)/../bin:$PATH RUST_LOG=info,lsp_ws_proxy=debug lsp-ws-proxy --remap -l 9990 -- typescript-language-server --stdio"
  },
  "devDependencies": {
    "@types/codemirror": "^5.0.0",
    "@types/marked": "^4.0.3",
    "@volar/vue-language-server": "^0.38.1",
    "concurrently": "^7.2.2",
    "vue": "^3.2.37",
    "@qualified/codemirror-workspace": "^0.5.0",
    "codemirror": "^5.59.2",
    "marked": "^4.0.17",
    '@marcj/ts-clone-node': '^2.0.0',
    '@typescript/vfs': '^1.4.0',
    'get-tsconfig': '^4.5.0',
    'lz-string': '^1.4.4',
    'micromatch': '^4.0.5',
    'strip-json-comments': '^3.1.1',
    '@rollup/pluginutils': '^5.0.2',
    "typescript-language-server": "^0.6.2",
    "vscode-css-languageserver-bin": "^1.4.0",
    "vscode-html-languageserver-bin": "^1.4.0",
    '@deepkit/core': 'latest',
    '@types/lz-string': '^1.3.34',
    '@types/micromatch': '^4.0.2',
    '@types/node': '^20.1.0',
    '@phenomnomnominal/tsquery': '^6.1.2',
    'ts-morph': '^19.0.0',
    "scrypt-ts-transpiler": "latest",
    "scryptlib": "latest",
    'unplugin-auto-import': '^0.16.6',
    'vite-plugin-inspect': '^0.7.33',
    'vite-plugin-node-polyfills': '^0.9.0',
    'vite-tsconfig-paths': '^4.2.0',
  },
  peerDependencies: {
    'typescript': 'latest',
    'scrypt-ts-transpiler': 'latest',
    'scryptlib': 'latest',
    'vite': '^4.4.7',
  }

}