import React, { useEffect, useState } from "react";
import { IconButton } from "@storybook/components";

import { API, useChannel } from "@storybook/api";
import { createElementFromHTML, createStoryRequest, notify } from "./utils";
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

const createStory = async (data: StoryData) => {
  try {
    const { css, height, html, width } = data;
    await createStoryRequest(STORYBOOK_ANIMA_TOKEN, html, css, width, height);
    notify("Story synced successfully");
  } catch (error) {
    console.log(error);
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
          `<style>
          .spin{
            animation: spin 200ms linear infinite;
          }
          @keyframes spin {
            from {
                transform:rotate(0deg);
            }
            to {
                transform:rotate(360deg);
            }
        }
          </style>`
        )
      );

    return () => {};
  }, []);

  return (
    <IconButton
      title={isAuthenticated ? "Export to Anima" : "Authenticate to export"}
      onClick={async () => {
        setIsExporting(true);
        await createStory(storyData);
        setIsExporting(false);
      }}
    >
      {isExporting ? (
        <svg
          className="spin"
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="#999999"
        >
          <path d="M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.336 3.663-8 8-8V2C6.579 2 2 6.58 2 12c0 5.421 4.579 10 10 10z"></path>
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
