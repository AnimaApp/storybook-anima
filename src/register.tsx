import React from "react";
import { addons, types } from "@storybook/addons";
import promiseRetry from "promise-retry";

import {
  ADDON_ID,
  ANIMA_ROOT_ID,
  EXPORT_ALL_STORIES,
  EXPORT_END,
  EXPORT_PROGRESS,
  EXPORT_SINGLE_STORY,
  EXPORT_START,
  GET_AUTH,
  INVALID_BOOLEAN_ARGS_DETECTED,
  SET_AUTH,
} from "./constants";
import { ExportButton } from "./ExportButton";
import {
  authenticate,
  createStorybook,
  getStorybook,
  getStorybookToken,
  injectCustomStyles,
  isJSON,
  notify,
  updateStorybookUploadStatus,
} from "./utils";
import { get } from "lodash";
import md5 from "object-hash";
import ReactDOM from "react-dom";
import Banner from "./components/banner";
import { uploadFile } from "./utils/upload";
import { AnimaParameters } from "./types";

const createIframeWorker = (): HTMLIFrameElement => {
  const el = document.createElement("iframe");
  Object.assign(el.style, {
    width: "100%",
    height: "100%",
    border: "none",
    zIndex: -1,
    visibility: "hidden",
    position: "fixed",
  });

  el.src = window.location.href;
  document.body.appendChild(el);
  return el;
};

const getZip = (): Promise<{ zipHash: string; zipBlob: Blob }> => {
  return new Promise((resolve, reject) => {
    fetch("storybook_preview.zip")
      .then((zipRes) => {
        if (zipRes.status !== 200) {
          return null;
        }

        return zipRes.blob();
      })
      .then((zipBlob) => {
        if (!zipBlob) {
          resolve({ zipBlob: null, zipHash: null });
          return;
        }

        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(zipBlob);
        fileReader.onloadend = function () {
          crypto.subtle
            .digest("SHA-256", fileReader.result as any)
            .then((hashBuffer) => {
              const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
              const zipHash = hashArray
                .map((b) => b.toString(16).padStart(2, "0"))
                .join(""); // convert bytes to hex string

              resolve({ zipHash, zipBlob });
            })
            .catch(reject);
        };
      })
      .catch(reject);
  });
};

const getOrCreateStorybook = async ({
  animaParameters,
}: {
  animaParameters: AnimaParameters;
}) => {
  return getZip().then(async ({ zipBlob, zipHash }) => {
    if (!zipBlob) return { error: true };

    const designTokens = get(animaParameters, "designTokens", null);
    const DSJSON = isJSON(JSON.stringify(designTokens)) ? designTokens : null;
    const hash =
      DSJSON && zipHash ? md5({ zip: zipHash, ds: DSJSON }) : zipHash;

    const res = await getStorybook(hash);
    let data: Record<string, any> = {};

    if (res.status === 200) {
      data = await res.json();
    } else if (res.status === 404) {
      data = await createStorybook({ hash, DSJSON });
    }

    const { id, upload_signed_url, upload_status = "init" } = data;

    return {
      storybookId: id,
      uploadUrl: upload_signed_url,
      uploadStatus: upload_status,
      hash,
      blob: zipBlob,
    };
  });
};

const uploadStorybook = async (
  storybookId: string,
  uploadUrl: string,
  file: Blob
) => {
  const uploadResponse = await promiseRetry(
    (doRetry) => {
      return uploadFile(uploadUrl, file).catch(doRetry);
    },
    { retries: 3 }
  );

  const status = uploadResponse.status === 200 ? "complete" : "failed";
  return updateStorybookUploadStatus(storybookId, status);
};

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
            case INVALID_BOOLEAN_ARGS_DETECTED:
              channel.emit(INVALID_BOOLEAN_ARGS_DETECTED, {
                storyName: data.storyName,
              });
              break;

            default:
              break;
          }
        }
      },
      false
    );

    const worker = createIframeWorker();

    channel.on(
      EXPORT_SINGLE_STORY,
      async ({ storyId, animaParameters, componentId, dependencies }) => {
        const { blob, hash, uploadStatus, storybookId, uploadUrl, error } =
          await getOrCreateStorybook({ animaParameters });

        if (error) {
          notify("Something went wrong. Please try again later.");
          return;
        }
        if (uploadStatus !== "complete" && hash) {
          uploadStorybook(storybookId, uploadUrl, blob);
        }
        const ev = new CustomEvent(EXPORT_SINGLE_STORY, {
          detail: { storyId, storybookId, componentId, dependencies },
        });

        worker.contentDocument.dispatchEvent(ev);
      }
    );
    channel.on(EXPORT_ALL_STORIES, async ({ stories, animaParameters }) => {
      const { blob, hash, uploadStatus, storybookId, uploadUrl, error } =
        await getOrCreateStorybook({ animaParameters });

      if (error) {
        notify("Something went wrong. Please try again later.");
        return;
      }

      if (uploadStatus !== "complete" && hash) {
        uploadStorybook(storybookId, uploadUrl, blob);
      }
      const ev = new CustomEvent(EXPORT_ALL_STORIES, {
        detail: { stories, storybookId },
      });
      worker.contentDocument.dispatchEvent(ev);
    });

    channel.on(GET_AUTH, () => {
      if (isAuthenticated) {
        channel.emit(SET_AUTH, {
          isAuthenticated: true,
        });
        return;
      }
      if (isLoading) return;

      isLoading = true;

      authenticate(getStorybookToken())
        .then(({ isAuthenticated, message }) => {
          channel.emit(SET_AUTH, {
            isAuthenticated,
            message: message,
          });
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
