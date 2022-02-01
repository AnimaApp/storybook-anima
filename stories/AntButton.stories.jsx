import React from 'react';

import { Button } from 'antd';
import 'antd/dist/antd.css';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/AntButton',
  component: Button,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <Button {...args} >{args.label}</Button>;



export const contained = Template.bind({});
contained.args = {
  label: 'Button',
  type: 'primary',
};

