function ResultsScreen({ playerName }) {
  // just dummy data, replace with mongo and should be fine even with the CSS that I added
  const results = [
    { id: 1, user: "MrCalzone", result: "Win", cardsLeft: 0 },
    { id: 2, user: "Jeims", result: "Loss", cardsLeft: 3 },
    { id: 3, user: "Spencer", result: "Win", cardsLeft: 0 },
    { id: 4, user: "Dawson", result: "Loss", cardsLeft: 6 },
    { id: 5, user: "BradPitt", result: "Loss", cardsLeft: 2 },
  ];

  return (
    <div className="screen results-screen">
      <h2>
        The winner was: <span className="winner-name">{playerName}</span>
      </h2>

      <p className="subtitle">Here are your results, {playerName}</p>

      <div className="results-table">
        <div className="results-header">
          <span>Player</span>
          <span>Win / Loss</span>
          <span>Cards Remaining</span>
        </div>

        {results.map((row) => (
          <div key={row.id} className="results-row">
            <span>{row.user}</span>
            <span>{row.result}</span>
            <span>{row.cardsLeft}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResultsScreen;

import {useEffect, useState} from "react";

function ResultsScreen({ playerId, playerName, winnerName }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    async function fetchResults() {
      try {
        const response = await fetch(`http://localhost:4000/api/results/${playerName}`); 
        const data = await response.json();
        if (data.results) {
          setResults(data.results.map(r => ({
            id: r._id,
            user: r.playerName, 
            result: r.won ? "Win" : "Loss",
            cardsLeft: r.loserCards, 
          })));
        }
      } catch (error) {
        console.error("Failed to fetch results:", error);
      }
    }
    fetchResults();
  }, [playerName]);

  return (
    <div className="screen results-screen">
      <h2>
        The winner was: <span className="winner-name">{winnerName || 'Unknown'}</span>
      </h2>

      <p className="subtitle">Here are your results, {playerName}</p>

      <div className="results-table">
        <div className="results-header">
          <span>Player</span>
          <span>Win / Loss</span>
          <span>Cards Remaining</span>
        </div>

        {results.map((row) => (
          <div key={row.id} className="results-row">
            <span>{row.user}</span>
            <span className={row.result === 'Win' ? 'win' : 'loss'}>{row.result}</span>
            <span>{row.cardsLeft}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResultsScreen;
