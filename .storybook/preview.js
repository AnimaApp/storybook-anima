export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  html: {
    removeEmptyComments: true, // default: false
  },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
