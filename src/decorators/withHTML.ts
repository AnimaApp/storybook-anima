import { addons, makeDecorator } from "@storybook/addons";
import { EVENT_CODE_RECEIVED } from "../constants";
import { extractCSS } from "../utils";

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
      let html = root ? root.innerHTML : `${rootSelector} not found.`;
      if (parameters.removeEmptyComments) {
        html = html.replace(/<!--\s*-->/g, "");
      }
      channel.emit(EVENT_CODE_RECEIVED, { html, css, options: parameters });
    }, 0);
    return storyFn(context);
  },
});

if (module && module.hot && module.hot.decline) {
  module.hot.decline();
}
