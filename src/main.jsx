import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "../e3-lop-v4.jsx";

// Polyfill window.storage with localStorage so data persists between refreshes.
// The real platform API uses window.storage.get/set; localStorage mirrors that shape.
if (!window.storage) {
  window.storage = {
    get: async (key) => {
      const value = localStorage.getItem(key);
      return value ? { value } : null;
    },
    set: async (key, value) => {
      localStorage.setItem(key, value);
    },
  };
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
