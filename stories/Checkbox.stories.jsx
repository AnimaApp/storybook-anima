import React from 'react';
import { default as Component } from '@mui/material/Checkbox';


export default {
  title: 'Example/MUICheckbox',
  component: Component,
  argTypes: {
    checked: { control: 'boolean' },
  },



};

const Template = (args) => <Component {...args} />;

export const checked = Template.bind({});

checked.args = {
  checked: true,
};


