"use client";

import { useEffect, useState } from "react";
// Import your new fast scanning function
import { scanAcademicRepository } from "@/lib/github"; 
import { AIStage, QuestionData } from "../app/page";

// ... Keep your existing types and interface exactly the same ...

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
  // 1. Add a master state to hold the entire catalog database
  const [allFiles, setAllFiles] = useState<any[]>([]);

  const [universities, setUniversities] = useState<PDFItem[]>([]);
  const [levels, setLevels] = useState<PDFItem[]>([]);
  const [semesters, setSemesters] = useState<PDFItem[]>([]);
  const [programmes, setProgrammes] = useState<PDFItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPDF, setSelectedPDF] = useState<PDFItem | null>(null);

  // ... Keep your other existing states ...

  // 2. Fetch everything ONCE on initial load
  useEffect(() => {
    async function initializeRepository() {
      try {
        setLoading(true);
        const masterList = await scanAcademicRepository();
        setAllFiles(masterList);

        // Extract unique universities from paths (e.g., "University of Ghana(UG)/Level 100")
        const uniNames = Array.from(new Set(masterList.map(f => f.path.split("/")[0])));
        const filteredUnis = uniNames
          .filter(name => name.toLowerCase() === "university of ghana(ug)")
          .map(name => ({ name, path: name }));

        setUniversities(filteredUnis);
      } catch (error) {
        console.error("Repository initialization failed:", error);
      } finally {
        setLoading(false);
      }
    }
    initializeRepository();
  }, []);

  // 3. Drill down completely offline using fast array filtering in memory
  async function selectUniversity(uniPath: string) {
    setLevels([]); setSemesters([]); setProgrammes([]); setPdfs([]);
    if (!uniPath) return;

    // Find unique folders at the next depth level
    const levelNames = Array.from(new Set(
      allFiles
        .filter(f => f.path.startsWith(uniPath + "/"))
        .map(f => f.path.split("/")[1])
        .filter(Boolean)
    ));

    setLevels(levelNames.map(name => ({ name, path: `${uniPath}/${name}` })));
  }

  async function selectLevel(levelPath: string) {
    setSemesters([]); setProgrammes([]); setPdfs([]);
    if (!levelPath) return;

    const semNames = Array.from(new Set(
      allFiles
        .filter(f => f.path.startsWith(levelPath + "/"))
        .map(f => f.path.split("/")[2])
        .filter(Boolean)
    ));

    setSemesters(semNames.map(name => ({ name, path: `${levelPath}/${name}` })));
  }

  async function selectSemester(semPath: string) {
    setProgrammes([]); setPdfs([]);
    if (!semPath) return;

    const progNames = Array.from(new Set(
      allFiles
        .filter(f => f.path.startsWith(semPath + "/"))
        .map(f => f.path.split("/")[3])
        .filter(Boolean)
    ));

    setProgrammes(progNames.map(name => ({ name, path: `${semPath}/${name}` })));
  }

  async function selectProgramme(progPath: string) {
    if (!progPath) return;
    
    // Grab the actual matching files directly from your stored array instantly
    const files = allFiles.filter(f => f.path.startsWith(progPath + "/"));
    setPdfs(files);
  }

  // ... Rest of your component (getPDFUrl, openPDF, sendChat, and return JSX) stays completely identical ...