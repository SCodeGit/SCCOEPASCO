"use client";

import { useEffect, useState, useRef } from "react";
import { fetchFolder } from "@/lib/github";

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

type ChatMessage = {
  role: "user" | "ai";
  content: string;
};

interface Props {
  pdfs: PDFItem[];
  setPdfs: (files: PDFItem[]) => void;
  solveAI: (url: string, name: string) => void;
  loadingAI: boolean;
  aiStage: AIStage;
  questions: QuestionData[];
  paperId: string;
  theme: "system" | "light" | "dark";
  setTheme: (theme: "system" | "light" | "dark") => void;
}

export default function SCodeAI({
  pdfs,
  setPdfs,
  solveAI,
  loadingAI,
  aiStage,
  questions,
  paperId,
  theme,
  setTheme
}: Props) {
  const [universities, setUniversities] = useState<PDFItem[]>([]);
  const [levels, setLevels] = useState<PDFItem[]>([]);
  const [semesters, setSemesters] = useState<PDFItem[]>([]);
  const [programmes, setProgrammes] = useState<PDFItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [downloads, setDownloads] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPDF, setSelectedPDF] = useState<PDFItem | null>(null);

  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadUniversities();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, chatLoading]);

  async function loadUniversities() {
    try {
      setLoading(true);
      const data = await fetchFolder("");
      const filtered = data.filter((item: any) => {
        return (
          item.type === "dir" &&
          item.name.toLowerCase() === "university of ghana(ug)"
        );
      });
      setUniversities(filtered);
    } catch (error) {
      console.error("Repository error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadFolder(path: string, setter: (files: PDFItem[]) => void) {
    try {
      setLoading(true);
      const data = await fetchFolder(path);
      setter(data.filter((item: any) => item.type === "dir"));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function selectUniversity(path: string) {
    setLevels([]);
    setSemesters([]);
    setProgrammes([]);
    setPdfs([]);
    if (!path) return;
    await loadFolder(path, setLevels);
  }

  async function selectLevel(path: string) {
    setSemesters([]);
    setProgrammes([]);
    setPdfs([]);
    if (!path) return;
    await loadFolder(path, setSemesters);
  }

  async function selectSemester(path: string) {
    setProgrammes([]);
    setPdfs([]);
    if (!path) return;
    await loadFolder(path, setProgrammes);
  }

  async function selectProgramme(path: string) {
    try {
      setLoading(true);
      const data = await fetchFolder(path);
      const files = data.filter((item: any) => item.name.toLowerCase().endsWith(".pdf"));
      setPdfs(files);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function getPDFUrl(pdf: PDFItem) {
    return (
      "https://raw.githubusercontent.com/SCodeGit/SCCOEPASCO/main/" +
      pdf.path
        .split("/")
        .map((part) => encodeURIComponent(part))
        .join("/")
    );
  }

  function openPDF(pdf: PDFItem) {
    const url = getPDFUrl(pdf);
    setDownloads((prev) => [pdf.name, ...prev]);
    window.open(url, "_blank");
  }

  const filteredPdfs = pdfs.filter((pdf) =>
    pdf.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function sendChat() {
    if (!question.trim() || !selectedPDF) return;

    const userMessage = question;
    setChat((prev) => [...prev, { role: "user", content: userMessage }]);
    setQuestion("");
    setChatLoading(true);

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_AI_API + "/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paper_id: paperId !== "default_fallback_paper_context_instance" ? paperId : undefined,
          filename: selectedPDF.name,
          question: userMessage
        })
      });

      const data = await response.json();
      setChat((prev) => [
        ...prev,
        { role: "ai", content: data.answer || data.reply || "No response received." }
      ]);
    } catch (error) {
      setChat((prev) => [...prev, { role: "ai", content: "AI connection failed." }]);
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <div className="scode-wrapper">
      <h1 className="main-title text-center font-extrabold my-2">
        Colleges of Education Past Questions
      </h1>

      <header className="topbar">
        <div className="brand">
          <div className="top-logos flex gap-2 items-center">
            <img src="https://raw.githubusercontent.com/SCodeGit/trial/main/WhatsApp%20Image%202025-10-29%20at%2021.29.26_b1bcd9d3.jpg" alt="Logo" className="h-8 w-auto object-contain" />
            <img src="https://raw.githubusercontent.com/SCodeGit/trial/main/WhatsApp%20Image%202025-10-29%20at%2021.28.30_968e228b.jpg" alt="Logo" className="h-8 w-auto object-contain" />
            <img src="https://raw.githubusercontent.com/SCodeGit/trial/main/WhatsApp%20Image%202025-10-29%20at%2021.31.34_5c11e8e8.jpg" alt="Logo" className="h-8 w-auto object-contain" />
          </div>
        </div>

        <div className="search-wrapper">
          <input
            className="search"
            placeholder="Search loaded papers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="theme-toggle-group">
          <button className={`theme-btn ${theme === "light" ? "active" : ""}`} onClick={() => setTheme("light")}>☀️</button>
          <button className={`theme-btn ${theme === "dark" ? "active" : ""}`} onClick={() => setTheme("dark")}>🌙</button>
          <button className={`theme-btn ${theme === "system" ? "active" : ""}`} onClick={() => setTheme("system")}>🖥️</button>
        </div>
      </header>

      <p className="tagline text-center font-semibold text-sm tracking-wide my-1">
        Empowering Learning Through Past Questions
      </p>

      <div className="instructions-container my-2 max-w-7xl mx-auto px-4">
        <button
          className="instructions-toggle w-full py-2 px-4 rounded-lg font-bold text-center transition bg-gray-100 dark:bg-gray-800"
          onClick={() => setShowInstructions(!showInstructions)}
        >
          {showInstructions ? "Hide Instructions For Trainees" : "View Instructions For Trainees"}
        </button>
        {showInstructions && (
          <div className="instructions-content mt-2 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900">
            <p className="text-sm leading-relaxed">
              <strong>Trainee Guide:</strong> Use the filtering panel below to sort by University, Level, Semester, and Programme. Once the past papers load, select <strong>Solve AI</strong> to view complete step-by-step guidance on the classroom workspace panel.
            </p>
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        <div className="left-column">
          <section className="repository">
            <div className="section-header">
              <h2>Select Study Materials</h2>
              <p>Filter through your institution's repository below</p>
            </div>

            <div className="filters">
              <div className="filter-group">
                <select onChange={(e) => selectUniversity(e.target.value)}>
                  <option value="">Select University</option>
                  {universities.map((item) => (
                    <option key={item.path} value={item.path}>{item.name}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <select disabled={!levels.length} onChange={(e) => selectLevel(e.target.value)}>
                  <option value="">Select Level</option>
                  {levels.map((item) => (
                    <option key={item.path} value={item.path}>{item.name}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <select disabled={!semesters.length} onChange={(e) => selectSemester(e.target.value)}>
                  <option value="">Select Semester</option>
                  {semesters.map((item) => (
                    <option key={item.path} value={item.path}>{item.name}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <select disabled={!programmes.length} onChange={(e) => selectProgramme(e.target.value)}>
                  <option value="">Select Programme</option>
                  {programmes.map((item) => (
                    <option key={item.path} value={item.path}>{item.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading && (
              <div className="loading-spinner-container">
                <div className="spinner"></div>
                <p>Retrieving documents...</p>
              </div>
            )}

            {!loading && filteredPdfs.length > 0 && (
              <div className="pdf-grid">
                {filteredPdfs.map((pdf) => (
                  <div className="pdf-card" key={pdf.path}>
                    <div className="pdf-icon">📄</div>
                    <div className="pdf-details">
                      <h3>{pdf.name.replace(".pdf", "")}</h3>
                    </div>
                    <div className="actions">
                      <button className="btn-secondary" onClick={() => openPDF(pdf)}>View Document</button>
                      <button
                        className="ai"
                        onClick={() => {
                          setSelectedPDF(pdf);
                          setChat([]);
                          solveAI(getPDFUrl(pdf), pdf.name);
                        }}
                      >
                        🤖 Solve AI
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && pdfs.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">📚</span>
                <p>Select your University filters above to display documents.</p>
              </div>
            )}
          </section>

          <section className="recent">
            <h3>Recent Downloads</h3>
            {downloads.length === 0 ? (
              <p className="empty-downloads">Your recently viewed documents will list here.</p>
            ) : (
              <div className="downloads-list">
                {downloads.slice(0, 5).map((item, index) => (
                  <div key={index} className="download-item">
                    <span className="file-icon">✓</span>
                    <p className="download-text">{item}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div id="aiWorkspaceSection" className="right-column">
          <section className="ai-box">
            <div className="section-header">
              <h2>🤖 AI Classroom Solver</h2>
              <p>Advanced PDF examination analysis & solution generator</p>
            </div>

            <div className="ai-content">
              {loadingAI && (
                <div className="ai-loading-state">
                  <div className="ai-pulse-scanner"></div>
                  <p className="capitalize font-bold">Status: AI is {aiStage}...</p>
                  <span>Processing text vectors and rendering evaluation blocks.</span>
                </div>
              )}

              {!loadingAI && questions.length > 0 && (
                <div className="answers-container space-y-6">
                  {questions.map((q, idx) => (
                    <div key={q.id || idx} className="answer-wrapper border p-4 rounded-xl mb-4 bg-white dark:bg-zinc-950">
                      <div className="font-bold border-b pb-2 mb-2 flex justify-between items-center">
                        <span>Question {idx + 1} ({q.type.toUpperCase()})</span>
                      </div>
                      <p className="my-2 font-medium">{q.question}</p>
                      
                      {q.options && (
                        <div className="options-grid grid grid-cols-1 md:grid-cols-2 gap-2 my-2 text-sm">
                          {Object.entries(q.options).map(([key, val]) => (
                            <div key={key} className={`p-2 rounded border ${q.correct_answer === key ? 'bg-green-50 border-green-300 dark:bg-green-950/30' : ''}`}>
                              <strong>{key}:</strong> {val}
                            </div>
                          ))}
                        </div>
                      )}

                      {q.correct_answer && (
                        <p className="text-sm text-green-600 dark:text-green-400 font-bold">
                          Correct Answer Option: {q.correct_answer}
                        </p>
                      )}

                      <div className="explanation-section mt-3 text-sm border-t pt-2">
                        <strong className="text-blue-500">Step-by-Step Analysis:</strong>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">{q.explanation}</p>
                      </div>

                      {(q.solution || q.explanation) && (
                        <div className="mt-2 text-right">
                          <button 
                            className="btn-copy text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded" 
                            onClick={() => navigator.clipboard.writeText(`${q.question}\n\nSolution: ${q.solution || q.explanation}`)}
                          >
                            📋 Copy This Question
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {selectedPDF && !loadingAI && questions.length > 0 && (
                <div className="chat-box mt-6 border-t pt-4">
                  <h3>💬 Ask follow-up questions about this paper</h3>
                  <div className="messages max-h-60 overflow-y-auto my-2 space-y-2 p-2 bg-gray-50 dark:bg-zinc-900 rounded-lg">
                    {chat.map((msg, index) => (
                      <div key={index} className={`p-2 rounded-lg max-w-[85%] ${msg.role === "user" ? "bg-blue-500 text-white ml-auto text-right" : "bg-gray-200 dark:bg-gray-700 mr-auto text-left"}`}>
                        {msg.content}
                      </div>
                    ))}
                    {chatLoading && <div className="text-gray-400 text-xs italic">Thinking...</div>}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="chat-input flex gap-2">
                    <input
                      className="flex-1 p-2 border rounded dark:bg-zinc-800"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") sendChat();
                      }}
                      placeholder="Ask anything about this paper..."
                    />
                    <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={sendChat}>Send</button>
                  </div>
                </div>
              )}

              {!loadingAI && questions.length === 0 && !selectedPDF && (
                <div className="ai-placeholder">
                  <div className="placeholder-graphic">✨</div>
                  <h3>Ready for analysis</h3>
                  <p>
                    Select any PDF on the left and click <strong>Solve AI</strong>. The AI pipeline will process the document sequentially.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <footer className="mt-8 border-t pt-4 text-center text-xs text-gray-400">
        <p>
          © {new Date().getFullYear()} SCode Academic AI • ATUBRA ABRAHAM •{" "}
          <a href="https://scodegit.github.io/scode.git.io/" target="_blank" rel="noopener noreferrer" className="underline">
            SCode GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}