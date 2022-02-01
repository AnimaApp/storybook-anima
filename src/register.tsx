import React from "react";
import { addons, types } from "@storybook/addons";
import { ADDON_ID } from "./constants";
import { ExportButton } from "./ExportButton";

let currentId;

addons.register(ADDON_ID, (api) => {
  const channel = api.getChannel();
  let rawSources;
  function fetchSources() {
    fetch("./rawSources.json")
      .then((response) => response.json())
      .then((data) => {
        if (!rawSources || currentId !== data.id) {
          currentId = data.id;
          rawSources = data.files;
          channel.on("sourceCode/rawSources", data.files);
        }
      });
  }
  fetchSources();

  addons.add(ADDON_ID, {
    title: "Export stories",
    type: types.TOOL,
    match: () => true,
    render: () => (
      <ExportButton
        channel={channel}
        rawSources={rawSources}
        api={api as any}
      />
    ),
  });
});
