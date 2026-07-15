"use client";

interface HeaderProps {
  theme: "system" | "light" | "dark";
  setTheme: (theme: "system" | "light" | "dark") => void;
}

export default function Header({
  theme,
  setTheme,
}: HeaderProps) {

  return (
    <header className="topbar">

      <div className="brand">

        <span>
          🤖
        </span>

        <span>
          SCode Academic AI
        </span>

      </div>


      <input
        className="search"
        placeholder="Search past questions, courses..."
      />


      <select
        className="theme-toggle"
        value={theme}
        onChange={(e) =>
          setTheme(
            e.target.value as
              "system" |
              "light" |
              "dark"
          )
        }
      >

        <option value="system">
          🖥 System
        </option>

        <option value="light">
          ☀ Light
        </option>

        <option value="dark">
          🌙 Dark
        </option>

      </select>


    </header>
  );
}
