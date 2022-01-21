const path = require('path');
const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
require("regenerator-runtime/runtime.js")

module.exports = {
  "mode": "none",
  "entry": ["regenerator-runtime/runtime.js","./frontend/src/index.js"],
  "output": {
    path: __dirname + '/frontend/build',
    filename: "bundle.js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        options: { presets: ['@babel/env'] },
      },
      {
        test: /\.css$/i,
        include: path.resolve(__dirname, 'frontend','src','css'),
        use: [
          'style-loader', 
          'css-loader',
          'postcss-loader'
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|mp4)$/i,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[hash].[ext]',
            outputPath: 'imgs',
          },
        },
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'frontend','src'),
    },
    compress: true,
    port: 3030,
    historyApiFallback : true, // for any routes
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        secure: false,
      }
    }
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          context: path.resolve(__dirname, 'frontend','dist'),
          from: "./*.html",
        },
      ],
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
      // `...`
      new HtmlMinimizerPlugin(),
    ],
  },
}