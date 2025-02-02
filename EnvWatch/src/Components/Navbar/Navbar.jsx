import React from 'react';
import './Navbar.css';

import { NavLink } from 'react-router-dom';

export const Navbar = () => {
  return (
    <div className='navbar'>
      <NavLink to='/' className='navlink'>
        <div className='navlogo'>
          <p>EnvWatch</p>
        </div>
      </NavLink>
      <ul className='navlinks'>
        <NavLink to='/dashboard' className='navlink' activeclassname='active'><li>Dashboard</li></NavLink>
        <NavLink to='/insights' className='navlink' activeclassname='active'><li>Insights</li></NavLink>
        <NavLink to='/data-explorer' className='navlink' activeclassname='active'><li>Data Explorer</li></NavLink>
        <NavLink to='/about' className='navlink' activeclassname='active'><li>About</li></NavLink>
      </ul>
    </div>
  );
};
