import React from 'react'
import './Navbar.css'
import { Link } from 'react-router-dom'

export const Navbar = () => {
  return (
    <div className='navbar'>
        <Link to='/' className='navlink'>
            <div className='navlogo'>
                <p>EnvWatch</p>
            </div>
        </Link>
        <ul className='navlinks'>
            <li>Dashboard</li>
            <li>Insights</li>
            <li>Data Explorer</li>
            <Link to='/about' className='navlink'><li>About</li></Link>
        </ul>
    </div>
  )
}
