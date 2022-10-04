import React, { useEffect, useRef, useState } from "react";
import { IconButton } from "@storybook/components";
import {
  API,
  useChannel,
  useStorybookApi,
  useStorybookState,
  State,
  Story,
  useArgTypes,
  useParameter,
  StoriesHash,
} from "@storybook/api";

import { createStoryRequest, isDocsStory, notify } from "./utils";
import {
  EXPORT_END,
  EXPORT_START,
  EXPORT_SINGLE_STORY,
  GET_AUTH,
  SET_AUTH,
  DEFAULT_ANIMA_PARAMETERS,
  INVALID_BOOLEAN_ARGS_DETECTED,
  SET_STORYBOOK_META,
  SET_CURRENT_COMPONENT_ID,
} from "./constants";
import { AnimaParameters, StorybookMetadata } from "./types";
import { get } from "lodash";
import { getStoryPayload } from "./story";

interface dependency {
  storyId: string;
  storyFilename: string;
  componentId: string | null;
}

const sendEventToParent = (action: string, data: Record<string, any>) => {
  parent.postMessage({ action, source: "anima", data }, "*");
};

const handleExportError = (e: any) => {
  console.error(e);
  sendEventToParent(EXPORT_END, { error: true });
};

interface SProps {}

export const getStoryDependencies = (
  story: Story,
  metadata: StorybookMetadata,
  storiesHash: StoriesHash
) => {
  const dependencies = [];
  const metadataPackages = metadata?.packages || {};
  const metadataStories = metadata?.stories || {};
  // const files = metadata?.files || {};

  const storyFile = get(story, "parameters.fileName", null);

  const entry = storyFile ? metadataStories[storyFile] : null;

  if (entry) {
    const packagesUsedByStory = Object.keys(entry.packages || {});
    dependencies.push(
      ...packagesUsedByStory.map((pkg) => metadataPackages[pkg]).filter(Boolean)
    );
  }

  return mapFilenameToStoryId(dependencies, storiesHash).filter(
    (e) => e.storyId !== story.id
  );
};

const mapFilenameToStoryId = (
  fileNames: string[],
  storiesHash: StoriesHash
): dependency[] => {
  const keys = Object.keys(storiesHash);

  return keys.reduce<dependency[]>((acc, key) => {
    const story = storiesHash[key] as Story;
    const fileName = get(story, "parameters.fileName", null);
    if (story.type === "story" && fileName && fileNames.includes(fileName)) {
      acc.push({
        storyId: story.id,
        storyFilename: fileName,
        componentId: get(story, "story.componentId", null),
      });
    }
    return acc;
  }, []);
};

const doExport = async (args: {
  api: API;
  state: State;
  action: string;
  animaParameters: AnimaParameters;
  metadata: StorybookMetadata;
  componentId: string | null;
}) => {
  const { api, action, metadata, animaParameters, componentId, state } = args;
  const channel = api.getChannel();
  const isMainThread = window.location === window.parent.location;

  if (!isMainThread) return Promise.resolve(false);

  // If we are on the main thread, we need to send the request to the worker iframe

  if (action === EXPORT_SINGLE_STORY) {
    const story = api.getCurrentStoryData() as Story;

    const deps = getStoryDependencies(story, metadata, state.storiesHash);

    if (!isDocsStory(story)) {
      channel.emit(EXPORT_SINGLE_STORY, {
        storyId: story.id,
        componentId,
        dependencies: deps,
        animaParameters,
      });
    } else {
      notify("Oups, you can only export components");
    }
  }

  return Promise.resolve(true);
};

export const ExportButton: React.FC<SProps> = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    message: "",
  });
  const metadata = useRef<StorybookMetadata>({
    files: {},
    packages: {},
    stories: {},
  });
  const currentComponentId = useRef<string | null>("");
  const argTypes = useRef({});
  const serverParams = useRef(null);
  const animaParams = useRef<AnimaParameters>(null);

  useChannel({
    [SET_AUTH]: ({ isAuthenticated, message = "" }) => {
      setAuthState({ isAuthenticated, message });
    },

    [EXPORT_START]: () => {
      setIsExporting(true);
    },
    [EXPORT_END]: ({ error = false } = {}) => {
      setIsExporting(false);
      if (!error) {
        notify("Story synced successfully");
      }
    },
    [INVALID_BOOLEAN_ARGS_DETECTED]: () => {
      notify(
        "Detected invalid configuration, please see the logs for more information"
      );
    },
    [SET_STORYBOOK_META]: (data) => {
      metadata.current = data;
    },
    [SET_CURRENT_COMPONENT_ID]: (id: string | null) => {
      currentComponentId.current = id;
    },
  });

  const isMainThread = window.location === window.parent.location;
  const api = useStorybookApi();
  const state = useStorybookState();
  argTypes.current = useArgTypes();
  // https://github.com/storybookjs/storybook/tree/main/app/server#getting-started
  serverParams.current = useParameter<Record<string, any>>("server", {});
  animaParams.current = useParameter<AnimaParameters>(
    "anima",
    DEFAULT_ANIMA_PARAMETERS
  );

  const handleExportSingleStory = async (event: CustomEvent) => {
    const { storyId, storybookId, dependencies, componentId } = get(
      event,
      "detail",
      {}
    );

    try {
      if (storyId && storybookId) {
        try {
          api.selectStory(storyId);

          const storyPayload = await getStoryPayload(api, argTypes.current, {
            isSRR: !!serverParams.current?.url,
          });

          if (storyPayload.variants.length === 0) {
            return;
          }
          await createStoryRequest(storybookId, {
            ...storyPayload,
            dependencies,
            componentId,
          });
          sendEventToParent(EXPORT_END, { error: null });
        } catch (error) {
          handleExportError(error);
        }
      }
    } catch (error) {
      handleExportError(error);
    } finally {
    }
  };

  useEffect(() => {
    if (isMainThread) {
      api.getChannel().emit(GET_AUTH);
    } else {
      document.addEventListener(EXPORT_SINGLE_STORY, handleExportSingleStory);
    }

    return () => {
      if (!isMainThread) {
        document.removeEventListener(
          EXPORT_SINGLE_STORY,
          handleExportSingleStory
        );
      }
    };
  }, []);

  return (
    <IconButton
      id="export-button"
      title={
        authState.isAuthenticated ? "Export to Anima" : "Authenticate to export"
      }
      onClick={() => {
        if (isMainThread && !authState.isAuthenticated) {
          notify(authState.message);
          return;
        }
        doExport({
          api,
          state,
          action: EXPORT_SINGLE_STORY,
          animaParameters: animaParams.current,
          metadata: metadata.current,
          componentId: currentComponentId.current,
        });
      }}
    >
      {isExporting ? (
        <svg
          width="16px"
          height="16px"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 478 522"
        >
          <path
            className="t"
            d="M52.655 55h355.457a2.608 2.608 0 0 1 2.247 1.21 2.599 2.599 0 0 1 .147 2.546 398.689 398.689 0 0 1-134.045 153.408c-92.415 62.352-185.475 68.791-223.778 69.135A2.625 2.625 0 0 1 50 278.672V57.628A2.63 2.63 0 0 1 52.655 55Z"
            fill="#FF6250"
          />
          <path
            className="c"
            d="M129.375 467.75c43.835 0 79.37-35.536 79.37-79.371 0-43.834-35.535-79.369-79.37-79.369-43.835 0-79.37 35.535-79.37 79.369 0 43.835 35.535 79.371 79.37 79.371Z"
            fill="#FFDF90"
          />
          <path
            className="l"
            d="M310.854 464.542c-22.453-8.571-34.395-33.281-26.787-55.156l59.917-170.984c7.677-21.875 32.098-32.648 54.552-24.077 22.453 8.585 34.395 33.281 26.787 55.169l-59.917 170.985c-7.677 21.875-32.098 32.662-54.552 24.063Z"
            fill="#36F"
          />
        </svg>
      ) : (
        <svg
          style={{
            ...(!authState.isAuthenticated ? { filter: "grayscale(1)" } : {}),
          }}
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
