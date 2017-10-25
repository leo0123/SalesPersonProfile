module.exports = {
  entry: {
    SalesPersonProfile: "./js/SalesPersonProfile.js",
    SalesPersonProfileDisplay: "./js/SalesPersonProfileDisplay.js",
    Adjustment: "./js/Adjustment.js",
  },
  output: {
    path: __dirname + "/build",
    filename: '[name]Bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      }
    ]
  }
}
