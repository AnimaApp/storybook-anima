const SourcePlugin = require("../dist/webpackPlugin");
const path = require("path");
module.exports = {
  stories: [
    "../stories/**/*.stories.mdx",
    "../stories/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-storysource",
    "../dist/register",
  ],
  framework: "@storybook/react",

  webpackFinal: async (config) => {
    // add loader that registers raw source code in a cache
    config.module.rules.push({
      test: /\.jsx?$|\.css$/,
      use: [
        {
          loader: path.resolve(__dirname, "../dist/webpackLoader.js"),
          options: { root: path.resolve(__dirname, "../stories") },
        },
      ],
    });
    // add loader that registers compiled source code in a cache
    config.module.rules.unshift({
      test: /\.jsx?$|\.css$/,
      use: [
        {
          loader: path.resolve(__dirname, "../dist/webpackLoader.js"),
          options: {
            root: path.resolve(__dirname, "../stories"),
            compiled: true,
          },
        },
      ],
    });
    // add plugin that collects the source code
    config.plugins.push(new SourcePlugin());
    // prevent filename mangling (which b0rks source file switching)
    config.mode = "development";
    // prevent minification
    config.optimization.minimizer = [];
    return config;
  },
};
