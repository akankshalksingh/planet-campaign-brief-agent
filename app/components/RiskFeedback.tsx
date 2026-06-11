"use client";

import { useState } from "react";

export function RiskFeedback({ riskTitle }: { riskTitle: string }) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  return (
    <div className="riskFeedback" aria-label={`Account manager feedback for ${riskTitle}`}>
      <span>Account manager feedback</span>
      <div>
        <button
          type="button"
          className={feedback === "up" ? "selected" : ""}
          onClick={() => setFeedback(feedback === "up" ? null : "up")}
          aria-pressed={feedback === "up"}
          title="This risk is useful"
        >
          👍
        </button>
        <button
          type="button"
          className={feedback === "down" ? "selected" : ""}
          onClick={() => setFeedback(feedback === "down" ? null : "down")}
          aria-pressed={feedback === "down"}
          title="This risk is not useful"
        >
          👎
        </button>
      </div>
      {feedback ? (
        <p>{feedback === "up" ? "Marked useful for account review." : "Marked for revision before account review."}</p>
      ) : null}
    </div>
  );
}
