import { API_URL, STORYBOOK_ANIMA_TOKEN } from "../constants";
import { capitalize, isBoolean, isString } from "./helpers";
import { Args, ArgTypes } from "@storybook/api";

const STORYBOOK_SERVICE = `${API_URL}/services/s2f`;

export interface StoryVariant {
  html_url: string;
  variant_id: string;
  description?: string;
  args?: Record<string, any>;
  is_default?: boolean;
}

export interface StoryPayload {
  storybookToken: string;
  default_preview_url_args: string;
  argTypes: ArgTypes;
  variants: StoryVariant[];
  fingerprint: string;
  name: string;
  storybookStoryId: string;
  isSample: boolean;
  isUsingEditor: boolean;
}

export const getStorybook = async (storybookZipHash: string) => {
  const storybookToken = getStorybookToken();

  if (!storybookToken) throw new Error("Storybook token is required");

  return fetch(`${STORYBOOK_SERVICE}/storybook?hash=${storybookZipHash}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + storybookToken,
    },
  });
};
export const createStorybook = async (storybookHash: string) => {
  const storybookToken = getStorybookToken();

  if (!storybookToken) throw new Error("Storybook token is required");

  const res = await fetch(`${STORYBOOK_SERVICE}/storybook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + storybookToken,
    },
    body: JSON.stringify({ storybook_hash: storybookHash }),
  });

  if (res.status === 200) {
    const data = await res.json();
    return data;
  }

  return null;
};

export const updateStorybookUploadStatus = async (
  storybookId: string,
  status: string
) => {
  const storybookToken = getStorybookToken();

  if (!storybookToken) throw new Error("Storybook token is required");

  return fetch(`${STORYBOOK_SERVICE}/storybook/${storybookId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + storybookToken,
    },
    body: JSON.stringify({ upload_status: status }),
  });
};

export const authenticate = async (storybookToken: string) => {
  const errorRes = { isAuthenticated: false, data: {} };

  if (!storybookToken) return errorRes;
  try {
    const res = await fetch(`${STORYBOOK_SERVICE}/validate_token`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + storybookToken,
      },
    });
    if (res.status === 200) {
      const data = await res.json();
      return { isAuthenticated: true, data };
    }
    if (res.status > 299) {
      const json = await res.json()
      return { isAuthenticated: false, message: json?.message };
    }
    return errorRes;
  } catch (error) {
    console.log(error);
    return errorRes;
  }
};

export const getStorybookToken = () => {
  const params = new URLSearchParams(window.location.search);
  const tokenFromUrl = params.get("anima_t");
  if (tokenFromUrl) {
    localStorage.setItem("anima_t", tokenFromUrl);
    return tokenFromUrl;
  }

  const tokenFromLocalStorage = localStorage.getItem("anima_t");
  if (tokenFromLocalStorage) {
    return tokenFromLocalStorage;
  }

  return STORYBOOK_ANIMA_TOKEN;
};

export const createStoryRequest = async (
  storybookId: string,
  payload: StoryPayload
) => {
  const {
    storybookToken,
    fingerprint,
    default_preview_url_args,
    variants,
    name,
    storybookStoryId,
    isUsingEditor,
    argTypes,
    isSample,
  } = payload;
  if (!storybookToken) throw new Error("No storybook token");

  const body = JSON.stringify({
    fingerprint,
    default_preview_url_args,
    variants,
    name,
    storybook_id: storybookStoryId,
    with_variants: true,
    is_using_editor: isUsingEditor,
    is_sample: isSample,
    argTypesJSON: JSON.stringify(argTypes),
  });

  return fetch(`${STORYBOOK_SERVICE}/storybook/${storybookId}/stories`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + storybookToken,
      "Content-Type": "application/json",
      // "Content-Encoding": "gzip",
    },
    body,
  });
};

export const extractCSS = () => {
  return Array.from(document.querySelectorAll("style"))
    .flatMap(({ sheet }: any) =>
      [...sheet.cssRules].map((rule: any) => {
        const selector = rule?.selectorText || (rule?.name as string);
        if ([".sb-", "sb-", ":not(.sb"].some((e) => selector?.startsWith(e)))
          return "";
        return rule.cssText;
      })
    )
    .join(" ")
    .replace(/\\n/g, " ")
    .trim();
};

export const getStoryNameFromArgs = (storyName: string, args: Args) => {
  const defaultName = capitalize(storyName);
  let name = `${defaultName}`;
  const addedArgs = [defaultName];

  const addArg = (s: string) => {
    if (addedArgs.includes(s)) return;
    name += ` / ${capitalize(s)}`;
    addedArgs.push(s);
  };

  const keys = Object.keys(args);
  for (let i = 0; i < keys.length; i++) {
    if (addedArgs.length > 5) break; // max of 5 args per name
    const key = keys[i];
    const value = args[key];
    if (isString(value)) {
      addArg(value);
    }
    if (isBoolean(value) && value) {
      addArg(key);
    }
  }

  return name;
};
