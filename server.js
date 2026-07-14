const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;  
const PDF_DIR = path.join(__dirname, "pdfs"); // your main PDFs folder

app.use(express.static("public"));

// API to get all PDFs
app.get("/api/files", (req, res) => {
  const walkDir = (dir, parentFolders = []) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(walkDir(filePath, [...parentFolders, file]));
      } else if (file.toLowerCase().endsWith(".pdf")) {
        results.push({
          title: path.parse(file).name,            // file name without extension
          url: path.relative(path.join(__dirname, "public"), filePath).replace(/\\/g, "/"),
          type: "PDF",
          folders: parentFolders.join(" / ")       // keep folder hierarchy for search
        });
      }
    });
    return results;
  };

  const files = walkDir(PDF_DIR);
  res.json(files);
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
