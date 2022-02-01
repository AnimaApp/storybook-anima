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
  parameters: {
    variants: [{
      variant: 'contained',
      label: 'Large',
      size: 'large',

    }, {
      variant: 'contained',
      label: 'Small',
      size: 'small',

    }, {
      variant: 'contained',
      label: 'Medium',
      size: 'medium',

    }, {
      variant: 'outlined',
      label: 'Large',
      size: 'large',
      color: 'secondary'

    }, {
      variant: 'outlined',
      label: 'Small',
      size: 'small',
      color: 'secondary'

    }, {
      variant: 'outlined',
      label: 'Medium',
      size: 'medium',
      color: 'secondary'

    }]

  }
};

const Template = (args) => <MUIButton {...args} />;

export const contained = Template.bind({});
contained.args = {
  label: 'Button',
  variant: 'contained',
  color: 'primary',
  disabled: false,
};

