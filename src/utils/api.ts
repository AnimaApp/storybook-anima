import { API_URL, STORYBOOK_ANIMA_TOKEN } from "../constants";
import { capitalize, isBoolean, isString } from "./helpers";
import { Args } from "@storybook/api";

interface CreateStoryArgs {
  storybookToken: string;
  fingerprint: string;
  HTML: string;
  CSS: string;
  width: number;
  height: number;
  defaultHTML: string;
  defaultCSS: string;
  name: string;
}

export const authenticate = async (storybookToken: string) => {
  if (!storybookToken) return false;
  try {
    const res = await fetch(`${API_URL}/storybook_token/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ storybook_auth_token: storybookToken }),
    });
    return res.status === 200;
  } catch (error) {
    console.log(error);
    return false;
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
  } = args;
  if (!storybookToken) return false;
  return fetch(`${API_URL}/stories`, {
    method: "POST",
    headers: {
      storybook_auth_token: storybookToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      html: HTML,
      css: CSS,
      fingerprint,
      width,
      height,
      name,
      storybook_auth_token: storybookToken,
      default_css: defaultCSS,
      default_html: defaultHTML,
      with_variants: true,
    }),
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
