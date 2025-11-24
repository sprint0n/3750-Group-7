import { useState, useEffect, useCallback, useMemo } from "react";
import { io } from "socket.io-client";
import "./App.css";

import img0 from "./images/0.jpg";
import img1 from "./images/1.jpg";
import img2 from "./images/2.jpg";
import img3 from "./images/3.jpg";
import img4 from "./images/4.jpg";
import img5 from "./images/5.jpg";
import img6 from "./images/6.jpg";



const images = [img0, img1, img2, img3, img4, img5, img6];

const socket = io("http://localhost:4000");

const MaxWrongGuesses = 6;


const GetNameScreen = ({ onNameSubmitted }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Please enter a name of at least 2 characters.");
      return;
    }
    setError("");
    onNameSubmitted(trimmed);
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




const Keyboard = ({ guessedLetters, handleGuess, isGameOver }) => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
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

const SelectWordScreen = ({ onWordSelected }) => {
  const [customWord, setCustomWord] = useState("");
  const [error, setError] = useState("");

  const validateWord = (word) => /^[A-Z]+$/.test(word) && word.length > 2;

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const word = customWord.toUpperCase().trim();
    if (!validateWord(word)) {
      setError("Invalid word. Use letters only, at least 3 characters.");
      return;
    }
    setError("");
    onWordSelected(word, true);
  };

  const handleRandomWord = () => {
    socket.emit("requestRandomWord");
  };
return (
    <div className="w-full max-w-xl mx-auto mt-12 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
            <h2 className="text-3xl font-extrabold text-center mb-6 text-gray-900 dark:text-gray-100">
            Select Your Word
            </h2>
            <p className="text-center text-lg mb-8 text-gray-600 dark:text-gray-400">
            Choose how the secret word will be selected.
            </p>

            <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="text-2xl font-semibold mb-3 text-indigo-600 dark:text-indigo-400">1. Select Random Word</h3>
                <button
                    onClick={handleRandomWord }
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-200 focus:ring-4 focus:ring-green-500/50"
                >   
                 Use a Random Word from Library
                </button>
            </div>
            <div>
                <h3 className="text-2xl font-semibold mb-3 text-indigo-600 dark:text-indigo-400">2. Enter Custom Word</h3>
                <form onSubmit={handleCustomSubmit} className="space-y-4">
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
);
};


const App = () => {
  // GET_NAME, WAITING_FOR_PLAYER, WORD_SELECTION, PLAYING, ROUND_OVER, HIGH_SCORES
  const [gameState, setGameState] = useState("GET_NAME"); 
  const [userName, setUserName] = useState("");
  const [gameId, setGameId] = useState(null);
  const [sessionState, setSessionState] = useState(null);
  const [highScores, setHighScores] = useState([]);



const handleWordSelected = useCallback(
  (word, isCustom) => {
    const source = isCustom ? "typed" : "db"; 
    console.log("Emitting setPhrase:", { gameId, word, source });
    socket.emit("setPhrase", { gameId, phrase: word, source });
  },
  [gameId]
);


  const handleNameSubmitted = useCallback((name) => {
    setUserName(name);
    socket.emit("submitName", { playerName: name });
    setGameState("WAITING_FOR_PLAYER");
  }, []);


  useEffect(() => {
    socket.on("waitingForPlayer", () => setGameState("WAITING_FOR_PLAYER"));

    socket.on("roundSetup", ({ gameId, setter, guesser, sessionState }) => {
      setGameId(gameId);
      setSessionState(sessionState);
      setGameState(userName === setter ? "WORD_SELECTION" : "WAITING_FOR_PLAYER");
    });

    socket.on("roundStarted", ({ sessionState }) => {
      setSessionState(sessionState);
      setGameState("PLAYING");
    });

    socket.on("gameUpdate", ({ sessionState }) => {
      setSessionState(sessionState);
    });

    socket.on("roundOver", ({ results, sessionState }) => {
      setSessionState(sessionState);
      setGameState("ROUND_OVER");
    });

    socket.on("gameOver", ({ results }) => {
      setSessionState(null);
      setGameState("HIGH_SCORES");
    });

    socket.on("highScoresUpdated",({scores}) => {
      setHighScores(scores);
    });

    socket.on("randomWord", ({ phrase, error }) => {
     if (!phrase) {
    alert(error || "No words available.");
    return;
    }


     handleWordSelected(phrase, false);
});
    
    return () => {
      socket.off("waitingForPlayer");
      socket.off("roundSetup");
      socket.off("roundStarted");
      socket.off("gameUpdate");
      socket.off("roundOver");
      socket.off("gameOver");
      socket.off("highScoresUpdated");
      socket.off("randomWord");
    };
  }, [userName, handleWordSelected]);



  const handleGuess = useCallback(
    (letter) => {
      if (!sessionState || !sessionState.state || sessionState.state.status !== "playing") return;
      socket.emit("makeGuess", { gameId, letter });
    },
    [gameId, sessionState]
  );

  const guessedLetters = useMemo(() => new Set(sessionState?.state?.guessedLetters || []), [sessionState]);
  const incorrectGuesses = useMemo(() => sessionState?.state?.wrongGuesses?.length || 0, [sessionState]);
  const maskedWord = useMemo(() => sessionState?.state?.maskedPhrase || "", [sessionState]);
  const isGameOver = useMemo(() => sessionState?.state?.status === "won" || sessionState?.state?.status === "lost", [sessionState]);

  if (gameState === "GET_NAME") return <GetNameScreen onNameSubmitted={handleNameSubmitted} />;

  if (gameState === "WAITING_FOR_PLAYER") return <div className="screen"><h2>Waiting for another player...</h2></div>;

  if (gameState === "WORD_SELECTION") return <SelectWordScreen onWordSelected={handleWordSelected} />;

  if (gameState === "PLAYING" && sessionState)
    return (
<>
      <div className="text-2xl font-semibold mb-4 text-center text-gray-700 dark:text-gray-300">
        Current Player Guessing: <span className="text-blue-600 dark:text-blue-400">{sessionState.guesser}</span>
      </div>
      <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-12">
        <div className="w-full max-w-xs lg:w-1/3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <img src={images[incorrectGuesses]}/>
          <p className="text-center text-lg font-medium text-red-500">
            Guesses Left: {MaxWrongGuesses - incorrectGuesses}
          </p>
        </div>
        <div className="w-full lg:w-2/3 max-w-md" >
          <WordDisplay word={maskedWord} guessedLetters={guessedLetters} className="word_display_class"/>
            <Keyboard className="keyboard_class"
              guessedLetters={guessedLetters}
              handleGuess={handleGuess}
              isGameOver={isGameOver}
            />
        </div>
      </div>
</>
    );

  if (gameState === "ROUND_OVER") return <div className="screen"><h2>Round Over! Waiting for next round...</h2></div>;

if (gameState === "HIGH_SCORES") {
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Phrase</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Guesses</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {highScores.map((score, index) => (
              <tr key={index} className={score.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{score.playerName}</td>
                <td >{score.phrase}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{score.numGuesses}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {score.source}
                </td>
                <td className={`px-4 py-4 whitespace-nowrap text-sm font-bold ${score.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {score.success ? 'WON' : 'LOST'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

)};

  return null;
};

export default App;