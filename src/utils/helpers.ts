import { Story } from "@storybook/api";
import { createAlert } from "../components/alert";

export const isString = (value: any) =>
  Object.prototype.toString.call(value) === "[object String]";

export const isBoolean = (val) => "boolean" === typeof val;

export const capitalize = (s: string) => {
  if (!isString(s)) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const createElementFromHTML = (htmlString: string): HTMLElement => {
  const div = document.createElement("div");
  div.innerHTML = htmlString.trim();
  return div.firstElementChild as HTMLElement;
};

export const notify = (text: string): void => {
  const alertElement = createAlert(text);
  document.body.appendChild(alertElement);

  (alertElement.firstElementChild as HTMLElement).style.opacity = "1";

  // Add an offset for multiple alerts
  const lowestPosition = Math.max(
    ...[...document.getElementsByClassName("anima-alert-container")].map(
      (element) => element.getBoundingClientRect().bottom
    )
  );
  alertElement.style.top = `${lowestPosition}px`;

  setTimeout(() => {
    (alertElement.firstElementChild as HTMLElement).style.opacity = "0";
    requestAnimationFrame(() => {
      alertElement.remove();
    });
  }, 3000);
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

// Source: https://stackoverflow.com/a/6234804/18342693
export const escapeHtml = (html: string) =>
  html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const isDocsStory = (story: Story) => {
  return !!story.parameters?.docsOnly;
};

export const getEventHandlerAsPromise = () => {
  let callback = (() => {}) as any;
  const promise = () => {
    return new Promise((resolve) => {
      callback = resolve;
    });
  };

  const handler = (...args) => {
    setTimeout(() => {
      process.nextTick(() => {
        callback(args);
      });
    }, 0);
  };

  return [handler, promise];
};

export const sleep = <T>(ms: number, returnValue: T): Promise<T> =>
  new Promise((resolve) => setTimeout(resolve, ms, returnValue));

// Useful to await for the next JS event tick, that way the UI can update in the meantime
export const nextTick = () => new Promise((resolve) => setTimeout(resolve, 0));

export const baseName = (path: string) => {
  var base = new String(path).substring(path.lastIndexOf("/") + 1);
  if (base.lastIndexOf(".") != -1) {
    base = base.substring(0, base.lastIndexOf("."));
  }
  return base;
};

export function isJSON(str: string) {
  try {
    var obj = JSON.parse(str);
    if (obj && typeof obj === "object" && obj !== null) {
      return true;
    }
  } catch (err) {}
  return false;
}
