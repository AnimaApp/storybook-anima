import { addons, makeDecorator } from "@storybook/addons";
import { EVENT_CODE_RECEIVED } from "../constants";
import { extractCSS } from "../utils";

export const withHTML = makeDecorator({
  name: "withHTML",
  parameterName: "html",
  skipIfNoParametersOrOptions: false,
  wrapper: (storyFn, context, { parameters = {} }) => {
    process.nextTick(() => {
      const channel = addons.getChannel();
      const rootSelector = parameters.root || "#root";
      const root = document.querySelector(rootSelector) as HTMLElement | null;
      const css = extractCSS();
      let html = root ? root.innerHTML : `${rootSelector} not found.`;
      if (parameters.removeEmptyComments) {
        html = html.replace(/<!--\s*-->/g, "");
      }

      let width = 0,
        height = 0;

      if (root) {
        let rootClone = root.cloneNode(true) as HTMLElement;
        rootClone.style.width = "fit-content";
        document.body.appendChild(rootClone);
        const rootRect = rootClone.getBoundingClientRect();
        width = rootRect.width;
        height = rootRect.height;

        if (rootClone.childNodes.length == 1) {
          const rect = rootClone.firstElementChild.getBoundingClientRect();
          width = rect.width;
          height = rect.height;
        }

        rootClone.remove();
      }

      channel.emit(EVENT_CODE_RECEIVED, {
        html,
        css,
        width,
        height,
        options: parameters,
      });
    });
    return storyFn(context);
  },
});

if (module && module.hot && module.hot.decline) {
  module.hot.decline();
}
