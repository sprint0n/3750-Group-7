import { useEffect, useState } from "react";

function CountdownScreen({ onFinish }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) return onFinish();

    const t = setTimeout(() => setCount(count - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <div className="screen">
      <h1>{count}</h1>
    </div>
  );
}

export default CountdownScreen;
