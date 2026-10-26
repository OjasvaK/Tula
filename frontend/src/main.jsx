import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Note: StrictMode intentionally kept. If a future animation/3rd-party lib
// misbehaves under double-invoke in dev, this is the first thing to try
// toggling.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
