import React from 'react';

import PlayerCard from './PlayerCard';




export default {
  title: 'Example/MUICard',
  component: PlayerCard,
  argTypes: {
  },
  parameters: {
    
  }

};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <PlayerCard {...args} />;



export const Card = Template.bind({});
Card.args = {};

