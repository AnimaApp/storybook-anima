import { API_URL, STORYBOOK_ANIMA_TOKEN } from "../constants";
import { capitalize, isBoolean, isString } from "./helpers";
import { Args } from "@storybook/api";
import { gzip } from "pako";

export interface CreateStoryArgs {
  storybookToken: string;
  fingerprint: string;
  HTML: string;
  CSS: string;
  width: number;
  height: number;
  defaultHTML: string;
  defaultCSS: string;
  name: string;
  storybookId: string;
  isSample: boolean;
}

export const authenticate = async (storybookToken: string) => {
  const errorRes = { isAuthenticated: false, data: {} };

  if (!storybookToken) return errorRes;
  try {
    const res = await fetch(`${API_URL}/storybook_token/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ storybook_auth_token: storybookToken }),
    });
    if (res.status === 200) {
      const data = await res.json();
      return { isAuthenticated: true, data };
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

export const updateTeamExportStatus = (value: boolean) => {
  const storybookToken = getStorybookToken();
  if (!storybookToken) return;
  fetch(`${API_URL}/teams/update_export_status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      is_storybook_exporting: value,
      storybook_auth_token: storybookToken,
    }),
  });
};

export const createStoryRequest = async (args: CreateStoryArgs) => {
  const {
    storybookToken,
    fingerprint,
    CSS,
    HTML,
    height,
    name,
    width,
    defaultCSS,
    defaultHTML,
    storybookId,
    isSample,
  } = args;
  if (!storybookToken) throw new Error("No storybook token");

  const gzippedBody = gzip(
    JSON.stringify({
      html: HTML,
      css: CSS,
      fingerprint,
      width,
      height,
      name,
      storybookId,
      storybook_auth_token: storybookToken,
      default_css: defaultCSS,
      default_html: defaultHTML,
      with_variants: true,
      is_sample: isSample,
    })
  );

  return fetch(`${API_URL}/stories`, {
    method: "POST",
    headers: {
      storybook_auth_token: storybookToken,
      "Content-Type": "application/json",
      "Content-Encoding": "gzip",
    },
    body: gzippedBody,
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
