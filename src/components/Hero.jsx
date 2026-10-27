import "../styles/Hero.css";
import heroPic from "../assets/hero-pic.svg";
import downArrow from "../assets/downarrow.svg";

export default function Hero() {
    return (
        <header className="hero">
            <div className="overlay"></div>
            <div className="hero-content">
                <div className="hero-image">
                    <img src={heroPic} alt="Hero Image" className="heropic"/>
                </div>
                <div className="hero-text">
                    <h2>Hello,</h2>
                    <h1>I'm <span>Esteban Flores</span></h1>
                    <p>Software Engineer Co-Op Student with Experience in AI, Full-Stack Web and Mobile App Development.</p>
                    <div className="hero-buttons">
                        <button> Download Resume</button>
                    </div>
                    <div className="downpointer">
                        <img src={downArrow} alt="Down Arrow" className="downarrowpic"/>
                    </div>
                </div>
                
            </div>
        </header>
    );
}