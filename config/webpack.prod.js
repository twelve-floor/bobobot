const merge = require('webpack-merge');

const commonConfig = require('./webpack.common');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = merge(commonConfig, {
  mode: 'production',

  output: {
    filename: 'js/[name].[hash].js',
    chunkFilename: '[id].[hash].chunk.js',
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        parallel: true,
        sourceMap: true,
        cache: false,
        uglifyOptions: {
          ie8: false,
          mangle: false,
          output: {
            comments: false,
            beautify: false,
          },
          compress: {
            sequences: false,
            join_vars: false,
          },
          warnings: false,
        },
      }),
    ],
  },
});
