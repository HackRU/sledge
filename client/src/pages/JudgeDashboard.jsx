import React from 'react';
import Layout from '../components/Layout';
import JudgeList from '../components/JudgeList';
import styles from './AdminDashboard.module.scss';
import JudgeRating from '../components/JudgeRating';

function JudgeDashboard() {
  return (
    <Layout version="judge">
      <div className={styles.adminDashboardContainer}>
        <p>Judges:</p>
        <JudgeList />
      </div>
    </Layout>
  );
}

export default JudgeDashboard;
