import {useEffect, useState} from "react";

function ResultsScreen({ playerId, playerName }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    async function fetchResults() {
      try {
        const response = await fetch(`/api/results/${playerId}`); 
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
  }, [playerId]);

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
            <span className={row.result === 'Win' ? 'win' : 'loss'}>{row.result}</span>
            <span>{row.cardsLeft}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResultsScreen;
