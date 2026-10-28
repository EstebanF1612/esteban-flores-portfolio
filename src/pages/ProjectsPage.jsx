import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCollectionData } from "../data/firestoreData";
import { projectData as fallbackProjectData } from "../data/projectData";
import "../styles/ProjectsPage.css";

const projectAssets = import.meta.glob("../assets/*", { eager: true });
const PROJECTS_PER_PAGE = 10;

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

function normalizeOption(value) {
    return String(value || "").trim().toLowerCase();
}

function toDisplayLabel(normalizedValue) {
    if (!normalizedValue) {
        return "";
    }

    return normalizedValue
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function buildNormalizedOptions(items) {
    const unique = new Map();

    items.forEach((item) => {
        const normalized = normalizeOption(item);
        if (normalized && !unique.has(normalized)) {
            unique.set(normalized, toDisplayLabel(normalized));
        }
    });

    return [...unique.entries()]
        .map(([value, label]) => ({ value, label }))
        .sort((a, b) => a.label.localeCompare(b.label));
}

export default function ProjectsPage() {
    const navigate = useNavigate();
    const [projectData, setProjectData] = useState(fallbackProjectData);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState("");

    const [search, setSearch] = useState("");
    const [topicFilter, setTopicFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [skillFilter, setSkillFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        let isMounted = true;

        async function loadProjects() {
            try {
                const data = await fetchCollectionData("projects");
                if (isMounted) {
                    setProjectData(data.length > 0 ? data : fallbackProjectData);
                }
            } catch (error) {
                console.error("Failed to load projects from Firestore:", error);
                if (isMounted) {
                    setLoadError("");
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

    const sortedProjects = useMemo(() => {
        return [...projectData].sort((a, b) => {
            const dateA = new Date(a.updateDate || a.creationDate);
            const dateB = new Date(b.updateDate || b.creationDate);
            return dateB - dateA;
        });
    }, [projectData]);

    const topicOptions = useMemo(() => {
        return buildNormalizedOptions(sortedProjects.map((project) => project.topic));
    }, [sortedProjects]);

    const typeOptions = useMemo(() => {
        return buildNormalizedOptions(sortedProjects.map((project) => project.type));
    }, [sortedProjects]);

    const skillOptions = useMemo(() => {
        return buildNormalizedOptions(sortedProjects.flatMap((project) => project.skills || []));
    }, [sortedProjects]);

    const filteredProjects = useMemo(() => {
        const normalizedSearch = normalizeOption(search);

        return sortedProjects.filter((project) => {
            const title = normalizeOption(project.title);
            const topic = normalizeOption(project.topic);
            const type = normalizeOption(project.type);
            const skills = (project.skills || []).map((skill) => normalizeOption(skill));

            const matchesSearch = !normalizedSearch || title.includes(normalizedSearch);
            const matchesTopic = !topicFilter || topic === topicFilter;
            const matchesType = !typeFilter || type === typeFilter;
            const matchesSkill = !skillFilter || skills.includes(skillFilter);

            return matchesSearch && matchesTopic && matchesType && matchesSkill;
        });
    }, [sortedProjects, search, topicFilter, typeFilter, skillFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE));

    const paginatedProjects = useMemo(() => {
        const start = (currentPage - 1) * PROJECTS_PER_PAGE;
        return filteredProjects.slice(start, start + PROJECTS_PER_PAGE);
    }, [filteredProjects, currentPage]);

    const pageNumbers = useMemo(() => {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }, [totalPages]);

    function handleSearchChange(event) {
        setSearch(event.target.value);
        setCurrentPage(1);
    }

    function handleTopicChange(event) {
        setTopicFilter(event.target.value);
        setCurrentPage(1);
    }

    function handleTypeChange(event) {
        setTypeFilter(event.target.value);
        setCurrentPage(1);
    }

    function handleSkillChange(event) {
        setSkillFilter(event.target.value);
        setCurrentPage(1);
    }

    function handlePrevPage() {
        setCurrentPage((prev) => Math.max(1, prev - 1));
    }

    function handleNextPage() {
        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
    }

    function goToPage(page) {
        setCurrentPage(page);
    }

    return (
        <main className="projects-page">
            <section className="projects-page-header">
                <h1>All My Projects</h1>
                <p>Search and filter by topic, type, and skills.</p>
            </section>

            <section className="projects-controls" aria-label="Project filters">
                <input
                    type="text"
                    value={search}
                    onChange={handleSearchChange}
                    placeholder="Search by project name"
                    className="projects-search"
                    aria-label="Search by project name"
                />

                <select value={topicFilter} onChange={handleTopicChange} className="projects-select" aria-label="Filter by topic">
                    <option value="">All Topics</option>
                    {topicOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>

                <select value={typeFilter} onChange={handleTypeChange} className="projects-select" aria-label="Filter by type">
                    <option value="">All Types</option>
                    {typeOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>

                <select value={skillFilter} onChange={handleSkillChange} className="projects-select" aria-label="Filter by skill">
                    <option value="">All Skills</option>
                    {skillOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </section>

            <section className="projects-list" aria-live="polite">
                {isLoading && <p className="projects-empty">Loading projects...</p>}
                {loadError && <p className="projects-empty">{loadError}</p>}
                {paginatedProjects.length === 0 && (
                    <p className="projects-empty">No projects found with the selected filters.</p>
                )}

                {paginatedProjects.map((project) => (
                    <article key={project.id} className="projects-list-item">
                        <img
                            src={resolveProjectImage(project.frontImg)}
                            alt={project.title}
                            className="project-list-image"
                        />

                        <div className="project-list-content">
                            <h2>{project.title}</h2>
                            <p className="project-updated">Last Update: {formatUpdatedDate(project.updateDate)}</p>
                            <p className="project-description">{project.shortDesc}</p>
                            <button
                                type="button"
                                className="project-learn-more"
                                onClick={() => navigate(`/detail/project/${project.id}`)}
                            >
                                Learn More
                            </button>
                        </div>
                    </article>
                ))}
            </section>

            <nav className="projects-pagination" aria-label="Projects pagination">
                <button type="button" onClick={handlePrevPage} disabled={currentPage === 1}>
                    <span aria-hidden="true">&lt;</span>
                    <span className="sr-only">Previous page</span>
                </button>

                {pageNumbers.map((page) => (
                    <button
                        key={page}
                        type="button"
                        className={page === currentPage ? "active" : ""}
                        onClick={() => goToPage(page)}
                        aria-current={page === currentPage ? "page" : undefined}
                    >
                        {page}
                    </button>
                ))}

                <button type="button" onClick={handleNextPage} disabled={currentPage === totalPages}>
                    <span aria-hidden="true">&gt;</span>
                    <span className="sr-only">Next page</span>
                </button>
            </nav>
        </main>
    );
}
