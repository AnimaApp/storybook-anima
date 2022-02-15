import React from "react";
import { addons, types } from "@storybook/addons";
import { ADDON_ID, STORYBOOK_ANIMA_TOKEN } from "./constants";
import { ExportButton } from "./ExportButton";
import { authenticate } from "./utils";

addons.register(ADDON_ID, (api) => {
  const channel = api.getChannel();

  authenticate(STORYBOOK_ANIMA_TOKEN).then((isAuthenticated) => {
    channel.emit("AUTH", isAuthenticated);
  });

  addons.add(ADDON_ID, {
    title: "Anima",
    type: types.TOOL,
    match: () => true,
    render: () => <ExportButton api={api as any} />,
  });
});
