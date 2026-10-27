import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar() {
    const location = useLocation();

    const handleHomeClick = (e) => {
        if (location.pathname === "/") {
            e.preventDefault();
            const element = document.getElementById("hero");
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        }
    };

    const handleProjectsClick = (e) => {
        if (location.pathname === "/projects") {
            e.preventDefault();
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        }
    };

    return (
        <nav className="navbar">
            <h2 className="nav-name"><Link to="/" style={{ textDecoration: "none", color: "inherit", fontWeight: "bold" }}>Esteban Flores</Link></h2>

            <ul className="nav-links">
                <li><Link to="/" onClick={handleHomeClick}>Home</Link></li>
                <li><Link to="/projects" onClick={handleProjectsClick}>Projects</Link></li>
                <li><Link to="/#skills">Skills</Link></li>
                <li><Link to="/#experience">Experience</Link></li>
                <li><Link to="/#about">About Me</Link></li>
            </ul>

            <Link to="/contact" className="nav-btn">Contact Me</Link>
        </nav>
    );
}