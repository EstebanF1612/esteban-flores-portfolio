import "../styles/Experience.css";
import { useEffect, useMemo, useState } from "react";
import { fetchCollectionData } from "../data/firestoreData";
import { useNavigate } from "react-router-dom";

// import lidersis from "../assets/logo-lidersis.png";
// import tru from "../assets/logo-tru.png";
// import sericonfarm from "../assets/logo-sericonfarm.png";

const monthYearFormatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
});

function formatMonthYear(value) {
    if (!value) {
        return "Present";
    }

    const [year, month] = value.split("-").map(Number);

    if (!year || !month) {
        return value;
    }

    return monthYearFormatter.format(new Date(year, month - 1));
}

export default function Experience({ limit }) {
    const navigate = useNavigate();
    const [experienceData, setExperienceData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function loadExperience() {
            try {
                const data = await fetchCollectionData("experience");
                if (isMounted) {
                    setExperienceData(data);
                }
            } catch (error) {
                if (isMounted) {
                    setLoadError("Unable to load experience right now.");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadExperience();

        return () => {
            isMounted = false;
        };
    }, []);

    // Sort logic: Most recent first
    const sortedExperience = useMemo(() => {
        return [...experienceData].sort((a, b) => {
            const dateA = new Date(a.startDate);
            const dateB = new Date(b.startDate);
            return dateB - dateA; // Sorts descending
        });
    }, [experienceData]);

    const projectedExperience = limit ? sortedExperience.slice(0, limit) : sortedExperience;

    return (
        <section className="Experience">
            <h1>Experience</h1>
            {isLoading && <p>Loading experience...</p>}
            {loadError && <p>{loadError}</p>}
            <ul className="timeline">
                {projectedExperience.map(exp => (
                    <li key={exp.id} className="timeline-event">
                        <label className="timeline-event-icon"></label>
                        <div className="timeline-event-copy">
                            <p className="timeline-event-thumbnail">{formatMonthYear(exp.startDate)} - {formatMonthYear(exp.endDate)}</p>
                            <h3>{exp.company}</h3>
                            <h4>{exp.role}</h4>
                            <p className="timeline-short-desc">{exp.shortDesc}</p>
                            <p className="timeline-skills">Skills: {Array.isArray(exp.skills) ? exp.skills.join(", ") : exp.skills}</p>
                            <button
                                className="outline timeline-details-button"
                                onClick={() => navigate(`/detail/experience/${exp.id}`)}
                            >
                                See Details
                            </button>
                        </div>
                    </li>
                ))}
            </ul>





            {/* <div className="experience-grid">
                <div className="card">
                    <div className="card-inner">
                        <div className="card-front">
                            <img src={lidersis} className="" />
                            <h2>Lidersis Ecuador</h2>
                            <h3>Software Engineer Intern</h3>
                        </div>
                        <div className="card-back">
                            <p>Collaborated in the development of front-end and back-end logic as well as UI programming for a stock management app delivered to a multi-national company</p>
                            <p className="skills-text">Skills: Software Development,  CI/CD Pipelines, Git, GitHub, SQL, JavaScript, Typescript, React.Js and Firestore Database</p>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-inner">
                        <div className="card-front">
                            <img src={tru} />
                            <h2>Thompson Rivers University</h2>
                            <h3>Undergraduate Research Assistant</h3>
                        </div>
                        <div className="card-back">
                            <p>Research Assistant for a Cloud Computing Project. Responsible for performing an analysis on the cloud computing job market, ACM CS 2023 curricula and industry standards to propose a new course structure that will better prepare students for the job market</p>
                            <p className="skills-text">Skills: Cloud Computing, Cloud Infrastructure, CI/CD Pipelines</p>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-inner">
                        <div className="card-front">
                            <img src={sericonfarm} />
                            <h2>Sericonfarm</h2>
                            <h3>Account Executive</h3>
                        </div>
                        <div className="card-back">
                            <p>Managed several client portfolio recovery accounts. Collaborated in obtaining 2 more clients for the company by building and maintaining strong client relationships</p>
                            <p className="skills-text">Skills: Microsoft Office, Excel, Business Structure and Processes, Decision Making, Analytical Skills, Time Management, Communication, Client Relations.</p>
                        </div>
                    </div>
                </div>
            </div> */}
        </section>
    );
}