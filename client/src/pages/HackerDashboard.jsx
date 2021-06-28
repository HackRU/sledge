import React from 'react';
import { Link } from 'react-router-dom';

import PastSubmissions from '../components/PastSubmissions';
import styles from './HackerDashboard.module.scss';

function HackerDashboard() {
  return (
    <div className={styles.hackerDashboardContainer}>
      <p>Make a new submission:</p>
      <div className={styles.newSubmission}>
        <Link to="/hacker/upload" className={styles.btn}>
          + Upload a new submission
        </Link>
      </div>
      <p>Your past submissions:</p>
      <PastSubmissions />
    </div>
  );
}

export default HackerDashboard;
