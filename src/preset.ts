const path = require("path");
const core = require("@storybook/core-common");
const ZipPlugin = require("../webpack/zip");
const SourceLoaderPlugin = require("../webpack/sourceLoader");

function managerEntries(entry = []) {
  return [...entry, require.resolve("./register")];
}

module.exports = {
  managerEntries,
  webpackFinal: async (config, options) => {
    config.module.rules.push({
      test: !["vue", "angular"].includes(options.framework)
        ? /\.(mjs|tsx?|jsx?)$/
        : /\.(mjs|jsx?)$/,
      loader: require.resolve("babel-loader"),
      options: {
        plugins: [require.resolve("babel-storybook-anima")],
        presets: ["@babel/preset-react"],
      },
      include: [core.getProjectRoot()],
      exclude: /node_modules/,
    });

    const sourcePluginConfig = {
      path: path.join(core.getProjectRoot(), ".anima"),
      filename: "storybook_preview.zip",
    };

    config.plugins.push(new ZipPlugin({ ...sourcePluginConfig }));
    config.plugins.push(new SourceLoaderPlugin(sourcePluginConfig));

    return config;
  },
};
