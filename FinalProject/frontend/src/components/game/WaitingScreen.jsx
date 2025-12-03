function WaitingScreen({ playerName, onNext }) {
  return (
    <div className="screen">
      <h2>Welcome, {playerName}!</h2>
      <p>Waiting for the other player...</p>

      <button onClick={onNext}>Continue</button>
    </div>
  );
}

export default WaitingScreen;
