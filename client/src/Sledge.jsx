import { CoreModule } from '@hackru/frontend-core';
import { BrowserRouter, Link, Route, Switch } from 'react-router-dom';

import HackerDashboard from './pages/HackerDashboard';

import './App.css';

const Sledge = CoreModule(({logout}) => {
  // Use profile store to see if user is logged in. If not, redirect them to hackru login.
  // if (true) {
  //   window.location.href = 'https://hackru.org';
  // }

  // Use <Redirect /> from react-router in a if statement to see if user is admin, hacker, or judge.
  return (
      <BrowserRouter>
        <div className="App">
          <Switch>
            {/* For now, base route shows list of links to go to. */}
            <Route exact path="/">
              <ul>
                <li>
                  <Link to="/hacker">Go to hacker dashboard</Link>
                </li>
              </ul>
            </Route>
            <Route exact path="admin">
              {/* Admin Dashboard Component */}
            </Route>
            <Route exact path="/hacker">
              <HackerDashboard />
            </Route>
            <Route exact path="judge">
              {/* Judge Dashboard Component */}
            </Route>
            <Route exact path="/hacker/submission">
              {/* Submission Form Component */}
            </Route>
          </Switch>
        </div>
      </BrowserRouter>
  );
},["logout"])

export default Sledge;
