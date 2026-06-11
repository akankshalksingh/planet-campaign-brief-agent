"use client";

import { useId, useState } from "react";

export function RiskFeedback({ riskTitle }: { riskTitle: string }) {
  const noteId = useId();
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [note, setNote] = useState("");

  return (
    <div className="riskFeedback" aria-label={`Account manager feedback for ${riskTitle}`}>
      <span>Account manager feedback</span>
      <div className="riskFeedbackActions">
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
        <div className="riskFeedbackNote">
          <p>{feedback === "up" ? "Marked useful for account review." : "Marked for revision before account review."}</p>
          <label htmlFor={noteId}>Additional feedback</label>
          <textarea
            id={noteId}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Add account manager context, correction, or next-step guidance."
          />
        </div>
      ) : null}
    </div>
  );
}
