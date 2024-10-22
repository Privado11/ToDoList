import React from "react";
import { AppUI } from "./AppUI";
import { CombinedProviders } from "./components/context/CombinedProviders";
import { BrowserRouter } from "react-router-dom";

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
