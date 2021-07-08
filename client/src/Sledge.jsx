/* eslint-disable */

import { CoreModule } from '@hackru/frontend-core';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';

import HackerDashboard from './pages/HackerDashboard';
import AdminDashboard from './pages/AdminDashboard';

import './App.css';

const Sledge = CoreModule(
  ({ profile }) => {
    // Use profile store to see if user is logged in. If not, redirect them to hackru login. Hopefully we can use react-router because of frontend-core?
    // if (true) {
    //   window.location.href = 'https://hackru.org/login';
    // }

    return (
      <BrowserRouter>
        <div className="App">
          <Switch>
            <Route exact path="/">
              {/* Conditionally redirect user based on their role. */}
              {profile.role.hacker ? (
                <Redirect to="/hacker" />
              ) : profile.role.judge ? (
                <Redirect to="/judge" />
              ) : profile.role.director ? (
                <Redirect to="/admin" />
              ) : (
                <></>
              )}
            </Route>
            <Route exact path="/admin">
              <AdminDashboard />
            </Route>
            <Route exact path="/hacker">
              <HackerDashboard />
            </Route>
            <Route exact path="judge">
              {/* TODO: Judge Dashboard Component */}
            </Route>
            <Route exact path="/hacker/submission">
              {/* TODO: Submission Form Component */}
            </Route>
          </Switch>
        </div>
      </BrowserRouter>
    );
  },
  ['profile'],
);

export default Sledge;
