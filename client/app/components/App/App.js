import React from 'react';

const App = ({ children }) => {
  const isSignedIn = localStorage.getItem('token') != null;
  return <main>{children}</main>;
};

export default App;
