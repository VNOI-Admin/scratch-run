const path = require('path');
const dist = path.resolve(__dirname, 'dist');
const noop_module_path = path.resolve(__dirname, 'src', 'build', 'noop-module');

module.exports = {
  mode: 'production',
  devtool: '',
  target: 'node',
  output: {
    filename: 'index.js',
    path: dist
  },
  entry: './src/index.js',
  resolve: {
    alias: {
      'text-encoding$': path.resolve(
        __dirname,
        'src',
        'build',
        'text-encoding'
      ),
      './tw-iframe-extension-worker': noop_module_path,
      htmlparser2$: noop_module_path
    }
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        loader: 'esbuild-loader'
      },
      {
        test: /\.(svg|png|mp3)$/i,
        use: [
          {
            loader: path.resolve(__dirname, 'src', 'build', 'noop-loader.js')
          }
        ]
      }
    ]
  },
  resolveLoader: {
    // Replace worker-loader with our own modified version
    modules: [
      path.resolve(__dirname, 'src', 'build', 'inline-worker-loader'),
      'node_modules'
    ]
  }
};
