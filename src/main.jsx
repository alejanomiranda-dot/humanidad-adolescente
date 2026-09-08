import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

const isPhase2A = new URLSearchParams(window.location.search).get("prototype") === "phase2a";
const Phase2APrototype = isPhase2A
  ? React.lazy(() => new URLSearchParams(window.location.search).get("study") === "lookdev"
    ? import("./prototypes/phase2a3/Lookdev.jsx")
    : new URLSearchParams(window.location.search).get("study") === "webgl"
      ? import("./prototypes/phase2a/Phase2APrototype.jsx")
      : import("./prototypes/phase2a2/MasterShot.jsx"))
  : null;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isPhase2A ? (
      <React.Suspense fallback={<div style={{ minHeight: "100vh", background: "#000", color: "#eee", padding: "2rem" }} role="status">Cargando prototipo…</div>}>
        <Phase2APrototype />
      </React.Suspense>
    ) : <App />}
  </React.StrictMode>
);
