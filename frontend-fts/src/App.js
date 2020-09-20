import React from 'react';
import { BrowserRouter, Switch } from 'react-router-dom';
import { Home } from './page/home';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        {/* todo: head */}
        <Home />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
