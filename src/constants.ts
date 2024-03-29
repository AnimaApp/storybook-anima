import { AnimaParameters } from "./types";
export const API_URL =
  localStorage.getItem("api_url") || "https://api.animaapp.com";
export const PARAM_KEY = "export-stories";
export const VARIANTS_COUNT_LIMIT = 1025;
export const EVENT_CODE_RECEIVED = "EVENT_CODE_RECEIVED";
export const IFRAME_RENDERER_CLICK = "IFRAME_RENDERER_CLICK";
export const ANIMA_ROOT_ID = "ANIMA_ROOT_ID";
export const ANIMA_FONT_EL_SELECTOR = "#ANIMA_FONT_EL_SELECTOR";
export const EXPORT_START = "EXPORT_START";
export const EXPORT_END = "EXPORT_END";
export const EXPORT_SINGLE_STORY = "EXPORT_SINGLE_STORY";
export const EXPORT_ALL_STORIES = "EXPORT_ALL_STORIES";
export const INVALID_BOOLEAN_ARGS_DETECTED = "INVALID_BOOLEAN_ARGS_DETECTED";
export const GET_AUTH = "GET_AUTH";
export const SET_AUTH = "SET_AUTH";
export const SET_STORYBOOK_META = "SET_STORYBOOK_META";
export const SET_CURRENT_COMPONENT_ID = "SET_CURRENT_COMPONENT_ID";
export const ANIMA_STORY_WINDOW_KEY = "__ANIMA__STORY__";
export const ANIMA_EXPORTS_WINDOW_KEY = "__ANIMA__EXPORTS__";

export const EXPORT_PROGRESS = "EXPORT_PROGRESS";
export const TOGGLE_EXPORT_STATUS = "TOGGLE_EXPORT_STATUS";
export const ADDON_ID = "storybook/anima";

export const SAMPLE_STORYBOOK_HOST = "animaapp.github.io";
export const STORYBOOK_ANIMA_TOKEN = process.env.STORYBOOK_ANIMA_TOKEN;

export const DEFAULT_ANIMA_PARAMETERS: AnimaParameters = {
  designTokens: {},
};

export const SPEC_STRING_UNIT_TYPES = ["dimension"];

export const CUSTOM_STRING_UNIT_TYPES = [
  "spacing",
  "lineHeights",
  "borderRadius",
  "fontSizes",
];
export const STRING_UNIT_TYPES = [
  ...SPEC_STRING_UNIT_TYPES,
  ...CUSTOM_STRING_UNIT_TYPES,
];
