import React from 'react';

const settings = {
  botkit: {
    host: 'http://localhost',
    port: process.env.REACT_APP_ABOTKIT_SERVER_PORT || 3000
  }
}

const settingsContext = React.createContext(settings);

export default settingsContext;