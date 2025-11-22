
import { useState, useEffect, useCallback, useMemo } from 'react'
import './App.css'


const WordLibrary = ["Dog", "Cat", "Skeleton", "Death", "Weber", "Dawson", "Spencer", "Jeims", "Cabbage", "Wife", "Husband", "Hurst", "React"]
const Players = [
    {name: "Player1", id: 'player1'},
    {name: "Player2", id: 'player2'}
];
import img0 from "./images/0.jpg";
import img1 from "./images/1.jpg";
import img2 from "./images/2.jpg";
import img3 from "./images/3.jpg";
import img4 from "./images/4.jpg";
import img5 from "./images/5.jpg";
import img6 from "./images/6.jpg";
const images = [img0, img1, img2, img3, img4, img5, img6]

const MaxWrongGuesses = 6;
const LocalStorageKey = "hangmanHighScores";

const initialHighScores = [
  { "Name": "Player1", "Phrase": "TEST", "GuessCount": 2, "PlayerWord": true, "PlayerWon": true },
  { "Name": "Player2", "Phrase": "WIFE", "GuessCount": 7, "PlayerWord": false, "PlayerWon": false }
];

const loadHighScores = () => {
    const storedScores = localStorage.getItem(LocalStorageKey);
    return storedScores ? JSON.parse(storedScores) : initialHighScores;
};

const saveHighScores = (scores) => {
    localStorage.setItem(LocalStorageKey, JSON.stringify(scores));
};
//Replace all localStorage with MongoDB backend connections

const getDictWord = () => {
    const randomChoice = Math.floor(Math.random() * WordLibrary.length);
    return WordLibrary[randomChoice].toUpperCase(); //choose a random word from the library and return it in upper case
};

const validateWord = (word) => {
    return /^[A-Z]+$/.test(word) && word.length > 2; //Regex to ensure word is only letters and is longer than 2 letters
};

const getInitialPlayerStatus = () => {
    const status = {};
    Players.forEach(player => status[player.id] = false);
    return status;
};

const GetNameScreen = ({ onNameSubmitted }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (trimmedName.length < 2) {
            setError("Please enter a name of at least 2 characters.");
            return;
        }
        setError('');
        onNameSubmitted(trimmedName);
    };

    return (
        <div className="w-full max-w-md mx-auto mt-24 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl transition-all duration-300">
            <h2 className="text-3xl font-extrabold text-center mb-6 text-indigo-600 dark:text-indigo-400">
                Welcome to Hangman!
            </h2>
            <p className="text-center text-lg mb-8 text-gray-600 dark:text-gray-400">
                Enter Your Name!
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        setError('');
                    }}
                    placeholder="Enter your name"
                    className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    maxLength={15}
                />
                {error && <p className="text-red-500 text-sm italic">{error}</p>}
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-200 focus:ring-4 focus:ring-blue-500/50"
                >
                    Start Game
                </button>
            </form>
        </div>
    );
};

const WordDisplay = ({ word, guessedLetters }) => {
  const displayedWord = word.split('').map((letter, index) => (
    <span key={index} className="mx-1 text-4xl lg:text-5xl font-mono border-b-4 border-gray-700 dark:border-gray-300" class="guess_word_span_class">
      {guessedLetters.has(letter) ? letter : (letter === ' ' ? '\u00A0\u00A0' : ' _ ')}
    </span>
  ));
  return <div className="p-4 flex flex-wrap justify-center mb-30 pl-200 pr-200" class="display_word_class">{displayedWord}</div>;
};

const Keyboard = ({guessedLetters, handleGuess, isGameOver}) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');


    return (
          <div className="grid grid-cols-7 gap-2 p-4 max-w-xl mx-auto">
      {alphabet.map((letter) => (
        <button
          key={letter}
          onClick={() => handleGuess(letter)}
          disabled={guessedLetters.has(letter) || isGameOver}
          className={`
            p-2 rounded-lg font-bold text-sm transition duration-150 ease-in-out
            shadow-md hover:shadow-lg focus:outline-none focus:ring-4
            ${guessedLetters.has(letter)
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed opacity-70'
              : 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700 focus:ring-green-300'
            }
          `}
        >
          {letter}
        </button>
      ))}
    </div>
    );
};


const SelectWordScreen = ({ currentPlayer, onWordSelected, onRandomWord }) => {
    const [customWord, setCustomWord] = useState('');
    const [error, setError] = useState('');

    const handleCustomWord = (e) => {
        e.preventDefault();
        const word = customWord.toUpperCase().trim();
        if(!validateWord(word)){
            setError("Please set a valid word: Letters Only.");
            return;
        }
        setError('');
        onWordSelected(word, true);
    };
    
    const handleRandomWord = () => {
        const word = getDictWord();
        onRandomWord(word, false);
    };

    return (
        <div className="w-full max-w-xl mx-auto mt-12 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
            <h2 className="text-3xl font-extrabold text-center mb-6 text-gray-900 dark:text-gray-100">
            {currentPlayer.name}, Select Your Word
            </h2>
            <p className="text-center text-lg mb-8 text-gray-600 dark:text-gray-400">
            Choose how the secret word will be selected.
            </p>

            <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="text-2xl font-semibold mb-3 text-indigo-600 dark:text-indigo-400">1. Select Random Word</h3>
                <button
                    onClick={handleRandomWord}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-200 focus:ring-4 focus:ring-green-500/50"
                >   
                 Use a Random Word from Library
                </button>
            </div>
            <div>
                <h3 className="text-2xl font-semibold mb-3 text-indigo-600 dark:text-indigo-400">2. Enter Custom Word</h3>
                <form onSubmit={handleCustomWord} className="space-y-4">
                  <input
                    type="text"
                    value={customWord}
                    onChange={(e) => {
                    setCustomWord(e.target.value);
                    setError('');
                    }}
                    placeholder="Enter your secret word"
                    className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    maxLength={15}
                    />
                    {error && <p className="text-red-500 text-sm italic">{error}</p>}
                    <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg:blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-200 focus:ring-4 focus:ring-blue-500/50"
                    >
                      Start game with custom word
                    </button>
                </form>
            </div>
        </div>
    )
};

const ShowScores = ({ highScores, onStartNewRound }) => {
  const sortedScores = useMemo(() => 
    [...highScores].sort((a, b) => {
      if (a.PlayerWon !== b.PlayerWon) {
        return a.PlayerWon ? -1 : 1;
      }
      if (a.PlayerWon) {
        return a.GuessCount - b.GuessCount; 
      } else {
        return b.GuessCount - a.GuessCount; 
      }
    }), [highScores]
  );
  return (
    <div className="w-full max-w-3xl mx-auto mt-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl">
      <h2 className="text-3xl font-extrabold text-center mb-6 text-gray-900 dark:text-gray-100 border-b pb-3">
        High Score History
      </h2>
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Word</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Incorrect Guesses</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedScores.map((score, index) => (
              <tr key={index} className={score.PlayerWon ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{score.Name}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{score.Phrase}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{score.GuessCount}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {score.PlayerWord ? 'Custom' : 'Library'}
                </td>
                <td className={`px-4 py-4 whitespace-nowrap text-sm font-bold ${score.PlayerWon ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {score.PlayerWon ? 'WON' : 'LOST'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


const App = () => {
  const [highScores, setHighScores] = useState(loadHighScores);
  const [playerGameStatus, setPlayerGameStatus] = useState(getInitialPlayerStatus); 
  const [gameState, setGameState] = useState('GET_NAME'); //GET_NAME, START_TURN, WORD_SELECTION, PLAYING, GAME_OVER, HIGH_SCORES
  const [userName, setUserName] = useState('');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [secretWord, setSecretWord] = useState('');
  const [isCustomWord, setIsCustomWord] = useState(false);
  const [guessedLetters, setGuessedLetters] = useState(new Set());
  const [incorrectGuesses, setIncorrectGuesses] = useState(0);


  const currentPlayer = useMemo(() => {
        const player = Players[currentPlayerIndex];
        if (player.id === 'player1') {
            return { ...player, name: userName || 'Player 1' }; // Use userName for Player1
        }
        return player;
    }, [currentPlayerIndex, userName]);


  const standardizedWord = useMemo(() => secretWord.replace(/\s/g, ''), [secretWord]);
  const correctLetters = useMemo(() =>
     new Set(standardizedWord.split('').filter(letter => guessedLetters.has(letter))),
     [standardizedWord, guessedLetters]
   );
  const uniqueLettersInWord = useMemo(() => {
        if (!standardizedWord) return new Set();
        return new Set(standardizedWord.split(''));
    }, [standardizedWord]);

    const hasWon = correctLetters.size === uniqueLettersInWord.size && standardizedWord.length > 0;
    const hasLost = incorrectGuesses >= MaxWrongGuesses;
    const isGameOver = hasWon || hasLost;
    const allPlayersPlayed = useMemo(() => 
          Players.every(player => playerGameStatus[player.id]),
          [playerGameStatus]
      );

   const startNextTurn = useCallback(() => {
    const nextPlayerIndex = Players.findIndex(player => !playerGameStatus[player.id]);

    if (nextPlayerIndex === -1){
      setGameState("HIGH_SCORES");
      return;
    }
    setCurrentPlayerIndex(nextPlayerIndex);
    setGameState('WORD_SELECTION');
   }, [playerGameStatus]);

   const startPlaying = useCallback((word, custom) => {
        setSecretWord(word);
        setIsCustomWord(custom);
        setGuessedLetters(new Set());
        setIncorrectGuesses(0);
        setGameState('PLAYING');
    }, []);

    const handleNameSubmitted = useCallback((name) => {
      setUserName(name);
      setGameState('START_TURN')
    }, []);

    const handleGuess = useCallback((letter) => {
        if(isGameOver || guessedLetters.has(letter)) return;

        const upperLetter = letter.toUpperCase();
        const newGuessedLetters = new Set(guessedLetters).add(upperLetter);
        setGuessedLetters(newGuessedLetters);

        if (!secretWord.includes(upperLetter)){
            setIncorrectGuesses(prev => prev + 1);
        }
    }, [isGameOver, guessedLetters, secretWord]);

    


    useEffect(() => {
        if(gameState === 'START_TURN'){
            startNextTurn();
        }
    }, [gameState, startNextTurn]);
    
    useEffect(() => {
        if (isGameOver && gameState === 'PLAYING') {
            setGameState('GAME_OVER');

            const newScore = {
                Name: currentPlayer.name,
                Phrase: secretWord,
                GuessCount: incorrectGuesses,
                PlayerWord: isCustomWord,
                PlayerWon: hasWon,
            };

            setHighScores(prevScores => {
                const updatedScores = [...prevScores, newScore];
                saveHighScores(updatedScores); 
                return updatedScores;
            });

            setPlayerGameStatus(prevStatus => ({
                ...prevStatus, 
                [currentPlayer.id]: true
            }));
        }
    }, [isGameOver, gameState, hasWon, incorrectGuesses, currentPlayer, secretWord, isCustomWord]);

const setupGameScreen = () => (
    <>
      <div className="text-2xl font-semibold mb-4 text-center text-gray-700 dark:text-gray-300">
        Current Player Guessing: <span className="text-blue-600 dark:text-blue-400">{currentPlayer.name}</span>
      </div>
      <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-12">
        <div className="w-full max-w-xs lg:w-1/3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <img src={images[incorrectGuesses]}/>
          <p className="text-center text-lg font-medium text-red-500">
            Guesses Left: {MaxWrongGuesses - incorrectGuesses}
          </p>
        </div>

        <div className="w-full lg:w-2/3 max-w-md" >
          <WordDisplay word={secretWord} guessedLetters={guessedLetters} class="word_display_class"/>

          {isGameOver ? (
            <div className="p-6 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl shadow-inner text-center">
              <h3 className={`text-3xl font-bold mb-3 ${hasWon ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'}`}>
                {hasWon ? 'You Won!' : 'Game over!'}
              </h3>
              <p className="text-lg text-gray-800 dark:text-gray-200 mb-4">
                The word was: <span className="font-extrabold">{secretWord}</span>
              </p>
              <button
                onClick={startNextTurn}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-200"
              >
                {allPlayersPlayed ? 'View Final High Scores' : `Next Player's Turn`}
              </button>
            </div>
          ) : (
            <Keyboard class="keyboard_class"
              guessedLetters={guessedLetters}
              handleGuess={handleGuess}
              isGameOver={isGameOver}
            />
          )}

          <div className="text-center mt-6">
            <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Incorrect Guesses:</h4>
            <div className="flex justify-center text-xl font-mono tracking-widest text-red-500">
              {Array.from(guessedLetters).filter(letter => !secretWord.includes(letter)).map((l, i) => (
                <span key={i} className="mx-1">{l}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 lg:p-8">
      <header className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-indigo-700 dark:text-indigo-400 tracking-tight">
          Two-Player Hangman Challenge
        </h1>
        <p className="text-lg mt-2 text-gray-600 dark:text-gray-400">
          The player whose turn it is selects the word. Each player gets one turn to play!
        </p>
      </header>

      <main className="max-w-6xl mx-auto">
            {gameState === 'GET_NAME' ? (
                <GetNameScreen onNameSubmitted={handleNameSubmitted} />
            ) : gameState === 'WORD_SELECTION' ? (
                <SelectWordScreen
                    currentPlayer={currentPlayer}
                    onWordSelected={startPlaying}
                    onRandomWord={startPlaying}
                />
            ) : gameState === 'PLAYING' || gameState === 'GAME_OVER' ? (
                setupGameScreen()
            ) : (
                <ShowScores highScores={highScores}/>
            )}
          </main>
    </div>
  );
};

export default App;
