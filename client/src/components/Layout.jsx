/* eslint-disable */

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';

import Navbar from './Navbar';
import HackerSidebar from './HackerSidebar';
import AdminSidebar from './AdminSidebar';

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
export default function Layout({ children, version }) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Navbar />
      {version === 'hacker' ? (
        <HackerSidebar />
      ) : version === 'admin' ? (
        <AdminSidebar />
      ) : version === 'judge' ? (
        // Judge sidebar
        <></>
      ) : (
        <></>
      )}
      <div className={classes.content}>
        <Toolbar />
        {children}
      </div>
    </div>
  );
}
