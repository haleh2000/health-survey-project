import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "@app/App";

import "@ds/styles/theme.css";

const container = document.getElementById("root");
if (!container) throw new Error('Missing <div id="root"> in index.html.');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
