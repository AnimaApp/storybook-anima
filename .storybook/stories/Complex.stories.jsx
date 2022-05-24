import React from "react";
import { Complex as CC } from "./complex";

export default {
  title: "complex/complex",
  component: CC,
  argTypes: {
    names: { control: "array" },
    xx: { control: "array" },
    variant: { control: { type: 'select', }, options: ['outlined', 'contained', "text"] },
  },
};

const Template = (args) => <CC {...args} />;

export const Complex = Template.bind({});
Complex.args = {
  names: ['him', 'her'],
  variant: 'contained',
  xx: [<React.Fragment> <span>Hello</span> </React.Fragment>]
};
