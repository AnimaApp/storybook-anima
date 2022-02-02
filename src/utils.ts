import { createAlert } from "./components/alert";

export const createElementFromHTML = (htmlString: string): HTMLElement => {
  const div = document.createElement("div");
  div.innerHTML = htmlString.trim();
  return div.firstElementChild as HTMLElement;
};

export const getCurrentCanvasHTML = (): string => {
  const el = document.querySelector(
    "#storybook-preview-iframe"
  ) as HTMLIFrameElement | null;

  if (!el) return null;
  return el.contentWindow.document.documentElement.outerHTML;
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
  }, 2000);
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
  return Array.from(document.head.getElementsByTagName("style"))
    .map((style) => style.innerHTML)
    .join("");
};

export const buildPage = (html: string, css: string) => {
  return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Preview</title>
          <style>
            ${css}
          </style>
          <meta name="viewport" content="initial-scale=1, width=device-width" />
        </head>
        <body>
          <script async src="build/bundle.js"></script>
          <div id="root">${html}</div>
        </body>
      </html>
    `;
};
