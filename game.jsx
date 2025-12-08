import { jsxDEV } from "react/jsx-dev-runtime";
import React, { useEffect, useRef, useState } from "react";
const WIDTH = 400;
const HEIGHT = 600;
const PLAYER_SIZE = 30;
const OBSTACLE_SIZE = 40;
const PLAYER_Y = HEIGHT - 60;
const PLAYER_SPEED = 300;
const SPAWN_RATE_INITIAL = 1500;
function Game({ onGameOver }) {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const previousTimeRef = useRef();
  const state = useRef({
    isPlaying: true,
    score: 0,
    startTime: 0,
    lastSpawnTime: 0,
    spawnRate: SPAWN_RATE_INITIAL,
    playerX: WIDTH / 2 - PLAYER_SIZE / 2,
    moveDir: 0,
    // -1 (left), 0 (idle), 1 (right)
    obstacles: [],
    // { id, x, y, speed }
    history: [],
    // { t: timestamp, type: 'spawn'|'input'|'score', ...data }
    // We also record snapshots periodically for easier replay entry points
    snapshots: []
    // { t: timestamp, playerX: number, obstacles: [] }
  });
  const [displayScore, setDisplayScore] = useState(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const crashAudio = new Audio("crash.mp3");
    const handleKeyDown = (e) => {
      if (!state.current.isPlaying) return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        updateInput(-1);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        updateInput(1);
      }
    };
    const handleKeyUp = (e) => {
      if (!state.current.isPlaying) return;
      if ((e.key === "ArrowLeft" || e.key === "a" || e.key === "A") && state.current.moveDir === -1) {
        updateInput(0);
      } else if ((e.key === "ArrowRight" || e.key === "d" || e.key === "D") && state.current.moveDir === 1) {
        updateInput(0);
      }
    };
    const updateInput = (dir) => {
      if (state.current.moveDir !== dir) {
        state.current.moveDir = dir;
        state.current.history.push({
          t: performance.now() - state.current.startTime,
          type: "input",
          dir,
          px: state.current.playerX
          // Log position for drift correction during replay
        });
      }
    };
    const handleTouchStart = (e) => {
      if (!state.current.isPlaying) return;
      const touchX = e.touches[0].clientX;
      const rect = canvas.getBoundingClientRect();
      const canvasX = touchX - rect.left;
      if (canvasX < rect.width / 2) updateInput(-1);
      else updateInput(1);
    };
    const handleTouchEnd = () => updateInput(0);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchend", handleTouchEnd);
    const animate = (time) => {
      if (!state.current.isPlaying) return;
      if (previousTimeRef.current === void 0) {
        previousTimeRef.current = time;
        state.current.startTime = time;
      }
      const deltaTime = time - previousTimeRef.current;
      const gameTime = time - state.current.startTime;
      previousTimeRef.current = time;
      if (state.current.moveDir !== 0) {
        const moveAmount = PLAYER_SPEED * deltaTime / 1e3 * state.current.moveDir;
        state.current.playerX += moveAmount;
        state.current.playerX = Math.max(0, Math.min(WIDTH - PLAYER_SIZE, state.current.playerX));
      }
      if (gameTime - state.current.lastSpawnTime > state.current.spawnRate) {
        const speedMultiplier = 1 + state.current.score * 0.05;
        const newObstacle = {
          id: Math.random().toString(36).substr(2, 9),
          x: Math.random() * (WIDTH - OBSTACLE_SIZE),
          y: -OBSTACLE_SIZE,
          speed: 200 * speedMultiplier
          // Base speed + difficulty
        };
        state.current.obstacles.push(newObstacle);
        state.current.lastSpawnTime = gameTime;
        state.current.spawnRate = Math.max(400, SPAWN_RATE_INITIAL - state.current.score * 30);
        state.current.history.push({
          t: gameTime,
          type: "spawn",
          data: { ...newObstacle }
        });
      }
      for (let i = state.current.obstacles.length - 1; i >= 0; i--) {
        const obs = state.current.obstacles[i];
        obs.y += obs.speed * deltaTime / 1e3;
        if (state.current.playerX < obs.x + OBSTACLE_SIZE && state.current.playerX + PLAYER_SIZE > obs.x && PLAYER_Y < obs.y + OBSTACLE_SIZE && PLAYER_Y + PLAYER_SIZE > obs.y) {
          endGame(gameTime);
          crashAudio.play().catch(() => {
          });
          return;
        }
        if (obs.y > HEIGHT) {
          state.current.obstacles.splice(i, 1);
          state.current.score += 1;
          setDisplayScore(state.current.score);
        }
      }
      if (Math.floor(gameTime / 100) > state.current.snapshots.length) {
        state.current.snapshots.push({
          t: gameTime,
          playerX: state.current.playerX,
          obstacles: JSON.parse(JSON.stringify(state.current.obstacles)),
          score: state.current.score
        });
      }
      draw(ctx, state.current);
      requestRef.current = requestAnimationFrame(animate);
    };
    const draw = (ctx2, gameState) => {
      ctx2.fillStyle = "#111";
      ctx2.fillRect(0, 0, WIDTH, HEIGHT);
      ctx2.strokeStyle = "#222";
      ctx2.lineWidth = 1;
      ctx2.beginPath();
      for (let i = 0; i < HEIGHT; i += 50) {
        ctx2.moveTo(0, i);
        ctx2.lineTo(WIDTH, i);
      }
      for (let i = 0; i < WIDTH; i += 50) {
        ctx2.moveTo(i, 0);
        ctx2.lineTo(i, HEIGHT);
      }
      ctx2.stroke();
      ctx2.fillStyle = "#333";
      ctx2.fillRect(0, PLAYER_Y + PLAYER_SIZE, WIDTH, 2);
      ctx2.fillStyle = "#0af";
      ctx2.shadowBlur = 10;
      ctx2.shadowColor = "#0af";
      ctx2.fillRect(gameState.playerX, PLAYER_Y, PLAYER_SIZE, PLAYER_SIZE);
      ctx2.shadowBlur = 0;
      ctx2.fillStyle = "#f04";
      gameState.obstacles.forEach((obs) => {
        ctx2.fillRect(obs.x, obs.y, OBSTACLE_SIZE, OBSTACLE_SIZE);
      });
    };
    const endGame = (endTime) => {
      state.current.isPlaying = false;
      const CLIP_DURATION = 5e3;
      const startTime = Math.max(0, endTime - CLIP_DURATION);
      let startState = {
        playerX: WIDTH / 2 - PLAYER_SIZE / 2,
        obstacles: [],
        score: 0
      };
      for (let i = state.current.snapshots.length - 1; i >= 0; i--) {
        if (state.current.snapshots[i].t <= startTime) {
          startState = state.current.snapshots[i];
          break;
        }
      }
      const relevantEvents = state.current.history.filter(
        (e) => e.t >= startTime && e.t <= endTime
      ).map((e) => ({
        ...e,
        t: e.t - startTime
        // Normalize time to 0-5000
      }));
      if (state.current.snapshots.length > 0) {
        const snapshotTime = startState.t || 0;
        const dt = (startTime - snapshotTime) / 1e3;
        if (dt > 0) {
          startState.obstacles.forEach((o) => {
            o.y += o.speed * dt;
          });
        }
      }
      const replayData = {
        totalDuration: endTime,
        clipDuration: Math.min(endTime, CLIP_DURATION),
        startState,
        events: relevantEvents
      };
      onGameOver(state.current.score, replayData);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchend", handleTouchEnd);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);
  return /* @__PURE__ */ jsxDEV(
    "div",
    {
      style: {
        position: "relative",
        border: "4px solid #333",
        boxShadow: "0 0 30px rgba(0,0,0,0.5)"
      },
      children: [
        /* @__PURE__ */ jsxDEV(
          "canvas",
          {
            ref: canvasRef,
            width: WIDTH,
            height: HEIGHT,
            style: { display: "block", background: "#111" }
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 296,
            columnNumber: 7
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          "div",
          {
            style: {
              position: "absolute",
              top: "10px",
              left: "10px",
              color: "#fff",
              fontSize: "20px",
              fontWeight: "bold",
              textShadow: "0 2px 0 #000"
            },
            children: [
              "SCORE: ",
              displayScore
            ]
          },
          void 0,
          true,
          {
            fileName: "<stdin>",
            lineNumber: 302,
            columnNumber: 7
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          "div",
          {
            style: {
              position: "absolute",
              bottom: "10px",
              width: "100%",
              textAlign: "center",
              color: "#444",
              fontSize: "12px",
              pointerEvents: "none"
            },
            children: "A / D or Arrows to Move"
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 315,
            columnNumber: 7
          },
          this
        )
      ]
    },
    void 0,
    true,
    {
      fileName: "<stdin>",
      lineNumber: 289,
      columnNumber: 5
    },
    this
  );
}
export {
  Game as default
};
