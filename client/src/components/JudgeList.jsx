import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
    flexBasis: '33.33%',
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
}));

function JudgeItem({ name }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        marginTop: '1px',
        paddingTop: '10px',
        paddingBottom: '10px',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'black',
        cursor: 'grab',
      }}
    >
      <a href="#">{name}</a>
    </div>
  );
}

export default function SimpleAccordion() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <JudgeItem name="Judge 1" />
      <JudgeItem name="Judge 2" />
    </div>
  );
}
