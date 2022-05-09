const core = require("@storybook/core-common");
function managerEntries(entry = []) {
  return [...entry, require.resolve("./dist/register")];
}

function config(entry = [], { addDecorator = true }) {
  const addonConfig = [];
  if (addDecorator) {
    addonConfig.push(require.resolve("./dist/addDecorators"));
  }
  return [...entry, ...addonConfig];
}



module.exports = {
  managerEntries,
  config,
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

    return config;
  },
};
