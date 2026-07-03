import { useState } from "react";
import { track } from "./lib/analytics";
import { isPro, requirePro } from "./lib/monetization";

/**
 * Template starter screen. Replace this with the actual app, but keep the
 * pattern: track() on meaningful actions, requirePro() on the premium path.
 */
export default function App() {
  const [count, setCount] = useState(0);
  const [pro, setPro] = useState(isPro());

  const increment = () => {
    setCount((c) => c + 1);
    track("counter_incremented", { value: count + 1 });
  };

  const usePremiumFeature = () => {
    if (!requirePro("mega_increment")) return;
    setPro(true);
    setCount((c) => c + 100);
    track("mega_increment_used");
  };

  return (
    <main className="app">
      <h1>Labinate App Template</h1>
      <p className="count">{count}</p>
      <div className="actions">
        <button onClick={increment}>+1</button>
        <button className="pro" onClick={usePremiumFeature}>
          +100 {pro ? "★" : "🔒"}
        </button>
      </div>
      <p className="hint">
        Instrumented out of the box: analytics events + paywall stub.
      </p>
    </main>
  );
}
