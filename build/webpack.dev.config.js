const path = require('path')
const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.base.config')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = merge(baseConfig, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '..', 'public', 'index.html')
    })
  ],
  devServer: {
    compress: true,
    port: 8080
  }
})