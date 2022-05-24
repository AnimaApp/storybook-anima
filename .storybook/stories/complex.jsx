
import React from 'react';
import Button from '@mui/material/Button';

export const Complex = (props) => {
  return (
    <Button {...props}>
      <div>{props.names.join(' & ')}</div>
    </Button>

  );
};
