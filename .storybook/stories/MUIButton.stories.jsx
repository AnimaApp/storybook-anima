import React from 'react';
import Button from '@mui/material/Button';
import { AddIcCallOutlined, Delete } from '@mui/icons-material';

export default {
  title: 'Example/MUI Button',
  component: Button,
  argTypes: {
    variant: { control: { type: 'select', }, options: ['outlined', 'contained'] },
    color: { control: { type: 'select', }, options: ['primary', "secondary", "warning", "info", "success"] },
    size: { control: { type: 'select', }, options: ['small', 'medium', 'large'] },
    disabled: { control: 'boolean' },
    startIcon: { control: { type: 'select' }, options: ['add', 'delete', 'none'], mapping: { none: null, add: <AddIcCallOutlined />, delete: <Delete /> } },
  },
};

const Template = (args) => (<Button {...args}>{args.label}</Button>);

export const Default = Template.bind({});
Default.args = {
  label: 'Button',
  variant: 'contained',
  color: 'primary',
  disabled: false,
  size: 'medium',
};

