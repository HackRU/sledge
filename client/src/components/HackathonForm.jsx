import {
    Button,
    FormLabel,
    Grid,
    IconButton,
    TextField,
  } from '@material-ui/core';
  import { makeStyles } from '@material-ui/core/styles';
  import DeleteIcon from '@material-ui/icons/Delete';
  import SentimentVeryDissatisfiedIcon from '@material-ui/icons/SentimentVeryDissatisfied';
  import { Form, Formik, FieldArray } from 'formik';
  import * as yup from 'yup';

  const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      flexDirection: 'column',
      width: '50%',
      '& .MuiTextField-root': {
        margin: theme.spacing(1),
      },
    },
    // Properly left aligns the "External Links" label for field where you can add multiple URLs.
    urlFieldLabel: {
      textAlign: 'start',
      margin: theme.spacing(1),
    },
    labelField: {
      width: '35ch',
    },
    urlField: {
      width: '50ch',
    },
    input: {
      display: 'none',
    },
}));

const validationSchema = yup.object({});

export default function HackathonForm() {
    const classes = useStyles();
    return(
        <Formik>
          <Form>
            
          </Form>
        </Formik>
    );
}