import React from "react";
import { addons, types } from "@storybook/addons";
import {
  ADDON_ID,
  ANIMA_ROOT_ID,
  EXPORT_ALL_STORIES,
  EXPORT_END,
  EXPORT_PROGRESS,
  EXPORT_SINGLE_STORY,
  EXPORT_START,
  GET_AUTH,
  SET_AUTH,
} from "./constants";
import { ExportButton } from "./ExportButton";
import { authenticate, getStorybookToken, injectCustomStyles } from "./utils";
import { get } from "lodash";
import ReactDOM from "react-dom";
import Banner from "./components/banner";

addons.register(ADDON_ID, (api) => {
  const channel = api.getChannel();
  const isMainThread = window.location === window.parent.location;
  let isLoading = false;
  let isAuthenticated = false;

  // ON THE MAIN PAGE
  if (isMainThread) {
    const animaRoot = document.createElement("div");
    animaRoot.id = ANIMA_ROOT_ID;
    document.body.appendChild(animaRoot);
    injectCustomStyles();

    ReactDOM.render(<Banner channel={channel} />, animaRoot);

    window.addEventListener(
      "message",
      (event) => {
        const source = get(event, "data.source", "");
        if (source === "anima") {
          const action = get(event, "data.action", "");
          const data = get(event, "data.data", {});

          switch (action) {
            case EXPORT_START:
              channel.emit(EXPORT_START, data);
              break;
            case EXPORT_END:
              channel.emit(EXPORT_END, { error: data.error });
              break;
            case EXPORT_PROGRESS:
              channel.emit(EXPORT_PROGRESS, data);
              break;

            default:
              break;
          }
        }
      },
      false
    );

    const workerFrame = document.createElement("iframe");
    Object.assign(workerFrame.style, {
      width: "100%",
      height: "100%",
      border: "none",
      zIndex: -1,
      visibility: "hidden",
      position: "fixed",
    });

    workerFrame.src = window.location.href;
    document.body.appendChild(workerFrame);

    channel.on(EXPORT_SINGLE_STORY, async ({ storyId }) => {
      const ev = new CustomEvent(EXPORT_SINGLE_STORY, { detail: { storyId } });
      workerFrame.contentDocument.dispatchEvent(ev);
    });
    channel.on(EXPORT_ALL_STORIES, async ({ stories }) => {
      const ev = new CustomEvent(EXPORT_ALL_STORIES, { detail: { stories } });
      workerFrame.contentDocument.dispatchEvent(ev);
    });
    channel.on(GET_AUTH, () => {
      if (isAuthenticated) {
        channel.emit(SET_AUTH, true);
        return;
      }
      if (isLoading) return;

      isLoading = true;

      authenticate(getStorybookToken())
        .then(({ isAuthenticated }) => {
          channel.emit(SET_AUTH, isAuthenticated);
          isAuthenticated = isAuthenticated;
        })
        .finally(() => {
          isLoading = false;
        });
    });
  }

  addons.add(ADDON_ID, {
    title: "Anima",
    type: types.TOOL,
    match: () => true,
    render: () => <ExportButton />,
  });
});
