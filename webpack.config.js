const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '';
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || '';

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['@babel/preset-env', '@babel/preset-react'] }
        }
      },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.(png|jpe?g|gif|svg)$/i, type: 'asset/resource' }
    ]
  },
  resolve: { extensions: ['.js', '.jsx'] },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.SUPABASE_URL': JSON.stringify(supabaseUrl),
      'process.env.SUPABASE_PUBLISHABLE_KEY': JSON.stringify(supabasePublishableKey),
      'process.env.REACT_APP_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'process.env.REACT_APP_SUPABASE_ANON_KEY': JSON.stringify(supabasePublishableKey)
    }),
    new HtmlWebpackPlugin({ template: './public/index.html', filename: 'index.html' })
  ],
  devServer: {
    static: { directory: path.join(__dirname, 'public') },
    historyApiFallback: true,
    compress: true,
    port: 3000,
    open: true
  }
};
