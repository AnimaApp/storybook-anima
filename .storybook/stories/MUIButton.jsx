import Button from '@mui/material/Button';

import React from 'react';

export const MUIButton = ({ label, ...props }) => {
  return (
    <Button {...props}>{label}</Button>
  );
};
