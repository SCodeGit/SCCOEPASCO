"use client";

import { useEffect, useState, useRef } from "react";
import { fetchFolder } from "@/lib/github";

type PDFItem = {
  name: string;
  path: string;
  type?: string;
};

type ChatMessage = {
  role: "user" | "ai";
  content: string;
};

// Added the missing props coming from app/page.tsx to satisfy TypeScript compiler rules
interface Props {
  pdfs: PDFItem[];
  setPdfs: (files: PDFItem[]) => void;
  solveAI: (url: string, name: string) => void;
  loadingAI: boolean;
  aiStage?: string;      // Added to fix build error
  questions?: any[];     // Added to fix build error
  paperId?: string | number; // Added to fix build error
  answer: string;
  theme: "system" | "light" | "dark";
  setTheme: (theme: "system" | "light" | "dark") => void;
}

export default function SCodeAI({
  pdfs,
  setPdfs,
  solveAI,
  loadingAI,
  aiStage,      // Destructured to match implementation requirements
  questions,    // Destructured to match implementation requirements
  paperId,      // Destructured to match implementation requirements
  answer,
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
          filename: selectedPDF.name,
          question: userMessage
        })
      });

      const data = await response.json();
      setChat((prev) => [
        ...prev,
        { role: "ai", content: data.answer || "No response received." }
      ]);
    } catch (error) {
      setChat((prev) => [...prev, { role: "ai", content: "AI connection failed." }]);
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <div className="scode-wrapper">
      {/* 1. Main Dynamic Layout Title */}
      <h1 className="main-title text-center font-extrabold my-2">
        Colleges of Education Past Questions
      </h1>

      {/* 2. Top Navigation Header featuring Triple Branding Logos */}
      <header className="topbar">
        <div className="brand">
          <div className="top-logos flex gap-2 items-center">
            <img src="https://raw.githubusercontent.com/SCodeGit/trial/main/WhatsApp%20Image%202025-10-29%20at%2021.29.26_b1bcd9d3.jpg" alt="Logo 1" className="h-8 w-auto object-contain" />
            <img src="https://raw.githubusercontent.com/SCodeGit/trial/main/WhatsApp%20Image%202025-10-29%20at%2021.28.30_968e228b.jpg" alt="Logo 2" className="h-8 w-auto object-contain" />
            <img src="https://raw.githubusercontent.com/SCodeGit/trial/main/WhatsApp%20Image%202025-10-29%20at%2021.31.34_5c11e8e8.jpg" alt="Logo 3" className="h-8 w-auto object-contain" />
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
          <button
            className={`theme-btn ${theme === "light" ? "active" : ""}`}
            onClick={() => setTheme("light")}
            title="Light Mode"
          >
            ☀️
          </button>
          <button
            className={`theme-btn ${theme === "dark" ? "active" : ""}`}
            onClick={() => setTheme("dark")}
            title="Dark Mode"
          >
            🌙
          </button>
          <button
            className={`theme-btn ${theme === "system" ? "active" : ""}`}
            onClick={() => setTheme("system")}
            title="Use System Preference"
          >
            🖥️
          </button>
        </div>
      </header>

      {/* 3. Thematic Tagline Subtext */}
      <p className="tagline text-center font-semibold text-sm tracking-wide my-1">
        Empowering Learning Through Past Questions
      </p>

      {/* 4. Dropdown Trainee Instruction Drawer Panel */}
      <div className="instructions-container my-2 max-w-7xl mx-auto px-4">
        <button
          className="instructions-toggle w-full py-2 px-4 rounded-lg font-bold text-center transition bg-gray-100 dark:bg-gray-800"
          onClick={() => setShowInstructions(!showInstructions)}
        >
          {showInstructions ? "Hide Instructions For Trainees" : "View Instructions For Trainees"}
        </button>
        {showInstructions && (
          <div className="instructions-content mt-2 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 transition-all">
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
                    <option key={item.path} value={item.path}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <select disabled={!levels.length} onChange={(e) => selectLevel(e.target.value)}>
                  <option value="">Select Level</option>
                  {levels.map((item) => (
                    <option key={item.path} value={item.path}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <select disabled={!semesters.length} onChange={(e) => selectSemester(e.target.value)}>
                  <option value="">Select Semester</option>
                  {semesters.map((item) => (
                    <option key={item.path} value={item.path}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <select disabled={!programmes.length} onChange={(e) => selectProgramme(e.target.value)}>
                  <option value="">Select Programme</option>
                  {programmes.map((item) => (
                    <option key={item.path} value={item.path}>
                      {item.name}
                    </option>
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
                      <button className="btn-secondary" onClick={() => openPDF(pdf)}>
                        View Document
                      </button>
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

            {!loading && pdfs.length > 0 && filteredPdfs.length === 0 && (
              <p className="empty-state">No papers found matching "{searchQuery}"</p>
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

        <div className="right-column">
          <section className="ai-box">
            <div className="section-header">
              <h2>🤖 AI Classroom Solver</h2>
              <p>Advanced PDF examination analysis & solution generator</p>
            </div>

            <div className="ai-content">
              {loadingAI && (
                <div className="ai-loading-state">
                  <div className="ai-pulse-scanner"></div>
                  <p>Processing examination paper...</p>
                  <span>Extracting text and generating answers.</span>
                </div>
              )}

              {/* Display custom visual cue if the parent pipeline indicates a specific dynamic evaluation step */}
              {!loadingAI && aiStage && (
                <div className="p-2 mb-2 text-xs rounded bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400">
                  Current Stage Status: {aiStage}
                </div>
              )}

              {!loadingAI && answer && (
                <div className="answer-wrapper">
                  <div className="answer-header">
                    <span>Generated Solution</span>
                    <button className="btn-copy" onClick={() => navigator.clipboard.writeText(answer)}>
                      📋 Copy Text
                    </button>
                  </div>
                  <div className="answer">{answer}</div>
                </div>
              )}

              {selectedPDF && (
                <div className="chat-box">
                  <h3>💬 Ask about this paper</h3>
                  <div className="messages">
                    {chat.map((msg, index) => (
                      <div key={index} className={msg.role === "user" ? "user-message" : "ai-message"}>
                        {msg.content}
                      </div>
                    ))}
                    {chatLoading && <div className="ai-message">Thinking...</div>}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="chat-input">
                    <input
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") sendChat();
                      }}
                      placeholder="Ask anything about this paper..."
                    />
                    <button onClick={sendChat}>Send</button>
                  </div>
                </div>
              )}

              {!loadingAI && !answer && !selectedPDF && (
                <div className="ai-placeholder">
                  <div className="placeholder-graphic">✨</div>
                  <h3>Ready for analysis</h3>
                  <p>
                    Select any PDF on the left and click <strong>Solve AI</strong>. The AI will analyse the examination paper and allow you to ask follow-up questions.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <footer>
        <p>
          © {new Date().getFullYear()} SCode Academic AI • ATUBRA ABRAHAM •{" "}
          <a href="https://scodegit.github.io/scode.git.io/" target="_blank" rel="noopener noreferrer">
            SCode GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}