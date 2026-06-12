import { useState, useEffect, useRef } from "react";



export default function Game({ mode,character }) {
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [lives, setLives] = useState(3);

  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [activePlayer, setActivePlayer] = useState(1);
  

  const [balloons, setBalloons] = useState([]);
  const [particles, setParticles] = useState([]); 
  const [speed, setSpeed] = useState(3);
  const [combo, setCombo] = useState(0);
  const [sideEmojis, setSideEmojis] = useState([]);
  const [shake, setShake] = useState(false);
  const[paused,setPaused] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [question, setQuestion] = useState(null);
  const [floatingText, setFloatingText] = useState([]);
  const [mathInput, setMathInput] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  
  
  const spawnRef = useRef(null);
  const popSound = useRef(null);

useEffect(() => {
  const audio = new Audio("/assets/sounds/pop.mp3");
  audio.preload = "auto";
  popSound.current = audio;
}, []);

useEffect(() => {
  const musicOn = localStorage.getItem("music");

  const audio = new Audio("/assets/sounds/bg.mp3");
  audio.loop = true;
  audio.volume = 0.5;

  if (musicOn === "true") {
    audio.play().catch(() => {});
  }

  return () => audio.pause();
}, []);

const isBattle = mode === "battle";

  // 🌬 REALISTIC WIND
  const getWind = () => (Math.sin(Date.now() / 800) * 0.6);
  //mobile design
  const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkSize = () => {
    setIsMobile(window.innerWidth < 600);
  };

  checkSize(); // run once

  window.addEventListener("resize", checkSize);
  return () => window.removeEventListener("resize", checkSize);
}, []);

  // 🎯 LANES
  const getLaneX = () => {
    const lanes = [
      window.innerWidth * 0.2,
      window.innerWidth * 0.5,
      window.innerWidth * 0.8,
    ];
    return lanes[Math.floor(Math.random() * lanes.length)];
  };

  // 🎈 TYPES
  const getType = () => {
    const r = Math.random();

    if (r < 0.4) return "red";
    if (r < 0.6) return "blue";
    if (r < 0.75) return "green";
    if (r < 0.9) return "yellow";
    if (r < 0.97) return "purple";
    if (r < 0.98) return "gold";
    if (r < 0.99) return "diamond";
    return "bomb";
  };

  const getEmoji = (type) => {
    if (type === "blue") return "🔵";
    if (type === "gold") return "🟡";
    if (type === "bomb") return "💣";
    if (type === "diamond") return "💎";
    if (type === "gold") return "🟡✨";
    return "🎈";
  };
  
  const getSideEmoji = () => {
  const list = ["🌟", "⭐", "🦋", "💖","💙", "💚", "💛", "🌈",  "🔥", "⚡", "🍀", "🎯"];
  return list[Math.floor(Math.random() * list.length)];
};


//seperate particless
const createSpecialParticles = (type, x, y) => {
  let icon = "💥";

  if (type === "gold") icon = "⭐";
  if (type === "diamond") icon = "💎";
  if (type === "bomb") icon = "💥";

  const pieces = Array.from({ length: 12 }, () => ({
    id: Math.random(),
    x,
    y,
    icon,
    vx: (Math.random() - 0.5) * 6,
    vy: (Math.random() - 0.5) * 6,
    life: 1,
  }));

  setParticles((prev) => [...prev, ...pieces]);
};


  // ⏱ TIMER
  useEffect(() => {
    if (time <= 0) setGameOver(true);

    const timer = setInterval(() => {
      setTime((p) => p - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [time]);

  // ❤️ LIVES
  useEffect(() => {
    if (lives <= 0) setGameOver(true);
  }, [lives]);

  // 🎈 INITIAL
  useEffect(() => {
    const initial = Array.from({ length: 5 }, () => ({
      id: Date.now() + Math.random(),
      x: getLaneX(),
      y: 600 + Math.random() * 200,
      vx: getWind(),
      type: getType(),
      popping: false,
    }));

    setBalloons(initial);
  }, []);

  // 🚀 SPAWN
  useEffect(() => {
    if (gameOver || paused ) return;

    spawnRef.current = setInterval(() => {
      setBalloons((prev) => {
        if (prev.length >= 80) return prev;

        return [
          ...prev,
          {
            id: Date.now() + Math.random(),
            x: getLaneX(),
            y: window.innerHeight + 100,
            vx: getWind(),
            type: getType(),
            popping: false,
          },
        ];
      });
    }, 350);

    return () => clearInterval(spawnRef.current);
  }, [gameOver,paused]);

  // ⬆ SPEED UP
  useEffect(() => {
    const speedUp = setInterval(() => {
      setSpeed((p) => Math.min(p + 0.25, 7));
    }, 4000);

    return () => clearInterval(speedUp);
  }, []);



  //levelss
  useEffect(() => {
  if (mode === "easy") setSpeed(2);
  else if (mode === "medium") setSpeed(4);
  else if (mode === "hard") setSpeed(6);
}, [mode]);




  //  MOVE

  useEffect(() => {
  if (gameOver) return;

  const move = setInterval(() => {
    if (paused) return;

    setBalloons((prev) => {
      return prev
        .map((b) => {
          const newY = b.y - speed;
          const newX = b.x + (b.vx || 0);

          if (newY <= -120) {
            setLives((l) => l - 1);
            setShake(true);
            setTimeout(() => setShake(false), 150);
            return null;
          }

          return { ...b, y: newY, x: newX };
        })
        .filter(Boolean);
    });
  }, 30);

  return () => clearInterval(move);
}, [gameOver, speed, paused]); 



//emoji useeffect
useEffect(() => {
  const interval = setInterval(() => {
    setSideEmojis((prev) => {
      if (prev.length > 30) return prev;

      const fromLeft = Math.random() < 0.5;

      return [
        ...prev,
        {
          id: Date.now() + Math.random(),
          emoji: getSideEmoji(),
          x: fromLeft ? -50 : window.innerWidth + 50,
          y: Math.random() * window.innerHeight,
          vx: fromLeft ? 2 : -2,
        },
      ];
    });
  }, 800);

  return () => clearInterval(interval);
}, []);
//playerss
useEffect(() => {
  if (mode === "battle") {
    setPlayer1Score(0);
    setPlayer2Score(0);
    setActivePlayer(1);
  }
}, [mode]);

//emojis
  
useEffect(() => {
  const move = setInterval(() => {
    setSideEmojis((prev) =>
      prev
        .map((e) => ({
          ...e,
          x: e.x + e.vx,
        }))
        .filter((e) => e.x > -100 && e.x < window.innerWidth + 100)
    );
  }, 16);

  return () => clearInterval(move);
}, []);
 

const getCharacterEffect = () => {
  if (character === "🐱") return "🐾";
  if (character === "🐶") return "🦴";
  if (character === "🐼") return "🎋";
  if (character === "🦊") return "🔥";
  return "💥";
};


//pointsss after guessing ans correctlyyyy
  const showFloatingText = (text, x = window.innerWidth / 2, y = 200) => {
  const id = Date.now() + Math.random();

  setFloatingText((prev) => [
    ...prev,
    { id, text, x, y },
  ]);

  setTimeout(() => {
    setFloatingText((prev) => prev.filter((t) => t.id !== id));
  }, 800);
};


// Question for gamee
const generateQuestion = () => {
  const type = Math.random() < 0.5 ? "math" : "gk";

  // 🧠 GK QUESTIONS
  const gkQuestions = [
    {
      text: "Capital of India?",
      options: ["Delhi", "Mumbai", "Chennai", "Kolkata"],
      answer: "Delhi",
    },
    {
      text: "National animal of India?",
      options: ["Lion", "Tiger", "Elephant", "Leopard"],
      answer: "Tiger",
    },
    {
      text: "Which is a fruit?",
      options: ["Carrot", "Potato", "Apple", "Onion"],
      answer: "Apple",
    },
    {
      text: "National bird of India?",
      options: ["Peacock", "Parrot", "Sparrow", "Eagle"],
      answer: "Peacock",
    },
    {
      text: "How many days are there in a leap year?",
      options: ["365", "366", "364", "367"],
      answer: "366",
    },
    {
      text: "Which planet is known as the Red Planet?",
      options: ["Earth", "Mars", "Jupiter", "Venus"],
      answer: "Mars",
    },
    {
      text: "Which is the largest ocean on Earth?",
      options: ["Atlantic", "Indian", "Arctic", "Pacific"],
      answer: "Pacific",
    },
    {
      text: "Which gas do plants absorb?",
      options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
      answer: "Carbon Dioxide",
    },
    {
      text: "Who is known as the Father of the Nation (India)?",
      options: ["Jawaharlal Nehru", "Mahatma Gandhi", "Subhash Chandra Bose", "B. R. Ambedkar"],
      answer: "Mahatma Gandhi",
    },
    {
      text: "Which is the smallest prime number?",
      options: ["0", "1", "2", "3"],
      answer: "2",
    },
    {
      text: "Which is the largest continent?",
      options: ["Africa", "Asia", "Europe", "Australia"],
      answer: "Asia",
    },
    {
      text: "What is the capital of Japan?",
      options: ["Seoul", "Beijing", "Tokyo", "Bangkok"],
      answer: "Tokyo",
    },
    {
      text: "Which is the fastest land animal?",
      options: ["Lion", "Cheetah", "Horse", "Leopard"],
      answer: "Cheetah",
    },
    {
      text: "How many colors are there in a rainbow?",
      options: ["5", "6", "7", "8"],
      answer: "7",
    },
    {
      text: "Which is the hardest natural substance?",
      options: ["Gold", "Iron", "Diamond", "Silver"],
      answer: "Diamond",
    },
    {
      text: "Which organ pumps blood in the human body?",
      options: ["Brain", "Heart", "Lungs", "Liver"],
      answer: "Heart",
    },
    {
      text: "Which is the largest mammal?",
      options: ["Elephant", "Blue Whale", "Giraffe", "Shark"],
      answer: "Blue Whale",
    },
    {
      text: "Which planet is closest to the Sun?",
      options: ["Venus", "Earth", "Mercury", "Mars"],
      answer: "Mercury",
    },
    {
      text: "Which is the longest river in the world?",
      options: ["Amazon", "Nile", "Ganga", "Yangtze"],
      answer: "Nile",
    },
    {
      text: "What is H2O commonly known as?",
      options: ["Salt", "Oxygen", "Water", "Hydrogen"],
      answer: "Water",
    },
    {
      text: "Which country is known as the Land of Rising Sun?",
      options: ["India", "Japan", "China", "Thailand"],
      answer: "Japan",
    },
    {
      text: "Which is the largest planet in our solar system?",
      options: ["Earth", "Jupiter", "Saturn", "Neptune"],
      answer: "Jupiter",
    },
    {
      text: "Which is the main source of energy for Earth?",
      options: ["Moon", "Sun", "Stars", "Wind"],
      answer: "Sun",
    },
    {
      text: "Which is the national flower of India?",
      options: ["Rose", "Lotus", "Sunflower", "Lily"],
      answer: "Lotus",
    },
    {
      text: "Which metal is liquid at room temperature?",
      options: ["Iron", "Mercury", "Copper", "Aluminium"],
      answer: "Mercury",
    },

  ];

  // ➗ MATH QUESTION
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;

  const ops = ["+", "-", "×", "÷"];
  const op = ops[Math.floor(Math.random() * ops.length)];

  let mathQuestion = null;

  if (op === "+") {
    mathQuestion = {
      text: `${a} + ${b} = ?`,
      answer: a + b,
    };
  }

  if (op === "-") {
    mathQuestion = {
      text: `${a} - ${b} = ?`,
      answer: a - b,
    };
  }

  if (op === "×") {
    mathQuestion = {
      text: `${a} × ${b} = ?`,
      answer: a * b,
    };
  }

  if (op === "÷") {
    const product = a * b;
    mathQuestion = {
      text: `${product} ÷ ${a} = ?`,
      answer: b,
    };
  }
  

  // 🎯 FINAL PICK
  if (type === "math") {
    return {
      type: "math",
      ...mathQuestion,
    };
  } else {
    const q = gkQuestions[Math.floor(Math.random() * gkQuestions.length)];
    return {
      type: "gk",
      ...q,
    };
  }
};

  // 💥 CLICK (UPDATED WITH PARTICLES)
  const handleBalloonClick = (id) => {
    if (gameOver) return;

    const clicked = balloons.find((b) => b.id === id);
    if (!clicked) return;

    popSound.current.currentTime = 0.5;
    popSound.current.volume = 0.5;
    popSound.current.play().catch(() => {});
    createSpecialParticles(clicked.type, clicked.x, clicked.y);

    if (clicked.type === "bomb") {
      setGameOver(true);
      return;
    }

    let add = 1;
    if (clicked.type === "blue") add = 2;

      if (!isBattle) {
      setScore((p) => p + add);
    } else {
      if (activePlayer === 1) {
        setPlayer1Score((p) => p + add);
        setActivePlayer(2);
      } else {
        setPlayer2Score((p) => p + add);
        setActivePlayer(1);
      }
    }
    if (Math.random() < 0.3) {
    const q = generateQuestion();
    setQuestion(q);
    setShowQuestion(true);
    setPaused(true);
  }

    //  PARTICLE BURST
    setParticles((prev) => [
  ...prev,
  ...Array.from({ length: 10 }, () => ({
    id: Math.random(),
    x: clicked.x,
    y: clicked.y,
    vx: (Math.random() - 0.5) * 6,
    vy: (Math.random() - 0.5) * 6,
    life: 1,
    emoji: getCharacterEffect(),
  })),
]);
    
    setBalloons((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, popping: true } : b
      )
    );

    setTimeout(() => {
      setBalloons((prev) => prev.filter((b) => b.id !== id));
    }, 150);
  };

  // ⭐ PARTICLE ANIMATION LOOP
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 0.03,
          }))
          .filter((p) => p.life > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, []);
return (
  <div
    className="game"
    style={{
      position: "relative",
      height: "100vh",
      transform: shake ? "translate(5px,5px)" : "none",
      touchAction: "none",
      overflow: "hidden",  
      userSelect: "none",  
    }}
  >
    <h1>🎈 Balloon Pop Game </h1>

    {/* HUD */}
    <div className="hud">
      {!isBattle ? (
        <div className="hud-box" style={{
            fontSize: isMobile ? "14px" : "18px"
        }}>🎯 Score: {score}</div>
      ) : (
        <>
          <div className="hud-box">🔴 Player 1: {player1Score}</div>
          <div className="hud-box">🔵 Player 2: {player2Score}</div>
          <div className="hud-box">
            Turn: {activePlayer === 1 ? "🔴 Player 1" : "🔵 Player 2"}
          </div>
        </>
      )}

      <div className="hud-box">❤️ Lives: {lives}</div>
      <div className="hud-box">⏰ {time}s</div>

      <button
        className="hud-box"
        onClick={() => setPaused(!paused)}
      >
        {paused ? "▶ Resume" : "⏸ Pause"}
      </button>
    </div>

    {/* GAME OVER */}
    {gameOver && (
      <div className="game-over-box">
        <h2>🏆 Game Over</h2>
        <h3>Your Score: {score}</h3>

        <button
          className="play-btn"
          onClick={() => window.location.reload()}
        >
          Play Again
        </button>
      </div>
    )}

    {/* BALLOONS */}
    {!gameOver &&
      balloons.map((b) => (
        <div
          key={b.id}
          onClick={() => handleBalloonClick(b.id)}
          style={{
            position: "absolute",
            left: b.x,
            top: b.y,
            fontSize: isMobile ? "45px" : "80px",
            cursor: "pointer",
            transition: "transform 0.2s",
            transform: b.popping ? "scale(1.5)" : "scale(1)",
            opacity: b.popping ? 0 : 1,
          }}
        >
          {getEmoji(b.type)}
        </div>
      ))}

    {/* ⭐ PARTICLES */}
    {particles.map((p) => (
      <div
        key={p.id}
        style={{
          position: "absolute",
          left: p.x,
          top: p.y,
          fontSize: isMobile ? "14px" : "20px",
          pointerEvents: "none",
          opacity: p.life,
        }}
      >
        {p.emoji || p.icon || "💥"}
      </div>
    ))}

    {/* SIDE EMOJIS */}
    {sideEmojis.map((e) => (
      <div
        key={e.id}
        style={{
          position: "absolute",
          left: e.x,
          top: e.y,
          fontSize: isMobile ? "25px" : "40px",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        {e.emoji}
      </div>
    ))}

    {/* PAUSE MENU */}
    {paused && !showQuestion && (
      <div className="pause-menu">
        <h2>⏸ Game Paused</h2>

        <button
          className="play-btn"
          onClick={() => setPaused(false)}
        >
          ▶ Resume
        </button>

        <button
          className="play-btn"
          onClick={() => window.location.reload()}
        >
          🔄 Restart
        </button>
      </div>
    )}

    {/* QUESTION BOX */}
    {showQuestion && (
              <div className="question-box">
                <h2>
                  {question.type === "math"
                    ? "🧮 Math Challenge"
                    : "🧠 GK Challenge"}
                </h2>

                <h3>{question.text}</h3>
                <div className="options">
          {question.type === "gk" ? (
            <>
              {question.options.map((opt, i) => (
                <button
                  key={i}
                  className="option-btn"
                  onClick={() => setSelectedOption(opt)}
                >
                  {opt}
                </button>
              ))}

              <button
                className="play-btn"
                onClick={() => {
                  if (selectedOption === question.answer) {
                    setScore((p) => p + 2);
                    showFloatingText("+2 🎉");
                  }

                  setSelectedOption("");
                  setShowQuestion(false);
                  setPaused(false);
                }}
              >
                Submit
              </button>
            </>
          ) : (
            <>
          <input
                type="number"
                value={mathInput}
                placeholder="Your answer"
                onChange={(e) => setMathInput(e.target.value)}
              />

              <button
                className="play-btn"
                onClick={() => {
                  if (Number(mathInput) === question.answer) {
                    setScore((p) => p + 2);
                    showFloatingText("+2 🎉");
                  }

                  setMathInput("");
                  setShowQuestion(false);
                  setPaused(false);
                }}
              >
                Submit
              </button>
            </>
          )}
        </div>
        {floatingText.map((t) => (
          <div
            key={t.id}
            style={{
              position: "absolute",
              left: t.x,
              top: t.y,
              fontSize: "30px",
              fontWeight: "bold",
              color: "gold",
              animation: "floatUp 0.8s ease-out",
              pointerEvents: "none",
              zIndex: 9999,
            }}
          >
            {t.text}
          </div>
        ))}
      </div>
    )}

  </div>
)};