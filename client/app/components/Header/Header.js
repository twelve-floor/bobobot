import React from 'react';

import { Link } from 'react-router-dom';

const Header = () => (
  <header>
    <button
      onClick={() => {
        localStorage.removeItem('token');
        window.location = '/';
      }}
    >
      Sign out
    </button>
    <hr />
  </header>
);

export default Header;
