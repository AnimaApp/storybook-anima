import React from 'react';
import { MUIButton } from './MUIButton';

export default {
  title: 'Example/MUIButton',
  component: MUIButton,
  argTypes: {
    variant: { control: { type: 'select', options: ['text', 'outlined', 'contained'] } },
    color: { control: { type: 'select', options: ['primary', 'secondary', "success", "error", "info", "warning"] } },
    size: { control: { type: 'select', options: ['small', 'medium', 'large'] } },
    disabled: { control: 'boolean' },
  },
};

const Template = (args) => <MUIButton {...args} />;

export const contained = Template.bind({});
contained.args = {
  label: 'Button',
  variant: 'contained',
  color: 'primary',
  disabled: false,
};

