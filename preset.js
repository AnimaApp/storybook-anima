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
};
