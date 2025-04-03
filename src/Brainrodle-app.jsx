import React, { useState, useEffect, useRef } from 'react';
import './index.css';

const Wordle = () => {
  // Game constants
  const MAX_ATTEMPTS = 6;

  // Game state
  const [targetWord, setTargetWord] = useState('');
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [gameStatus, setGameStatus] = useState('playing');
  const [message, setMessage] = useState('');
  const [wordDefinition, setWordDefinition] = useState('');
  const [keyStates, setKeyStates] = useState({});
  const inputRef = useRef(null);

  useEffect(() => {
    fetch('/modernWords.json')
      .then(response => response.json())
      .then(data => {
        // Save the valid words to local storage for quick reference
        const validWords = data.map(wordObj => wordObj.word.toLowerCase());
        localStorage.setItem('validWords', JSON.stringify(validWords));
  
        // Randomly select a word from the loaded words
        const randomIndex = Math.floor(Math.random() * data.length);
        const selectedWord = data[randomIndex];
        setTargetWord(selectedWord.word.toLowerCase()); // Set target word
        setWordDefinition(selectedWord.definition); // Set word definition
        setGuesses(Array(MAX_ATTEMPTS).fill(''));
      })
      .catch(error => console.error('Error loading words:', error));
  
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  // Handle keyboard input
  const handleKeyDown = (e) => {
    if (gameStatus !== 'playing') return;

    if (e.key === 'Enter') {
      submitGuess();
    } else if (e.key === 'Backspace') {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else if (/^[a-zA-Z\s]$/.test(e.key) && currentGuess.length < targetWord.length + 1) {
      setCurrentGuess(currentGuess + e.key.toLowerCase());
    }
  };

  const submitGuess = () => {
    // Check if the current guess is the correct length
    if (currentGuess.length !== targetWord.length) {
      setMessage(`Guess must be ${targetWord.length} letters.`);
      setTimeout(() => setMessage(''), 2000);
      return;
    }
  
    // Check if the guess is in the list of valid words
    const validWords = JSON.parse(localStorage.getItem('validWords')) || [];
    if (!validWords.includes(currentGuess.toLowerCase())) {
      setMessage('Guess is not a valid word.');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
  
    // If the guess is valid, proceed with the game logic
    const newGuesses = [...guesses];
    newGuesses[currentAttempt] = currentGuess;
    setGuesses(newGuesses);
  
    // Update keyStates based on the current guess
    const updatedKeyStates = { ...keyStates };
    currentGuess.split("").forEach((letter, index) => {
      if (!updatedKeyStates[letter]) {
        updatedKeyStates[letter] = getLetterStatus(currentGuess, index);
      } else {
        const existingStatus = updatedKeyStates[letter];
        const newStatus = getLetterStatus(currentGuess, index);
        if (existingStatus === 'absent' && newStatus !== 'absent') {
          updatedKeyStates[letter] = newStatus;
        }
      }
    });
    setKeyStates(updatedKeyStates);
  
    // Compare the guesses with target word
    if (currentGuess === targetWord) {
      setGameStatus('won');
      setMessage('You win!');
    } else if (currentAttempt >= MAX_ATTEMPTS - 1) {
      setGameStatus('lost');
      setMessage(`Game over! The word was: ${targetWord}`);
    } else {
      setCurrentAttempt(currentAttempt + 1);
      setCurrentGuess('');
    }
  };  

  // Reset the game
  const resetGame = () => {
    fetch('/modernWords.json')
      .then(response => response.json())
      .then(data => {
        const randomIndex = Math.floor(Math.random() * data.length);
        const selectedWord = data[randomIndex];
        setTargetWord(selectedWord.word.toLowerCase());
        setWordDefinition(selectedWord.definition);
        setCurrentAttempt(0);
        setCurrentGuess('');
        setGuesses(Array(MAX_ATTEMPTS).fill(''));
        setGameStatus('playing');
        setMessage('');
        setKeyStates({});
      })
      .catch(error => console.error('Error resetting game:', error));

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Get letter status for cell coloring
  const getLetterStatus = (guess, letterIndex) => {
  const letter = guess[letterIndex];

  if (!letter) return '';

  if (letter === targetWord[letterIndex]) {
    return 'correct';
  } else if (targetWord.includes(letter)) {
    return 'present';
  } else {
    return 'absent';
  }
};

  // Render keyboard
const renderKeyboard = () => {
  const rows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['Enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace']
  ];

  return (
    <div className="keyboard">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map(key => (
            <button
              key={key}
              className={`key ${
                key === 'Enter' || key === 'Backspace'
                  ? 'key-large'
                  : keyStates[key] === 'correct'
                  ? 'key-correct'
                  : keyStates[key] === 'present'
                  ? 'key-present'
                  : keyStates[key] === 'absent'
                  ? 'key-absent'
                  : ''
              }`}
              onClick={() => {
                if (key === 'Enter') {
                  submitGuess();
                } else if (key === 'Backspace') {
                  setCurrentGuess(currentGuess.slice(0, -1));
                } else if (currentGuess.length < targetWord.length) {
                  setCurrentGuess(currentGuess + key);
                }
                inputRef.current.focus();
              }}
            >
              {key === 'Backspace' ? '⌫' : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};


  return (
    <div className="wordle-game" onKeyDown={handleKeyDown} tabIndex="0" ref={inputRef}>
      <h1 className="title">Brainrodle</h1>

      {message && <div className="message">{message}</div>}

      {gameStatus !== 'playing' && (
        <div className="word-definition">
          <h3>Definition:</h3>
          <p>{wordDefinition}</p>
        </div>
      )}

      <div className="board">
        {Array(MAX_ATTEMPTS).fill(0).map((_, attemptIndex) => (
          <div key={attemptIndex} className={`row ${attemptIndex === currentAttempt ? 'current-row' : ''}`}>
            {Array(targetWord.length).fill(0).map((_, letterIndex) => {
              const guessToShow = attemptIndex === currentAttempt ? currentGuess : guesses[attemptIndex];
              const letter = guessToShow[letterIndex] || '';
              const status = guesses[attemptIndex] ? getLetterStatus(guesses[attemptIndex], letterIndex) : '';

              return (
                <div
                  key={letterIndex}
                  className={`cell ${
                    status === 'correct'
                      ? 'cell-correct'
                      : status === 'present'
                      ? 'cell-present'
                      : status === 'absent'
                      ? 'cell-absent'
                      : letter
                      ? 'cell-filled'
                      : ''
                  }`}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {renderKeyboard()}

      {gameStatus !== 'playing' && (
        <button className="reset-button" onClick={resetGame}>Play Again</button>
      )}
    </div>
  );
};

export default Wordle;
