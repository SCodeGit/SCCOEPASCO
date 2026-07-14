// theme.js

// === Configuration ===
// Default colors for light and dark themes
const themes = {
  light: {
    '--bg-color': '#f7fbff',
    '--text-color': '#222',
    '--form-bg': '#fff',
    '--form-border': '#d7e8ff',
    '--button-bg': '#003366',
    '--button-text': '#fff',
    '--button-hover': '#0055aa',
  },
  dark: {
    '--bg-color': '#0a0f0f',
    '--text-color': '#f2f2f2',
    '--form-bg': '#101616',
    '--form-border': '#1c1c1c',
    '--button-bg': '#0055aa',
    '--button-text': '#fff',
    '--button-hover': '#0080ff',
  }
};

// Apply theme by setting CSS variables
function applyTheme(theme) {
  const root = document.documentElement;
  const t = themes[theme];
  for (const key in t) {
    root.style.setProperty(key, t[key]);
  }
  document.body.setAttribute('data-theme', theme);

  const toggleBtn = document.getElementById('theme-toggle');
  if(toggleBtn){
    toggleBtn.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
  }

  localStorage.setItem('theme', theme);
}

// Detect saved theme or system preference
const savedTheme = localStorage.getItem('theme');
if(savedTheme) {
  applyTheme(savedTheme);
} else {
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(systemPrefersDark ? 'dark' : 'light');
}

// Theme toggle button functionality
const toggleBtn = document.getElementById('theme-toggle');
if(toggleBtn){
  toggleBtn.addEventListener('click', () => {
    const current = document.body.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
}
