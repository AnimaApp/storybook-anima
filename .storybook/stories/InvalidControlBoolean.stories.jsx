import React from "react";
import Button from "@mui/material/Button";

// If a boolean control is specified without type _and_ without default value,
// then storybook can't parse it correctly.
// For more information, see: https://github.com/storybookjs/storybook/issues/18796

export default {
  title: "EdgeCases/InvalidControlType",
  component: Button,
  argTypes: {
    disabled: { control: "boolean" },
    isContained: { control: { type: "boolean" } },
  },
};

const Template = (args) => (
  <Button variant={args.isContained ? "contained" : undefined} {...args}>
    {args.label}
  </Button>
);

export const Default = Template.bind({});
Default.args = {
  label: "Button",
};
