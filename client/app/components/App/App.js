import React, { Component } from 'react';

import Header from '../Header/Header';

const App = ({ children }) => {
  const isSignedIn = localStorage.getItem('token') != null;
  return (
    <>
      {isSignedIn && <Header />}
      <main>{children}</main>
    </>
  );
};

export default App;
