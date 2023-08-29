import React from 'react'
import { createPortal } from 'react-dom';
import closed from '../assets/close.svg';
import '../styles/Modal.css';

function Modal({ children }) {
  return createPortal(
    <div className='modal'>
        <div className='tittle'>
            <img src={closed}/>
            <h1>Add new task</h1>
        </div>
        <div className='text'>
            <input placeholder='Write the new task'></input>
            <button>Add</button>
        </div>
    </div>,
    document.getElementById('modal')
  );
}

export { Modal };