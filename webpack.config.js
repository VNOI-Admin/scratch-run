const webpack = require('webpack');
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const path = require('path');

const noop_module_path = path.resolve(__dirname, 'src', 'build', 'noop-module');

module.exports = {
  mode: 'production',
  devtool: '',
  target: 'node',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist')
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

      // Force webpack to rebuild scratch-sb1-converter
      'scratch-sb1-converter$': path.resolve(
        __dirname,
        'node_modules',
        'scratch-sb1-converter',
        'index.js'
      ),

      // Replace with dummy module
      immutable: path.resolve(__dirname, 'src', 'build', 'immutable'),

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
    ),

    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false
    })
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
