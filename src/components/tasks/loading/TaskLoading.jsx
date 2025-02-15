import React from "react";
import "../../../styles/TaskLoading.css";

function TaskLoading() {
  return (
    <div className="container-loading">
      <div className="cargando">
        <div className="pelotas"></div>
        <div className="pelotas"></div>
        <div className="pelotas"></div>
        <span className="texto-cargando">Loading...</span>
      </div>
    </div>
  );
}

export { TaskLoading };
