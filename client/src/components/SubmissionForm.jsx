import { Button, IconButton, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import { Form, Formik, FieldArray, getIn, useFormik } from 'formik';
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
        images: '',
        categories: '',
      }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        alert(JSON.stringify(values));
      }}
    >
      {({ values, handleChange }) => (
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
                {values.links.map((link, index) => {
                  return (
                    <div
                      key={index}
                      style={{ justifyContent: 'space-between' }}
                    >
                      <TextField
                        name={`links[${index}].label`}
                        value={link.label}
                        onChange={handleChange}
                        label="Label"
                        helperText={
                          index == 0
                            ? 'What is this link? (ex. repository, live website, etc.)'
                            : ''
                        }
                        required
                      />

                      <TextField
                        name={`links[${index}].url`}
                        value={link.url}
                        onChange={handleChange}
                        label="URL"
                        required
                      />

                      <IconButton
                        aria-label="delete"
                        color="secondary"
                        onClick={() => remove(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
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

          <TextField
            name="images"
            value={values.images}
            onChange={handleChange}
            label="Image"
          />

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
