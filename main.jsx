import { jsxDEV } from "react/jsx-dev-runtime";
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Player } from "@websim/remotion/player";
import Game from "./game.jsx";
import { ReplayComposition } from "./composition.jsx";
const App = () => {
  const [view, setView] = useState("game");
  const [replayData, setReplayData] = useState(null);
  const [score, setScore] = useState(0);
  const handleGameOver = (finalScore, recordedData) => {
    setScore(finalScore);
    setReplayData(recordedData);
    setView("summary");
  };
  const handleGenerateVideo = () => {
    console.log("video clip: Generating replay sequence...");
    setView("video");
  };
  const handleRestart = () => {
    setView("game");
    setReplayData(null);
    setScore(0);
  };
  return /* @__PURE__ */ jsxDEV("div", { style: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  }, children: [
    view === "game" && /* @__PURE__ */ jsxDEV(Game, { onGameOver: handleGameOver }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 40,
      columnNumber: 9
    }),
    view === "summary" && /* @__PURE__ */ jsxDEV("div", { style: { textAlign: "center", zIndex: 10 }, children: [
      /* @__PURE__ */ jsxDEV("h1", { style: { fontSize: "4rem", margin: "0", color: "#f04", textShadow: "0 0 20px #f04", fontFamily: "'Orbitron', sans-serif" }, children: "CRITICAL FAILURE" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 45,
        columnNumber: 11
      }),
      /* @__PURE__ */ jsxDEV("p", { style: { fontSize: "2rem", margin: "1rem 0 2rem", color: "#0ff", fontFamily: "'Rajdhani', sans-serif" }, children: [
        "SCORE: ",
        score
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 46,
        columnNumber: 11
      }),
      /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }, children: [
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: handleRestart,
            style: {
              padding: "1rem 3rem",
              fontSize: "1.5rem",
              background: "rgba(0,0,0,0.5)",
              border: "2px solid #0ff",
              boxShadow: "0 0 15px #0ff",
              color: "#fff",
              cursor: "pointer",
              fontFamily: "'Orbitron', sans-serif",
              textTransform: "uppercase"
            },
            children: "Re-Initialize"
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 49,
            columnNumber: 13
          }
        ),
        score > 10 && replayData && /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: handleGenerateVideo,
            style: {
              marginTop: "1rem",
              padding: "1rem 2rem",
              fontSize: "1.2rem",
              background: "#f04",
              border: "none",
              boxShadow: "0 0 20px #f04",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              fontFamily: "'Orbitron', sans-serif",
              animation: "pulse 2s infinite",
              textTransform: "uppercase"
            },
            children: "Save Replay"
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 67,
            columnNumber: 15
          }
        ),
        score <= 10 && /* @__PURE__ */ jsxDEV("p", { style: { opacity: 0.7, fontSize: "1rem", color: "#aaa" }, children: "Score > 10 to unlock replay system" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 89,
          columnNumber: 15
        })
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 48,
        columnNumber: 11
      })
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 44,
      columnNumber: 9
    }),
    view === "video" && replayData && /* @__PURE__ */ jsxDEV("div", { style: { width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }, children: [
      /* @__PURE__ */ jsxDEV(
        Player,
        {
          component: ReplayComposition,
          durationInFrames: 150,
          fps: 30,
          compositionWidth: 400,
          compositionHeight: 600,
          inputProps: { data: replayData },
          controls: true,
          autoPlay: true,
          loop: true,
          style: {
            width: "100%",
            maxWidth: "400px",
            aspectRatio: "400/600",
            boxShadow: "0 0 20px rgba(0,0,0,0.5)"
          }
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 99,
          columnNumber: 11
        }
      ),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          onClick: handleRestart,
          style: {
            marginTop: "20px",
            background: "transparent",
            border: "none",
            color: "#aaa",
            textDecoration: "underline",
            cursor: "pointer"
          },
          children: "Back to Game"
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 116,
          columnNumber: 11
        }
      )
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 98,
      columnNumber: 9
    }),
    /* @__PURE__ */ jsxDEV("style", { children: `
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 0, 68, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(255, 0, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 0, 68, 0); }
        }
      ` }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 132,
      columnNumber: 7
    })
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 31,
    columnNumber: 5
  });
};
createRoot(document.getElementById("app")).render(/* @__PURE__ */ jsxDEV(App, {}, void 0, false, {
  fileName: "<stdin>",
  lineNumber: 143,
  columnNumber: 51
}));
