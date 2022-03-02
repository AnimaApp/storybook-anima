import React, { useEffect, useState } from "react";
import { IconButton } from "@storybook/components";

import { API, useChannel, useStorybookApi, Story } from "@storybook/api";
import {
  createElementFromHTML,
  createStoryRequest,
  getStoryNameFromArgs,
  notify,
} from "./utils";
import { STORYBOOK_ANIMA_TOKEN, EVENT_CODE_RECEIVED } from "./constants";

interface SProps {
  api: API;
}

interface StoryData {
  html: string;
  css: string;
  width: number;
  height: number;
}

const createStory = async (story: Story, data: StoryData) => {
  try {
    const { css, height, html, width } = data;
    const name = getStoryNameFromArgs(story.name, story.args);
    await createStoryRequest(
      STORYBOOK_ANIMA_TOKEN,
      html,
      css,
      width,
      height,
      name
    );
    notify("Story synced successfully");
  } catch (error) {
    console.log(error);
    return error;
  } finally {
    return true;
  }
};

export const ExportButton: React.FC<SProps> = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [storyData, setStoryData] = useState<StoryData>({
    css: "",
    html: "",
    width: 0,
    height: 0,
  });

  useChannel({
    [EVENT_CODE_RECEIVED]: (data) => {
      setStoryData(data);
    },
    ["AUTH"]: (authState) => {
      setIsAuthenticated(authState);
    },
  });

  useEffect(() => {
    const customFont = document.querySelector("#anima-custom-font");
    !customFont &&
      document.head.appendChild(
        createElementFromHTML(
          `<link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">`
        )
      ) &&
      document.head.appendChild(
        createElementFromHTML(
          `<style>.t{animation:3s cubic-bezier(.34,1.56,.64,1) 0s infinite normal forwards running t;transform-box:fill-box;transform-origin:0% 0%}@keyframes t{0%{transform:scale(0);opacity:0}3.33%{opacity:1}23.33%{transform:scale(1)}76.67%{opacity:1}80%{transform:scale(1)}93.33%{transform:scale(0);opacity:0}100%{transform:scale(0);opacity:0}}.c{animation:3s cubic-bezier(.34,1.56,.64,1) .5s infinite normal forwards running c;transform-box:fill-box;transform-origin:50% 50%}@keyframes c{0%{transform:scale(0);opacity:0}3.33%{opacity:1}23.33%{transform:scale(1)}76.67%{opacity:1}80%{transform:scale(1)}93.33%{transform:scale(0);opacity:0}100%{transform:scale(0);opacity:0}}.l{animation:3s cubic-bezier(.34,1.56,.64,1) .8s infinite normal forwards running l;transform-box:fill-box;transform-origin:50% 50%}@keyframes l{0%{transform:scale(0) rotateZ(-180deg);opacity:0}3.33%{opacity:1}23.33%{transform:scale(1)}50%{transform:rotateZ(0)}76.67%{opacity:1}80%{transform:scale(1)}93.33%{transform:scale(0);opacity:0}100%{transform:scale(0);opacity:0}}</style>`
        )
      );

    return () => {};
  }, []);

  const api = useStorybookApi();
  const story = api.getCurrentStoryData() as Story;

  return (
    <IconButton
      title={isAuthenticated ? "Export to Anima" : "Authenticate to export"}
      onClick={async () => {
        if (!isAuthenticated) { 
          notify("Missing team token. Please read the installation instructions.");
          return; 
        }
        setIsExporting(true);
        await createStory(story, storyData);
        setIsExporting(false);
      }}
    >
      {isExporting ? (
        <svg width="16px" height="16px" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 478 522">
        <path className="t" d="M52.655 55h355.457a2.608 2.608 0 0 1 2.247 1.21 2.599 2.599 0 0 1 .147 2.546 398.689 398.689 0 0 1-134.045 153.408c-92.415 62.352-185.475 68.791-223.778 69.135A2.625 2.625 0 0 1 50 278.672V57.628A2.63 2.63 0 0 1 52.655 55Z" fill="#FF6250"/>
        <path className="c" d="M129.375 467.75c43.835 0 79.37-35.536 79.37-79.371 0-43.834-35.535-79.369-79.37-79.369-43.835 0-79.37 35.535-79.37 79.369 0 43.835 35.535 79.371 79.37 79.371Z" fill="#FFDF90"/>
        <path className="l" d="M310.854 464.542c-22.453-8.571-34.395-33.281-26.787-55.156l59.917-170.984c7.677-21.875 32.098-32.648 54.552-24.077 22.453 8.585 34.395 33.281 26.787 55.169l-59.917 170.985c-7.677 21.875-32.098 32.662-54.552 24.063Z" fill="#36F"/>
        </svg>
      ) : (
        <svg
          style={{ ...(!isAuthenticated ? { filter: "grayscale(1)" } : {}) }}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 32 32"
        >
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
      )}
    </IconButton>
  );
};
