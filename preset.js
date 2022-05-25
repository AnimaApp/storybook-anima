const path = require("path");
const core = require("@storybook/core-common");
const ZipPlugin = require("./webpack/zip");
const SourceLoaderPlugin = require("./webpack/sourceLoader");

function managerEntries(entry = []) {
  return [...entry, require.resolve("./dist/register")];
}

module.exports = {
  managerEntries,
  babel: async (config) => {
    return {
      ...config,
      plugins: [...config.plugins, require.resolve("babel-storybook-anima")],
    };
  },
  webpackFinal: async (config) => {
    const sourcePluginConfig = {
      path: path.join(core.getProjectRoot(), ".anima"),
      filename: "storybook_preview.zip",
    };

    config.plugins.push(new ZipPlugin({ ...sourcePluginConfig }));
    config.plugins.push(new SourceLoaderPlugin(sourcePluginConfig));

    return config;
  },
};
