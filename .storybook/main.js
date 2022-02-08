module.exports = {
  stories: [
    "./stories/**/*.stories.mdx",
    "./stories/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-essentials",
    "../dist/preset",
  ],
  framework: "@storybook/react",
};
