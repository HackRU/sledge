import React from 'react';
import { Link } from 'react-router-dom';

import Layout from '../components/Layout';
import PastSubmissions from '../components/PastSubmissions';
import styles from './HackerDashboard.module.scss';

function HackerDashboard() {
  return (
    <Layout version="hacker">
      <div className={styles.hackerDashboardContainer}>
        <p>Make a new submission:</p>
        <div className={styles.newSubmission}>
          <Link to="/hacker/submissions/create" className={styles.btn}>
            + Upload a new submission
          </Link>
        </div>
        <p>Your past submissions:</p>
        <PastSubmissions />
      </div>
    </Layout>
  );
}

export default HackerDashboard;
