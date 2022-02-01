import React, { useEffect, useState } from "react";
import { IconButton } from "@storybook/components";
import { STORY_RENDERED } from "@storybook/core-events";

import { API, Story } from "@storybook/api";
import pako from "pako";
import { Channel } from "@storybook/addons";
import { createElementFromHTML, downloadAsJSON } from "./utils";
import { createAlert } from "./alert";

const exportJSON = async (api: API) => {
  let SBRenderCallback = (() => {}) as any;

  const getSBRenderPromise = () => {
    return new Promise((resolve) => {
      SBRenderCallback = resolve;
    });
  };

  const handleSBRender = () => {
    SBRenderCallback();
  };

  api.on(STORY_RENDERED, handleSBRender);

  const el = document.querySelector(
    "#storybook-preview-iframe"
  ) as HTMLIFrameElement | null;

  function getHTML() {
    const el = document.querySelector(
      "#storybook-preview-iframe"
    ) as HTMLIFrameElement | null;

    if (!el) return null;
    return el.contentWindow.document.documentElement.outerHTML;
  }

  let data = { layers: [] };
  let jobs = [];
  const api_base = "https://fig.moeapps.dev";
  const story = api.getCurrentStoryData() as Story;
  const variants = [];

  const keys = [];

  if (variants.length == 0) {
    variants.push(story.args);
  }

  for (let index = 0; index < variants.length; index++) {
    const props = variants[index];

    const p = getSBRenderPromise();
    api.updateStoryArgs(story, props);
    await p;

    const html = getHTML();

    if (html) {
      const job = async () => {
        const gzippedBody = pako.gzip(JSON.stringify({ html }));
        return fetch(api_base + "/p", {
          method: "POST",
          headers: {
            "Content-Encoding": "gzip",
            "Content-Type": "application/json",
          },
          body: gzippedBody,
        })
          .then((response) => response.json())
          .then((json) => {
            return json;
          });
      };

      jobs.push(job());
    }
  }
  api.resetStoryArgs(api.getCurrentStoryData() as Story);

  Promise.all(jobs).then((results) => {
    el.setAttribute("data-is-storybook", "true");
    // elClone.parentElement.removeChild(elClone);

    console.log(results);
    data = results[0]
      ? { layers: [{ ...results[0].layers[0], children: [] }] }
      : { layers: [] };
    results.forEach((result) => {
      data.layers[0].children.push(...result.layers[0].children);
    });
    let startX = data.layers[0].children[0].x;
    let x = data.layers[0].children[0].x;
    let y = data.layers[0].children[0].y + data.layers[0].children[0].height;
    let maxHeight = 0;
    for (let i = 1; i < data.layers[0].children.length; i++) {
      const component = data.layers[0].children[i];
      y = Math.max(y, component["y"] + component["height"]);
      maxHeight = Math.max(maxHeight, component["height"]);
      const prevComponent = data.layers[0].children[i - 1];

      if (keys.filter(Boolean).includes(i)) {
        x = startX;
        y += maxHeight + 20;
        component["y"] = y;
        component["x"] = startX;
      } else {
        x += prevComponent["width"] + 10;
        component["x"] = x;
        component["y"] = y;
      }
    }

    downloadAsJSON({ layers: data.layers[0].children });

    const alertElement = createAlert("Component exported Successfully");
    document.body.appendChild(alertElement);

    (alertElement.firstElementChild as HTMLElement).style.opacity = "1";

    setTimeout(() => {
      (alertElement.firstElementChild as HTMLElement).style.opacity = "0";
      requestAnimationFrame(() => {
        alertElement.remove();
      });
    }, 2000);

    api.off(STORY_RENDERED, handleSBRender);
  });
};

interface SProps {
  api: API;
  rawSources: any;
  channel: Channel;
}

export const ExportButton: React.FC<SProps> = ({
  api,
  rawSources: rawSourcesFromProps,
  channel,
}) => {
  const [_rawSources, setRawSources] = useState(rawSourcesFromProps);

  const handleChannel = (newRawSources) => {
    channel.removeListener("sourceCode/rawSources", handleChannel);
    setRawSources(newRawSources);
  };

  useEffect(() => {
    channel.on("sourceCode/rawSources", handleChannel);

    const customFont = document.querySelector("#anima-custom-font");
    !customFont &&
      document.head.appendChild(
        createElementFromHTML(
          `<link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">`
        )
      );

    return () => {
      channel.removeListener("sourceCode/rawSources", handleChannel);
    };
  }, [setRawSources]);

  return (
    <IconButton
      active={false}
      title="Export to Figma"
      onClick={() => exportJSON(api)}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32">
        <rect width="32" height="32" fill="#3B3B3B" rx="4" />
        <path
          fill="#FF6250"
          d="M7.1287 6H24.353a.1262.1262 0 0 1 .1088.0586.1266.1266 0 0 1 .0072.1234 19.319 19.319 0 0 1-6.4955 7.4335c-4.4781 3.0214-8.9875 3.3334-10.8435 3.35a.1261.1261 0 0 1-.12-.0779.1282.1282 0 0 1-.01-.0494V6.1273A.1274.1274 0 0 1 7.1287 6Z"
        />
        <path
          fill="#FFDF90"
          d="M10.8461 25.9999c2.1241 0 3.846-1.7219 3.846-3.846 0-2.1242-1.7219-3.8461-3.846-3.8461C8.7219 18.3078 7 20.0297 7 22.1539c0 2.1241 1.722 3.846 3.8461 3.846Z"
        />
        <path
          fill="#36F"
          d="M18.708 25.7722c-1.088-.4153-1.6667-1.6127-1.298-2.6727l2.9034-8.2855c.372-1.06 1.5554-1.582 2.6434-1.1667 1.088.4161 1.6667 1.6127 1.298 2.6734l-2.9034 8.2855c-.372 1.06-1.5553 1.5827-2.6434 1.166Z"
        />
      </svg>
    </IconButton>
  );
};
