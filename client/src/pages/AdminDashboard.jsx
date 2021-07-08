import React from 'react';
import Layout from '../components/Layout';
import PastHackathons from '../components/PastHackathons';
import styles from './AdminDashboard.module.scss';

function AdminDashboard() {
  return (
    <Layout version="admin">
      <div className={styles.adminDashboardContainer}>
        <p>Hackathons:</p>
        <PastHackathons />
      </div>
    </Layout>
  );
}

export default AdminDashboard;
