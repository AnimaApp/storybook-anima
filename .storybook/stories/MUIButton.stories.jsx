import React from 'react';
import { MUIButton } from './MUIButton';

export default {
  title: 'Example/MUI Button',
  component: MUIButton,
  argTypes: {
    // variant: { control: { type: 'select', }, options: ['text', 'outlined', 'contained'] },
    variant: { control: { type: 'select', }, options: ['outlined', 'contained'] },
    color: { control: { type: 'select', }, options: ['primary', 'secondary'] },
    color: { control: { type: 'select', }, options: ['primary'] },
    // size: { control: { type: 'select', }, options: ['small', 'medium', 'large'] },
    disabled: { control: 'boolean' },
  },
};

const Template = (args) => <MUIButton {...args} />;

export const Button = Template.bind({});
Button.args = {
  label: 'Button',
  variant: 'contained',
  color: 'primary',
  disabled: false,
};

