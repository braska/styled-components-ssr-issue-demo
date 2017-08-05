const NODE_ENV = process.env.NODE_ENV || 'development';
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const nodeExternals = require('webpack-node-externals');
const path = require('path');

const addHash = (template, hash) => (NODE_ENV === 'production' ? template.replace(/\.[^.]+(\.map)?$/, `.[${hash}]$&`) : template);

const clientConfig = {
  name: 'client',
  context: path.resolve(__dirname, 'src'),
  entry: {
    main: (files => (NODE_ENV !== 'production' ? [
      'react-hot-loader/patch',
      'webpack-hot-middleware/client?path=/__webpack_hmr&name=client',
      'webpack/hot/only-dev-server',
    ] : []).concat(files))(['babel-polyfill', './index']),
  },
  output: {
    path: path.resolve(__dirname, 'dist', 'client'),
    publicPath: '/',
    filename: addHash('assets/js/[name].js', 'chunkhash'),
    sourceMapFilename: addHash('assets/js/[name].js.map', 'chunkhash'),
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    modules: ['shared', 'node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['css-loader'],
      },
      {
        test: /\.(jpe?g|png|gif)$/,
        use: 'file-loader',
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(path.join('dist', 'client')),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(NODE_ENV !== 'production'),
    }),
    new ManifestPlugin({
      publicPath: '/',
    }),
  ],
};

if (NODE_ENV !== 'production') {
  clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
}

const clientSSR = {
  name: 'server-side',
  target: 'node',
  context: path.resolve(__dirname, 'src'),
  entry: ['babel-polyfill', './server'],
  output: {
    path: path.resolve(__dirname, 'dist', 'server'),
    publicPath: '/',
    filename: 'render.js',
    libraryTarget: 'commonjs2',
  },
  plugins: [
    new CleanWebpackPlugin(path.join('dist', 'server')),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.NamedModulesPlugin(),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    modules: ['shared', 'node_modules'],
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(jpe?g|png|gif)$/,
        use: 'file-loader?emitFile=false',
      },
    ],
  },
};

module.exports = [clientConfig, clientSSR];
