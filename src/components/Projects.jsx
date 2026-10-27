import { useEffect, useMemo, useState } from "react";
import { fetchCollectionData } from "../data/firestoreData";
import { useNavigate } from "react-router-dom";
import "../styles/Projects.css";

const projectAssets = import.meta.glob("../assets/*", { eager: true });

const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
});

function formatUpdatedDate(dateValue) {
    if (!dateValue) {
        return "Recently updated";
    }

    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) {
        return dateValue;
    }

    return fullDateFormatter.format(parsedDate);
}

function resolveProjectImage(frontImg) {
    if (!frontImg) {
        return "https://graphics.stanford.edu/~henrik/images/imgs/cornellbox.jpg";
    }

    if (/^https?:\/\//i.test(frontImg)) {
        return frontImg;
    }

    const matchedImage = projectAssets[`../assets/${frontImg}`];
    return matchedImage?.default || "https://graphics.stanford.edu/~henrik/images/imgs/cornellbox.jpg";
}

export default function Projects({ limit }) {
    const navigate = useNavigate();
    const [projectData, setProjectData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function loadProjects() {
            try {
                const data = await fetchCollectionData("projects");
                if (isMounted) {
                    setProjectData(data);
                }
            } catch (error) {
                if (isMounted) {
                    setLoadError("Unable to load projects right now.");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadProjects();

        return () => {
            isMounted = false;
        };
    }, []);

    function openProjectDetail(projectId) {
        navigate(`/detail/project/${projectId}`);
    }

    // Sort logic: Most recent first
    const sortedProjects = useMemo(() => {
        return [...projectData].sort((a, b) => {
            const dateA = new Date(a.updateDate || a.creationDate);
            const dateB = new Date(b.updateDate || b.creationDate);
            return dateB - dateA; // Sorts descending
        });
    }, [projectData]);

    const projectedProjects = limit ? sortedProjects.slice(0, limit) : sortedProjects;
    return (
        <section className="Projects">
            <h2>Most Recent Projects</h2>
            {isLoading && <p>Loading projects...</p>}
            {loadError && <p>{loadError}</p>}
            <div className="projects-grid">
                {projectedProjects.map((project) => (
                    <div key={project.id} className="project-card-wrap">
                        <button
                            type="button"
                            className="article-card"
                            onClick={() => openProjectDetail(project.id)}
                            aria-label={`Open details for ${project.title}`}
                        >
                            <img src={resolveProjectImage(project.frontImg)} alt={project.title} />
                            <div className="content">
                                <p className="date">Updated: {formatUpdatedDate(project.updateDate)}</p>
                                <p className="title">{project.title}</p>
                            </div>
                        </button>
                        <button
                            type="button"
                            className="learn-more"
                            onClick={() => openProjectDetail(project.id)}
                        >
                            Learn More
                        </button>
                    </div>
                ))}
            </div>

            <button
                type="button"
                className="see-all-projects-btn"
                onClick={() => navigate("/projects")}
            >
                See All Projects
            </button>
        </section>
    );
}
