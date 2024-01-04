const webpack = require('webpack');
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
      // Replace with fastestsmallesttextencoderdecoder
      'text-encoding$': path.resolve(
        __dirname,
        'src',
        'build',
        'text-encoding'
      ),

      // Remove dead modules
      htmlparser2$: noop_module_path,
      'canvas-toBlob$': noop_module_path,
      './extension-support/tw-default-extension-urls$': noop_module_path,
      '../util/scratch-link-websocket$': noop_module_path
    }
  },
  plugins: [
    // Remove extensions
    new webpack.NormalModuleReplacementPlugin(
      /\/extension-manager$/,
      '/src/build/scratch-vm/extension-support/extension-manager'
    ),

    // Remove log
    new webpack.NormalModuleReplacementPlugin(
      /\/log$/,
      '/src/build/scratch-vm/util/log'
    ),

    // Remove I/O modules
    new webpack.NormalModuleReplacementPlugin(/^\.\.\/io\//, (resource) => {
      resource.request = resource.request.replace(
        '..',
        '/src/build/scratch-vm'
      );
    }),

    // Remove load-costume and load-sound
    new webpack.NormalModuleReplacementPlugin(
      /\.\/import\/load-(costume|sound)/,
      (resource) => {
        resource.request =
          '/src/build/scratch-vm/import/load-' +
          resource.request.match(/\.\/import\/load-(costume|sound)/)[1];
      }
    ),

    // Remove deserialize-assets, serialize-assets, and tw-costume-import-export
    new webpack.NormalModuleReplacementPlugin(
      /\.\/(?:serialization\/)?(deserialize-assets|serialize-assets|tw-costume-import-export)/,
      (resource) => {
        resource.request =
          '/src/build/scratch-vm/serialization/' +
          resource.request.match(
            /(deserialize-assets|serialize-assets|tw-costume-import-export)/
          )[1];
      }
    ),

    // Remove FontManager
    new webpack.NormalModuleReplacementPlugin(
      /\.\/tw-font-manager$/,
      '/src/build/scratch-vm/engine/tw-font-manager'
    )
  ],
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        loader: 'esbuild-loader'
      }
    ]
  }
};
