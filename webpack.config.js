const path = require("path");

let webpackMode = "development";
if (process.env.BUILD_MODE && process.env.BUILD_MODE.toUpperCase().startsWith("PROD")) {
  webpackMode = "production";
}

module.exports = {
  mode: webpackMode,
  entry: "./src/client/index.ts",
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "bundle.js"
  },

  module: {
    rules: [
      {
        test: /\.ts$/i,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-typescript", {
                  allExtensions: true, isTSX: false
                }
              ]
            ]
          }
        }
      },
      {
        test: /\.tsx$/i,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              ["@babel/preset-typescript",
                {
                  allExtensions: true, isTSX: true
                }
              ],
              "@babel/preset-react"
            ]
          }
        }
      },
      {
        test: /\.scss$/i,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      }
    ]
  },

  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"]
  }
};
