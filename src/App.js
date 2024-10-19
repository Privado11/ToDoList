import React from "react";
import { AppUI } from "./AppUI";
import { CombinedProviders } from "./components/context/CombinedProviders";

function App() {
  return (
    <CombinedProviders>
      <AppUI />
    </CombinedProviders>
  );
}

export default App;
