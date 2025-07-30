import { StrictMode } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
