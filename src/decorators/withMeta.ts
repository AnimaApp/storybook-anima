import { ANIMA_STORY_WINDOW_KEY, ANIMA_FILE_WINDOW_KEY } from "./../constants";
import { makeDecorator, addons } from "@storybook/addons";

import { sanitize } from "@storybook/csf";
import { SET_CURRENT_COMPONENT_ID, SET_STORYBOOK_META } from "../constants";
import { StorybookMetadata } from "../types";

function copyAttributes(
  source: Element,
  target: Element,
  excludedAttributes: string[] = []
) {
  return Array.from(source.attributes).forEach((attribute) => {
    if (excludedAttributes.includes(attribute.name)) return;
    target.setAttribute(attribute.nodeName, attribute.nodeValue);
  });
}

const removeElementAttributes = (element: HTMLElement) => {
  for (let i = 0; i < element.attributes.length; i++) {
    element.removeAttribute(element.attributes[i].name);
  }
};

const unWrap = (animaElement: HTMLSpanElement, removeAttributes = true) => {
  removeAttributes && removeElementAttributes(animaElement);
};

export const withHTML = makeDecorator({
  name: "withMeta",
  parameterName: "html",
  skipIfNoParametersOrOptions: false,
  wrapper: (storyFn, context, { parameters = {} }) => {
    const channel = addons.getChannel();
    channel.emit(SET_CURRENT_COMPONENT_ID, context.componentId);
    setTimeout(() => {
      const rootSelector = parameters.root || "#root";
      const root = document.querySelector<HTMLDivElement | null>(rootSelector);
      if (root) {
        const metadata = Object.keys(window).reduce<StorybookMetadata>(
          (prev, curr) => {
            const storyFileAsKey = curr.replace(ANIMA_STORY_WINDOW_KEY, "");
            if (curr.startsWith(ANIMA_STORY_WINDOW_KEY)) {
              const value = {
                ...window[curr],
                title: sanitize(window[curr]?.title ?? ""),
                filename: storyFileAsKey,
                packages: window[curr]?.imports ?? {},
              };
              delete value?.imports;

              const storyKey = value.title || value.filename;

              prev["stories"][storyKey] = value;

              if (value.component) {
                const packages = Object.keys(value.packages);

                let key: string;

                for (const packageKey of packages) {
                  const pkgs = value.packages[packageKey];

                  const pkg = pkgs.find((pkg) => pkg.name === value.component);

                  if (pkg) {
                    key = pkg.key;
                    break;
                  }
                }

                if (key) {
                  if (prev["packages"][key]) {
                    console.warn("Duplicate key found: ", key, value);
                  }

                  prev["packages"][key] = value.title || storyFileAsKey;
                }
              }
            }
            if (curr.startsWith(ANIMA_FILE_WINDOW_KEY)) {
              const fileAsKey = curr.replace(ANIMA_FILE_WINDOW_KEY, "");
              prev["files"][fileAsKey] = window[curr];
            }
            return prev;
          },
          {
            files: {},
            stories: {},
            packages: {},
          } as StorybookMetadata
        );

        channel.emit(SET_STORYBOOK_META, metadata);
        const metadataPackages = metadata?.packages || {};

        const animaElements = Array.from(
          root.querySelectorAll<HTMLSpanElement>("[is-anima]")
        );

        if (animaElements.length === 0) return;

        for (const animaElement of animaElements) {
          const elPkg = animaElement.getAttribute("data-package");

          if (elPkg) {
            animaElement.setAttribute(
              "data-as-orphan",
              metadataPackages[elPkg] ?? "true"
            );
          }

          if (animaElement.children.length > 1) {
            unWrap(animaElement);
          } else if (animaElement.children.length === 1) {
            const child = animaElement.children[0];
            copyAttributes(animaElement, child, ["is-anima"]);
            unWrap(animaElement);
          }
        }
      }
    }, 0);
    return storyFn(context);
  },
});

if (module && module.hot && module.hot.decline) {
  module.hot.decline();
}
