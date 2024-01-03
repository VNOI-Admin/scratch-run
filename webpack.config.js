const path = require('path');
const dist = path.resolve(__dirname, 'dist');
const noop_module_path = path.resolve(__dirname, 'src', 'build', 'noop-module');
const noop_loader_path = path.resolve(
  __dirname,
  'src',
  'build',
  'noop-loader.js'
);

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
      './tw-iframe-extension-worker$': noop_module_path,
      './tw-unsandboxed-extension-runner$': noop_module_path,
      '../blocks/scratch3_core_example$': noop_module_path,
      '../extensions/scratch3_pen$': noop_module_path,
      '../extensions/scratch3_wedo2$': noop_module_path,
      '../extensions/scratch3_music$': noop_module_path,
      '../extensions/scratch3_microbit$': noop_module_path,
      '../extensions/scratch3_text2speech$': noop_module_path,
      '../extensions/scratch3_translate$': noop_module_path,
      '../extensions/scratch3_video_sensing$': noop_module_path,
      '../extensions/scratch3_ev3$': noop_module_path,
      '../extensions/scratch3_makeymakey$': noop_module_path,
      '../extensions/scratch3_boost$': noop_module_path,
      '../extensions/scratch3_gdx_for$': noop_module_path,
      '../extensions/tw$': noop_module_path
    }
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        loader: 'esbuild-loader'
      }
    ]
  },
  resolveLoader: {
    alias: {
      'worker-loader': noop_loader_path
    }
  }
};
