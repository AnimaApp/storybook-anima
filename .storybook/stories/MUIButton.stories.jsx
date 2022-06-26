import React from 'react';
import Button from '@mui/material/Button';
import { AddIcCallOutlined, Delete as DeleteIcon } from '@mui/icons-material';

// For some reason the get react component name method doesn't work for MUI Icons out of the box.
const Delete = () => <DeleteIcon />

export default {
  title: 'Example/MUI Button',
  component: Button,
  argTypes: {
    variant: { control: { type: 'select', }, options: ['outlined', 'contained'] },
    color: { control: { type: 'select', }, options: ['primary', "secondary", "warning", "info", "success"] },
    size: { control: { type: 'select', }, options: ['small', 'medium', 'large'] },
    disabled: { control: 'boolean' },
    startIcon: { control: { type: 'select' }, options: ['addCall', 'delete', 'none'], mapping: { none: null, addCall: <AddIcCallOutlined />, delete: <Delete /> } },
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

