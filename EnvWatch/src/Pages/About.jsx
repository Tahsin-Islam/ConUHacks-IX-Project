import React from 'react'
import './CSS/About.css'
import people_search from '../assets/peoplesearch.png'

export const About = () => {
  return (
    <div className='about'>
        <div className='about-description'>
            <h1>About Us</h1>
            <p>EnvWatch is a web application that empowers users to track and analyze crime data near transportation stops in real-time. 
              By leveraging crime data from various sources, users can visualize trends, identify hotspots, and make informed decisions to ensure safety. 
              Whether you're a concerned commuter, city planner, or researcher, EnvWatch provides the tools to stay informed and make safer, smarter choices.
            </p>
        </div>
        <img src={people_search} alt='placeholder' />
    </div>
  )
}
