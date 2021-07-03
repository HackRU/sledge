import {Formik, Form, Field} from 'formik';

export default function SubmissionForm() {
    return (
        <div>
            <Formik>
                 <Form>
                    <label htmlFor = "title">Title
                        <Field id = "title" name = "title" type = "title" label = "Title"/>
                    </label>
                    <label htmlFor = "desc">Description
                        <Field id = "desc" name = "desc" type = "desc" label = "Description"/>
                    </label>
                 </Form>
            </Formik>
        </div>
    );
};