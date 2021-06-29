import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import Navbar from './Navbar';
import Sidebar from './Sidebar';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

/**
 * Layout contains the Navbar and Sidebar that is present on all pages.
 */
export default function Layout({ children }) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Navbar />
      <Sidebar />
      <div className={classes.content}><Toolbar />{children}</div>
    </div>
  );
}
