import React from "react";
import { AppUI } from "./AppUI";
import { BrowserRouter } from "react-router-dom";
import { CombinedProviders } from "./context/CombinedProviders";
import "./index.css"; 

function App() {
  return (
    <CombinedProviders>
      <BrowserRouter>
        <AppUI />
      </BrowserRouter>
    </CombinedProviders>
  );
}

export default App;
