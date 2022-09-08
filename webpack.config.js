const fs = require("fs");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = (env, argv) => {
  return {
    node: { global: true },
    mode: "development",
    entry: "./src/index.js",
    ...(argv.mode === "production"
      ? {
          optimization: {
            minimize: false,
          },
        }
      : { devtool: "inline-source-map" }),
    output: {
      path: path.join(__dirname, "dist"),
      filename: "app.js",
      library: {
        name: "app",
        type: "umd",
      },
      globalObject: `(typeof self !== 'undefined' ? self : this)`,
    },
    performance: {
      hints: false,
    },
    devServer: {
      static: [{ directory: path.join(__dirname, "public") }],
      compress: true,
      port: 9000,
      open: true,
    },
    plugins: [
      // Copy files pyodide.js will load asynchronously
      new CopyPlugin({
        patterns: [
          { from: require.resolve("pyodide/distutils.tar"), to: "pyodide/distutils.tar" },
          { from: require.resolve("pyodide/repodata.json"), to: "pyodide/repodata.json" },
          { from: require.resolve("pyodide/pyodide_py.tar"), to: "pyodide/pyodide_py.tar" },
          { from: require.resolve("pyodide/pyodide.asm.data"), to: "pyodide/pyodide.asm.data" },
          { from: require.resolve("pyodide/pyodide.asm.js"), to: "pyodide/pyodide.asm.js" },
          { from: require.resolve("pyodide/pyodide.asm.wasm"), to: "pyodide/pyodide.asm.wasm" },
        ],
      }),
    ],
    module: {
      noParse: /pyodide\.js/,
      rules: [
        // Remove pyodide globals. They are not necessary when using pyodide in webpack
        {
          test: /pyodide\/.+\.js$/,
          loader: "string-replace-loader",
          options: {
            multiple: [
              {
                search: "globalThis.loadPyodide=loadPyodide",
                replace: "({})",
              },
            ],
          },
        },
      ],
    },
  };
};
