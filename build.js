const { build } = require('esbuild');
//const { dependencies } = require('./package.json');

const sharedConfig = {
  entryPoints: ['./application/entry-points/**/*'],
  bundle: true,
  minify: true,
  external: [],
};

build({
  ...sharedConfig,
  platform: 'node', // for CJS,
  target: 'es2020',
  outdir: './build/modules/functions/dist',
});


build({
  ...sharedConfig,
  minify: false, // example without minification for testing purposes
  platform: 'node', // for CJS,
  target: 'es2020',
  outdir: './build/modules/functions/dist-unminified',
});
