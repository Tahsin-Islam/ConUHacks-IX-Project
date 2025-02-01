import React from 'react';
import './CSS/Landing.css';

export const Landing = () => {
  return (
    <div className='landing'>
      <header className="landing-header">
        <h1>Welcome to EnvWatch</h1>
        <p>Your go-to platform for environmental monitoring and awareness.</p>
        <a href="#about" className="cta-button">Learn More</a>
      </header>
    </div>
  );
};