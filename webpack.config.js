var webpack = require('webpack'),
  path = require('path'),
  env = require('./utils/env'),
  { CleanWebpackPlugin } = require('clean-webpack-plugin'),
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin');

const ASSET_PATH = process.env.ASSET_PATH || '/';

var fileExtensions = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'eot',
  'otf',
  'svg',
  'ttf',
  'woff',
  'woff2',
];

var options = {
  mode: process.env.NODE_ENV || 'development',
  context: __dirname + '/src',
  entry: {
    onboarding: './views/onboarding/onboarding.js',
    dashboard: './views/dashboard/dashboard.js',
    assistant: './views/assistant/assistant.js',
    options: './views/options/options.js',
    popup: './views/popup/popup.js',
    controller: './controller/index.js',
    models: './models/index.js',
    contentScript: './content/index.js',
    background: './background/background.js',
  },
  output: {
    path: __dirname + '/build',
    filename: '[name].bundle.js',
    publicPath: ASSET_PATH,
  },
  resolve: {
    extensions: fileExtensions
      .map((extension) => '.' + extension)
      .concat(['.js', '.jsx', '.ts', '.tsx', '.css']),
  },
  module: {
    rules: [
      {
        // look for .css or .scss files
        test: /\.(css|scss)$/,
        // in the `src` directory
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: new RegExp('.(' + fileExtensions.join('|') + ')$'),
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(js)$/,
        use: [
          {
            loader: 'source-map-loader',
          },
          {
            loader: 'babel-loader',
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.ProgressPlugin(),
    // clean the build folder
    new CleanWebpackPlugin({
      verbose: true,
      cleanStaleWebpackAssets: true,
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'manifest.json',
          to: __dirname + '/build',
          force: true,
          transform: function (content, path) {
            // generates the manifest file using the package.json information
            return Buffer.from(
              JSON.stringify({
                description: process.env.npm_package_description,
                version: process.env.npm_package_version,
                ...JSON.parse(content.toString()),
              })
            );
          },
        },
        {
          from: 'assets/img/icon-128.png',
          to: path.join(__dirname, 'build'),
          force: true,
        },
        {
          from: 'assets/img/icon-34.png',
          to: path.join(__dirname, 'build'),
          force: true,
        },
        {
          from: 'content/content.styles.css',
          to: path.join(__dirname, 'build'),
          force: true,
        }
      ],
    }),
    new HtmlWebpackPlugin({
      template: 'views/onboarding/onboarding.html',
      filename: 'onboarding.html',
      chunks: ['onboarding'],
      cache: false,
    }),
    new HtmlWebpackPlugin({
      template: 'views/dashboard/dashboard.html',
      filename: 'dashboard.html',
      chunks: ['dashboard'],
      cache: false,
    }),
    new HtmlWebpackPlugin({
      template: 'views/assistant/assistant.html',
      filename: 'assistant.html',
      chunks: ['assistant'],
      cache: false,
    }),
    new HtmlWebpackPlugin({
      template: 'views/options/options.html',
      filename: 'options.html',
      chunks: ['options'],
      cache: false,
    }),
    new HtmlWebpackPlugin({
      template: 'views/popup/popup.html',
      filename: 'popup.html',
      chunks: ['popup'],
      cache: false,
    })
  ],
  infrastructureLogging: {
    level: 'info',
  },
};

if (env.NODE_ENV === 'development') {
  options.devtool = 'cheap-module-source-map';
}

module.exports = options;