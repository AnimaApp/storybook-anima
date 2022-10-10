const path = require("path");
const findUp = require("find-up");

const getProjectRoot = () => {
  let result;
  try {
    const found = findUp.sync(".storybook", { type: "directory" });
    if (found) {
      result = result || path.join(found, "..");
    }
  } catch (e) {
    //
  }
  try {
    const found = findUp.sync(".git", { type: "directory" });
    if (found) {
      result = result || path.join(found, "..");
    }
  } catch (e) {
    //
  }
  try {
    const found = findUp.sync(".svn", { type: "directory" });
    if (found) {
      result = result || path.join(found, "..");
    }
  } catch (e) {
    //
  }
  try {
    result = result || __dirname.split("node_modules")[0];
  } catch (e) {
    //
  }

  return result || process.cwd();
};

module.exports = {
  getProjectRoot,
};
