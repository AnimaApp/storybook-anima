import React from "react";
import { addons, types } from "@storybook/addons";
import { ADDON_ID } from "./constants";
import { ExportButton } from "./ExportButton";

addons.register(ADDON_ID, (api) => {
  addons.add(ADDON_ID, {
    title: "Export stories",
    type: types.TOOL,
    match: () => true,
    render: () => <ExportButton api={api as any} />,
  });
});
