import React from 'react'
import '../styles/TodosLoading.css';

function TodosLoading() {
  return (
    <div className="container">
  <div className="cargando">
    <div className="pelotas"></div>
    <div className="pelotas"></div>
    <div className="pelotas"></div>
    <span className="texto-cargando">Loading...</span>
  </div>
</div>
  );
}

export { TodosLoading };