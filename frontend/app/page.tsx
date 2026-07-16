"use client";

import { useEffect, useState } from "react";
import SCodeAI from "@/components/SCodeAI";

type PDFItem = {
  name: string;
  path: string;
  type?: string;
};

export default function Home() {
  const [pdfs, setPdfs] = useState<PDFItem[]>([]);
  const [answer, setAnswer] = useState("");
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
    setAnswer("");

    try {
        `${process.env.NEXT_PUBLIC_AI_API}/api/solve`,

        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({

            pdf_url: url,
            filename: name
          })

        }
      );

      if (!response.ok) {
        throw new Error("AI server request failed");
      }


      const data = await response.json();
      setAnswer(data.answer || "No AI response returned.");
    } catch (error) {
      console.error("AI ERROR:", error);
      setAnswer("Unable to connect to SCode AI server.");
    } finally {
      setLoadingAI(false);
    }
  }

  return (
    <main className="app">
      <SCodeAI
        pdfs={pdfs}
        setPdfs={setPdfs}
        solveAI={solveAI}
        loadingAI={loadingAI}
        answer={answer}
        theme={theme}
        setTheme={setTheme}
      />
    </main>
  );
}
