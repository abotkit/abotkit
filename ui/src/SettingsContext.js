import React from 'react';

const settings = {
  botkit: {
    host: 'http://localhost',
    port: process.env.REACT_APP_ABOTKIT_SERVER_PORT || 3000
  },
  colors: {
    primary: '#002F53',
    secondary: '#2D999F',
    accent: '#F25D50'
  }
}

const settingsContext = React.createContext(settings);

export default settingsContext;