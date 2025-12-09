import { useState } from "react";

function NameScreen({ onSubmit }) {
  const [name, setName] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(name);
  }

  return (
    <div className="screen">
      <h2>Please enter your name to see the results</h2>

      <form onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default NameScreen;
