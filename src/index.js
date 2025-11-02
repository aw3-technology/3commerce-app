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
    if (typeof args[0] === 'string' &&
        args[0].includes("Can't call setState on a component that is not yet mounted")) {
      // Suppress this specific warning from react-draft-wysiwyg
      return;
    }
    originalWarn.apply(console, args);
  };

  console.error = (...args) => {
    if (typeof args[0] === 'string' &&
        args[0].includes("Can't call setState on a component that is not yet mounted")) {
      // Suppress this specific warning from react-draft-wysiwyg
      return;
    }
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
