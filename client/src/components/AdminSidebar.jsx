import React from 'react';
import { Link } from 'react-router-dom';
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
          <Typography variant="h5">Welcome, Admin</Typography>
          <Link to="/admin">
            <ListItem button>
              <ListItemText primary="Home" />
            </ListItem>
          </Link>

          <ListItem>
            <ListItemText primary="Phases:" />
          </ListItem>

          <Link to="/admin">
            <ListItem button>
              <ListItemText primary="Pre-hackathon" />
            </ListItem>
          </Link>

          <Link to="/admin/submissions">
            <ListItem button>
              <ListItemText primary="Submissions" />
            </ListItem>
          </Link>

          <Link to="/admin">
            <ListItem button>
              <ListItemText primary="Judging" />
            </ListItem>
          </Link>

          <Link to="/admin">
            <ListItem button>
              <ListItemText primary="Post-hackathon" />
            </ListItem>
          </Link>
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
