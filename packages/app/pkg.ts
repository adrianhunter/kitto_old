export default {
  exports: {
    '.': './dist/mod.js',
    './*.js': './dist/*.js',
    './globals': {
      types: './global.d.ts',
    },
  },
  devDependencies: {
    'vite': '^4.4.8',
    'sync-message': '^0.0.10',

    '@kitto/vite-plugin': 'workspace:^',
  },
  dependencies: {
    '@deepkit/type': 'latest',
    '@types/chai': '^4.3.5',
    '@types/mocha': '^10.0.1',
    'chai': '^4.3.7',
    'mocha': '^10.2.0',
    'scrypt-ts': 'latest',
  },
}
