import grafica from '../assets/ejemploGrafica.jpg';
import '../styles/Progress.css';

function Progress({children}) {
  return (
    <aside>
      <h1>Progress</h1>
      <div className='containerChildren'>
        { children[0]};
        <img src={grafica}/>
      </div>
      <div className='addTask'>
        { children[1] }
      </div>
    </aside>
  )
}

export {Progress};