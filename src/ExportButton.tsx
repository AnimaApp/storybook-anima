import React, { useEffect, useRef, useState } from "react";
import { IconButton } from "@storybook/components";
import md5 from "object-hash";
import { InputType } from "@storybook/csf";
import {
  API,
  useChannel,
  useStorybookApi,
  Story,
  useStorybookState,
  State,
  useArgTypes,
  ArgTypes,
  useParameter,
} from "@storybook/api";
import { Args } from "@storybook/addons";
import {
  get,
  has,
  isBoolean,
  isEmpty,
  isNil,
  isString,
  omit,
  omitBy,
  uniqBy,
} from "lodash";

import {
  createStoryRequest,
  escapeHtml,
  getStorybookToken,
  isDocsStory,
  nextTick,
  notify,
  StoryPayload,
  StoryVariant,
} from "./utils";
import {
  EXPORT_END,
  EXPORT_START,
  EXPORT_PROGRESS,
  EXPORT_SINGLE_STORY,
  EXPORT_ALL_STORIES,
  GET_AUTH,
  SET_AUTH,
  SAMPLE_STORYBOOK_HOST,
  VARIANTS_COUNT_LIMIT,
} from "./constants";
import { choice, runSeed } from "./utils";
import { buildArgsParam } from "./utils/argsQuery";

interface SProps {}

const SUPPORTED_ARG_TYPES = ["select", "radio", "boolean"];
const COMPLEX_CONTROLS: string[] = ["array", "object", "date", "range", "file"];

const getArgType = (arg: InputType): string => {
  let argType = "";
  const control = arg?.control as { type?: string };
  argType = control?.type;
  if (!argType) {
    argType = isString(arg.type) ? arg.type : arg.type?.name || "unknown";
  }
  return argType;
};

const getArgOptions = (arg: InputType): any[] => {
  const options = arg?.options || arg?.control?.options || [];
  return options;
};

const populateSeedObjectBasedOnArgType = (
  seedObj: Record<string, any>,
  arg: InputType,
  argKey: string
) => {
  const seedObject = { ...seedObj };
  const argType = getArgType(arg);
  const argOptions = getArgOptions(arg);
  switch (argType) {
    case "select":
    case "radio":
      seedObject[argKey] = choice(...argOptions);
      break;
    case "boolean":
      seedObject[argKey] = choice(true, false);
      break;
  }
  return seedObject;
};

const getVariants = (
  story: Story,
  argTypes: ArgTypes
): [Record<string, any>[], boolean] => {
  let seedObj = {};
  let isUsingEditor = false;
  const storyArgs = get(story, "args", {}) as Args;
  const storyDefaultArgs = get(story, "initialArgs", {}) as Args;

  if (argTypes) {
    const argKeys = Object.keys(argTypes);

    isUsingEditor = argKeys.some((argKey) =>
      COMPLEX_CONTROLS.includes(getArgType(argTypes[argKey]))
    );

    for (const argKey of argKeys) {
      const arg = argTypes[argKey];
      const argType = getArgType(arg);

      if (SUPPORTED_ARG_TYPES.includes(argType)) {
        seedObj[argKey] = has(storyDefaultArgs, argKey)
          ? storyDefaultArgs[argKey]
          : has(storyArgs, argKey)
          ? storyArgs[argKey]
          : null;
        seedObj = populateSeedObjectBasedOnArgType(seedObj, arg, argKey);
      }
    }
  }

  seedObj = omitBy(seedObj, isNil);
  let defaultVariant = {};
  Object.keys(seedObj).forEach((key) => {
    const getValue = (key: string) => {
      if (has(storyDefaultArgs, key)) return storyDefaultArgs[key];
      if (has(storyArgs, key)) return storyArgs[key];

      const arg = argTypes[key];
      const argType = getArgType(arg);

      if (["select", "radio"].includes(argType)) {
        const options = getArgOptions(arg);
        return options.length > 0 ? options[0] : null;
      }
      if (["boolean"].includes(argType)) {
        return false;
      }
    };

    defaultVariant[key] = getValue(key);
  });

  const hash = md5(defaultVariant);
  defaultVariant["hash"] = hash;

  const variants = (
    !isEmpty(seedObj) ? runSeed(() => seedObj) : [defaultVariant]
  ) as Record<string, any>[];
  return [[defaultVariant, ...variants], isUsingEditor];
};

const getTopNVariantsWithinLimit = (
  story: Story,
  argTypes: ArgTypes,
  limit = VARIANTS_COUNT_LIMIT
): [
  variants: Record<string, any>[],
  isUsingEditor: boolean,
  hadTrimmedVariants: boolean
] => {
  const argTypeEntries = Object.entries(argTypes);
  if (argTypeEntries.length === 0) {
    return [...getVariants(story, argTypes), false];
  }

  let currentArgs: ArgTypes = {};
  let previousVariants: [Record<string, any>[], boolean];
  let hadTrimmedVariants = false;

  for (const [argName, argValue] of argTypeEntries) {
    currentArgs[argName] = argValue;
    const variants = getVariants(story, currentArgs);

    if (variants[0].length > limit) {
      hadTrimmedVariants = true;
      break;
    } else {
      previousVariants = variants;
    }
  }

  if (hadTrimmedVariants) {
    // If we had to trim variants, then we want the component to be classified as complex
    return [previousVariants[0], true, hadTrimmedVariants];
  } else {
    return [...previousVariants, hadTrimmedVariants];
  }
};

// Extract the properties we support from the initial args so that
// the query building process can ignore them.
const getSupportedInitialArgs = (argTypes: ArgTypes, initialArgs: any) => {
  if (!initialArgs || !argTypes) {
    return {};
  }

  const supportedArgs = {};

  for (const [argName, arg] of Object.entries(argTypes)) {
    const argType = getArgType(arg);
    const initialArgValue = initialArgs[argName];

    if (
      SUPPORTED_ARG_TYPES.includes(argType) &&
      initialArgValue !== undefined
    ) {
      supportedArgs[argName] = initialArgValue;
    }
  }

  return supportedArgs;
};

const doExport = async (
  api: API,
  state: State,
  action = "create-single-story"
) => {
  const channel = api.getChannel();
  const isMainThread = window.location === window.parent.location;

  if (!isMainThread) return Promise.resolve(false);

  // If we are on the main thread, we need to send the request to the worker iframe

  if (action === EXPORT_SINGLE_STORY) {
    const story = api.getCurrentStoryData() as Story;

    if (!isDocsStory(story)) {
      channel.emit(EXPORT_SINGLE_STORY, { storyId: story.id });
    } else {
      notify("Oups, you can only export components");
    }
  }

  if (action === EXPORT_ALL_STORIES) {
    const stories = Object.entries(state.storiesHash);
    const componentStories = stories
      .map(([_, story]) => story)
      .filter((story: Story) => !isDocsStory(story) && story.isLeaf);

    channel.emit(EXPORT_ALL_STORIES, { stories: componentStories });
  }

  return Promise.resolve(true);
};

const getStoryPayload = async (
  api: API,
  argTypes: ArgTypes,
  { isSRR } = { isSRR: false }
): Promise<StoryPayload> => {
  const story = api.getCurrentStoryData() as Story;

  const storyName = story?.name;
  // Story type complains that there is not title in the story but it's okay
  const storyTitle = (story as any)?.title || storyName;
  const storyId = story?.id;
  const supportedInitialArgs = getSupportedInitialArgs(
    argTypes,
    story.initialArgs
  );

  const [variants, isUsingEditor, hadTrimmedVariants] =
    getTopNVariantsWithinLimit(story, argTypes);

  if (hadTrimmedVariants) {
    console.warn(
      `Unable to export all controls for story: '${storyName}' as the resulting number of variants would have been too high. ` +
        `You can solve this problem by explicitly specifying which props should be exported in the story definition files. ` +
        `For more information, see: https://github.com/AnimaApp/storybook-anima#limits-on-the-number-of-variants`
    );
  }

  let defaultArgsQuery = "";
  const storyVariants: StoryVariant[] = [];
  const uniqueVariants = uniqBy(variants, (e) => e.hash).slice(
    0,
    VARIANTS_COUNT_LIMIT
  );

  const hashArray = uniqueVariants.map((e) => e.hash);

  if (uniqueVariants.length > 0) {
    parent.postMessage(
      {
        action: EXPORT_START,
        source: "anima",
        data: { total: uniqueVariants.length, storyName, hadTrimmedVariants },
      },
      "*"
    );
  }

  for (let i = 0; i < uniqueVariants.length; i++) {
    let variant = omit(uniqueVariants[i], "hash");
    let is_default = false;

    variant = Object.keys(variant)
      .filter((key) => isBoolean(variant[key]) || isString(variant[key]))
      .reduce((cur, key) => {
        return Object.assign(cur, { [key]: variant[key] });
      }, {});

    // Every once in a while notify the progress
    if (i % 50 === 0 || i === uniqueVariants.length - 1) {
      window.parent.postMessage(
        {
          action: EXPORT_PROGRESS,
          data: {
            current: i + 1,
            total: uniqueVariants.length,
            storyName,
            hadTrimmedVariants,
          },
          source: "anima",
        },
        "*"
      );
      // Wait for the UI to update
      await nextTick();
    }

    const variantData = Object.keys(variant).map(
      (key) => `${key}=${variant[key]}`
    );
    const variantID = escapeHtml(variantData.join(",") || "default");
    const completeArgs = {
      ...supportedInitialArgs,
      ...variant,
    };
    const serializedArgs = buildArgsParam(supportedInitialArgs, completeArgs);
    const query = `?path=/story/${story.id}&args=${serializedArgs}`;

    if (i === 0) {
      is_default = true;
      defaultArgsQuery = query;
    }

    storyVariants.push({
      html_url: `iframe.html${query}`,
      variant_id: variantID,
      args: is_default ? { ...story.initialArgs, ...variant } : variant,
      is_default,
      use_external_resources: isSRR,
    });
  }

  const fingerprint = md5({ variants: hashArray, name: storyName });
  const isSample = window.location.hostname === SAMPLE_STORYBOOK_HOST;

  return {
    storybookToken: getStorybookToken(),
    argTypes,
    source: story.parameters?.storySource?.source,
    default_preview_url_args: defaultArgsQuery,
    variants: storyVariants,
    fingerprint,
    name: storyName,
    title: storyTitle,
    storybookStoryId: storyId,
    isSample,
    isUsingEditor,
    initialArgs: story.initialArgs,
  };
};

export const ExportButton: React.FC<SProps> = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    message: "",
  });
  const argTypes = useRef({});
  const serverParams = useRef(null);

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
  });

  const isMainThread = window.location === window.parent.location;
  const api = useStorybookApi();
  const state = useStorybookState();
  argTypes.current = useArgTypes();
  // https://github.com/storybookjs/storybook/tree/main/app/server#getting-started
  serverParams.current = useParameter<Record<string, any>>("server", {});

  // Export button click trigger (triggered only in the main thread)
  const handleExportClick = (action: string) => {
    doExport(api, state, action);
  };

  const handleExportError = (e: any) => {
    console.error(e);
    parent.postMessage(
      { action: EXPORT_END, source: "anima", data: { error: true } },
      "*"
    );
  };

  // Export single story handler
  const handleExportSingleStory = async (event: CustomEvent) => {
    const { storyId, storybookId } = get(event, "detail", {});

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

          await createStoryRequest(storybookId, storyPayload);
          parent.postMessage(
            { action: EXPORT_END, source: "anima", data: { error: null } },
            "*"
          );
        } catch (error) {
          handleExportError(error);
        }
      }
    } catch (error) {
      handleExportError(error);
    } finally {
    }
  };

  // Export full library handler
  const handleExportAllStories = async (event: CustomEvent) => {
    try {
      const { stories = [], storybookId = "" } = get(event, "detail", {});

      for (const story of stories) {
        try {
          api.selectStory(story.id);
          const storyPayload = await getStoryPayload(api, argTypes.current);

          if (storyPayload.variants.length === 0) {
            continue;
          }

          await createStoryRequest(storybookId, storyPayload);
        } catch (error) {
          handleExportError(error);
          continue;
        }
      }
      parent.postMessage(
        { action: EXPORT_END, source: "anima", data: { error: null } },
        "*"
      );
    } catch (error) {
      handleExportError(error);
    }
  };

  useEffect(() => {
    if (isMainThread) {
      api.getChannel().emit(GET_AUTH);
    } else {
      document.addEventListener(EXPORT_SINGLE_STORY, handleExportSingleStory);
      document.addEventListener(EXPORT_ALL_STORIES, handleExportAllStories);
    }

    return () => {
      if (!isMainThread) {
        document.removeEventListener(
          EXPORT_SINGLE_STORY,
          handleExportSingleStory
        );
        document.removeEventListener(
          EXPORT_ALL_STORIES,
          handleExportAllStories
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
        handleExportClick(EXPORT_SINGLE_STORY);
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
