export default {
  devDependencies: {
    '@deepkit/sqlite': '^1.0.1-alpha.98',
    '@deepkit/type': '^1.0.1-alpha.97',
    '@kitto/vite-plugin': 'workspace:^',
    '@rollup/plugin-inject': '^5.0.3',
    'rxjs': '^7.8.1',
    'vite': '^4.4.8',
  },
  peerDependencies: {
    '@deepkit/orm': '^1.0.1-alpha.98',
    '@deepkit/sqlite': '^1.0.1-alpha.98',
    '@deepkit/type': '^1.0.1-alpha.97',
    '@sqlite.org/sqlite-wasm': '^3.42.0-build4',
    'rxjs': '^7.8.1',
  },
  overrides: {
    'better-sqlite3': './better-sqlite3/better-sqlite3.js',
    '@deepkit/type-compiler': {},
    '@deepkit/sqlite': {
      'better-sqlite3': './better-sqlite3/better-sqlite3.js',
    },
  },
}
