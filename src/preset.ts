function managerEntries(entry = []) {
  return [...entry, require.resolve("./register")];
}

function config(entry = [], { addDecorator = true }) {
  const addonConfig = [];
  if (addDecorator) {
    addonConfig.push(require.resolve("./addDecorators"));
  }
  return [...entry, ...addonConfig];
}
module.exports = {
  managerEntries,
  config,
};
