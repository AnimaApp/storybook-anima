import React from 'react';
import { default as Component } from '@mui/material/Button';

export default {
  title: 'Example/MUI Button',
  component: Component,
  argTypes: {
    variant: { control: { type: 'select', }, options: ['outlined', 'contained'] },
    color: { control: { type: 'select', }, options: ['primary', "secondary", "warning", "info", "success"] },
    size: { control: { type: 'select', }, options: ['small', 'medium', 'large'] },
    disabled: { control: 'boolean' },
  },
};

const Template = (args) => (<Component {...args}>{args.label}</Component>);

export const Button = Template.bind({});
Button.args = {
  label: 'Button',
  variant: 'contained',
  color: 'primary',
  disabled: false,
  size: 'medium',
};

