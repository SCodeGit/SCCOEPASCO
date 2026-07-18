"use client";

import { useEffect, useState } from "react";
import { fetchFolder } from "@/lib/github";
import { AIStage, QuestionData } from "../app/page";

type PDFItem = {
  name: string;
  path: string;
  type?: string;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPDF, setSelectedPDF] = useState<PDFItem | null>(null);

  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [activeQuestionTab, setActiveQuestionTab] = useState<string>("");

  useEffect(() => {
    loadUniversities();
  }, []);

  useEffect(() => {
    if (questions && questions.length > 0) {
      setActiveQuestionTab(questions[0].id);
    }
  }, [questions]);

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
      const files = data.filter((item: any) =>
        item.name.toLowerCase().endsWith(".pdf")
      );
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
      const baseUrl = (process.env.NEXT_PUBLIC_AI_API || "https://scode-academic-ai-v2.onrender.com").replace(/\/+$/, "");
      const response = await fetch(`${baseUrl}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          paper_id: paperId || undefined,
          filename: selectedPDF.name,
          question: userMessage
        })
      });

      const data = await response.json();
      setChat((prev) => [...prev, { role: "ai", content: data.answer || data.response || "No contextual clarification received." }]);
    } catch (error) {
      setChat((prev) => [...prev, { role: "ai", content: "AI connection failed." }]);
    } finally {
      setChatLoading(false);
    }
  }

  const activeQuestion = questions.find((q) => q.id === activeQuestionTab);

  return (
    <div className="scode-wrapper">
      <header className="topbar">
        <div className="brand">
          <span className="brand-logo">🎓</span>
          <div className="brand-text">
            <h1 className="main-title">SCode PastAI</h1>
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

      <div className="dashboard-grid" id="aiWorkspaceSection">
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
                        Download Document
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
        </div>

        <div className="right-column">
          <section className="ai-box">
            <div className="section-header">
              <h2>SCode AI Solver</h2>
              <p>Direct Past questions solver in house AI system</p>
            </div>

            <div className="ai-content">
              {loadingAI && (
                <div className="ai-loading-state">
                  <div className="ai-pulse-scanner"></div>
                  <p style={{ fontWeight: 600 }}>Stage: {aiStage.toUpperCase()}...</p>
                  <p>Processing examination paper structure configuration protocols.</p>
                </div>
              )}

              {!loadingAI && questions.length > 0 && (
                <div className="answer-wrapper">
                  {/* Dynamic Question Tab Bar Selector */}
                  <div className="question-tabs" style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "12px", borderBottom: "1px solid var(--border)", marginBottom: "16px" }}>
                    {questions.map((q, idx) => (
                      <button
                        key={q.id}
                        onClick={() => setActiveQuestionTab(q.id)}
                        className={`tab-btn ${activeQuestionTab === q.id ? "active" : ""}`}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "1px solid var(--border)",
                          background: activeQuestionTab === q.id ? "var(--accent)" : "var(--card)",
                          color: activeQuestionTab === q.id ? "#fff" : "var(--text)",
                          whiteSpace: "nowrap"
                        }}
                      >
                        Q{idx + 1} ({q.type.toUpperCase()})
                      </button>
                    ))}
                  </div>

                  {activeQuestion && (
                    <div className="active-question-view">
                      <div className="answer-header" style={{ marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 700 }}>Active Workspace Query Element</span>
                        <button className="btn-copy" onClick={() => navigator.clipboard.writeText(activeQuestion.solution || activeQuestion.explanation)}>
                          📋 Copy answers and work more on it
                        </button>
                      </div>

                      <div className="question-body" style={{ background: "var(--card)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border)", marginBottom: "16px" }}>
                        <h4 style={{ margin: "0 0 10px 0", color: "var(--accent)" }}>Question Context:</h4>
                        <p style={{ margin: 0, fontWeight: 500 }}>{activeQuestion.question}</p>
                        
                        {activeQuestion.options && (
                          <div className="options-block" style={{ marginTop: "12px", display: "grid", gap: "8px" }}>
                            {Object.entries(activeQuestion.options).map(([key, val]) => (
                              <div key={key} style={{ padding: "8px 12px", borderRadius: "6px", background: "var(--surface)", border: "1px solid var(--border)", fontSize: "14px" }}>
                                <strong>{key}:</strong> {val}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="answer" style={{ marginBottom: "20px" }}>
                        {activeQuestion.correct_answer && (
                          <p style={{ margin: "0 0 10px 0" }}>
                            <strong style={{ color: "var(--accent)" }}>Correct Answer Choice: </strong> 
                            <span style={{ background: "var(--surface)", padding: "2px 8px", borderRadius: "4px", border: "1px solid var(--border)" }}>{activeQuestion.correct_answer}</span>
                          </p>
                        )}
                        <h4 style={{ margin: "0 0 6px 0" }}>Analytical Core Solution:</h4>
                        <div style={{ whiteSpace: "pre-wrap" }}>{activeQuestion.solution || activeQuestion.explanation}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedPDF && !loadingAI && (
                <div className="chat-box" style={{ marginTop: "24px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                  <h3>💬 Ask strictly specific paper related questions</h3>
                  <div className="messages" style={{ maxHeight: "250px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px" }}>
                    {chat.map((msg, index) => (
                      <div
                        key={index}
                        className={msg.role === "user" ? "user-message" : "ai-message"}
                        style={{
                          alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                          background: msg.role === "user" ? "var(--accent)" : "var(--card)",
                          color: msg.role === "user" ? "white" : "var(--text)",
                          padding: "10px 14px",
                          borderRadius: "12px",
                          maxWidth: "85%",
                          border: msg.role === "user" ? "none" : "1px solid var(--border)",
                          fontSize: "14px"
                        }}
                      >
                        {msg.content}
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="ai-message" style={{ alignSelf: "flex-start", background: "var(--card)", padding: "10px 14px", borderRadius: "12px", border: "1px solid var(--border)", fontSize: "14px", color: "var(--muted)" }}>
                        SCodeAI Thinking...
                      </div>
                    )}
                  </div>

                  <div className="chat-input" style={{ display: "flex", gap: "8px" }}>
                    <input
                      style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--input)", color: "var(--text)" }}
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") sendChat();
                      }}
                      placeholder="Ask anything about this paper..."
                    />
                    <button style={{ background: "var(--accent)", color: "white", border: "none", padding: "0 16px", borderRadius: "8px" }} onClick={sendChat}>
                      Send
                    </button>
                  </div>
                </div>
              )}

              {!loadingAI && questions.length === 0 && !selectedPDF && (
                <div className="ai-placeholder">
                  <div className="placeholder-graphic">✨</div>
                  <h3>Ready for analysis</h3>
                  <p>
                    Select any PDF on the left and click <strong>Solve AI</strong>. The AI will analyze the examination paper and break down questions dynamically.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <footer>
        <p>
          © {new Date().getFullYear()} SCode Academic AI •{" "}
          <a href="https://scodegit.github.io/scode.git.io/" target="_blank" rel="noopener noreferrer">
            SCode GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}