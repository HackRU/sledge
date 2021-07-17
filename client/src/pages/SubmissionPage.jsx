import React from 'react';
import SubmissionForm from '../components/SubmissionForm';
import Layout from '../components/Layout';


function SubmissionPage() {
    return (
        <Layout version="hacker">
            <div>
                <h1>Submission Page</h1>
                <SubmissionForm/>
            </div>
        </Layout>
    );
}

export default SubmissionPage;