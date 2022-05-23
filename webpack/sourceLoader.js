const path = require("path");
const fs = require("fs");
const webpack = require("webpack");

const { RawSource } = webpack.sources || require("webpack-sources");

class SourceLoaderPlugin {
  constructor(options) {
    this.options = options || {};
  }
  apply(compiler) {
    const options = this.options;

    compiler.hooks.emit.tapAsync("Source Plugin", (compilation, callback) => {
      const outputPath = options.path || compilation.options.output.path;

      const extension = "." + (options.extension || "zip");

      const outputPathAndFilename = path.resolve(
        compilation.options.output.path, // ...supporting both absolute and relative paths
        outputPath,
        path.basename(options.filename, ".zip") + extension // ...and filenames with and without a .zip extension
      );

      const relativeOutputPath = path.relative(
        compilation.options.output.path,
        outputPathAndFilename
      );

      const asset = compilation.getAsset(relativeOutputPath);

      if (asset) {
        compilation.emitAsset(options.filename, asset.source);
      } else {
        fs.readFile(outputPathAndFilename, (err, data) => {
          if (!err) {
            const zipFileSource = new RawSource(data);
            console.log(zipFileSource);
            compilation.emitAsset(options.filename, zipFileSource);
          }
        });
      }

      callback();
    });
  }
}

module.exports = SourceLoaderPlugin;
