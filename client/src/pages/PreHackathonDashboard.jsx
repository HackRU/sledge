import React from 'react';

import { makeStyles } from '@material-ui/core/styles';

import Layout from '../components/Layout';
import HackathonForm from '../components/HackathonForm';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
}));

function PreHackathonDashboard() {
    const classes = useStyles();
    return (
        <Layout version="admin">
          <div className={classes.root}>
            <h1>Create Hackathon: </h1>
            <HackathonForm/>
          </div>
        </Layout>
      );
};

export default PreHackathonDashboard;