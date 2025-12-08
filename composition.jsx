import { jsxDEV } from "react/jsx-dev-runtime";
import React, { useRef, useEffect } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Audio, Sequence } from "remotion";
const WIDTH = 400;
const HEIGHT = 600;
const PLAYER_SIZE = 30;
const OBSTACLE_SIZE = 40;
const PLAYER_Y = HEIGHT - 80;
const PLAYER_SPEED = 350;
const ReplayComposition = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current || !data) return;
    const ctx = canvasRef.current.getContext("2d");
    const currentTime = frame / fps * 1e3;
    let playerX = data.startState.playerX;
    let currentDir = 0;
    let lastCalcTime = 0;
    for (let event of data.events) {
      if (event.type === "input") {
        if (event.t > currentTime) break;
        const dt = (event.t - lastCalcTime) / 1e3;
        playerX += currentDir * PLAYER_SPEED * dt;
        playerX = Math.max(0, Math.min(WIDTH - PLAYER_SIZE, playerX));
        currentDir = event.dir;
        lastCalcTime = event.t;
        if (event.px !== void 0) playerX = event.px;
      }
    }
    const dtFinal = (currentTime - lastCalcTime) / 1e3;
    playerX += currentDir * PLAYER_SPEED * dtFinal;
    playerX = Math.max(0, Math.min(WIDTH - PLAYER_SIZE, playerX));
    let currentObstacles = data.startState.obstacles.map((o) => ({
      ...o,
      y: o.y + o.speed * (currentTime / 1e3),
      rotation: (o.rotation || 0) + (o.rotationSpeed || 2) * currentTime / 1e3
    }));
    data.events.forEach((event) => {
      if (event.type === "spawn" && event.t <= currentTime) {
        const timeSinceSpawn = (currentTime - event.t) / 1e3;
        currentObstacles.push({
          ...event.data,
          y: event.data.y + event.data.speed * timeSinceSpawn,
          rotation: (event.data.rotation || 0) + (event.data.rotationSpeed || 2) * timeSinceSpawn
        });
      }
    });
    ctx.fillStyle = "#050510";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.strokeStyle = "rgba(40, 40, 80, 0.5)";
    ctx.lineWidth = 1;
    const gridSize = 50;
    const offset = currentTime * 0.2 % 50;
    ctx.beginPath();
    for (let i = 0; i <= WIDTH; i += gridSize) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i, HEIGHT);
    }
    for (let i = -gridSize; i <= HEIGHT; i += gridSize) {
      let y = i + offset;
      if (y > HEIGHT) y -= HEIGHT + gridSize;
      ctx.moveTo(0, y);
      ctx.lineTo(WIDTH, y);
    }
    ctx.stroke();
    const tilt = currentDir * 15;
    ctx.save();
    ctx.translate(playerX + PLAYER_SIZE / 2, PLAYER_Y + PLAYER_SIZE / 2);
    ctx.rotate(tilt * Math.PI / 180);
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#0ff";
    ctx.fillStyle = "#0ff";
    ctx.beginPath();
    ctx.moveTo(0, -PLAYER_SIZE / 2);
    ctx.lineTo(PLAYER_SIZE / 2, PLAYER_SIZE / 2);
    ctx.lineTo(0, PLAYER_SIZE / 2 - 5);
    ctx.lineTo(-PLAYER_SIZE / 2, PLAYER_SIZE / 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(0, -PLAYER_SIZE / 2 + 10);
    ctx.lineTo(5, PLAYER_SIZE / 2 - 5);
    ctx.lineTo(-5, PLAYER_SIZE / 2 - 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#f04";
    ctx.fillStyle = "#f04";
    currentObstacles.forEach((obs) => {
      ctx.save();
      ctx.translate(obs.x + OBSTACLE_SIZE / 2, obs.y + OBSTACLE_SIZE / 2);
      ctx.rotate(obs.rotation || 0);
      ctx.beginPath();
      const size = OBSTACLE_SIZE / 2;
      ctx.moveTo(0, -size);
      ctx.lineTo(size, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f04";
      ctx.restore();
    });
  }, [frame, data, fps]);
  return /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: { backgroundColor: "#111" }, children: [
    /* @__PURE__ */ jsxDEV(
      "canvas",
      {
        ref: canvasRef,
        width: WIDTH,
        height: HEIGHT,
        style: { width: "100%", height: "100%" }
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 149,
        columnNumber: 8
      }
    ),
    frame >= 150 - 5 && /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: {
      backgroundColor: "white",
      opacity: (frame - (150 - 5)) / 5
    } }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 158,
      columnNumber: 10
    }),
    /* @__PURE__ */ jsxDEV("div", { style: {
      position: "absolute",
      bottom: 20,
      width: "100%",
      textAlign: "center",
      fontFamily: "'Orbitron', sans-serif",
      color: "rgba(0, 255, 255, 0.7)",
      fontSize: "20px",
      letterSpacing: "2px"
    }, children: "REPLAY MODE" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 165,
      columnNumber: 7
    })
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 148,
    columnNumber: 5
  });
};
export {
  ReplayComposition
};
