"use client";

import { useId, useState } from "react";

export function RiskFeedback({ riskTitle }: { riskTitle: string }) {
  const noteId = useId();
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleFeedback(nextFeedback: "up" | "down") {
    setFeedback(feedback === nextFeedback ? null : nextFeedback);
    setSubmitted(false);
  }

  return (
    <div className="riskFeedback" aria-label={`Account manager feedback for ${riskTitle}`}>
      <span>Account manager feedback</span>
      <div className="riskFeedbackActions">
        <button
          type="button"
          className={feedback === "up" ? "selected" : ""}
          onClick={() => handleFeedback("up")}
          aria-pressed={feedback === "up"}
          title="This risk is useful"
        >
          👍
        </button>
        <button
          type="button"
          className={feedback === "down" ? "selected" : ""}
          onClick={() => handleFeedback("down")}
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
            onChange={(event) => {
              setNote(event.target.value);
              setSubmitted(false);
            }}
            placeholder="Add account manager context, correction, or next-step guidance."
          />
          <div className="riskFeedbackSubmit">
            <button
              type="button"
              onClick={() => setSubmitted(true)}
              disabled={!note.trim()}
            >
              Submit feedback
            </button>
            {submitted ? <span>Feedback noted for review.</span> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
