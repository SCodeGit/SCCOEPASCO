"use client";

import { useState } from "react";

interface Props {
  answer: string;
  loadingAI: boolean;
}

export default function AIAssistant({
  answer: parentAnswer,
  loadingAI,
}: Props) {

  const [question, setQuestion] = useState("");
  const [localAnswer, setLocalAnswer] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  async function ask() {
    try {
      setLocalLoading(true);
      const form = new FormData();

      form.append(
        "question",
        question
      );

      if (file) {
        form.append(
          "file",
          file
        );
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/solve`,
        {
          method: "POST",
          body: form,
        }
      );

      const data = await res.json();
      setLocalAnswer(data.answer || "No answer");
    } catch (error) {
      console.error("Error asking AI:", error);
      setLocalAnswer("An error occurred. Please try again.");
    } finally {
      setLocalLoading(false);
    }
  }

  // Display either the real-time solved PDF answer from the parent or the local custom follow-up query answer
  const displayAnswer = parentAnswer || localAnswer;
  const isCurrentlyLoading = loadingAI || localLoading;

  return (
    <section className="ai-assistant">

      <h2>
        AI Study Assistant
      </h2>


      <div className="ai-inputs">

        <input
          type="file"
          accept=".pdf,.ppt,.pptx,.doc,.docx"
          onChange={(e) =>
            setFile(e.target.files?.[0] || null)
          }
        />


        <textarea
          placeholder="Ask a custom question or select a PDF above to solve..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />


        <button 
          onClick={ask}
          disabled={isCurrentlyLoading}
        >
          {isCurrentlyLoading ? "Thinking..." : "Ask Question"}
        </button>

      </div>


      <div className="ai-output">

        {isCurrentlyLoading ? (
          <p className="loading">Processing and analyzing with AI...</p>
        ) : (
          <div className="answer-box">
            {displayAnswer ? (
              <p>{displayAnswer}</p>
            ) : (
              <p className="placeholder">
                Your AI-generated solutions and answers will appear here.
              </p>
            )}
          </div>
        )}

      </div>


    </section>
  );
}
