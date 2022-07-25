import React from "react";
import Button from "@mui/material/Button";

export default {
  title: "Example/NullAndUndefinedValues",
  component: Button,
  argTypes: {
    variant: {
      control: { type: "select" },
      options: [null, "outlined", "contained"],
    },
    color: {
      control: { type: "select" },
      options: ["primary", "secondary", "warning", "info", "success"],
    },
    size: {
      control: { type: "select" },
      options: [undefined, "small", "medium", "large"],
    },
    disabled: { control: "boolean" },
  },
};

const Template = (args) => <Button {...args}>{args.label}</Button>;

export const NullAndUndefined = Template.bind({});
NullAndUndefined.args = {
  label: "Button",
  variant: "contained",
  disabled: false,
  size: "small",
};
