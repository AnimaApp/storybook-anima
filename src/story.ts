import { InputType } from "@storybook/csf";
import { API, Story, ArgTypes } from "@storybook/api";
import { Args } from "@storybook/addons";
import md5 from "object-hash";

import {
  get,
  has,
  isBoolean,
  isEmpty,
  isNil,
  isNull,
  isString,
  isUndefined,
  omit,
  omitBy,
  uniqBy,
} from "lodash";
import { hasInvalidBooleanDefinitions } from "./utils/argTypesValidation";
import {
  choice,
  escapeHtml,
  getStorybookToken,
  nextTick,
  runSeed,
  StoryPayload,
  StoryVariant,
} from "./utils";
import {
  EXPORT_PROGRESS,
  EXPORT_START,
  INVALID_BOOLEAN_ARGS_DETECTED,
  SAMPLE_STORYBOOK_HOST,
  VARIANTS_COUNT_LIMIT,
} from "./constants";
import { buildArgsParam } from "./utils/argsQuery";

const SUPPORTED_ARG_TYPES = ["select", "radio", "inline-radio", "boolean"];
const COMPLEX_CONTROLS = ["array", "object", "date", "range", "file"];

const getArgType = (arg: InputType): string => {
  let argType = "";
  const control = arg?.control as { type?: string };
  argType = control?.type;
  if (!argType) {
    argType = isString(arg.type) ? arg.type : arg.type?.name || "unknown";
  }
  return argType;
};

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
    case "inline-radio":
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

      if (["select", "radio", "inline-radio"].includes(argType)) {
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

export const getStoryPayload = async (
  api: API,
  argTypes: ArgTypes,
  { isSRR } = { isSRR: false }
): Promise<Omit<StoryPayload, "dependencies" | "componentId">> => {
  const story = api.getCurrentStoryData() as Story;

  const storyName = story?.name;
  // Story type complains that there is not title in the story but it's okay
  const storyTitle = (story as any)?.title || storyName;
  const storyId = story?.id;
  const supportedInitialArgs = getSupportedInitialArgs(
    argTypes,
    story.initialArgs
  );

  if (hasInvalidBooleanDefinitions(argTypes, story.initialArgs)) {
    console.error(
      "Detected invalid configuration: boolean controls must specify an explicit type to be correctly processed. " +
        "Until you fix this, the resulting components might be missing some variants. " +
        "For more information, please see: https://github.com/AnimaApp/storybook-anima#limitations-with-boolean-control-types"
    );

    parent.postMessage(
      {
        action: INVALID_BOOLEAN_ARGS_DETECTED,
        source: "anima",
        data: { storyName },
      },
      "*"
    );
  }

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
      .filter(
        (key) =>
          isBoolean(variant[key]) ||
          isString(variant[key]) ||
          isUndefined(variant[key]) ||
          isNull(variant[key])
      )
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
    filename: get(story, "parameters.fileName", ""),
  };
};
