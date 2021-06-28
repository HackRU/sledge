import React from 'react';
import PastSubmissions from '../components/PastSubmissions';
import styles from './HackerDashboard.module.scss';

function HackerDashboard() {
  return (
    <div className={styles.hackerDashboardContainer}>
      <p>Make a new submission:</p>
      <div className={styles.newSubmission}>
        <a href="upload" className={styles.btn}>+ Upload a new submission</a></div>
      <p>Your past submissions:</p>
      <PastSubmissions />
    </div>
  );
}

export default HackerDashboard;
