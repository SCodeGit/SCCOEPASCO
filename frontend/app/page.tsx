"use client";

import { useEffect, useState } from "react";
import SCodeAI from "@/components/SCodeAI";

type PDFItem = {
  name: string;
  path: string;
  type?: string;
};

export type AIStage = "reading" | "understanding" | "solving" | "formatting" | "idle";

export type QuestionData = {
  id: string;
  type: "mcq" | "essay";
  question: string;
  options?: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer?: string;
  explanation: string;
  solution?: string;
};

export default function Home() {
  const [pdfs, setPdfs] = useState<PDFItem[]>([]);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [paperId, setPaperId] = useState<string>("");
  const [aiStage, setAiStage] = useState<AIStage>("idle");
  const [loadingAI, setLoadingAI] = useState(false);
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");

  useEffect(() => {
    const saved = localStorage.getItem("scode-theme");
    if (saved) {
      setTheme(saved as "system" | "light" | "dark");
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
    localStorage.setItem("scode-theme", theme);
  }, [theme]);

  async function solveAI(url: string, name: string) {
    setLoadingAI(true);
    setQuestions([]);
    setPaperId("");
    
    const workspaceElement = document.getElementById("aiWorkspaceSection");
    if (workspaceElement) {
      workspaceElement.scrollIntoView({ behavior: "auto", block: "start" });
    }

    try {
      setAiStage("reading");
      await new Promise((resolve) => setTimeout(resolve, 1200));
      
      setAiStage("understanding");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setAiStage("solving");
      
      const baseUrl = (process.env.NEXT_PUBLIC_AI_API || "https://scode-academic-ai-v2.onrender.com").replace(/\/+$/, "");
      const response = await fetch(`${baseUrl}/api/ai/solve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          pdf_url: url,
          filename: name
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Backend Error Response:", errorData);
        throw new Error("AI server request failed");
      }

      setAiStage("formatting");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const data = await response.json();
      
      if (data.questions && Array.isArray(data.questions)) {
        setQuestions(data.questions);
      } else if (data.answer || data.solution) {
        setQuestions([
          {
            id: "fallback_1",
            type: "essay",
            question: "Extracted Complete Solutions",
            explanation: "Aggregated automated layout analysis parsing response structure.",
            solution: data.answer || data.solution
          }
        ]);
      } else {
        throw new Error("Invalid output content response signature layout");
      }

      if (data.paper_id) {
        setPaperId(data.paper_id);
      } else {
        setPaperId("default_fallback_paper_context_instance");
      }

    } catch (error) {
      console.error("AI ERROR:", error);
      setQuestions([
        {
          id: "err_instance",
          type: "essay",
          question: "System Execution Interruption",
          explanation: "Network validation gateway connection failure protocols.",
          solution: "Unable to connect to SCode AI server. Verify network perimeter configuration routes or target deployment status."
        }
      ]);
    } finally {
      setLoadingAI(false);
      setAiStage("idle");
    }
  }

  return (
    <main className="app">
      <SCodeAI
        pdfs={pdfs}
        setPdfs={setPdfs}
        solveAI={solveAI}
        loadingAI={loadingAI}
        aiStage={aiStage}
        questions={questions}
        paperId={paperId}
        theme={theme}
        setTheme={setTheme}
      />
    </main>
  );
}
