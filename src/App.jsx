import React from "react";
import { AppUI } from "./AppUI";
import { BrowserRouter } from "react-router-dom";
import { CombinedProviders } from "./context";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <CombinedProviders>
        <AppUI />
      </CombinedProviders>
    </BrowserRouter>
  );
}

export default App;
