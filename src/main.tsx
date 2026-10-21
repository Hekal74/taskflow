/// <reference types="vite/client" />
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.scss";

if (import.meta.env.PROD) {
  console.warn("App is running in production mode.");
} else {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App name="World" />
    </React.StrictMode>
  );
}
