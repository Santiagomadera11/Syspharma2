import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
// import TestApp from "./TestApp.jsx";
import App from "./App.jsx";
import { authService } from "./features/auth/authService";
import { rolesService } from "./features/settings/rolesService";

// Ensure admin user and roles storage exist on app startup
authService.init();
rolesService.init();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
