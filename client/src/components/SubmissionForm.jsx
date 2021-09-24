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

import ImageUpload from './ImageUpload';

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

export default function SubmissionForm() {
  const classes = useStyles();

  return (
    <Formik
      initialValues={{
        title: '',
        technologies: '',
        description: '',
        links: [{ label: '', url: '' }],
        images: [],
        categories: '',
      }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        alert(JSON.stringify(values, null, 2));
      }}
    >
      {({ values, handleChange, setFieldValue }) => (
        <Form className={classes.root} autoComplete="off">
          <TextField
            name="title"
            value={values.title}
            onChange={handleChange}
            label="Title"
            helperText="What is your project called?"
            fullWidth
            required
          />

          <TextField
            name="technologies"
            value={values.technologies}
            onChange={handleChange}
            label="Technologies"
            helperText="What technologies does your project use? Enter them here, separated by commas."
            required
          />

          <TextField
            name="description"
            value={values.description}
            onChange={handleChange}
            label="Description"
            helperText="Tell us about your project! Tell us about what it does, how it works, challenges you faced, etc."
            fullWidth
            multiline
            required
            rows="5"
          />

          <FieldArray name="links">
            {({ push, remove }) => (
              <>
                <FormLabel className={classes.urlFieldLabel}>
                  External Links
                </FormLabel>
                {values.links.length === 0 ? (
                  <FormLabel className={classes.urlFieldLabel}>
                    (No links <SentimentVeryDissatisfiedIcon />)
                  </FormLabel>
                ) : (
                  <></>
                )}
                {/* eslint-disable-next-line */}
                {values.links.map((link, index) => {
                  return (
                    <div>
                      {/* Using a [Grid] was the only way I could center the delete [IconButton]. */}
                      <Grid
                        container
                        direction="row"
                        justify="flex-start"
                        alignItems="baseline"
                      >
                        <TextField
                          className={classes.labelField}
                          name={`links[${index}].label`}
                          value={link.label}
                          onChange={handleChange}
                          label="Label"
                          helperText={
                            index === 0
                              ? 'What is this link? (ex. repository, live website, etc.)'
                              : ''
                          }
                          required
                        />

                        <TextField
                          className={classes.urlField}
                          name={`links[${index}].url`}
                          value={link.url}
                          onChange={handleChange}
                          label="URL"
                          required
                        />

                        <IconButton
                          className={classes.deleteButton}
                          aria-label="delete"
                          color="secondary"
                          onClick={() => remove(index)}
                          edge="start"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </div>
                  );
                })}

                <Button
                  className={classes.button}
                  type="button"
                  onClick={() => push({ label: '', url: '' })}
                >
                  {values.links.length === 0 ? 'Add link' : 'Add another link'}
                </Button>
              </>
            )}
          </FieldArray>

          <FormLabel className={classes.urlFieldLabel}>
            Image Uploads (Max 5)
          </FormLabel>
          <ImageUpload setFieldValue={setFieldValue} />

          <TextField
            name="categories"
            value={values.categories}
            onChange={handleChange}
            label="Categories"
            required
          />

          <Button
            name="submitButton"
            type="submit"
            variant="contained"
            color="primary"
          >
            Submit
          </Button>
        </Form>
      )}
    </Formik>
  );
}
