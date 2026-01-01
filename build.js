const { build } = require('esbuild');
//const { dependencies } = require('./package.json');

const sharedConfig = {
  entryPoints: ['./application/entry-points/**/*'],
  bundle: true,
  //minify: true,
  external: [],
};

build({
  ...sharedConfig,
  platform: 'node', // for CJS,
  target: 'es2020',
  outdir: './build/modules/functions/dist',
});
