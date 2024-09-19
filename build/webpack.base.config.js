const path = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const ESLintPlugin = require('eslint-webpack-plugin')
const TerserPlugin = require("terser-webpack-plugin");
const { getEntryFile, getPluginId } = require('./utils');

const NODE_ENV = process.env.NODE_ENV


module.exports = {
  entry: getEntryFile(),
  context: path.join(process.cwd(), 'src'),
  // cache: {
  //   type: 'filesystem',
  //   buildDependencies: {
  //     config: [__filename],
  //   },
  // },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        exclude: /node_modules/,
        type: 'asset/resource',
        generator: NODE_ENV === 'development' ? {} : {
          publicPath: `plugins/${getPluginId()}/img/`,
          outputPath: 'img/',
          filename: NODE_ENV === 'development' ? '[hash][ext]' : '[name][ext]',
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)(\?v=\d+\.\d+\.\d+)?$/,
        exclude: /node_modules/,
        type: 'asset/resource',
        generator: NODE_ENV === 'development' ? {} : {
          publicPath: `plugins/${getPluginId()}/fonts`,
          outputPath: 'fonts/',
          filename: NODE_ENV === 'development' ? '[hash][ext]' : '[name][ext]',
        },
      },
      {
        exclude: /(node_modules)/,
        test: /\.[jt]sx?$/,
        use: [{
          loader: 'swc-loader',
          options: {
            jsc: {
              baseUrl: path.resolve(__dirname, 'src'),
              target: 'es2015',
              loose: false,
              parser: {
                syntax: 'ecmascript', 
                jsx: true, 
                decorators: false,
                dynamicImport: true,
              },
            },
          },
        },
        'babel-loader'
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
    extensions: ['.js', '.jsx', '.json'],
    modules: [path.resolve(process.cwd(), 'src'), 'node_modules'],
    unsafeCache: true,
  },
  optimization: {
    runtimeChunk: false,
    minimize: true,
    minimizer: [new TerserPlugin({
      extractComments: false
    })],

  }
}