import React from "react";
import { addons, types } from "@storybook/addons";
import {
  ADDON_ID,
  EXPORT_END,
  EXPORT_START,
  STORYBOOK_ANIMA_TOKEN,
} from "./constants";
import { ExportButton } from "./ExportButton";
import { authenticate, createElementFromHTML } from "./utils";
import { GLOBAL_STYLES } from "./globalStyles";
import { get } from "lodash";

addons.register(ADDON_ID, (api) => {
  const channel = api.getChannel();

  const customFont = document.querySelector("#anima-custom-font");
  !customFont &&
    document.head.appendChild(
      createElementFromHTML(
        `<link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">`
      )
    ) &&
    document.head.appendChild(
      createElementFromHTML(
        `<style>.t{animation:3s cubic-bezier(.34,1.56,.64,1) 0s infinite normal forwards running t;transform-box:fill-box;transform-origin:0% 0%}@keyframes t{0%{transform:scale(0);opacity:0}3.33%{opacity:1}23.33%{transform:scale(1)}76.67%{opacity:1}80%{transform:scale(1)}93.33%{transform:scale(0);opacity:0}100%{transform:scale(0);opacity:0}}.c{animation:3s cubic-bezier(.34,1.56,.64,1) .5s infinite normal forwards running c;transform-box:fill-box;transform-origin:50% 50%}@keyframes c{0%{transform:scale(0);opacity:0}3.33%{opacity:1}23.33%{transform:scale(1)}76.67%{opacity:1}80%{transform:scale(1)}93.33%{transform:scale(0);opacity:0}100%{transform:scale(0);opacity:0}}.l{animation:3s cubic-bezier(.34,1.56,.64,1) .8s infinite normal forwards running l;transform-box:fill-box;transform-origin:50% 50%}@keyframes l{0%{transform:scale(0) rotateZ(-180deg);opacity:0}3.33%{opacity:1}23.33%{transform:scale(1)}50%{transform:rotateZ(0)}76.67%{opacity:1}80%{transform:scale(1)}93.33%{transform:scale(0);opacity:0}100%{transform:scale(0);opacity:0}}</style>`
      )
    ) &&
    document.head.appendChild(
      createElementFromHTML(`<style>${GLOBAL_STYLES}</style>`)
    );

  // ON THE MAIN PAGE
  if (window.location === window.parent.location) {
    window.addEventListener(
      "message",
      (event) => {
        const source = get(event, "data.source", "");
        if (source === "anima") {
          const action = get(event, "data.action", "");
          const data = get(event, "data.data", {});

          switch (action) {
            case "export-start":
              channel.emit(EXPORT_START);
              break;
            case "export-end":
              channel.emit(EXPORT_END, { error: data.error });
              break;

            default:
              break;
          }
        }
      },
      false
    );

    const frame = document.createElement("iframe");
    Object.assign(frame.style, {
      width: "100%",
      height: "100%",
      border: "none",
      zIndex: -1,
      visibility: "hidden",
      position: "fixed",
    });

    // let exportButton: HTMLButtonElement | null;

    frame.onload = function () {
      // exportButton = frame.contentDocument.querySelector(
      //   "#export-button"
      // ) as HTMLButtonElement;
    };
    frame.src = window.location.href;
    document.body.appendChild(frame);

    channel.on("createStory", async ({ storyId }) => {
      console.log("createStory", storyId);
      const ev = new CustomEvent("change-story", { detail: { storyId } });
      frame.contentDocument.dispatchEvent(ev);
    });

    authenticate(STORYBOOK_ANIMA_TOKEN).then((isAuthenticated) => {
      channel.emit("AUTH", isAuthenticated);
    });
  }

  addons.add(ADDON_ID, {
    title: "Anima",
    type: types.TOOL,
    match: () => true,
    render: () => <ExportButton api={api as any} />,
  });
});
