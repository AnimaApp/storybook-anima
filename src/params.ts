/// <reference types="webpack-env" />

/**
 * Automatically creates plugin parameters from a webpack context.
 * @example
 * // Adds all files in the current directory except for filenames containing 'stories'
 * parameters: {
 *        storybookCodePanel: createParams(require.context('!!raw-loader!./', false, /^((?!stories).)*$/))
 *  }
 * @example
 * // Adds all files in the parent directory except for filenames containing 'stories'
 * parameters: {
 *        storybookCodePanel: createParams(require.context('!!raw-loader!../', false, /^((?!stories).)*$/))
 *  }
 * @param {__WebpackModuleApi.RequireContext} context
 */
export default function (context) {
  let files = context.keys().map((x) => ({
    fileName: x,
    code: context(x),
  }));

  return {
    disabled: false,
    files: files,
  };
}
