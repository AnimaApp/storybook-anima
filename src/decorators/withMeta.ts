import { ANIMA_STORY_WINDOW_KEY, ANIMA_FILE_WINDOW_KEY } from "./../constants";
import { makeDecorator, addons } from "@storybook/addons";

import { sanitize } from "@storybook/csf";
import { SET_CURRENT_COMPONENT_ID, SET_STORYBOOK_META } from "../constants";
import { StorybookMetadata } from "../types";

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

              const storyKey = value.filename;

              if (storyKey) {
                prev["stories"][storyKey] = value;
              }

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

        const animaComments = Array.from(
          root.querySelectorAll<HTMLSpanElement>("[is-anima]")
        )
          .map((e) => e.previousSibling)
          .filter((e) => e?.nodeType === Node.COMMENT_NODE) as Comment[];

        if (animaComments.length === 0) return;

        for (const animaComment of animaComments) {
          const data = animaComment.data;

          if (data) {
            const { componentData } = JSON.parse(data) ?? {};
            const { pkg, ...rest } = componentData ?? {};
            const filename = pkg ? metadataPackages[pkg] : null;
            animaComment.deleteData(0, data.length);
            animaComment.insertData(
              0,
              "anima-metadata " +
                JSON.stringify({
                  componentData: {
                    pkg,
                    filename,
                    ...rest,
                  },
                })
            );
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
