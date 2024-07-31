const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const ESLintPlugin = require('eslint-webpack-plugin')
const NODE_ENV = process.env.NODE_ENV
module.exports = {
  entry: NODE_ENV !== 'development' ? path.join(__dirname,'..','src','moudle.js') :  path.join(__dirname,'..','src','index.js'),
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
          NODE_ENV === 'development' ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader:'css-loader',
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
  plugins:[
    new ESLintPlugin({
      extensions: ['js','jsx']
    }),
    new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin({
      // title: NODE_ENV === 'development' ? 'Carl的React16脚手架-开发模式' : 'Carl的React16脚手架-生产模式',
      template: path.join(__dirname,'..','public','index.html')
    })
  ],
  resolve: {
    alias: {
      "@": path.join(__dirname,'..','src')
    },
    extensions: ['.js','.jsx','.json','...'] 
  },
  optimization: {
    runtimeChunk: 'single'
  },
  output: {
    clean: true,
    path: path.join(__dirname,'..','dist'),
    filename: NODE_ENV === 'development' ? '[name].js' : '[name].js'
  }
}