import React from 'react';

import { makeStyles } from '@material-ui/core/styles';

import SubmissionForm from '../components/SubmissionForm';
import Layout from '../components/Layout';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
}));

function SubmissionPage() {
  const classes = useStyles();
  return (
    <Layout version="hacker">
      <div className={classes.root}>
        <h1>Edit Submission</h1>
        <SubmissionForm />
      </div>
    </Layout>
  );
}

export default SubmissionPage;
