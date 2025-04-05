import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

const MAX_WRONG = 6;

const HangRotMan = () => {
  const history = useHistory();
  const [wordObj, setWordObj] = useState(null);
  const [guessed, setGuessed] = useState(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [keyStates, setKeyStates] = useState({}); // Tracking the state of each key

  useEffect(() => {
    fetch('/modernWords.json')
      .then((res) => res.json())
      .then((data) => {
        const randomWord = data[Math.floor(Math.random() * data.length)];
        setWordObj(randomWord);
      });
  }, []);

  const guessLetter = (letter) => {
    if (!wordObj || guessed.has(letter)) return;

    setGuessed((prev) => new Set(prev).add(letter));

    if (!wordObj.word.includes(letter)) {
      setWrongGuesses((prev) => prev + 1);
      setKeyStates((prev) => ({ ...prev, [letter]: 'absent' }));
    } else {
      setKeyStates((prev) => ({ ...prev, [letter]: 'correct' }));
    }
  };

  const displayWord = () => {
    if (!wordObj) return '';
    return wordObj.word.split('').map((letter, idx) => {
      const isGuessed = guessed.has(letter);
      return (
        <div key={idx} className={`cell ${isGuessed ? 'cell-filled' : ''}`}>
          {isGuessed ? letter : ''}
        </div>
      );
    });
  };

  const isWinner = wordObj && wordObj.word.split('').every((letter) => guessed.has(letter));
  const isLoser = wrongGuesses >= MAX_WRONG;

  const alphabetRows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  const renderKeyboard = () => {
    return (
      <div className="keyboard">
        {alphabetRows.map((row, rowIndex) => (
          <div key={rowIndex} className="keyboard-row">
            {row.map((key) => (
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
                    // Submit the guess (optional for hangman, can be ignored here)
                  } else if (key === 'Backspace') {
                    // Handle backspace (optional, can be added)
                  } else {
                    guessLetter(key); // Guess the letter
                  }
                }}
                disabled={guessed.has(key) || isWinner || isLoser}
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
    <div className="wordle-game">
      <div className="title">Hangrotman</div>

      {wordObj && (
        <>
          <div className="board">
            <div className="row">{displayWord()}</div>
          </div>
          <div className="message">
            Definition: <em>{wordObj.definition}</em>
          </div>
        </>
      )}

      <div className="message">
        Wrong guesses: {wrongGuesses} / {MAX_WRONG}
      </div>

      {renderKeyboard()}

      {isWinner && <div className="message" style={{ backgroundColor: '#6aaa64', color: 'white' }}>🎉 You won!</div>}
      {isLoser && (
        <div className="message" style={{ backgroundColor: '#787c7e', color: 'white' }}>
          💀 You lost! The word was: <strong>{wordObj.word}</strong>
        </div>
      )}

      {(isWinner || isLoser) && (
        <button className="reset-button" onClick={() => window.location.reload()}>
          Play Again
        </button>
      )}
      <button className="back-button" onClick={() => history.push('/')}>Back to Menu</button>
    </div>
  );
};

export default HangRotMan;