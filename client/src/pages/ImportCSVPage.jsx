import React from "react";
import { ChangeEvent, useState } from "react";
import {link} from 'react-router-dom';
import Layout from "../components/Layout";
import {Button} from '@material-ui/core';
import {Input} from '@mui/material';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    },
    input: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      margin: '10%',
      justifyContent: 'space-between',
    },
    button: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '50%',
      width: '100%',
    },
  }));

  const theme = createTheme({
    status:{
      danger: '#000000',
    },
    palette:{
      primary: {
        main:'#0000FF',
        darker: '#000000',
      },
    },
  });

function ImportCSVPage() {
    const classes = useStyles();
    return(
        <Layout version = "admin">
            <div className = {classes.root}>
              <h1>Upload CSV</h1>
              <form>
                <ThemeProvider theme={theme}>
                <Input className = {classes.input} name="uploadButton" variant="contained" color="primary" type ={"file"} accept={".csv"} />
                </ThemeProvider>
                <Button className = {classes.button} name="uploadButton" type="submit" variant="contained" color="primary">
                  Upload CSV
                </Button>
              </form>
            </div>
        </Layout>
    );
}

export default ImportCSVPage;