/* eslint-disable */
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Typography from '@material-ui/core/Typography';
import styles from './AppSideBar.module.scss';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

export default function ButtonAppBar() {
  const classes = useStyles();

  const openNav = () => {
    document.getElementById('sideNav').style.width = '250px';
  };

  const closeNav = () => {
    document.getElementById('sideNav').style.width = '0';
  };

  return (
    <div className={classes.root}>
      <div id="sideNav" className={styles.sideNav}>
        <a
          href="javascript:void(0)"
          className={styles.closeBtn}
          onClick={() => closeNav()}
        >
          &times;
        </a>
        <a href="#">New Submission</a>
        <a href="#">HackRU</a>
        <a href="#">Logout</a>
      </div>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
            onClick={() => openNav()}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Sledge
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  );
}
