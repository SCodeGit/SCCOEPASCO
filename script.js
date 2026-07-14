:root{
  --navy: #0a1f44;
  --white: #ffffff;
  --accent: #1e3a8a;
  --soft-accent: #0f335f;
  --muted: #f3f6fb;
  --shadow: rgba(10,31,68,0.12);
  --hover-shadow: rgba(30,58,138,0.2);
}

*{box-sizing:border-box;margin:0;padding:0;transition: all 0.25s ease-in-out;}

body{
  font-family:'Times New Roman', serif;
  background: var(--muted);
  color: var(--navy);
  padding:18px;
  line-height:1.6;
  font-size:1rem;
}

/* Headings with Royal font */
h1,h2,h3,h4,h5,h6{
  font-family:'Cinzel', serif;
}

/* Frame & headings */
.frame{
  max-width:980px;
  margin:18px auto;
  background: var(--white);
  border-radius:16px;
  border:4px solid var(--navy);
  box-shadow:0 14px 30px var(--shadow);
  overflow:hidden;
  animation: frameFadeIn 0.8s ease both;
}
@keyframes frameFadeIn{
  0% {opacity:0; transform: translateY(15px);}
  100%{opacity:1; transform: translateY(0);}
}
.frame-inner{padding:28px;}

h1{
  text-align:center;
  margin-top:10px;
  color:var(--navy);
  font-size:1.7rem;
  font-weight:700;
  text-shadow:1px 1px 4px rgba(0,0,0,0.1);
}

.tagline{
  text-align:center;
  color:var(--soft-accent);
  margin:10px 0 20px;
  font-style:italic;
  font-family:'Cinzel', serif;
  transition: color 0.3s ease;
}
.tagline:hover{color:var(--accent);}

/* Top bar */
.top-bar{display:flex;align-items:center;gap:18px;max-width:1100px;margin:0 auto 18px;padding:10px 12px;transition: all 0.3s ease;}
.top-bar:hover{box-shadow:0 8px 25px var(--hover-shadow);}
.top-logos{display:flex;gap:14px;justify-content:center;align-items:center;flex:1 1 auto;}
.top-logos img{
  width:60px;height:60px;border-radius:50%;object-fit:cover;border:2px solid var(--navy);background: var(--white);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.top-logos img:hover{transform: scale(1.12) rotate(2deg);box-shadow:0 8px 25px var(--hover-shadow);}

#theme-toggle{
  background:transparent;
  border:none;
  font-size:1.3rem;
  color: var(--navy);
  cursor:pointer;
  padding:6px 8px;
  margin-left:12px;
  transition: transform 0.3s ease, color 0.3s ease;
}
#theme-toggle:hover{transform: scale(1.2) rotate(15deg);color: var(--accent);}

/* Controls */
.controls{display:block;width:100%;max-width:760px;margin:0 auto;gap:12px;}
.controls > *{display:block;width:100%;margin:10px 0;}
select,input[type="text"],button{
  font-family:'Times New Roman', serif;
  padding:12px 14px;
  border-radius:12px;
  border:1px solid #cbd9f0;
  font-size:1rem;
  background:#fff;
  color: var(--navy);
  transition: all 0.3s ease;
}
select:hover,input[type="text"]:hover,button:hover{box-shadow:0 6px 25px var(--hover-shadow);transform: translateY(-2px) scale(1.02);border-color: var(--accent);}
button{background: var(--accent);color: var(--white);cursor:pointer;font-weight:600;}
button:hover{background: var(--soft-accent);transform: translateY(-3px) scale(1.03);box-shadow:0 12px 30px var(--hover-shadow);}

/* PDF List */
.pdf-list a{
  font-family:'Times New Roman', serif;
  display:block;color: var(--navy);text-decoration:none;padding:10px 14px;border-radius:10px;border:1px solid #cbd9f0;margin:6px 0;transition: all 0.3s ease;
}
.pdf-list a:hover{background: var(--accent);color: var(--white);transform: translateX(4px) scale(1.02);box-shadow:0 6px 25px var(--hover-shadow);}

/* Instructions */
.instructions-container{text-align:center;margin:40px auto;max-width:700px;}
.instructions-toggle{
  font-family:'Times New Roman', serif;
  background:transparent;color:#00b3ff;border:1px solid #00b3ff;border-radius:8px;padding:10px 22px;cursor:pointer;font-size:17px;transition: all 0.4s ease;
}
.instructions-toggle:hover{background:#00b3ff;color:#fff;box-shadow:0 0 20px rgba(0,179,255,0.5);}
.instructions-content{display:none;margin-top:15px;background: rgba(0,10,30,0.9);color:#d6f1ff;border-radius:12px;padding:22px;animation: fadeIn 0.5s ease forwards;}
@keyframes fadeIn{from{opacity:0; transform: translateY(-10px);}to{opacity:1; transform:translateY(0);}}

/* Footer */
footer{margin-top:28px;text-align:center;color:#374761;font-size:0.95rem;opacity:0.85;font-family:'Times New Roman', serif;transition: all 0.3s ease;}
footer:hover{opacity:1;color:var(--accent);}

/* SC Tools Hub */
#scToolsHub{
  position:fixed;bottom:20px;right:20px;width:250px;z-index:9999;font-family:'Times New Roman', serif;cursor:move;transition: all 0.3s ease;
}
#scToggle{
  background:#1e3a8a;color:#fff;width:50px;height:50px;border-radius:50%;text-align:center;line-height:50px;font-weight:bold;font-size:18px;box-shadow:0 4px 12px rgba(0,0,0,0.25);transition: all 0.3s ease;font-family:'Cinzel', serif;
}
#scToggle:hover{transform: scale(1.15) rotate(5deg);box-shadow:0 10px 28px rgba(30,58,138,0.3);}
#scContent{
  display:none;background:#fff;border-radius:12px;box-shadow:0 6px 25px rgba(0,0,0,0.25);padding:12px;margin-top:10px;transition: all 0.4s ease;
}
#scContent select,#scContent input,#scContent button{width:100%;margin-bottom:8px;padding:10px;border-radius:8px;border:1px solid #ccc;transition: all 0.3s ease;font-family:'Times New Roman', serif;}
#scContent button{background:#1e3a8a;color:#fff;cursor:pointer;}
#scContent button:hover{background:#0a1f44; transform: translateY(-2px) scale(1.03); box-shadow:0 12px 28px rgba(30,58,138,0.4);}
.sc-instructions{background: rgba(30,58,138,0.1);padding:8px;border-radius:8px;font-size:0.88rem;margin-bottom:10px;font-family:'Times New Roman', serif;}

/* Dark theme */
body[data-theme="dark"]{
  background:#071427;color:#e9eef6;
}
body[data-theme="dark"] .frame{
  background: rgba(8,18,36,0.92); border-color:#072043; box-shadow:0 14px 30px rgba(0,0,0,0.5);
}
body[data-theme="dark"] select,body[data-theme="dark"] input,body[data-theme="dark"] button{
  background:#071427;color:#e9eef6;border:1px solid rgba(255,255,255,0.06);
}
