import React from "react";
import { addons, types } from "@storybook/addons";
import { ADDON_ID } from "./constants";
import { ExportButton } from "./ExportButton";
import { authenticate, getStorybookToken } from "./utils";

addons.register(ADDON_ID, (api) => {
  const channel = api.getChannel();

  authenticate(getStorybookToken()).then((isAuthenticated) => {
    channel.emit("AUTH", isAuthenticated);
  });

  addons.add(ADDON_ID, {
    title: "Anima",
    type: types.TOOL,
    match: () => true,
    render: () => <ExportButton api={api as any} />,
  });
});
