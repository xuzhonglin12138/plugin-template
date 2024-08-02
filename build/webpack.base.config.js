const path = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const ESLintPlugin = require('eslint-webpack-plugin')
const TerserPlugin = require("terser-webpack-plugin");
const { getEntryFile } = require('./utils');

const NODE_ENV = process.env.NODE_ENV


module.exports = {
  entry: getEntryFile(),
  context: path.join(process.cwd(), 'src'),
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        exclude: /node_modules/,
        type: 'asset/resource',
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)(\?v=\d+\.\d+\.\d+)?$/,
        exclude: /node_modules/,
        type: 'asset/resource',
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          'cache-loader',
          'thread-loader',
          'babel-loader'
        ]
      },
      {
        test: /\.less$/,
        exclude: /node_modules/,
        use: [
          NODE_ENV === 'development'
            ?
            'style-loader'
            :
            MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true
            }
          },
          'postcss-loader',
          'less-loader'
        ]
      }
    ]
  },
  plugins: [
    new ESLintPlugin({
      extensions: ['js', 'jsx']
    }),
    new webpack.ProgressPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.join(__dirname, '..', 'src')
    },
    extensions: ['.js', '.jsx', '.json']
  },
  optimization: {
    runtimeChunk: false,
    minimize: true,
    minimizer: [new TerserPlugin({
        extractComments: false
    })],

  },
  output: {
    clean: true,
    path: path.join(__dirname, '..', 'dist'),
    filename: '[name].js',
    assetModuleFilename: 'images/[hash][ext][query]',
  }
}