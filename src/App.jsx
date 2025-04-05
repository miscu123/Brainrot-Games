import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import MainMenu from './MainMenu';
import Brainrodle from './Brainrodle-app';
import HangRotMan from './HangRotMan';

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path="/" component={MainMenu} />
          <Route path="/brainrodle" component={Brainrodle} />
          <Route path="/hangrotman" component={HangRotMan} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;