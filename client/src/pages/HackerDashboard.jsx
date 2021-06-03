import React from 'react';
import PastSubmissions from '../components/PastSubmissions';
import styles from './HackerDashboard.module.scss';

function HackerDashboard() {
  return (
    <div className={styles.hackerDashboardContainer}>
      <p>Your past submissions</p>
      <PastSubmissions />
    </div>
  );
};

export default HackerDashboard;
