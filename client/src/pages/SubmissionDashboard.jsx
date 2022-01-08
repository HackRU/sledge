import React from 'react';

import { Switch } from '@material-ui/core';

import styles from './SubmissionDashboard.module.scss';
import Layout from '../components/Layout';
import FlaggedSubmissions from '../components/FlaggedSubmissions';
import SubmissionStatistics from '../components/SubmissionStatistics';

function SubmissionDashboard() {
  return (
    <Layout version="admin">
      <label>
        Stop
        <Switch size="large" />
        Start
      </label>

      <h1>Flagged Submissions:</h1>
      <FlaggedSubmissions />
      <h1>Submission Statistics:</h1>
      <SubmissionStatistics />
    </Layout>
  );
}

export default SubmissionDashboard;
