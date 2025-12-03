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
