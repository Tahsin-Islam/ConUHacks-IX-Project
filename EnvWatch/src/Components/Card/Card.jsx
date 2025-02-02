import React from 'react';
import './Card.css';

const Card = ({ title, text }) => {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
};

export default Card;
