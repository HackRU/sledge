import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

const drawerWidth = 240;

const useStyles = makeStyles(() => ({
  drawer: {
    width: drawerWidth,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerContainer: {
    overflow: 'auto',
  },
}));

/**
 * Layout contains the Navbar and Sidebar that is present on all pages.
 */
export default function Sidebar() {
  const classes = useStyles();

  return (
    <Drawer
      className={classes.drawer}
      variant="permanent"
      anchor="left"
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <Toolbar />
      <div className={classes.drawerContainer}>
        <List>
          <Typography variant="h5">Welcome, Hacker</Typography>

          {/* HackRU Main Website */}
          <ListItem button>
            <ListItemText primary="HackRU Main Page" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="TeamRU" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="MentorQ" />
          </ListItem>
          <Divider />
          {/* Log out */}
          <ListItem button>
            <ListItemIcon>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="Log out" />
          </ListItem>
        </List>
      </div>
    </Drawer>
  );
}
