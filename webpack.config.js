module.exports = {
  entry: {
    SalesPersonProfile: "./js/SalesPersonProfile.js",
    SalesPersonProfileDisplay: "./js/SalesPersonProfileDisplay.js",
    Adjustment: "./js/Adjustment.js",
  },
  output: {
    path: __dirname + "/build",
    filename: '[name]Bundle.js'
  }
}