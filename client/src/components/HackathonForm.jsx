import {
    Button,
    Divider,
    FormLabel,
    Grid,
    IconButton,
    TextField,
  } from '@material-ui/core';
  import { makeStyles } from '@material-ui/core/styles';
  import DeleteIcon from '@material-ui/icons/Delete';
  import SentimentVeryDissatisfiedIcon from '@material-ui/icons/SentimentVeryDissatisfied';
import { mergeClasses } from '@material-ui/styles';
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
    categoryField: {
      width: '50ch',
    },
    companyField: {
      width: '35ch',
    },
    typeField: {
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
        <Formik
          initialValues={{
            season: "",
            categories: [{
              name: "",
              companyName: "",
              type: "",
            }],
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            alert(JSON.stringify(values, null, 2));
          }}
        >
          {({ values, handleChange, setFieldValue }) => (
            <Form className={classes.root} autoComplete="off">
              <TextField
                name="season"
                value={values.season}
                onChange={handleChange}
                label="Season"
                helperText="Season of this Hackathon"
                fullWidth
                required
              />

              <FieldArray name="categories">
                {({ push , remove }) => (
                  <>
                  <FormLabel className={classes.urlFieldLabel}>
                    Categories
                  </FormLabel>
                  {values.categories.length === 0 ? (
                  <FormLabel className={classes.urlFieldLabel}>
                    Need At Least 1 Category!!!!!!
                  </FormLabel>
                ) : (
                  <></>
                )}
                {/* eslint-disable-next-line */}
                {values.categories.map((category, index) => {
                  return (
                    <div>
                      <Grid
                        container
                        direction="row"
                        justify="flex-start"
                        alignItems="baseline"
                      >

                        <TextField
                          className={classes.categoryField}
                          name={`categories[${index}].name`}
                          value={category.name}
                          onChange={handleChange}
                          label="Name"
                          helperText="Name of the Category"
                          required
                        />

                        <TextField
                          className={classes.companyField}
                          name={`categories[${index}].companyName`}
                          value={category.companyName}
                          onChange={handleChange}
                          label="Company Name"
                          helperText="Name of the company sponsoring the category (if Applicable)"
                        />

                        <TextField
                          className={classes.typeField}
                          name={`categories[${index}].type`}
                          value={category.type}
                          onChange={handleChange}
                          label="Type"
                          helperText="Type of the category, either 'Track' or 'Superlative'"
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
                  )
                })}

                <Button
                  className={classes.button}
                  type="button"
                  onClick={() => push({ name: '', companyName: '', type: '',})}
                >
                  {values.categories.length === 0 ? 'Add link' : 'Add another link'}
                </Button>
                  </>
                )}
              </FieldArray>

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