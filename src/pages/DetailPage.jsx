import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchDocumentData } from "../data/firestoreData";
import { experienceData as fallbackExperienceData } from "../data/experienceData";
import { projectData as fallbackProjectData } from "../data/projectData";
import "../styles/DetailPage.css";

const detailAssets = import.meta.glob("../assets/*", { eager: true });
const detailDateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
});

function resolveDetailImage(imageName) {
    if (!imageName) {
        return "";
    }

    if (/^https?:\/\//i.test(imageName)) {
        return imageName;
    }

    const matchedImage = detailAssets[`../assets/${imageName}`];
    return matchedImage?.default || `/assets/${imageName}`;
}

function parseVideoLink(videoLink) {
    const rawLink = String(videoLink || "").trim();
    if (!rawLink) {
        return null;
    }

    const youtubeMatch = rawLink.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (youtubeMatch?.[1]) {
        return {
            type: "embed",
            src: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
        };
    }

    const vimeoMatch = rawLink.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch?.[1]) {
        return {
            type: "embed",
            src: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
        };
    }

    return {
        type: "file",
        src: rawLink,
    };
}

function formatDetailDate(dateValue) {
    if (!dateValue) {
        return "Unknown";
    }

    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) {
        return dateValue;
    }

    return detailDateFormatter.format(parsed);
}

function formatEmploymentDate(dateValue) {
    if (!dateValue) {
        return "";
    }

    const [year, month] = String(dateValue).split("-").map(Number);
    if (!year || !month) {
        return dateValue;
    }

    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
    }).format(new Date(year, month - 1));
}

function renderTextWithLinks(text, keyPrefix) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    const textStr = String(text);
    const result = [];
    let lastIndex = 0;
    let componentIndex = 0;

    // First, handle markdown-style links [text](url)
    const markdownRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const matches = [...textStr.matchAll(markdownRegex)];

    if (matches.length > 0) {
        matches.forEach((match) => {
            const [fullMatch, linkText, url] = match;
            const matchIndex = match.index;

            // Add text before the link
            if (matchIndex > lastIndex) {
                const textBefore = textStr.substring(lastIndex, matchIndex);
                // Check for direct URLs in the text before
                const beforeParts = textBefore.split(urlRegex);
                beforeParts.forEach((part) => {
                    if (/^https?:\/\//.test(part)) {
                        result.push(
                            <a
                                key={`${keyPrefix}-${componentIndex++}`}
                                href={part}
                                target="_blank"
                                rel="noreferrer"
                                className="detail-link"
                            >
                                {part}
                            </a>
                        );
                    } else if (part) {
                        result.push(
                            <span key={`${keyPrefix}-${componentIndex++}`}>{part}</span>
                        );
                    }
                });
            }

            // Add the markdown link
            result.push(
                <a
                    key={`${keyPrefix}-${componentIndex++}`}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="detail-link detail-markdown-link"
                >
                    {linkText}
                </a>
            );

            lastIndex = matchIndex + fullMatch.length;
        });

        // Handle remaining text after last markdown link
        if (lastIndex < textStr.length) {
            const textAfter = textStr.substring(lastIndex);
            const afterParts = textAfter.split(urlRegex);
            afterParts.forEach((part) => {
                if (/^https?:\/\//.test(part)) {
                    result.push(
                        <a
                            key={`${keyPrefix}-${componentIndex++}`}
                            href={part}
                            target="_blank"
                            rel="noreferrer"
                            className="detail-link"
                        >
                            {part}
                        </a>
                    );
                } else if (part) {
                    result.push(
                        <span key={`${keyPrefix}-${componentIndex++}`}>{part}</span>
                    );
                }
            });
        }

        return result;
    }

    // If no markdown links, handle only direct URLs
    const parts = textStr.split(urlRegex);
    return parts.map((part, partIndex) => {
        if (/^https?:\/\//.test(part)) {
            return (
                <a
                    key={`${keyPrefix}-${partIndex}`}
                    href={part}
                    target="_blank"
                    rel="noreferrer"
                    className="detail-link"
                >
                    {part}
                </a>
            );
        }

        return <span key={`${keyPrefix}-${partIndex}`}>{part}</span>;
    });
}


export default function DetailPage() {
    const { category, id } = useParams();
    const isExperienceDetail = category === "experience";
    const [item, setItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [expandedImage, setExpandedImage] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function loadDetail() {
            setLoadError("");
            const fallbackData = isExperienceDetail ? fallbackExperienceData : fallbackProjectData;
            const fallbackItem = fallbackData.find((entry) => entry.id === id) || null;

            try {
                const collectionName = isExperienceDetail ? "experience" : "projects";
                const data = await fetchDocumentData(collectionName, id);
                if (isMounted) {
                    setItem(data || fallbackItem);
                }
            } catch (error) {
                console.error("Failed to load detail from Firestore:", error);
                if (isMounted) {
                    setLoadError("");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        if (id && (category === "experience" || category === "project")) {
            const fallbackData = isExperienceDetail ? fallbackExperienceData : fallbackProjectData;
            setItem(fallbackData.find((entry) => entry.id === id) || null);
            setIsLoading(false);
            loadDetail();
        } else {
            setItem(null);
            setIsLoading(false);
        }

        return () => {
            isMounted = false;
        };
    }, [category, id, isExperienceDetail]);

    useEffect(() => {
        if (!expandedImage) {
            return undefined;
        }

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        function handleEscKey(event) {
            if (event.key === "Escape") {
                setExpandedImage(null);
            }
        }

        window.addEventListener("keydown", handleEscKey);

        return () => {
            window.removeEventListener("keydown", handleEscKey);
            document.body.style.overflow = originalOverflow;
        };
    }, [expandedImage]);

    if (isLoading) {
        return (
            <main className="detail-page">
                <article className="detail-container">
                    <h1 className="detail-title">Loading...</h1>
                    <p className="detail-text">Fetching post details from database.</p>
                </article>
            </main>
        );
    }

    if (loadError) {
        return (
            <main className="detail-page">
                <article className="detail-container">
                    <h1 className="detail-title">Unable to Load Content</h1>
                    <p className="detail-text">{loadError}</p>
                </article>
            </main>
        );
    }

    if (!item) {
        return (
            <main className="detail-page">
                <article className="detail-container">
                    <h1 className="detail-title">Content Not Found</h1>
                    <p className="detail-text">The requested post could not be found.</p>
                </article>
            </main>
        );
    }

    const companyLogoSource = isExperienceDetail
        ? resolveDetailImage(
            item.logoLink || item.logoUrl || item.companyLogo || item.companyLogoLink || item.logo
        )
        : "";

    return (
        <main className="detail-page">
            <article className="detail-container">
                {isExperienceDetail ? (
                    <section className="detail-title-row">
                        <div className="detail-title-group">
                            <h1 className="detail-title">{item.company || item.title}</h1>
                            {item.role && (
                                <h2 className="detail-subtitle">{item.role}</h2>
                            )}
                        </div>
                        {companyLogoSource && (
                            <img
                                src={companyLogoSource}
                                alt={`${item.company || "Company"} logo`}
                                className="detail-company-logo"
                                loading="lazy"
                            />
                        )}
                    </section>
                ) : (
                    <h1 className="detail-title">{item.company || item.title}</h1>
                )}
                <header className="detail-header">
                    {isExperienceDetail ? (
                        <>
                            <p className="detail-dates">Start of Employment: {formatEmploymentDate(item.startDate)}</p>
                            {item.endDate && (
                                <p className="detail-dates">End of Employment: {formatEmploymentDate(item.endDate)}</p>
                            )}
                        </>
                    ) : (
                        <>
                            <p className="detail-dates">Last Updated: {formatDetailDate(item.updateDate || item.creationDate)}</p>
                            <p className="detail-dates">Created: {formatDetailDate(item.creationDate)}</p>
                        </>
                    )}
                </header>

                {(item.content || []).map((block, index) => {
                    if (block.type === "text") {
                        if (!block.value) {
                            return null;
                        }

                        return (
                            <p key={index} className="detail-text">
                                {renderTextWithLinks(block.value, `text-${index}`)}
                            </p>
                        );
                    }

                    if (block.type === "subheader") {
                        if (!block.value) {
                            return null;
                        }

                        return (
                            <h3 key={index} className="detail-subheader">
                                {block.value}
                            </h3>
                        );
                    }

                    if (block.type === "list") {
                        if (!block.value || !Array.isArray(block.value) || block.value.length === 0) {
                            return null;
                        }

                        return (
                            <ul key={index} className="detail-list">
                                {block.value.map((item, itemIndex) => (
                                    <li 
                                        key={itemIndex} 
                                        className="detail-list-item"
                                        style={{ marginLeft: `${item.level * 24}px` }}
                                    >
                                        {renderTextWithLinks(item.text, `list-${index}-${itemIndex}`)}
                                    </li>
                                ))}
                            </ul>
                        );
                    }

                    if (block.type === "image") {
                        const imageSource = resolveDetailImage(block.value);
                        if (!imageSource) {
                            return null;
                        }

                        return (
                            <figure key={index} className="detail-image-container">
                                <button
                                    type="button"
                                    className="detail-image-button"
                                    onClick={() => setExpandedImage({
                                        src: imageSource,
                                        alt: block.caption || "Project detail",
                                    })}
                                    aria-label="Open full image"
                                >
                                    <img src={imageSource} alt={block.caption || "Project detail"} className="detail-image-source" />
                                </button>
                                <p className="detail-image-hint">Click to show full image</p>
                                {block.caption && (
                                    <figcaption className="detail-image-caption">{block.caption}</figcaption>
                                )}
                            </figure>
                        );
                    }

                    if (block.type === "video") {
                        const videoData = parseVideoLink(block.value);
                        if (!videoData) {
                            return null;
                        }

                        return (
                            <figure key={index} className="detail-video-container">
                                {videoData.type === "embed" ? (
                                    <iframe
                                        src={videoData.src}
                                        className="detail-video-embed"
                                        title={block.caption || "Entry video"}
                                        loading="lazy"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    />
                                ) : (
                                    <video className="detail-video-player" controls preload="metadata">
                                        <source src={videoData.src} />
                                        Your browser does not support the video tag.
                                    </video>
                                )}
                                {block.caption && (
                                    <figcaption className="detail-image-caption">{block.caption}</figcaption>
                                )}
                            </figure>
                        );
                    }

                    return null;
                })}

                {Array.isArray(item.skills) && item.skills.length > 0 && (
                    <section className="detail-skills-section" aria-label="Skills used in this entry">
                        <h3 className="detail-skills-title">Skills</h3>
                        <div className="detail-skills-list">
                            {item.skills.map((skill, index) => (
                                <span key={`${skill}-${index}`} className="detail-skill-pill">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>
                )}
            </article>

            {expandedImage && (
                <div
                    className="detail-image-overlay"
                    onClick={() => setExpandedImage(null)}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Expanded image preview"
                >
                    <button
                        type="button"
                        className="detail-image-overlay-close"
                        onClick={() => setExpandedImage(null)}
                        aria-label="Close full image"
                    >
                        Close
                    </button>
                    <img
                        src={expandedImage.src}
                        alt={expandedImage.alt}
                        className="detail-image-overlay-content"
                        onClick={(event) => event.stopPropagation()}
                    />
                </div>
            )}
        </main>
    );
}