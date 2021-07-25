import { Button, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {useFormik} from 'formik'
import * as yup from 'yup'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '60%',
  },
}));

const validationSchema = yup.object({})

export default function SubmissionForm() {
  const classes = useStyles();

  const formik = useFormik({
    initialValues: {},
    validationSchema: validationSchema,
    onSubmit: (values) => {
      alert(JSON.stringify(values));
    },
  });

  return (
    <form className={classes.root} onSubmit={formik.handleSubmit}>
      <TextField id="title" value={formik.values.title} onChange={formik.handleChange} label="Title" helperText="What is your project called?" fullWidth required />
      <TextField id="technologies" value={formik.values.technologies} onChange={formik.handleChange} label="Technologies" helperText="What technologies does your project use? Enter them here, separated by commas." required />
      <TextField
        id="description"
        value={formik.values.description} onChange={formik.handleChange}
        label="Description"
        helperText="Tell us about your project! Tell us about what it does, how it works, challenges you faced, etc."
        fullWidth
        multiline
        required
        rows="5"
      />
      <TextField id="urls" value={formik.values.urls} onChange={formik.handleChange} label="URLs" multiline="true" rows="5" />
      <TextField id="images" value={formik.values.images} onChange={formik.handleChange} label="Image" />
      <TextField id="categories" value={formik.values.categories} onChange={formik.handleChange} label="Categories" required />
      <Button
        id="submit-button"
        type="submit"
        variant="contained"
        color="primary"
      >
        Submit
      </Button>
    </form>
  );
}
