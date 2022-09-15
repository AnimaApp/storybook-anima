module.exports = {
  stories: [
    "./stories/**/*.stories.@(js|jsx|ts|tsx)",
    "../src/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: ["@storybook/addon-essentials", "../dist/preset"],
  framework: "@storybook/react",
  // core: {
  //   builder: "webpack5",
  // },
};
