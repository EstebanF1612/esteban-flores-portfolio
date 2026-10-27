import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../components/Hero";
import Skills from "../components/Skills";
import Experience from "../components/Experience";
import Projects from "../components/Projects";
import About from "../components/About";

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash.substring(1); // Remove the # symbol
    if (hash) {
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location.hash]);

  return (
    <>
      <div id="hero">
        <Hero />
      </div>
      <Projects limit={3} />
      <div id="skills">
        <Skills />
      </div>
      <div id="experience">
        <Experience limit={3} />
      </div>
      
      <div id="about">
        <About />
      </div>
    </>
  );
}