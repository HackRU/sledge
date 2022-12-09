import * as React from 'react';

import Rating from "@mui/material/Rating"
import Box from '@mui/material/Box';
import { blue } from "@material-ui/core/colors";
import Layout from './Layout';
import JudgeTextInfoDisplay from './JudgeTextInfoDisplay';

export default function JudgeRating() {
    return (
        
        <Layout version="judge">
          <h1>Judge Rating Page</h1>
          <JudgeTextInfoDisplay/>
           <Rating 
           size="large"
           max={10}
           precision={0.5}
               />

        </Layout>
    )
}