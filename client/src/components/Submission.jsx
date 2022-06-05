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
  },
}));

export default function SimpleAccordion({value}) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
        >
          <Typography className={classes.heading}>Hack 1</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
              {value.state}
              <br/>
              {value.teamId}
              <br/>
              {value.attributes.title}
              <br/>
              {value.attributes.description}
              <br/>
              {value.attributes.technologies}
              <br/>
              {value.urls.map(data =>
                  <p key={data.label}>
                    {data.label} <hr/>
                    {data.url}
                  </p> 
                )}
              {value.categories.map(data =>
                  <p key={data.categoryID}>
                    category ID {data.categoryID} and category name {data.categoryName}
                  </p> 
                )}
            </Typography>
          
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
