import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "./view/HomePage";
import { NewTodo } from "./view/NewTodo";

function AppUI() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/add-task" element={<NewTodo />} />
          <Route path="/edit-task/:id" element={<NewTodo />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export { AppUI };
