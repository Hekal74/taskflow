/// <reference types="vite/client" />
import "./index.scss";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

async function enableMocking() {
  if (import.meta.env.DEV) {
    const { worker } = await import("./mocks/browser");

    await worker.start({
      onUnhandledRequest: "bypass",
    });
  }
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App name="World" />
    </React.StrictMode>
  );
});
