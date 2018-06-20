const path = require('path');

module.exports = {
  entry: {
    SalesPersonProfile: "./js/SalesPersonProfile.js",
    SalesPersonProfileDisplay: "./js/SalesPersonProfileDisplay.js",
    Adjustment: "./js/Adjustment.js",
    SPViewPermission: "./js/SPViewPermission.js",
    babelPolyfill: "babel-polyfill",
  },
  output: {
    path: __dirname + "/build",
    filename: '[name]Bundle.js'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['es2015']
          }
        }
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, "build"),
    historyApiFallback: true
  }
}
