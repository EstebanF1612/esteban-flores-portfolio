import { useState, useEffect } from "react";
import "../styles/About.css";

// ===== CUSTOMIZE: Add or replace image paths here =====
const backgroundImages = [
    "about_1.png",
    "about_2.jpg",
    "about_3.jpg",
];

export default function About() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        if (backgroundImages.length === 0) return;

        const interval = setInterval(() => {
            setIsFading(true);
            
            setTimeout(() => {
                setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
                setIsFading(false);
            }, 500); // Fade duration
        }, 5000); // Change every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const currentImage = backgroundImages[currentImageIndex];

    return (
        <section className="About">
            <div
                className="about-bg-image"
                style={{
                    backgroundImage: `url(/src/assets/${currentImage})`,
                    opacity: isFading ? 0.3 : 1,
                    transition: "opacity 500ms ease-in-out",
                }}
            ></div>
            <div className="about-overlay"></div>
            <div className="about-content-box">
                <h1>About Me</h1>
                <p>
                    Hello! I'm Esteban, a passionate software engineer with a strong
                    background in game development and software engineering. I have
                    experience working with a variety of programming languages and
                    technologies, including C++, Python, Unreal Engine, and web
                    development frameworks. I enjoy creating immersive gaming experiences
                    and innovative software solutions that solve real-world problems. In
                    my free time, I like to explore new technologies, contribute to
                    open-source projects, and stay up-to-date with the latest trends in
                    the tech industry.
                </p>
            </div>
        </section>
    );
}