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

interface StructuredQuestion {
  id: string;
  displayIndex: number;
  questionText: string;
  correctAnswer: string;
  explanation: string;
  type: string;
}

/**
 * Super-Parser: Intercepts the backend's messy text block, identifies if it contains
 * multiple numbered questions, and splits them into clean, separate virtual UI entities.
 */
function unpackBackendQuestions(rawQuestions: QuestionData[]): StructuredQuestion[] {
  if (!rawQuestions || rawQuestions.length === 0) return [];

  const parsedList: StructuredQuestion[] = [];
  let virtualIndex = 1;

  rawQuestions.forEach((backendQ) => {
    const rawText = backendQ.solution || backendQ.explanation || "";
    
    // Look for lines starting with "1. ", "2. ", "Question 1:", etc.
    const questionBlockRegex = /(?:^|\n)(?:\*\*|\b)?(?:Question\s+)?(\d+)[.)]\s*(.*?)(?=(?:\n(?:\*\*|\b)?(?:Question\s+)?\d+[.)])|$)/gs;
    
    let match;
    let foundSubQuestions = false;

    // Reset regex index for safety
    questionBlockRegex.lastIndex = 0;

    while ((match = questionBlockRegex.exec(rawText)) !== null) {
      foundSubQuestions = true;
      const qNum = match[1];
      const contentBlock = match[2].trim();

      // Within this individual block, extract the answer and explanation markers
      let correctAnswer = "";
      let explanation = contentBlock;

      // Extract specific bold answer selections e.g. "**B. first aid**" or "B. first aid"
      const answerRegex = /(?:\*\*Answer:\*\*|\*\*Correct Answer:\*\*|Correct Answer:)\s*(.*?)(?:\n|$)/i;
      const inlineAnswerRegex = /[*+-]?\s*\*?([A-D]\.\s*[^*_\n]+)\*?/i;
      
      let answerMatch = contentBlock.match(answerRegex) || contentBlock.match(inlineAnswerRegex);
      
      if (answerMatch) {
        correctAnswer = answerMatch[1].replace(/\*+/g, "").trim();
      }

      // Isolate explanation text if the backend explicitly marked it
      if (contentBlock.includes("Explanation:")) {
        const parts = contentBlock.split("Explanation:");
        explanation = parts[1].replace(/\*+/g, "").trim();
      } else if (answerMatch) {
        // Clean up text if explanation wasn't labeled explicitly
        explanation = contentBlock.replace(answerMatch[0], "").trim();
      }

      // Clean markdown bold tags off the text variables
      explanation = explanation.replace(/\*+/g, "").trim();

      parsedList.push({
        id: `${backendQ.id || "v"}-sub-${qNum}`,
        displayIndex: virtualIndex++,
        questionText: `Question text inferred from context breakdown parameters.`,
        correctAnswer: correctAnswer || "See Solution Core",
        explanation: explanation || contentBlock,
        type: "Objective"
      });
    }

    // Fallback: If the text block doesn't match standard multi-question lists, render it normally
    if (!foundSubQuestions) {
      parsedList.push({
        id: backendQ.id || `fallback-${virtualIndex}`,
        displayIndex: virtualIndex++,
        questionText: backendQ.question || "Open Analysis Window",
        correctAnswer: backendQ.correct_answer || "Refer to core evaluation",
        explanation: rawText,
        type: backendQ.type || "Core"
      });
    }
  });

  return parsedList;
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

  // Transform backend payload into clean atomic questions immediately
  const structuredQuestions = unpackBackendQuestions(questions);

  useEffect(() => {
    loadUniversities();
  }, []);

  useEffect(() => {
    if (structuredQuestions.length > 0) {
      setActiveQuestionTab(structuredQuestions[0].id);
    }
  }, [questions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, chatLoading]);

  async function loadUniversities() {
    try {
      setLoading(true);
      const data = await fetchFolder("");
      setUniversities(data.filter((item: any) => item.type === "dir" && item.name.toLowerCase() === "university of ghana(ug)"));
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
    setLevels([]); setSemesters([]); setProgrammes([]); setPdfs([]);
    if (!path) return;
    await loadFolder(path, setLevels);
  }

  async function selectLevel(path: string) {
    setSemesters([]); setProgrammes([]); setPdfs([]);
    if (!path) return;
    await loadFolder(path, setSemesters);
  }

  async function selectSemester(path: string) {
    setProgrammes([]); setPdfs([]);
    if (!path) return;
    await loadFolder(path, setProgrammes);
  }

  async function selectProgramme(path: string) {
    try {
      setLoading(true);
      const data = await fetchFolder(path);
      setPdfs(data.filter((item: any) => item.name.toLowerCase().endsWith(".pdf")));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function getPDFUrl(pdf: PDFItem) {
    return "https://raw.githubusercontent.com/SCodeGit/SCCOEPASCO/main/" + pdf.path.split("/").map(encodeURIComponent).join("/");
  }

  function openPDF(pdf: PDFItem) {
    window.open(getPDFUrl(pdf), "_blank");
  }

  function handleSolveAI(pdf: PDFItem) {
    setSelectedPDF(pdf);
    setChat([]);
    solveAI(getPDFUrl(pdf), pdf.name);
    
    if (workspaceRef.current) {
      workspaceRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paper_id: paperId || undefined, filename: selectedPDF.name, question: userMessage })
      });
      const data = await response.json();
      setChat((prev) => [...prev, { role: "ai", content: data.answer || data.response || "No contextual clarification received." }]);
    } catch (error) {
      setChat((prev) => [...prev, { role: "ai", content: "AI connection failed." }]);
    } finally {
      setChatLoading(false);
    }
  }

  const activeQuestion = structuredQuestions.find((q) => q.id === activeQuestionTab);

  return (
    <div className="scode-wrapper">
      <header className="topbar">
        <div className="brand">
          <span className="brand-logo">🎓</span>
          <div className="brand-text"><h1 className="main-title">SCode PastAI</h1></div>
        </div>
        <div className="search-wrapper">
          <input className="search" placeholder="Search loaded papers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="theme-toggle-group">
          <button className={`theme-btn ${theme === "light" ? "active" : ""}`} onClick={() => setTheme("light")}>☀️</button>
          <button className={`theme-btn ${theme === "dark" ? "active" : ""}`} onClick={() => setTheme("dark")}>🌙</button>
          <button className={`theme-btn ${theme === "system" ? "active" : ""}`} onClick={() => setTheme("system")}>🖥️</button>
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
                  {universities.map((item) => <option key={item.path} value={item.path}>{item.name}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <select disabled={!levels.length} onChange={(e) => selectLevel(e.target.value)}>
                  <option value="">Select Level</option>
                  {levels.map((item) => <option key={item.path} value={item.path}>{item.name}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <select disabled={!semesters.length} onChange={(e) => selectSemester(e.target.value)}>
                  <option value="">Select Semester</option>
                  {semesters.map((item) => <option key={item.path} value={item.path}>{item.name}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <select disabled={!programmes.length} onChange={(e) => selectProgramme(e.target.value)}>
                  <option value="">Select Programme</option>
                  {programmes.map((item) => <option key={item.path} value={item.path}>{item.name}</option>)}
                </select>
              </div>
            </div>

            {loading && <div className="loading-spinner-container"><div className="spinner"></div><p>Retrieving documents...</p></div>}

            {!loading && pdfs.length > 0 && (
              <div className="pdf-grid">
                {pdfs.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((pdf) => (
                  <div className="pdf-card" key={pdf.path}>
                    <div className="pdf-icon">📄</div>
                    <div className="pdf-details"><h3>{pdf.name.replace(".pdf", "")}</h3></div>
                    <div className="actions">
                      <button className="btn-secondary" onClick={() => openPDF(pdf)}>Download</button>
                      <button className="ai" onClick={() => handleSolveAI(pdf)}>Solve with AI</button>
                    </div>
                  </div>
                ))}
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
                </div>
              )}

              {!loadingAI && structuredQuestions.length > 0 && (
                <div className="answer-wrapper">
                  <div className="question-tabs">
                    {structuredQuestions.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => setActiveQuestionTab(q.id)}
                        className={`tab-btn ${activeQuestionTab === q.id ? "active" : ""}`}
                      >
                        Q{q.displayIndex} ({q.type.toUpperCase()})
                      </button>
                    ))}
                  </div>

                  {activeQuestion && (
                    <div className="active-question-view">
                      <div className="answer-header">
                        <span className="workspace-query-label">Isolated Workspace Query Element</span>
                        <button 
                          className="btn-copy" 
                          onClick={() => navigator.clipboard.writeText(`Answer: ${activeQuestion.correctAnswer}\nExplanation: ${activeQuestion.explanation}`)}
                        >
                          📋 Copy Solution
                        </button>
                      </div>

                      <div className="answer">
                        {activeQuestion.correctAnswer && (
                          <div className="correct-choice-row">
                            <strong className="accent-label">Correct Option: </strong> 
                            <span className="badge-choice">{activeQuestion.correctAnswer}</span>
                          </div>
                        )}
                        <h4 className="solution-title font-bold mt-4">Analytical Explanation & Details:</h4>
                        <div className="solution-output">{activeQuestion.explanation}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedPDF && !loadingAI && (
                <div className="chat-box">
                  <h3>💬 Ask follow-up question regarding this paper</h3>
                  <div className="messages">
                    {chat.map((msg, idx) => <div key={idx} className={msg.role === "user" ? "user-message" : "ai-message"}>{msg.content}</div>)}
                    {chatLoading && <div className="ai-message thinking-state">SCodeAI Thinking...</div>}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="chat-input">
                    <input value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChat()} placeholder="Ask anything about this paper..." />
                    <button className="btn-send-chat" onClick={sendChat}>Send</button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}