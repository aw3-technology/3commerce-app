import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

// Suppress known react-draft-wysiwyg warnings in development
// This is a known issue with the library: https://github.com/jpuri/react-draft-wysiwyg/issues/1317
if (process.env.NODE_ENV === 'development') {
  const originalWarn = console.warn;
  const originalError = console.error;

  console.warn = (...args) => {
    const message = args[0];
    if (typeof message === 'string' &&
        message.includes("Can't call setState") &&
        message.includes("not yet mounted")) {
      // Suppress this specific warning from react-draft-wysiwyg
      return;
    }
    originalWarn.apply(console, args);
  };

  console.error = (...args) => {
    const message = args[0];
    // Suppress react-draft-wysiwyg setState warnings
    if (typeof message === 'string' &&
        message.includes("Can't call setState") &&
        message.includes("not yet mounted")) {
      return;
    }
    // Don't suppress other errors - pass them through
    originalError.apply(console, args);
  };
}

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);
