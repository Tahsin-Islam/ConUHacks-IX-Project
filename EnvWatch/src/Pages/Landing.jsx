import React from 'react';
import './CSS/Landing.css';
import Map from '../Components/Map/map.jsx';
import Card from '../Components/Card/Card.jsx';

export const Landing = () => {
  return (
    <div className="landing">
      <header className="landing-header">
        <h1>Welcome to EnvWatch</h1>
        <p>Your go-to platform for monitoring and understanding crime trends around key transportation stops. <br />
          Explore real-time data, analyze crime patterns, and stay informed to make safer decisions.</p>
      </header>
      <div className='map-container'>
        <Map />
      </div>
      <div className="card-container">
      <Card
          title="What We Do"
          text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla convallis purus eu felis pretium, at auctor enim gravida."
        />
        <Card
          title="Our Mission"
          text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam suscipit odio ut mauris tristique, vel bibendum nisl euismod."
        />
        <Card
          title="Get Involved"
          text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod ligula et dui posuere, in aliquam tortor hendrerit."
        />
      </div>
    </div>
  );
};
