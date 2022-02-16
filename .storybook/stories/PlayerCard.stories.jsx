import React from 'react';

import PlayerCard from './PlayerCard';

export default {
  title: 'Example/MUI Card',
  component: PlayerCard,
};

const Template = (args) => <PlayerCard {...args} />;

export const Card = Template.bind({});
Card.args = {};

