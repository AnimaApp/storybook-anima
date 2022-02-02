import { addons, makeDecorator } from "@storybook/addons";
import { EVENT_CODE_RECEIVED } from "../constants";
import { buildPage, extractCSS } from "../utils";

export const withHTML = makeDecorator({
  name: "withHTML",
  parameterName: "html",
  skipIfNoParametersOrOptions: false,
  wrapper: (storyFn, context, { parameters = {} }) => {
    setTimeout(() => {
      const channel = addons.getChannel();
      const rootSelector = parameters.root || "#root";
      const root = document.querySelector(rootSelector);
      const css = extractCSS();
      let previewHTML = root ? root.innerHTML : `${rootSelector} not found.`;
      if (parameters.removeEmptyComments) {
        previewHTML = previewHTML.replace(/<!--\s*-->/g, "");
      }
      const html = buildPage(previewHTML, css);
      channel.emit(EVENT_CODE_RECEIVED, { html, options: parameters });
    }, 0);
    return storyFn(context);
  },
});

if (module && module.hot && module.hot.decline) {
  module.hot.decline();
}
