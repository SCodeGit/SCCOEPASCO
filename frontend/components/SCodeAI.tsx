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
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadUniversities();
  }, []);

  async function loadUniversities() {
    try {
      const data = await fetchFolder("");
      
      const excludedFolders = [
        "frontend", 
        "backend", 
        "node_modules", 
        ".git", 
        ".github", 
        "docs"
      ];

      const filtered = data.filter((item: any) => {
        const isDirectory = item.type === "dir";
        const folderNameLower = item.name.toLowerCase();
        
        const isExcluded = excludedFolders.some(ex => 
          folderNameLower === ex || folderNameLower.startsWith(ex + "/")
        );

        return isDirectory && !isExcluded;
      });

      setUniversities(filtered);
    } catch (error) {
      console.error("Repository error:", error);
    }
  }

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
    await loadFolder(path, setSemesters);
  }

  async function selectProgramme(path: string) {
    try {
      setLoading(true);
      const data = await fetchFolder(path);
      const files = data.filter(
        (item: any) => item.name.toLowerCase().endsWith(".pdf")
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

  const filteredPdfs = pdfs.filter(pdf =>
    pdf.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="scode-wrapper">
      <header className="topbar">
        <div className="brand">
          <span className="brand-logo">🎓</span>
          <div className="brand-text">
            <h1 className="main-title">SCode Academic</h1>
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
            className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
            onClick={() => setTheme('light')}
            title="Light Mode"
          >
            ☀️
          </button>
          <button 
            className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => setTheme('dark')}
            title="Dark Mode"
          >
            🌙
          </button>
          <button 
            className={`theme-btn ${theme === 'system' ? 'active' : ''}`}
            onClick={() => setTheme('system')}
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
                <select onChange={e => selectUniversity(e.target.value)}>
                  <option value="">Select University</option>
                  {universities.map(item => (
                    <option key={item.path} value={item.path}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <select disabled={!levels.length} onChange={e => selectLevel(e.target.value)}>
                  <option value="">Select Level</option>
                  {levels.map(item => (
                    <option key={item.path} value={item.path}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <select disabled={!semesters.length} onChange={e => selectSemester(e.target.value)}>
                  <option value="">Select Semester</option>
                  {semesters.map(item => (
                    <option key={item.path} value={item.path}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <select disabled={!programmes.length} onChange={e => selectProgramme(e.target.value)}>
                  <option value="">Select Programme</option>
                  {programmes.map(item => (
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
                {filteredPdfs.map(pdf => (
                  <div className="pdf-card" key={pdf.path}>
                    <div className="pdf-icon">📄</div>
                    <div className="pdf-details">
                      <h3>{pdf.name.replace(".pdf", "")}</h3>
                    </div>
                    <div className="actions">
                      <button className="btn-secondary" onClick={() => openPDF(pdf)}>
                        View Document
                      </button>
                      <button className="ai" onClick={() => solveAI(getPDFUrl(pdf), pdf.name)}>
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
                  <p>Processing text structures & crunching formulas...</p>
                  <span>This may take a moment. Please keep this tab active.</span>
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

              {!loadingAI && !answer && (
                <div className="ai-placeholder">
                  <div className="placeholder-graphic">✨</div>
                  <h3>Ready for analysis</h3>
                  <p>Select any PDF on the left and click <strong>Solve AI</strong>. Our solver will scan questions, equations, and structures to generate direct solutions.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <footer>
        <p>© 2026 SCode Academic AI • Built for Modern Learning ecosystems</p>
      </footer>
    </div>
  );
}
