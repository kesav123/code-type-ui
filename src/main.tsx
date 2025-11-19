import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import CodeTypeMappingsPage from "./pages/CodeTypeMappingsPage";
import TermMappingsPage from "./pages/TermMappingsPage";

// If you installed Roboto fonts, keep these; otherwise, you can comment them out
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<CodeTypeMappingsPage />} />
          <Route path="mapping/:id" element={<TermMappingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
