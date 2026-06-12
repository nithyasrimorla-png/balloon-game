import { useState, useEffect, useRef } from "react";
import Game from "./Game";

export default function Home() {
  const [start, setStart] = useState(false);
  const [mode, setMode] = useState("practice");
  const [darkMode, setDarkMode] = useState(false);
  const [musicOn, setMusicOn] = useState(true);
  const [character, setCharacter] = useState(null);

  const audioRef = useRef(null);

  const startPractice = () => {
    setMode("practice");
    setStart(true);
  };

  const startBattle = () => {
    setMode("battle");
    setStart(true);
  };
  const toggleMusic = () => {
  const newState = !musicOn;
  setMusicOn(newState);
  localStorage.setItem("music", newState);
};
  // 🎵 MUSIC
  useEffect(() => {
  audioRef.current = new Audio("/assets/sounds/bg.mp3");
  audioRef.current.loop = true;
  audioRef.current.volume = 0.5;

  const saved = localStorage.getItem("music");

  if (saved === "true") {
    setMusicOn(true);
    audioRef.current.play().catch(() => {});
  }

  return () => {
    audioRef.current.pause();
  };
}, []);

useEffect(() => {
  if (!audioRef.current) return;

  if (musicOn) {
    audioRef.current.play().catch(() => {});
  } else {
    audioRef.current.pause();
  }

  localStorage.setItem("music", musicOn);
}, [musicOn]);

//mode 
  if (start) {
    return <Game mode={mode} character={character} />;
  }

  return (
    <div className={`home ${darkMode ? "night" : ""}`}>
      <h1>{character} Balloon Pop Game</h1>

      <button
        className="theme-btn"
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? "☀️ Day Mode" : "🌙 Night Mode"}
      </button>

      <button
        className="music-btn"
        onClick={() => setMusicOn(!musicOn)}
      >
        {musicOn ? "🎵 Music ON" : "🔇 Music OFF"}
      </button>
      <h2>Choose Character</h2>

    <div className="char-select">
      <button onClick={() => setCharacter("🐱")}>🐱 Cat</button>
      <button onClick={() => setCharacter("🐶")}>🐶 Dog</button>
      <button onClick={() => setCharacter("🐼")}>🐼 Panda</button>
      <button onClick={() => setCharacter("🦊")}>🦊 Fox</button>
    </div>

      <div className="card-container">
        <div className="card" onClick={startPractice}>
          <h2>🟢 Practice Mode</h2>
        </div>

        <div className="card" onClick={startBattle}>
          <h2>🔴 1 vs 1 Battle Mode</h2>
        </div>

        <div className="card">
          <h2>⚡ Difficulty Mode</h2>

          <button className="play-btn" onClick={() => { setMode("easy"); setStart(true); }}>
            🟢 Easy
          </button>

          <button className="play-btn" onClick={() => { setMode("medium"); setStart(true); }}>
            🟡 Medium
          </button>

          <button className="play-btn" onClick={() => { setMode("hard"); setStart(true); }}>
            🔴 Hard
          </button>
        </div>
      </div>

      <button className="play-btn" onClick={startPractice}>
        Start Game
      </button>
    </div>
  );
}