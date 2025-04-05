import React from 'react';
import { Link } from 'react-router-dom';
import './index.css'; 

const MainMenu = () => {
  return (
    <div className="wordle-game">
      <h1 className="title">Welcome to the Brainrot Game Center!</h1>
      <div className="message">
        <h3>Select a brainrot game to play:</h3>
      </div>
      <div className="game-buttons">
        <Link to="/brainrodle" className="link">
          <button className="game-button">Play Brainrodle</button>
        </Link>
        <br />
        <Link to="/hangrotman" className="link">
          <button className="game-button">Play HangRotMan</button>
        </Link>
      </div>
    </div>
  );
};

export default MainMenu;
