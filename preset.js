const path = require("path");
const core = require("@storybook/core-common");
const ZipPlugin = require("./webpack/zip");
const SourceLoaderPlugin = require("./webpack/sourceLoader");
const readPkgUp = require("read-pkg-up");

const getStorybookConfigDir = (packageJson = {}) => {
  return (
    core.getStorybookConfiguration(
      packageJson?.scripts?.storybook || "",
      "-c",
      "--config-dir"
    ) ?? ".storybook"
  );
};

const getStorybookMetadata = async (_configDir) => {
  const { packageJson = {} } =
    readPkgUp.sync({ cwd: process.cwd(), normalize: false }) || {};
  const configDir = getStorybookConfigDir(packageJson);
  return core.loadMainConfig({ configDir });
};

function managerEntries(entry = []) {
  return [...entry, require.resolve("./register")];
}

function config(entry = [], { addDecorator = true }) {
  const addonConfig = [];
  if (addDecorator) {
    addonConfig.push(require.resolve("./dist/addDecorators"));
  }
  return [...entry, ...addonConfig];
}

function managerEntries(entry = []) {
  return [...entry, require.resolve("./dist/register")];
}

module.exports = {
  config,
  managerEntries,
  babel: async (config) => {
    return {
      ...config,
      plugins: [
        ...config.plugins,
        [
          require.resolve("babel-storybook-anima"),
          {
            projectRoot: core.getProjectRoot(),
            storybookConfigDirectory: getStorybookConfigDir(),
            storybookConfig: await getStorybookMetadata(),
          },
        ],
      ],
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
