import React from 'react';
import ReactDOM from 'react-dom';
import { AmplifyProvider, Authenticator } from '@aws-amplify/ui-react';

import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <AmplifyProvider>
      <Authenticator.Provider>
        <App />
      </Authenticator.Provider>
    </AmplifyProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
