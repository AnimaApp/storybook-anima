import { createAlert } from "./components/alert";
import { API_URL } from "./constants";

export const createElementFromHTML = (htmlString: string): HTMLElement => {
  const div = document.createElement("div");
  div.innerHTML = htmlString.trim();
  return div.firstElementChild as HTMLElement;
};

export const notify = (text: string): void => {
  const alertElement = createAlert(text);
  document.body.appendChild(alertElement);

  (alertElement.firstElementChild as HTMLElement).style.opacity = "1";

  setTimeout(() => {
    (alertElement.firstElementChild as HTMLElement).style.opacity = "0";
    requestAnimationFrame(() => {
      alertElement.remove();
    });
  }, 2500);
};

export const downloadAsJSON = (data: Record<string, any>) => {
  const content = JSON.stringify(data, null, 2);
  const blob = new Blob([content], { type: "text/json" });
  const dataURI = `data:text/json;charset=utf-8,${content}`;
  const URL = window.URL || window.webkitURL;
  const downloadURI =
    typeof URL.createObjectURL === "undefined"
      ? dataURI
      : URL.createObjectURL(blob);

  let link = document.createElement("a");
  link.setAttribute("href", downloadURI);
  link.setAttribute("download", "fg-json.json");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const extractCSS = () => {
  return (
    Array.from(document.querySelectorAll("style"))
      .filter((el) => !el.hasAttribute("data-emotion"))
      .map((style) => style.innerHTML)
      .join(" ") +
    Array.from(document.querySelectorAll("[data-emotion]"))
      .flatMap(({ sheet }: any) =>
        [...sheet.cssRules].map((rules) => rules.cssText)
      )
      .join(" ")
      .replace(/\\n/g, " ")
      .trim()
  );
};

export const authenticate = async (storybookToken: string) => {
  if (!storybookToken) return false;
  try {
    const res = await fetch(`${API_URL}/auth/storybook`, {
      method: "GET",
      headers: {
        AUTH_TOKEN: storybookToken,
      },
    });
    return res.status === 200;
  } catch (error) {
    console.log(error);
    return false;
  }
};
export const createStoryRequest = async (
  storybookToken: string,
  ...payload: any
) => {
  if (!storybookToken) return false;
  return fetch(`${API_URL}/stories`, {
    method: "POST",
    headers: {
      AUTH_TOKEN: storybookToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};
