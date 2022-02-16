import React from 'react';
import { default as Component } from '@mui/material/Checkbox';


export default {
  title: 'Example/MUI Checkbox',
  component: Component,
  argTypes: {
    checked: { control: 'boolean' },
  },
};

const Template = (args) => <Component {...args} />;
export const Checkbox = Template.bind({});

Checkbox.args = {
  checked: true,
};


