"use client";

import { useEffect, useState, useRef } from "react";
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

// Structured UI block format for messy text strings
interface ParsedContent {
  questionText: string;
  options: Record<string, string>;
  correctAnswer: string;
  explanation: string;
}

/**
 * Parses messy, markdown-heavy strings returned in backend solutions
 * and cleanly isolates the components for standard UI rendering.
 */
function parseMessySolution(rawString: string, activeQ: QuestionData): ParsedContent {
  if (!rawString) {
    return {
      questionText: activeQ.question || "",
      options: activeQ.options || {},
      correctAnswer: activeQ.correct_answer || "",
      explanation: ""
    };
  }

  // Remove bold markdown styling variations inside key titles
  let cleanStr = rawString
    .replace(/\*\*Answer:\*\*/gi, "Answer:")
    .replace(/\*\*Correct Answer:\*\*/gi, "Answer:")
    .replace(/\*\*Explanation:\*\*/gi, "Explanation:")
    .replace(/Correct Answer:\s*/gi, "Answer: ");

  let questionText = activeQ.question || "";
  let options: Record<string, string> = { ...(activeQ.options || {}) };
  let correctAnswer = activeQ.correct_answer || "";
  let explanation = "";

  // 1. Extract Explanation Block
  if (cleanStr.includes("Explanation:")) {
    const parts = cleanStr.split("Explanation:");
    explanation = parts[1].trim();
    cleanStr = parts[0];
  }

  // 2. Extract Answer Block
  if (cleanStr.includes("Answer:")) {
    const parts = cleanStr.split("Answer:");
    correctAnswer = parts[1].replace(/^[A-D]\.\s*/i, "").trim();
    // Strip trailing stars or dots if present
    correctAnswer = correctAnswer.replace(/^[:\s*–-]+/, "").trim();
    cleanStr = parts[0];
  }

  // 3. Extract and Parse Options (if they were dumped inline into the string text)
  const optionRegex = /(?:^|\n)\s*[*+-]?\s*\*\*?([A-D])\.\*\*?\s*([^\n]+)/g;
  let match;
  let hasParsedOptions = false;
  
  while ((match = optionRegex.exec(cleanStr)) !== null) {
    hasParsedOptions = true;
    options[match[1].toUpperCase()] = match[2].trim();
  }

  // 4. Clean up any remaining question headers or prefix digits left over
  if (hasParsedOptions) {
    const firstOptionIdx = cleanStr.search(/(?:^|\n)\s*[*+-]?\s*\*\*?[A-D]\./);
    if (firstOptionIdx !== -1) {
      questionText = cleanStr.substring(0, firstOptionIdx).trim();
    }
  } else if (cleanStr.trim() && !activeQ.question) {
    questionText = cleanStr.trim();
  }

  // Strip question number markers like "**21. " out of the finalized header text
  questionText = questionText.replace(/^\s*\*\*?\d+\.\s*\*\*?/, "").trim();

  return {
    questionText,
    options,
    correctAnswer: correctAnswer || activeQ.correct_answer || "",
    explanation: explanation || cleanStr.trim()
  };
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

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadUniversities();
  }, []);

  useEffect(() => {
    if (questions && questions.length > 0) {
      setActiveQuestionTab(questions[0].id);
    }
  }, [questions]);

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
    await loadFolder(path, setSemesters);
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

  function handleSolveAI(pdf: PDFItem) {
    setSelectedPDF(pdf);
    setChat([]);
    solveAI(getPDFUrl(pdf), pdf.name);
    
    if (workspaceRef.current) {
      workspaceRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
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
  
  // Clean up data formatting constraints on execution loop
  const parsedData = activeQuestion 
    ? parseMessySolution(activeQuestion.solution || activeQuestion.explanation || "", activeQuestion)
    : null;

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
                        Download Document
                      </button>
                      <button className="ai" onClick={() => handleSolveAI(pdf)}>
                         Solve with AI
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

        <div className="right-column" ref={workspaceRef}>
          <section className="ai-box">
            <div className="section-header">
              <h2>SCode AI Solver</h2>
              <p>Direct Past questions solver in house AI system</p>
            </div>

            <div className="ai-content">
              {loadingAI && (
                <div className="ai-loading-state">
                  <div className="ai-pulse-scanner"></div>
                  <p className="loading-stage-text">Stage: {aiStage.toUpperCase()}...</p>
                  <p>Processing examination paper structure configuration protocols.</p>
                </div>
              )}

              {!loadingAI && questions.length > 0 && (
                <div className="answer-wrapper">
                  <div className="question-tabs">
                    {questions.map((q, idx) => (
                      <button
                        key={q.id || `q-${idx}`}
                        onClick={() => setActiveQuestionTab(q.id)}
                        className={`tab-btn ${activeQuestionTab === q.id ? "active" : ""}`}
                      >
                        Q{idx + 1} ({q.type.toUpperCase()})
                      </button>
                    ))}
                  </div>

                  {activeQuestion && parsedData && (
                    <div className="active-question-view">
                      <div className="answer-header">
                        <span className="workspace-query-label">Active Workspace Query Element</span>
                        <button 
                          className="btn-copy" 
                          onClick={() => navigator.clipboard.writeText(
                            `Question: ${parsedData.questionText}\n` +
                            `Answer: ${parsedData.correctAnswer}\n` +
                            `Explanation: ${parsedData.explanation}`
                          )}
                        >
                          📋 Copy answers and work more on it
                        </button>
                      </div>

                      <div className="question-body">
                        <h4 className="context-title">Question Context:</h4>
                        <p className="context-text">{parsedData.questionText}</p>
                        
                        {Object.keys(parsedData.options).length > 0 && (
                          <div className="options-block">
                            {Object.entries(parsedData.options).map(([key, val]) => (
                              <div key={key} className="option-item">
                                <strong>{key}:</strong> {val}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="answer">
                        {parsedData.correctAnswer && (
                          <div className="correct-choice-row">
                            <strong className="accent-label">Correct Answer Choice: </strong> 
                            <span className="badge-choice">{parsedData.correctAnswer}</span>
                          </div>
                        )}
                        <h4 className="solution-title">Analytical Core Solution:</h4>
                        <div className="solution-output">{parsedData.explanation}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedPDF && !loadingAI && (
                <div className="chat-box">
                  <h3>💬 Ask strictly specific paper related questions</h3>
                  <div className="messages">
                    {chat.map((msg, index) => (
                      <div
                        key={index}
                        className={msg.role === "user" ? "user-message" : "ai-message"}
                      >
                        {msg.content}
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="ai-message thinking-state">
                        SCodeAI Thinking...
                      </div>
                    )}
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
                    <button className="btn-send-chat" onClick={sendChat}>
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
                    Select any PDF and click <strong>Solve AI</strong>. The AI will analyze the examination paper and break down questions dynamically.
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
            SCode
          </a>
        </p>
      </footer>
    </div>
  );
}