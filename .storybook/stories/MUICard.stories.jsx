import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';

export default {
  title: 'Example/MUI Card',
  component: Card,
};


export const Default = () => (
  <Card sx={{ minWidth: 275 }}>
    <CardContent>
      <Button variant="contained" color="primary" >Content</Button>
    </CardContent>
    <CardActions>
      <Button size="small">Learn More</Button>
    </CardActions>
  </Card>
)


