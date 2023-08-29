import waveImg from "../assets/wave.png";
import webPersonal from "../assets/web.svg";
import gitHub from "../assets/github.svg";
import linkedin from "../assets/linkedin.svg";
import '../styles/Header.css';


function Header() {
  return (
    <header>
        <div>
            <div className="welcome">
                <p>
                    Welcome!
                    <img src={waveImg} alt="wave"/>
                </p>
                <h2>Walter Jiménez</h2>
            </div>
        </div>
        

        <nav>
            <a target="_blank" href="https://privado11.github.io/Portafolio-personal/">
                <img src={webPersonal} alt="Web Personal"/>
            </a>
            <a target="_blank" href="https://github.com/Privado11">
                <img src={gitHub} alt="GitHub"/>
            </a>
            <a target="_blank" href="https://www.linkedin.com/in/walter-jimenez9522/">
                <img src={linkedin} alt="Linkedin"/>
            </a>
        </nav>
    </header>
  )
}

export { Header };