"use client";

import { useState } from "react";

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const PLAYERS = {
  sun: { name: "Araw", english: "Sun" },
  star: { name: "Bituin", english: "Star" },
};

function findWinner(board) {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { player: board[a], line };
    }
  }
  return null;
}

function Sun() {
  const rays = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <svg viewBox="0 0 100 100" className="mark mark-sun" aria-hidden="true">
      {rays.map((deg) => (
        <path key={deg} d="M50 6 L55 26 L45 26 Z" transform={`rotate(${deg} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="19" />
    </svg>
  );
}

function Star() {
  return (
    <svg viewBox="0 0 100 100" className="mark mark-star" aria-hidden="true">
      <path d="M50 8 L61.8 37.6 L93.7 39.6 L69 60 L77 91 L50 73.8 L23 91 L31 60 L6.3 39.6 L38.2 37.6 Z" />
    </svg>
  );
}

function Mark({ player }) {
  if (player === "sun") return <Sun />;
  if (player === "star") return <Star />;
  return null;
}

// Pixel-free win line: each cell is 1/3 of the board, so centres sit at 1/6, 3/6, 5/6.
function lineCoords(line) {
  const centre = (i) => ({ x: (i % 3) * 2 + 1, y: Math.floor(i / 3) * 2 + 1 });
  const a = centre(line[0]);
  const c = centre(line[2]);
  return { x1: a.x, y1: a.y, x2: c.x, y2: c.y };
}

export default function Game() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState("sun");
  const [starter, setStarter] = useState("sun");
  const [score, setScore] = useState({ sun: 0, star: 0, draw: 0 });

  const win = findWinner(board);
  const full = board.every(Boolean);
  const over = Boolean(win) || full;

  function play(i) {
    if (board[i] || over) return;
    const next = board.slice();
    next[i] = turn;
    setBoard(next);

    const result = findWinner(next);
    if (result) {
      setScore((s) => ({ ...s, [result.player]: s[result.player] + 1 }));
    } else if (next.every(Boolean)) {
      setScore((s) => ({ ...s, draw: s.draw + 1 }));
    } else {
      setTurn(turn === "sun" ? "star" : "sun");
    }
  }

  // The player who did not start last round goes first, so it stays fair.
  function newGame() {
    const first = starter === "sun" ? "star" : "sun";
    setStarter(first);
    setTurn(first);
    setBoard(Array(9).fill(null));
  }

  function resetScores() {
    setScore({ sun: 0, star: 0, draw: 0 });
    setStarter("sun");
    setTurn("sun");
    setBoard(Array(9).fill(null));
  }

  let status;
  if (win) {
    status = (
      <>
        <strong>{PLAYERS[win.player].name}</strong> wins this round
      </>
    );
  } else if (full) {
    status = <>It&rsquo;s a draw. Nobody blinked.</>;
  } else {
    status = (
      <>
        <strong>{PLAYERS[turn].name}</strong>&rsquo;s turn
      </>
    );
  }

  return (
    <main className="wrap">
      <header className="head">
        <p className="kicker">Tic-Tac-Toe · two players, one screen</p>
        <h1>
          <span className="t-sun">Araw</span> <span className="vs">vs</span>{" "}
          <span className="t-star">Bituin</span>
        </h1>
        <p className="sub">
          The sun and the stars from the Philippine flag take turns. Line up three to win.
        </p>
      </header>

      <section className="scores" aria-label="Score board">
        <div className={`score score-sun${!over && turn === "sun" ? " is-turn" : ""}`}>
          <Sun />
          <span className="who">Araw</span>
          <span className="num">{score.sun}</span>
        </div>
        <div className="score score-draw">
          <span className="who">Draws</span>
          <span className="num">{score.draw}</span>
        </div>
        <div className={`score score-star${!over && turn === "star" ? " is-turn" : ""}`}>
          <Star />
          <span className="who">Bituin</span>
          <span className="num">{score.star}</span>
        </div>
      </section>

      <p className={`status${win ? " status-win status-" + win.player : ""}`} role="status" aria-live="polite">
        {status}
      </p>

      <div className={`board${over ? " is-over" : ""}`}>
        {board.map((cell, i) => {
          const isWinCell = win && win.line.includes(i);
          const label = cell
            ? `Square ${i + 1}, ${PLAYERS[cell].name}`
            : `Square ${i + 1}, empty${over ? "" : `, place ${PLAYERS[turn].name}`}`;
          return (
            <button
              key={i}
              type="button"
              className={`cell${cell ? " filled" : ""}${isWinCell ? " win" : ""}${win && !isWinCell ? " dim" : ""}`}
              onClick={() => play(i)}
              disabled={Boolean(cell) || over}
              aria-label={label}
            >
              <Mark player={cell} />
              {!cell && !over && (
                <span className="ghost">
                  <Mark player={turn} />
                </span>
              )}
            </button>
          );
        })}
        {win && (
          <svg className={`winline winline-${win.player}`} viewBox="0 0 6 6" aria-hidden="true">
            <line {...lineCoords(win.line)} />
          </svg>
        )}
      </div>

      <div className="actions">
        <button type="button" className="btn btn-main" onClick={newGame}>
          New Game
        </button>
        <button type="button" className="btn btn-quiet" onClick={resetScores}>
          Reset scores
        </button>
      </div>

      <footer className="foot">
        Built with React and Next.js by Mickhail Felismino ·{" "}
        <a href="https://mickhail-portfolio.vercel.app">portfolio</a>
      </footer>
    </main>
  );
}
