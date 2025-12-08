import { jsxDEV } from "react/jsx-dev-runtime";
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
const WIDTH = 400;
const HEIGHT = 600;
const PLAYER_SIZE = 30;
const OBSTACLE_SIZE = 40;
const PLAYER_Y = HEIGHT - 60;
const PLAYER_SPEED = 300;
const ReplayComposition = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!data) return /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: { backgroundColor: "#000", color: "red" }, children: "No Data" }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 16,
    columnNumber: 21
  });
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
      if (event.px !== void 0) {
        playerX = event.px;
      }
    }
  }
  const dtFinal = (currentTime - lastCalcTime) / 1e3;
  playerX += currentDir * PLAYER_SPEED * dtFinal;
  playerX = Math.max(0, Math.min(WIDTH - PLAYER_SIZE, playerX));
  let currentObstacles = data.startState.obstacles.map((o) => ({
    ...o,
    y: o.y + o.speed * (currentTime / 1e3)
    // Move them forward by total elapsed time
  }));
  data.events.forEach((event) => {
    if (event.type === "spawn" && event.t <= currentTime) {
      const timeSinceSpawn = (currentTime - event.t) / 1e3;
      currentObstacles.push({
        ...event.data,
        y: event.data.y + event.data.speed * timeSinceSpawn
      });
    }
  });
  return /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: { backgroundColor: "#111" }, children: [
    /* @__PURE__ */ jsxDEV("svg", { width: "100%", height: "100%", style: { position: "absolute" }, children: [
      /* @__PURE__ */ jsxDEV("pattern", { id: "grid", width: "50", height: "50", patternUnits: "userSpaceOnUse", children: /* @__PURE__ */ jsxDEV("path", { d: "M 50 0 L 0 0 0 50", fill: "none", stroke: "#222", strokeWidth: "1" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 90,
        columnNumber: 11
      }) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 89,
        columnNumber: 9
      }),
      /* @__PURE__ */ jsxDEV("rect", { width: "100%", height: "100%", fill: "url(#grid)" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 92,
        columnNumber: 9
      })
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 88,
      columnNumber: 7
    }),
    /* @__PURE__ */ jsxDEV("div", { style: {
      position: "absolute",
      top: PLAYER_Y + PLAYER_SIZE,
      left: 0,
      width: "100%",
      height: 2,
      backgroundColor: "#333"
    } }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 96,
      columnNumber: 7
    }),
    /* @__PURE__ */ jsxDEV("div", { style: {
      position: "absolute",
      left: playerX,
      top: PLAYER_Y,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      backgroundColor: "#0af",
      boxShadow: "0 0 10px #0af"
    } }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 106,
      columnNumber: 7
    }),
    currentObstacles.map((obs, i) => /* @__PURE__ */ jsxDEV("div", { style: {
      position: "absolute",
      left: obs.x,
      top: obs.y,
      width: OBSTACLE_SIZE,
      height: OBSTACLE_SIZE,
      backgroundColor: "#f04"
    } }, obs.id || i, false, {
      fileName: "<stdin>",
      lineNumber: 118,
      columnNumber: 11
    })),
    /* @__PURE__ */ jsxDEV("div", { style: {
      position: "absolute",
      top: 20,
      left: 0,
      width: "100%",
      textAlign: "center",
      fontFamily: "Courier New",
      color: "rgba(255, 255, 255, 0.5)",
      fontSize: "24px",
      fontWeight: "bold"
    }, children: "REPLAY" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 129,
      columnNumber: 7
    }),
    frame >= 148 && /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: {
      backgroundColor: "white",
      opacity: (frame - 148) / 2
      // flash
    } }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 145,
      columnNumber: 9
    })
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 86,
    columnNumber: 5
  });
};
export {
  ReplayComposition
};
