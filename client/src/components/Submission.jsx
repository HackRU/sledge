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
  console.log(value);
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
              <b>STATUS:</b> {value.state}
              <br/>
              <b>TITLE:</b> {value.attributes.title}
              <br/>
              <b>DESCRIPTION:</b> {value.attributes.description}
              <br/>
              <b>TECHNOLOGIES:</b> {value.attributes.technologies.map(tech =>
                <p>{tech}</p>
              )}
              <br/>
              <b>LINKS</b>
              {value.urls.map(data =>
                  <p key={data.label}>
                    {data.label} <hr/>
                    {data.url}
                  </p> 
                )}
              <b>CATEGORIES</b>
              {value.categories.map((data,idx) =>
                  <p key={data.categoryID}>
                    <b>#{idx+1}</b> {data.categoryName}
                  </p> 
                )}
            </Typography>
          
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
