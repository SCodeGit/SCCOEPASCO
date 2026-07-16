"use client";

import { useEffect, useState } from "react";
import { fetchFolder } from "@/lib/github";

type PDFItem = {
  name: string;
  path: string;
  type?: string;
};

interface Props {
  pdfs: PDFItem[];
  setPdfs: (files: PDFItem[]) => void;
  solveAI: (url: string, name: string) => void;
  loadingAI: boolean;
  answer: string;
  theme: "system" | "light" | "dark";
  setTheme: (theme: "system" | "light" | "dark") => void;
}

export default function SCodeAI({
  pdfs,
  setPdfs,
  solveAI,
  loadingAI,
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

  useEffect(() => {
    loadUniversities();
  }, []);

  async function loadUniversities() {
    try {
      const data = await fetchFolder("");
      setUniversities(
        data.filter((item: any) => item.type === "dir")
      );
    } catch (error) {
      console.error("Repository error:", error);
    }
  }

  async function loadFolder(path: string, setter: any) {
    try {
      setLoading(true);
      const data = await fetchFolder(path);
      setter(
        data.filter((item: any) => item.type === "dir")
      );
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

    try {
      setLoading(true);
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
        .map(part => encodeURIComponent(part))
        .join("/")
    );
  }

  function openPDF(pdf: PDFItem) {
    const url = getPDFUrl(pdf);
    setDownloads(prev => [pdf.name, ...prev]);
    window.open(url, "_blank");
  }

  return (
    <div className="scode-wrapper">
      <header className="topbar">
        <div className="brand">
          🤖 <span>SCode Academic AI</span>
        </div>

        <input
          className="search"
          placeholder="Search past questions, courses..."
        />

        <select
          className="theme-toggle"
          value={theme}
          onChange={e => setTheme(e.target.value as "system" | "light" | "dark")}
        >
          <option value="system">🖥 System</option>
          <option value="light">☀ Light</option>
          <option value="dark">🌙 Dark</option>
        </select>
      </header>

      <section className="repository">
        <h2>Past Questions</h2>

        <div className="filters">
          <select onChange={e => selectUniversity(e.target.value)}>
            <option value="">Select University</option>
            {universities.map(item => (
              <option key={item.path} value={item.path}>
                {item.name}
              </option>
            ))}
          </select>

          <select disabled={!levels.length} onChange={e => selectLevel(e.target.value)}>
            <option value="">Select Level</option>
            {levels.map(item => (
              <option key={item.path} value={item.path}>
                {item.name}
              </option>
            ))}
          </select>

          <select disabled={!semesters.length} onChange={e => selectSemester(e.target.value)}>
            <option value="">Select Semester</option>
            {semesters.map(item => (
              <option key={item.path} value={item.path}>
                {item.name}
              </option>
            ))}
          </select>

          <select disabled={!programmes.length} onChange={e => selectProgramme(e.target.value)}>
            <option value="">Select Programme</option>
            {programmes.map(item => (
              <option key={item.path} value={item.path}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {loading && <p>Loading repository...</p>}

        <div className="pdf-grid">
          {pdfs.map(pdf => (
            <div className="pdf-card" key={pdf.path}>
              <h3>📘 {pdf.name}</h3>
              <div className="actions">
                <button onClick={() => openPDF(pdf)}>Open PDF</button>
                <button className="ai" onClick={() => solveAI(getPDFUrl(pdf), pdf.name)}>
                  🤖 Solve AI
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="ai-box">
        <h2>🤖 AI Solver</h2>
        {loadingAI && <p>Reading PDF and generating solution...</p>}
        {!loadingAI && answer && <div className="answer">{answer}</div>}
        {!loadingAI && !answer && <p>Select a past question PDF and click Solve AI</p>}
      </section>

      <section className="recent">
        <h3>Recent Downloads</h3>
        {downloads.length === 0 ? (
          <p>No recent downloads yet.</p>
        ) : (
          downloads.map((item, index) => (
            <p key={index}>📄 {item}</p>
          ))
        )}
      </section>

      <footer>© 2026 SCode Academic AI</footer>
    </div>
  );
}      const data = await fetchFolder(path);
      const files = data.filter(
        (item: any) => item.name.toLowerCase().endsWith(".pdf")

