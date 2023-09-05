import React from 'react'
import '../styles/TodosLoading.css';

function TodosLoading() {
  return (
    <div class="container">
  <div class="cargando">
    <div class="pelotas"></div>
    <div class="pelotas"></div>
    <div class="pelotas"></div>
    <span class="texto-cargando">Loading...</span>
  </div>
</div>
  );
}

export { TodosLoading };