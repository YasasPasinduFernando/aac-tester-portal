import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./auth";
import { LocaleProvider } from "./locale";
import "./index.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element missing");
}

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
        <LocaleProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </LocaleProvider>
    </BrowserRouter>
  </StrictMode>,
);
