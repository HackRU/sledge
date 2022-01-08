import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Submission from './Submission';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
}));

export default function SimpleAccordion() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Submission />
      <Submission />
    </div>
  );
}
