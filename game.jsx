import { jsxDEV } from "react/jsx-dev-runtime";
import React, { useEffect, useRef, useState } from "react";
const WIDTH = 400;
const HEIGHT = 600;
const PLAYER_SIZE = 30;
const OBSTACLE_SIZE = 40;
const PLAYER_Y = HEIGHT - 80;
const PLAYER_SPEED = 350;
const SPAWN_RATE_INITIAL = 1400;
function Game({ onGameOver }) {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const previousTimeRef = useRef();
  const bgmRef = useRef(new Audio("bgm.mp3"));
  const scoreAudioRef = useRef(new Audio("score.mp3"));
  const crashAudioRef = useRef(new Audio("crash.mp3"));
  const state = useRef({
    isPlaying: true,
    score: 0,
    startTime: 0,
    lastSpawnTime: 0,
    spawnRate: SPAWN_RATE_INITIAL,
    playerX: WIDTH / 2 - PLAYER_SIZE / 2,
    playerTilt: 0,
    // Visual tilt angle
    moveDir: 0,
    // -1 (left), 0 (idle), 1 (right)
    obstacles: [],
    // { id, x, y, speed, type }
    particles: [],
    // { x, y, vx, vy, life, maxLife, color, size }
    bgOffset: 0,
    shake: 0,
    // Screen shake intensity
    history: [],
    snapshots: []
  });
  const [displayScore, setDisplayScore] = useState(0);
  useEffect(() => {
    bgmRef.current.loop = true;
    bgmRef.current.volume = 0.4;
    scoreAudioRef.current.volume = 0.3;
    crashAudioRef.current.volume = 0.6;
    const startAudio = () => {
      bgmRef.current.play().catch((e) => console.log("Audio autoplay prevented", e));
      window.removeEventListener("keydown", startAudio);
      window.removeEventListener("touchstart", startAudio);
    };
    window.addEventListener("keydown", startAudio);
    window.addEventListener("touchstart", startAudio);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
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
      if (!state.current.isPlaying && state.current.shake <= 0) return;
      if (previousTimeRef.current === void 0) {
        previousTimeRef.current = time;
        state.current.startTime = time;
      }
      const deltaTime = Math.min(time - previousTimeRef.current, 50);
      const gameTime = time - state.current.startTime;
      previousTimeRef.current = time;
      if (state.current.shake > 0) {
        state.current.shake -= deltaTime * 0.05;
        if (state.current.shake < 0) state.current.shake = 0;
      }
      if (state.current.isPlaying) {
        if (state.current.moveDir !== 0) {
          const moveAmount = PLAYER_SPEED * deltaTime / 1e3 * state.current.moveDir;
          state.current.playerX += moveAmount;
          state.current.playerX = Math.max(0, Math.min(WIDTH - PLAYER_SIZE, state.current.playerX));
          state.current.playerTilt = state.current.moveDir * 15;
        } else {
          state.current.playerTilt = 0;
        }
        if (gameTime % 2 < 1) {
          state.current.particles.push({
            x: state.current.playerX + PLAYER_SIZE / 2 + (Math.random() * 10 - 5),
            y: PLAYER_Y + PLAYER_SIZE - 5,
            vx: (Math.random() - 0.5) * 20,
            vy: Math.random() * 50 + 100,
            // Downward
            life: 1,
            maxLife: 1,
            size: Math.random() * 3 + 2,
            color: `rgba(0, 255, 255, 1)`
          });
        }
      }
      state.current.bgOffset = (state.current.bgOffset + deltaTime * 0.2) % 50;
      if (state.current.isPlaying && gameTime - state.current.lastSpawnTime > state.current.spawnRate) {
        const speedMultiplier = 1 + state.current.score * 0.05;
        const newObstacle = {
          id: Math.random().toString(36).substr(2, 9),
          x: Math.random() * (WIDTH - OBSTACLE_SIZE),
          y: -OBSTACLE_SIZE,
          speed: 250 * speedMultiplier,
          rotation: 0,
          rotationSpeed: (Math.random() - 0.5) * 4
        };
        state.current.obstacles.push(newObstacle);
        state.current.lastSpawnTime = gameTime;
        state.current.spawnRate = Math.max(350, SPAWN_RATE_INITIAL - state.current.score * 30);
        state.current.history.push({
          t: gameTime,
          type: "spawn",
          data: { ...newObstacle }
        });
      }
      if (state.current.isPlaying) {
        for (let i = state.current.obstacles.length - 1; i >= 0; i--) {
          const obs = state.current.obstacles[i];
          obs.y += obs.speed * deltaTime / 1e3;
          obs.rotation += obs.rotationSpeed * deltaTime / 1e3;
          const hitMargin = 6;
          if (state.current.playerX + hitMargin < obs.x + OBSTACLE_SIZE - hitMargin && state.current.playerX + PLAYER_SIZE - hitMargin > obs.x + hitMargin && PLAYER_Y + hitMargin < obs.y + OBSTACLE_SIZE - hitMargin && PLAYER_Y + PLAYER_SIZE - hitMargin > obs.y + hitMargin) {
            state.current.shake = 20;
            spawnExplosion(state.current.playerX + PLAYER_SIZE / 2, PLAYER_Y + PLAYER_SIZE / 2);
            crashAudioRef.current.play().catch(() => {
            });
            bgmRef.current.pause();
            endGame(gameTime);
            state.current.isPlaying = false;
          }
          if (obs.y > HEIGHT) {
            state.current.obstacles.splice(i, 1);
            state.current.score += 1;
            setDisplayScore(state.current.score);
            scoreAudioRef.current.currentTime = 0;
            scoreAudioRef.current.play().catch(() => {
            });
          }
        }
      }
      for (let i = state.current.particles.length - 1; i >= 0; i--) {
        const p = state.current.particles[i];
        p.x += p.vx * deltaTime / 1e3;
        p.y += p.vy * deltaTime / 1e3;
        p.life -= deltaTime / 1e3;
        if (p.life <= 0) {
          state.current.particles.splice(i, 1);
        }
      }
      if (state.current.isPlaying && Math.floor(gameTime / 100) > state.current.snapshots.length) {
        state.current.snapshots.push({
          t: gameTime,
          playerX: state.current.playerX,
          obstacles: JSON.parse(JSON.stringify(state.current.obstacles)),
          score: state.current.score
        });
      }
      draw(ctx, state.current);
      if (state.current.isPlaying || state.current.shake > 0 || state.current.particles.length > 0) {
        requestRef.current = requestAnimationFrame(animate);
      }
    };
    const spawnExplosion = (x, y) => {
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 200 + 50;
        state.current.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: Math.random() * 0.5 + 0.3,
          maxLife: 0.8,
          size: Math.random() * 4 + 2,
          color: `rgba(255, 50, 50, 1)`
          // Red/Orange
        });
      }
    };
    const draw = (ctx2, gameState) => {
      ctx2.fillStyle = "#050510";
      ctx2.fillRect(0, 0, WIDTH, HEIGHT);
      ctx2.save();
      if (gameState.shake > 0) {
        const dx = (Math.random() - 0.5) * gameState.shake;
        const dy = (Math.random() - 0.5) * gameState.shake;
        ctx2.translate(dx, dy);
      }
      ctx2.strokeStyle = "rgba(40, 40, 80, 0.5)";
      ctx2.lineWidth = 1;
      const gridSize = 50;
      const offset = gameState.bgOffset;
      ctx2.beginPath();
      for (let i = 0; i <= WIDTH; i += gridSize) {
        ctx2.moveTo(i, 0);
        ctx2.lineTo(i, HEIGHT);
      }
      for (let i = -gridSize; i <= HEIGHT; i += gridSize) {
        let y = i + offset;
        if (y > HEIGHT) y -= HEIGHT + gridSize;
        ctx2.moveTo(0, y);
        ctx2.lineTo(WIDTH, y);
      }
      ctx2.stroke();
      gameState.particles.forEach((p) => {
        ctx2.fillStyle = p.color.replace("1)", `${p.life / p.maxLife})`);
        ctx2.beginPath();
        ctx2.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx2.fill();
      });
      if (gameState.isPlaying) {
        ctx2.save();
        ctx2.translate(gameState.playerX + PLAYER_SIZE / 2, PLAYER_Y + PLAYER_SIZE / 2);
        ctx2.rotate(gameState.playerTilt * Math.PI / 180);
        ctx2.shadowBlur = 20;
        ctx2.shadowColor = "#0ff";
        ctx2.fillStyle = "#0ff";
        ctx2.beginPath();
        ctx2.moveTo(0, -PLAYER_SIZE / 2);
        ctx2.lineTo(PLAYER_SIZE / 2, PLAYER_SIZE / 2);
        ctx2.lineTo(0, PLAYER_SIZE / 2 - 5);
        ctx2.lineTo(-PLAYER_SIZE / 2, PLAYER_SIZE / 2);
        ctx2.closePath();
        ctx2.fill();
        ctx2.fillStyle = "#fff";
        ctx2.beginPath();
        ctx2.moveTo(0, -PLAYER_SIZE / 2 + 10);
        ctx2.lineTo(5, PLAYER_SIZE / 2 - 5);
        ctx2.lineTo(-5, PLAYER_SIZE / 2 - 5);
        ctx2.closePath();
        ctx2.fill();
        ctx2.restore();
      }
      ctx2.shadowBlur = 15;
      ctx2.shadowColor = "#f04";
      ctx2.fillStyle = "#f04";
      gameState.obstacles.forEach((obs) => {
        ctx2.save();
        ctx2.translate(obs.x + OBSTACLE_SIZE / 2, obs.y + OBSTACLE_SIZE / 2);
        ctx2.rotate(obs.rotation || 0);
        ctx2.beginPath();
        const size = OBSTACLE_SIZE / 2;
        ctx2.moveTo(0, -size);
        ctx2.lineTo(size, 0);
        ctx2.lineTo(0, size);
        ctx2.lineTo(-size, 0);
        ctx2.closePath();
        ctx2.fill();
        ctx2.fillStyle = "#fff";
        ctx2.beginPath();
        ctx2.arc(0, 0, size * 0.4, 0, Math.PI * 2);
        ctx2.fill();
        ctx2.fillStyle = "#f04";
        ctx2.restore();
      });
      ctx2.shadowBlur = 0;
      ctx2.restore();
    };
    const endGame = (endTime) => {
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
            lineNumber: 456,
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
            lineNumber: 462,
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
            lineNumber: 475,
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
      lineNumber: 449,
      columnNumber: 5
    },
    this
  );
}
export {
  Game as default
};
