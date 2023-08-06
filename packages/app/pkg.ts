export default {
  exports: {
    '.': './dist/mod.js',
    './*.js': './dist/*.js',
    './globals': {
      types: './global.d.ts',
    },
  },
  dependencies: {
    '@deepkit/type': 'latest',
    '@types/chai': '^4.3.5',
    '@types/mocha': '^10.0.1',
    'chai': '^4.3.7',
    'mocha': '^10.2.0',
  },
}
