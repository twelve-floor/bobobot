const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const helpers = require('./helpers');

const NODE_ENV = process.env.NODE_ENV;
const isProd = NODE_ENV === 'production';

module.exports = {
  entry: {
    app: [helpers.root('client/app/index.js')],
  },

  output: {
    path: helpers.root('dist'),
    publicPath: '/',
  },

  resolve: {
    extensions: ['.js', '.json', '.css', '.scss', '.html'],
    alias: {
      app: 'client/app',
    },
  },

  module: {
    rules: [
      // JS files
      {
        test: /\.jsx?$/,
        include: helpers.root('client'),
        loader: 'babel-loader',
      },
      // {
      //   test: /\.css$/,
      //   use: [
      //     {
      //       loader: MiniCssExtractPlugin.loader,
      //       options: {
      //         // you can specify a publicPath here
      //         // by default it uses publicPath in webpackOptions.output
      //         publicPath: '../',
      //         hmr: process.env.NODE_ENV === 'development',
      //       },
      //     },
      //     'css-loader',
      //   ],
      // },

      // SCSS files
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          isProd ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
    ],
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),

    // new MiniCssExtractPlugin({
    //   // Options similar to the same options in webpackOptions.output
    //   // both options are optional
    //   filename: '[name].css',
    //   chunkFilename: '[id].css',
    // }),

    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(NODE_ENV),
        BOT_NAME: JSON.stringify(
          process.env.BOT_NAME || 'no_BOT_NAME_specified'
        ),
      },
    }),

    new HtmlWebpackPlugin({
      template: helpers.root('client/public/index.html'),
      inject: 'body',
    }),

    new CopyWebpackPlugin({
      patterns: [
        {
         from: helpers.root('client/public'),
        }
      ]
    }),

    new MiniCssExtractPlugin(),
  ],
};
