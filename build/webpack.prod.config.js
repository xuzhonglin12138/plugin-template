const path = require('path')
const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.base.config')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const CopyWebpackPlugin = require('copy-webpack-plugin');
const  ReplaceInFileWebpackPlugin = require('replace-in-file-webpack-plugin');
const { hasReadme, getPackageJsonInfo, getPluginId, getTodayDate } = require('./utils');

const REPORT = process.env.REPORT
const prodConfig = {
  mode: 'production',
  externals: [
    'react',
    'react-dom',
    'antd'
  ],
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'styles/[name].[contenthash].css', 
      chunkFilename: 'styles/[id].[contenthash].css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: hasReadme() ? 'README.md' : '../README.md', to: '.', force: true },
        { from: 'pluginData.json', to: '.' },
        { from: '../LICENSE', to: '.' ,noErrorOnMissing: true },
        { from: '../CHANGELOG.md', to: '.', force: true, noErrorOnMissing: true  },
        { from: '**/*.json', to: '.' }
      ],
    }),
    new ReplaceInFileWebpackPlugin([
      {
        dir: 'dist',
        files: ['pluginData.json', 'README.md'],
        rules: [
          {
            search: /\%VERSION\%/g,
            replace: getPackageJsonInfo().version,
          },
          {
            search: /\%TODAY\%/g,
            replace: getTodayDate(),
          },
          {
            search: /\%PLUGIN_ID\%/g,
            replace: getPluginId(),
          },
        ],
      },
    ]),
  ]
}
if(REPORT) {
  prodConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = merge(baseConfig, prodConfig)