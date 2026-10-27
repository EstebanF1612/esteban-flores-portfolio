import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, storage } from "../firebaseConfig";
import { deleteDocumentData, fetchCollectionData, setDocumentData } from "../data/firestoreData";
import { experienceData as fallbackExperienceData } from "../data/experienceData";
import { projectData as fallbackProjectData } from "../data/projectData";
import { skillsData as fallbackSkillsData } from "../data/skillsData";
import "../styles/DetailPage.css";
import "../styles/AdminPanel.css";

const EMPTY_TEXT_BLOCK = { type: "text", value: "" };
const EMPTY_SUBHEADER_BLOCK = { type: "subheader", value: "" };
const EMPTY_LIST_BLOCK = { type: "list", value: [{ text: "", level: 0 }] };
const EMPTY_IMAGE_BLOCK = { type: "image", value: "", caption: "" };
const EMPTY_VIDEO_BLOCK = { type: "video", value: "", caption: "" };

const COMMON_SKILL_TYPES = [
    "Tools & Technologies",
    "Industry Knowledge",
    "Interpersonal Skills",
    "Programming Languages",
    "Frameworks",
    "Databases",
    "Cloud",
    "Other",
];

function cloneValue(value) {
    return JSON.parse(JSON.stringify(value));
}

function slugify(value) {
    return String(value || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function todayIsoDate() {
    return new Date().toISOString().slice(0, 10);
}

function normalizeSkills(value) {
    if (Array.isArray(value)) {
        return value.filter(Boolean).map((item) => String(item).trim());
    }

    if (typeof value === "string") {
        return value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
}

function normalizeBlock(block) {
    const safeBlock = block || {};

    if (safeBlock.type === "list") {
        return {
            type: "list",
            value: Array.isArray(safeBlock.value) && safeBlock.value.length > 0
                ? safeBlock.value.map((item) => ({
                    text: item?.text || "",
                    level: Number.isFinite(Number(item?.level)) ? Number(item.level) : 0,
                }))
                : [{ text: "", level: 0 }],
        };
    }

    if (safeBlock.type === "image" || safeBlock.type === "video") {
        return {
            type: safeBlock.type,
            value: safeBlock.value || "",
            caption: safeBlock.caption || "",
        };
    }

    if (safeBlock.type === "subheader") {
        return {
            type: "subheader",
            value: safeBlock.value || "",
        };
    }

    return {
        type: "text",
        value: safeBlock.value || "",
    };
}

function normalizeDetailBlocks(blocks) {
    if (!Array.isArray(blocks) || blocks.length === 0) {
        return [cloneValue(EMPTY_TEXT_BLOCK)];
    }

    return blocks.map(normalizeBlock);
}

function normalizeExperienceRecord(record = {}) {
    return {
        id: String(record.id || ""),
        startDate: record.startDate || "",
        endDate: record.endDate || "",
        company: record.company || "",
        role: record.role || "",
        logo: record.logo || record.logoUrl || record.logoLink || "",
        shortDesc: record.shortDesc || "",
        skills: normalizeSkills(record.skills),
        content: normalizeDetailBlocks(record.content),
    };
}

function normalizeProjectRecord(record = {}) {
    return {
        id: String(record.id || ""),
        creationDate: record.creationDate || "",
        updateDate: record.updateDate || todayIsoDate(),
        title: record.title || "",
        type: record.type || "",
        topic: record.topic || "",
        frontImg: record.frontImg || "",
        shortDesc: record.shortDesc || "",
        skills: normalizeSkills(record.skills),
        content: normalizeDetailBlocks(record.content),
    };
}

function normalizeSkillRecord(record = {}) {
    return {
        id: String(record.id || ""),
        name: record.name || "",
        type: record.type || "Tools & Technologies",
        asset: record.asset || "",
        invert: Boolean(record.invert),
    };
}

function createBlankExperience() {
    return {
        id: "",
        startDate: "",
        endDate: "",
        company: "",
        role: "",
        logo: "",
        shortDesc: "",
        skills: [],
        content: [cloneValue(EMPTY_TEXT_BLOCK)],
    };
}

function createBlankProject() {
    return {
        id: "",
        creationDate: todayIsoDate(),
        updateDate: todayIsoDate(),
        title: "",
        type: "",
        topic: "",
        frontImg: "",
        shortDesc: "",
        skills: [],
        content: [cloneValue(EMPTY_TEXT_BLOCK)],
    };
}

function createBlankSkill() {
    return {
        id: "",
        name: "",
        type: "Tools & Technologies",
        asset: "",
        invert: false,
    };
}

function suggestSkillAsset(skillName) {
    const normalized = String(skillName || "").toLowerCase();
    const suggestions = [
        { match: ["unreal engine", "unreal"], asset: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/unrealengine/unrealengine-original.svg" },
        { match: ["python"], asset: "https://www.svgrepo.com/show/452091/python.svg" },
        { match: ["c++", "cpp"], asset: "https://www.svgrepo.com/show/452183/cpp.svg" },
        { match: ["react"], asset: "https://www.svgrepo.com/show/452092/react.svg" },
        { match: ["javascript", "js"], asset: "https://www.svgrepo.com/show/349419/javascript.svg" },
        { match: ["typescript", "ts"], asset: "https://www.svgrepo.com/show/374146/typescript-official.svg" },
        { match: ["firebase"], asset: "https://www.svgrepo.com/show/373595/firebase.svg" },
        { match: ["html"], asset: "https://www.svgrepo.com/show/452228/html-5.svg" },
        { match: ["css"], asset: "https://www.svgrepo.com/show/452185/css-3.svg" },
        { match: ["blender"], asset: "https://www.svgrepo.com/show/353488/blender.svg" },
        { match: ["asp.net", "aspnet", ".net"], asset: "https://www.svgrepo.com/show/508894/aspnet.svg" },
        { match: ["sql"], asset: "https://www.svgrepo.com/show/331761/sql-database-sql-azure.svg" },
        { match: ["arduino"], asset: "https://www.svgrepo.com/show/373950/arduino.svg" },
        { match: ["linux"], asset: "https://www.svgrepo.com/show/448236/linux.svg" },
        { match: ["github"], asset: "https://www.svgrepo.com/show/512317/github-142.svg" },
    ];

    const suggestion = suggestions.find((entry) => entry.match.some((word) => normalized.includes(word)));
    if (suggestion) {
        return suggestion.asset;
    }

    const slug = slugify(skillName).replace(/[^a-z0-9]/g, "");
    if (!slug) {
        return "";
    }

    return `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-original.svg`;
}

function renderBlockPreview(block, index) {
    if (block.type === "subheader") {
        return block.value ? <h3 key={index} className="detail-subheader">{block.value}</h3> : null;
    }

    if (block.type === "list") {
        if (!Array.isArray(block.value) || block.value.length === 0) {
            return null;
        }

        return (
            <ul key={index} className="detail-list">
                {block.value.map((item, itemIndex) => (
                    <li key={`${index}-${itemIndex}`} className="detail-list-item" style={{ marginLeft: `${Number(item.level || 0) * 24}px` }}>
                        {item.text}
                    </li>
                ))}
            </ul>
        );
    }

    if (block.type === "image") {
        if (!block.value) {
            return null;
        }

        return (
            <figure key={index} className="detail-image-container">
                <img src={block.value} alt={block.caption || "Preview"} className="detail-image-source" />
                {block.caption && <figcaption className="detail-image-caption">{block.caption}</figcaption>}
            </figure>
        );
    }

    if (block.type === "video") {
        if (!block.value) {
            return null;
        }

        return (
            <p key={index} className="detail-text">
                Video: {block.value}
                {block.caption ? ` - ${block.caption}` : ""}
            </p>
        );
    }

    return block.value ? <p key={index} className="detail-text">{block.value}</p> : null;
}

async function loadCollectionOrFallback(collectionName, fallbackData) {
    try {
        const data = await fetchCollectionData(collectionName);
        if (Array.isArray(data) && data.length > 0) {
            return data;
        }
    } catch {
        // Fall back to the local seed data when Firestore is empty or unavailable.
    }

    return cloneValue(fallbackData);
}

async function uploadAdminAsset(file, collectionName, documentId, folderName) {
    const safeDocumentId = documentId || "draft";
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `admin-panel/${collectionName}/${safeDocumentId}/${folderName}/${fileName}`;
    const fileReference = storageRef(storage, filePath);
    await uploadBytes(fileReference, file);
    return getDownloadURL(fileReference);
}

function ChipsInput({ label, value, onChange, placeholder }) {
    const [chipText, setChipText] = useState("");

    function addChip() {
        const nextChip = chipText.trim();
        if (!nextChip) {
            return;
        }

        onChange([...value, nextChip]);
        setChipText("");
    }

    return (
        <div className="admin-field admin-chips-field">
            <label>{label}</label>
            <div className="admin-chips-row">
                <input
                    type="text"
                    value={chipText}
                    placeholder={placeholder}
                    onChange={(event) => setChipText(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            addChip();
                        }
                    }}
                />
                <button type="button" onClick={addChip}>Add</button>
            </div>
            <div className="admin-chip-list">
                {value.map((chip, index) => (
                    <button
                        key={`${chip}-${index}`}
                        type="button"
                        className="admin-chip"
                        onClick={() => onChange(value.filter((_, chipIndex) => chipIndex !== index))}
                    >
                        {chip} ×
                    </button>
                ))}
            </div>
        </div>
    );
}

function BlockEditor({ blocks, onChange, collectionLabel }) {
    function updateBlock(index, nextBlock) {
        const nextBlocks = blocks.map((block, blockIndex) => (blockIndex === index ? nextBlock : block));
        onChange(nextBlocks);
    }

    function removeBlock(index) {
        onChange(blocks.filter((_, blockIndex) => blockIndex !== index));
    }

    function moveBlock(index, direction) {
        const nextIndex = index + direction;
        if (nextIndex < 0 || nextIndex >= blocks.length) {
            return;
        }

        const nextBlocks = [...blocks];
        [nextBlocks[index], nextBlocks[nextIndex]] = [nextBlocks[nextIndex], nextBlocks[index]];
        onChange(nextBlocks);
    }

    function addListRow(blockIndex) {
        const nextBlock = normalizeBlock(blocks[blockIndex]);
        nextBlock.value = [...nextBlock.value, { text: "", level: 0 }];
        updateBlock(blockIndex, nextBlock);
    }

    function uploadIntoBlock(file, blockIndex) {
        return uploadAdminAsset(file, collectionLabel, "draft", "content")
            .then((url) => {
                const nextBlock = normalizeBlock(blocks[blockIndex]);
                nextBlock.value = url;
                updateBlock(blockIndex, nextBlock);
            });
    }

    return (
        <div className="admin-block-editor">
            <div className="admin-block-toolbar-shell">
                <div className="admin-block-toolbar">
                    <button type="button" onClick={() => onChange([...blocks, cloneValue(EMPTY_TEXT_BLOCK)])}>Add Text</button>
                    <button type="button" onClick={() => onChange([...blocks, cloneValue(EMPTY_SUBHEADER_BLOCK)])}>Add Subheader</button>
                    <button type="button" onClick={() => onChange([...blocks, cloneValue(EMPTY_LIST_BLOCK)])}>Add List</button>
                    <button type="button" onClick={() => onChange([...blocks, cloneValue(EMPTY_IMAGE_BLOCK)])}>Add Image</button>
                    <button type="button" onClick={() => onChange([...blocks, cloneValue(EMPTY_VIDEO_BLOCK)])}>Add Video</button>
                </div>
            </div>

            {blocks.map((block, index) => {
                const safeBlock = normalizeBlock(block);

                return (
                    <div key={`${safeBlock.type}-${index}`} className="admin-block-card">
                        <div className="admin-block-card-header">
                            <strong>{safeBlock.type}</strong>
                            <div className="admin-block-actions">
                                <button type="button" onClick={() => moveBlock(index, -1)}>Up</button>
                                <button type="button" onClick={() => moveBlock(index, 1)}>Down</button>
                                <button type="button" onClick={() => removeBlock(index)}>Remove</button>
                            </div>
                        </div>

                        {(safeBlock.type === "text" || safeBlock.type === "subheader") && (
                            <textarea
                                rows={safeBlock.type === "text" ? 6 : 2}
                                value={safeBlock.value}
                                onChange={(event) => updateBlock(index, { ...safeBlock, value: event.target.value })}
                                placeholder={safeBlock.type === "text" ? "Write the paragraph here. Markdown links like [label](url) still work." : "Enter the section title."}
                            />
                        )}

                        {safeBlock.type === "list" && (
                            <div className="admin-list-editor">
                                {safeBlock.value.map((item, itemIndex) => (
                                    <div key={`${index}-${itemIndex}`} className="admin-list-row">
                                        <input
                                            type="text"
                                            value={item.text}
                                            placeholder="List item text"
                                            onChange={(event) => {
                                                const nextItems = safeBlock.value.map((currentItem, currentIndex) => (
                                                    currentIndex === itemIndex ? { ...currentItem, text: event.target.value } : currentItem
                                                ));
                                                updateBlock(index, { ...safeBlock, value: nextItems });
                                            }}
                                        />
                                        <input
                                            type="number"
                                            min="0"
                                            max="5"
                                            value={item.level}
                                            onChange={(event) => {
                                                const nextItems = safeBlock.value.map((currentItem, currentIndex) => (
                                                    currentIndex === itemIndex ? { ...currentItem, level: Number(event.target.value) } : currentItem
                                                ));
                                                updateBlock(index, { ...safeBlock, value: nextItems });
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const nextItems = safeBlock.value.filter((_, currentIndex) => currentIndex !== itemIndex);
                                                updateBlock(index, { ...safeBlock, value: nextItems.length > 0 ? nextItems : [{ text: "", level: 0 }] });
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addListRow(index)}>Add List Item</button>
                            </div>
                        )}

                        {safeBlock.type === "image" && (
                            <div className="admin-media-editor">
                                <input
                                    type="url"
                                    value={safeBlock.value}
                                    placeholder="Image URL"
                                    onChange={(event) => updateBlock(index, { ...safeBlock, value: event.target.value })}
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (event) => {
                                        const file = event.target.files?.[0];
                                        if (!file) {
                                            return;
                                        }

                                        await uploadIntoBlock(file, index);
                                        event.target.value = "";
                                    }}
                                />
                                <input
                                    type="text"
                                    value={safeBlock.caption || ""}
                                    placeholder="Optional caption"
                                    onChange={(event) => updateBlock(index, { ...safeBlock, caption: event.target.value })}
                                />
                                {safeBlock.value && <img src={safeBlock.value} alt={safeBlock.caption || "Preview"} className="admin-image-preview" />}
                            </div>
                        )}

                        {safeBlock.type === "video" && (
                            <div className="admin-media-editor">
                                <input
                                    type="url"
                                    value={safeBlock.value}
                                    placeholder="YouTube, Vimeo, or direct video URL"
                                    onChange={(event) => updateBlock(index, { ...safeBlock, value: event.target.value })}
                                />
                                <input
                                    type="text"
                                    value={safeBlock.caption || ""}
                                    placeholder="Optional caption"
                                    onChange={(event) => updateBlock(index, { ...safeBlock, caption: event.target.value })}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default function AdminPanel() {
    const navigate = useNavigate();
    const [adminEmail, setAdminEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isAuthChecking, setIsAuthChecking] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const notificationTimersRef = useRef(new Map());

    const [experienceDocs, setExperienceDocs] = useState([]);
    const [projectDocs, setProjectDocs] = useState([]);
    const [skillDocs, setSkillDocs] = useState([]);

    const [selectedExperienceId, setSelectedExperienceId] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [selectedSkillId, setSelectedSkillId] = useState("");

    const [experienceForm, setExperienceForm] = useState(createBlankExperience());
    const [projectForm, setProjectForm] = useState(createBlankProject());
    const [skillForm, setSkillForm] = useState(createBlankSkill());

    const [activeTab, setActiveTab] = useState("experience");

    function pushNotification(type, message) {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        setNotifications((current) => [...current, { id, type, message }]);

        const timeoutId = window.setTimeout(() => {
            setNotifications((current) => current.filter((notification) => notification.id !== id));
            notificationTimersRef.current.delete(id);
        }, 10000);

        notificationTimersRef.current.set(id, timeoutId);
    }

    function clearAllNotifications() {
        notificationTimersRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
        notificationTimersRef.current.clear();
        setNotifications([]);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsUnlocked(Boolean(user));
            setIsAuthChecking(false);
        });

        return unsubscribe;
    }, []);

    useEffect(() => () => {
        clearAllNotifications();
    }, []);

    useEffect(() => {
        if (!isUnlocked) {
            return;
        }

        let isMounted = true;

        async function loadAdminCollections() {
            try {
                const [experience, projects, skills] = await Promise.all([
                    loadCollectionOrFallback("experience", fallbackExperienceData),
                    loadCollectionOrFallback("projects", fallbackProjectData),
                    loadCollectionOrFallback("skills", fallbackSkillsData),
                ]);

                if (!isMounted) {
                    return;
                }

                setExperienceDocs(experience.map(normalizeExperienceRecord));
                setProjectDocs(projects.map(normalizeProjectRecord));
                setSkillDocs(skills.map(normalizeSkillRecord));
            } catch (error) {
                if (isMounted) {
                    pushNotification("error", `Unable to load content: ${error.message}`);
                }
            }
        }

        loadAdminCollections();

        return () => {
            isMounted = false;
        };
    }, [isUnlocked]);

    useEffect(() => {
        if (experienceDocs.length === 0) {
            setExperienceForm(createBlankExperience());
            return;
        }

        const selected = experienceDocs.find((entry) => entry.id === selectedExperienceId) || experienceDocs[0];
        if (selected && selected.id !== selectedExperienceId) {
            setSelectedExperienceId(selected.id);
        }
        setExperienceForm(normalizeExperienceRecord(selected));
    }, [experienceDocs, selectedExperienceId]);

    useEffect(() => {
        if (projectDocs.length === 0) {
            setProjectForm(createBlankProject());
            return;
        }

        const selected = projectDocs.find((entry) => entry.id === selectedProjectId) || projectDocs[0];
        if (selected && selected.id !== selectedProjectId) {
            setSelectedProjectId(selected.id);
        }
        setProjectForm(normalizeProjectRecord(selected));
    }, [projectDocs, selectedProjectId]);

    useEffect(() => {
        if (skillDocs.length === 0) {
            setSkillForm(createBlankSkill());
            return;
        }

        const selected = skillDocs.find((entry) => entry.id === selectedSkillId) || skillDocs[0];
        if (selected && selected.id !== selectedSkillId) {
            setSelectedSkillId(selected.id);
        }
        setSkillForm(normalizeSkillRecord(selected));
    }, [skillDocs, selectedSkillId]);

    function unlockPanel(event) {
        event?.preventDefault();

        signInWithEmailAndPassword(auth, adminEmail, loginPassword)
            .then(() => {
                setLoginPassword("");
                pushNotification("success", "Admin panel unlocked.");
            })
            .catch((error) => {
                pushNotification("error", error.message);
            });
    }

    async function lockPanel() {
        await signOut(auth);
        setIsUnlocked(false);
        setAdminEmail("");
        setLoginPassword("");
        pushNotification("info", "Admin panel locked.");
    }

    async function handleUploadToField(file, collectionName, documentId, setter) {
        const url = await uploadAdminAsset(file, collectionName, documentId, "cover");
        setter(url);
        return url;
    }

    async function saveExperience() {
        setIsSaving(true);

        try {
            const originalId = selectedExperienceId || experienceForm.id;
            const nextId = slugify(experienceForm.id || experienceForm.company || `experience-${Date.now()}`) || `experience-${Date.now()}`;
            const payload = {
                ...normalizeExperienceRecord(experienceForm),
                id: nextId,
                skills: normalizeSkills(experienceForm.skills),
                content: normalizeDetailBlocks(experienceForm.content),
            };

            await setDocumentData("experience", nextId, payload);
            if (originalId && originalId !== nextId) {
                await deleteDocumentData("experience", originalId);
            }

            const refreshed = await loadCollectionOrFallback("experience", fallbackExperienceData);
            setExperienceDocs(refreshed.map(normalizeExperienceRecord));
            setSelectedExperienceId(nextId);
            pushNotification("success", "Experience entry saved.");
        } catch (error) {
            pushNotification("error", `Could not save experience entry: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    }

    async function saveProject() {
        setIsSaving(true);

        try {
            const originalId = selectedProjectId || projectForm.id;
            const nextId = slugify(projectForm.id || projectForm.title || `project-${Date.now()}`) || `project-${Date.now()}`;
            const payload = {
                ...normalizeProjectRecord(projectForm),
                id: nextId,
                creationDate: projectForm.creationDate || todayIsoDate(),
                updateDate: todayIsoDate(),
                skills: normalizeSkills(projectForm.skills),
                content: normalizeDetailBlocks(projectForm.content),
            };

            await setDocumentData("projects", nextId, payload);
            if (originalId && originalId !== nextId) {
                await deleteDocumentData("projects", originalId);
            }

            const refreshed = await loadCollectionOrFallback("projects", fallbackProjectData);
            setProjectDocs(refreshed.map(normalizeProjectRecord));
            setSelectedProjectId(nextId);
            pushNotification("success", "Project saved.");
        } catch (error) {
            pushNotification("error", `Could not save project: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    }

    async function saveSkill() {
        setIsSaving(true);

        try {
            const originalId = selectedSkillId || skillForm.id;
            const nextId = slugify(skillForm.id || skillForm.name || `skill-${Date.now()}`) || `skill-${Date.now()}`;
            const payload = {
                ...normalizeSkillRecord(skillForm),
                id: nextId,
                asset: skillForm.asset || suggestSkillAsset(skillForm.name),
            };

            await setDocumentData("skills", nextId, payload);
            if (originalId && originalId !== nextId) {
                await deleteDocumentData("skills", originalId);
            }

            const refreshed = await loadCollectionOrFallback("skills", fallbackSkillsData);
            setSkillDocs(refreshed.map(normalizeSkillRecord));
            setSelectedSkillId(nextId);
            pushNotification("success", "Skill saved.");
        } catch (error) {
            pushNotification("error", `Could not save skill: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    }

    async function uploadExperienceLogo(file) {
        const url = await handleUploadToField(file, "experience", selectedExperienceId || experienceForm.id || "draft", (value) => {
            setExperienceForm((current) => ({ ...current, logo: value }));
        });
        return url;
    }

    async function uploadProjectImage(file) {
        const url = await handleUploadToField(file, "projects", selectedProjectId || projectForm.id || "draft", (value) => {
            setProjectForm((current) => ({ ...current, frontImg: value }));
        });
        return url;
    }

    async function uploadSkillAsset(file) {
        const url = await handleUploadToField(file, "skills", selectedSkillId || skillForm.id || "draft", (value) => {
            setSkillForm((current) => ({ ...current, asset: value }));
        });
        return url;
    }

    if (isAuthChecking) {
        return (
            <main className="admin-panel-shell">
                <section className="admin-card admin-login-card">
                    <div>
                        <h1 className="admin-panel-title">Admin Panel</h1>
                        <p>Checking admin access...</p>
                    </div>
                </section>
            </main>
        );
    }

    if (!isUnlocked) {
        return (
            <main className="admin-panel-shell">
                <section className="admin-card admin-login-card">
                    <div>
                        <h1 className="admin-panel-title">Admin Panel</h1>
                        <p>Sign in with your Firebase admin account to edit experience, projects, and skills.</p>
                        <p className="admin-helper-text">For production security, keep this behind Firebase Authentication and Firestore/Storage rules with an admin-only allowlist or custom claim.</p>
                    </div>
                    <form className="admin-login-form" onSubmit={unlockPanel}>
                        <label>
                            Email
                            <input
                                type="email"
                                value={adminEmail}
                                onChange={(event) => setAdminEmail(event.target.value)}
                                placeholder="Enter your admin email"
                                autoComplete="email"
                                required
                            />
                        </label>
                        <label>
                            Password
                            <input
                                type="password"
                                value={loginPassword}
                                onChange={(event) => setLoginPassword(event.target.value)}
                                placeholder="Enter your Firebase password"
                                autoComplete="current-password"
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        unlockPanel(event);
                                    }
                                }}
                            />
                        </label>
                        <button type="submit">Unlock</button>
                    </form>
                </section>
            </main>
        );
    }

    return (
        <main className="admin-panel-shell">
            <section className="admin-card admin-topbar">
                <div>
                    <h1 className="admin-panel-title">Admin Panel</h1>
                    <p>Edit the portfolio content and save it directly to Firestore.</p>
                </div>
                <div className="admin-topbar-actions">
                    <button type="button" onClick={() => navigate("/")}>Back to site</button>
                    <button type="button" onClick={lockPanel}>Lock</button>
                </div>
            </section>

            <section className="admin-card admin-tabs-card">
                <div className="admin-tabs">
                    <button type="button" className={activeTab === "experience" ? "active" : ""} onClick={() => setActiveTab("experience")}>Experience</button>
                    <button type="button" className={activeTab === "projects" ? "active" : ""} onClick={() => setActiveTab("projects")}>Projects</button>
                    <button type="button" className={activeTab === "skills" ? "active" : ""} onClick={() => setActiveTab("skills")}>Skills</button>
                </div>
            </section>

            {activeTab === "experience" && (
                <section className="admin-card admin-form-card">
                    <div className="admin-form-header">
                        <div>
                            <h2>Experience Editor</h2>
                            <p>Write the detail page block-by-block, then save it to the <em>experience</em> collection.</p>
                        </div>
                        <button type="button" onClick={() => { setSelectedExperienceId(""); setExperienceForm(createBlankExperience()); }}>New Experience</button>
                    </div>

                    <label className="admin-field">
                        Select entry
                        <select value={selectedExperienceId} onChange={(event) => setSelectedExperienceId(event.target.value)}>
                            {experienceDocs.map((entry) => <option key={entry.id} value={entry.id}>{entry.company || entry.id}</option>)}
                        </select>
                    </label>

                    <div className="admin-grid">
                        <label className="admin-field">Document ID<input type="text" value={experienceForm.id} onChange={(event) => setExperienceForm((current) => ({ ...current, id: event.target.value }))} /></label>
                        <label className="admin-field">Company<input type="text" value={experienceForm.company} onChange={(event) => setExperienceForm((current) => ({ ...current, company: event.target.value }))} /></label>
                        <label className="admin-field">Role<input type="text" value={experienceForm.role} onChange={(event) => setExperienceForm((current) => ({ ...current, role: event.target.value }))} /></label>
                        <label className="admin-field">Start Date<input type="month" value={experienceForm.startDate} onChange={(event) => setExperienceForm((current) => ({ ...current, startDate: event.target.value }))} /></label>
                        <label className="admin-field">End Date<input type="month" value={experienceForm.endDate} onChange={(event) => setExperienceForm((current) => ({ ...current, endDate: event.target.value }))} /></label>
                    </div>

                    <label className="admin-field">Logo URL<input type="url" value={experienceForm.logo} onChange={(event) => setExperienceForm((current) => ({ ...current, logo: event.target.value }))} /></label>
                    <label className="admin-field">
                        Upload logo
                        <input type="file" accept="image/*" onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (!file) {
                                return;
                            }

                            await uploadExperienceLogo(file);
                            event.target.value = "";
                        }} />
                    </label>
                    {experienceForm.logo && <img src={experienceForm.logo} alt="Experience logo preview" className="admin-image-preview admin-logo-preview" />}

                    <label className="admin-field">Short Description<textarea rows="4" value={experienceForm.shortDesc} onChange={(event) => setExperienceForm((current) => ({ ...current, shortDesc: event.target.value }))} /></label>
                    <ChipsInput label="Skills" value={experienceForm.skills} onChange={(nextSkills) => setExperienceForm((current) => ({ ...current, skills: nextSkills }))} placeholder="Add a skill and press Enter" />

                    <section className="admin-detail-blocks-section">
                        <div className="admin-subsection-header admin-subsection-sticky">
                            <h3>Detail Blocks</h3>
                            <p>Add text, subheaders, lists, images, and videos. Markdown links in text blocks still work in the public detail page.</p>
                        </div>
                        <BlockEditor blocks={experienceForm.content} onChange={(nextBlocks) => setExperienceForm((current) => ({ ...current, content: nextBlocks }))} collectionLabel="experience" />
                    </section>

                    <div className="admin-preview-panel">
                        <h3>Live Preview</h3>
                        <article className="detail-page admin-detail-preview">
                            <article className="detail-container">
                                <section className="detail-title-row">
                                    <div className="detail-title-group">
                                        <h1 className="detail-title">{experienceForm.company || "Untitled company"}</h1>
                                        {experienceForm.role && <h2 className="detail-subtitle">{experienceForm.role}</h2>}
                                    </div>
                                    {experienceForm.logo && (
                                        <img src={experienceForm.logo} alt={`${experienceForm.company || "Company"} logo`} className="detail-company-logo" />
                                    )}
                                </section>
                                <header className="detail-header">
                                    {experienceForm.startDate && <p className="detail-dates">Start of Employment: {experienceForm.startDate}</p>}
                                    {experienceForm.endDate && <p className="detail-dates">End of Employment: {experienceForm.endDate}</p>}
                                </header>
                                {experienceForm.shortDesc && <p className="detail-text">{experienceForm.shortDesc}</p>}
                                {(Array.isArray(experienceForm.content) ? experienceForm.content : []).map(renderBlockPreview)}
                            </article>
                        </article>
                    </div>

                    <button type="button" className="admin-save-button" disabled={isSaving} onClick={saveExperience}>
                        {isSaving ? "Saving..." : "Save Experience"}
                    </button>
                </section>
            )}

            {activeTab === "projects" && (
                <section className="admin-card admin-form-card">
                    <div className="admin-form-header">
                        <div>
                            <h2>Project Editor</h2>
                            <p>Build the public detail page content using the same block layout as the site.</p>
                        </div>
                        <button type="button" onClick={() => { setSelectedProjectId(""); setProjectForm(createBlankProject()); }}>New Project</button>
                    </div>

                    <label className="admin-field">
                        Select project
                        <select value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)}>
                            {projectDocs.map((entry) => <option key={entry.id} value={entry.id}>{entry.title || entry.id}</option>)}
                        </select>
                    </label>

                    <div className="admin-grid">
                        <label className="admin-field">Document ID<input type="text" value={projectForm.id} onChange={(event) => setProjectForm((current) => ({ ...current, id: event.target.value }))} /></label>
                        <label className="admin-field">Title<input type="text" value={projectForm.title} onChange={(event) => setProjectForm((current) => ({ ...current, title: event.target.value }))} /></label>
                        <label className="admin-field">Type<input type="text" value={projectForm.type} onChange={(event) => setProjectForm((current) => ({ ...current, type: event.target.value }))} /></label>
                        <label className="admin-field">Topic<input type="text" value={projectForm.topic} onChange={(event) => setProjectForm((current) => ({ ...current, topic: event.target.value }))} /></label>
                        <label className="admin-field">Creation Date<input type="date" value={projectForm.creationDate} onChange={(event) => setProjectForm((current) => ({ ...current, creationDate: event.target.value }))} /></label>
                        <label className="admin-field">Update Date<input type="date" value={projectForm.updateDate} onChange={(event) => setProjectForm((current) => ({ ...current, updateDate: event.target.value }))} /></label>
                    </div>

                    <label className="admin-field">Front Image URL<input type="url" value={projectForm.frontImg} onChange={(event) => setProjectForm((current) => ({ ...current, frontImg: event.target.value }))} /></label>
                    <label className="admin-field">
                        Upload front image
                        <input type="file" accept="image/*" onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (!file) {
                                return;
                            }

                            await uploadProjectImage(file);
                            event.target.value = "";
                        }} />
                    </label>
                    {projectForm.frontImg && <img src={projectForm.frontImg} alt="Project front preview" className="admin-image-preview" />}

                    <label className="admin-field">Short Description<textarea rows="4" value={projectForm.shortDesc} onChange={(event) => setProjectForm((current) => ({ ...current, shortDesc: event.target.value }))} /></label>
                    <ChipsInput label="Skills" value={projectForm.skills} onChange={(nextSkills) => setProjectForm((current) => ({ ...current, skills: nextSkills }))} placeholder="Add a skill and press Enter" />

                    <section className="admin-detail-blocks-section">
                        <div className="admin-subsection-header admin-subsection-sticky">
                            <h3>Detail Blocks</h3>
                            <p>Use images for screenshots, videos for embeds or direct URLs, and text blocks for the rest of the story.</p>
                        </div>
                        <BlockEditor blocks={projectForm.content} onChange={(nextBlocks) => setProjectForm((current) => ({ ...current, content: nextBlocks }))} collectionLabel="projects" />
                    </section>

                    <div className="admin-preview-panel">
                        <h3>Live Preview</h3>
                        <article className="detail-page admin-detail-preview">
                            <article className="detail-container">
                                <h1 className="detail-title">{projectForm.title || "Untitled project"}</h1>
                                <header className="detail-header">
                                    {projectForm.creationDate && <p className="detail-dates">Created: {projectForm.creationDate}</p>}
                                    {projectForm.updateDate && <p className="detail-dates">Last Updated: {projectForm.updateDate}</p>}
                                </header>
                                {projectForm.frontImg && (
                                    <figure className="detail-image-container">
                                        <img src={projectForm.frontImg} alt={projectForm.title || "Project preview"} className="detail-image-source" />
                                    </figure>
                                )}
                                {projectForm.shortDesc && <p className="detail-text">{projectForm.shortDesc}</p>}
                                {(Array.isArray(projectForm.content) ? projectForm.content : []).map(renderBlockPreview)}
                            </article>
                        </article>
                    </div>

                    <button type="button" className="admin-save-button" disabled={isSaving} onClick={saveProject}>
                        {isSaving ? "Saving..." : "Save Project"}
                    </button>
                </section>
            )}

            {activeTab === "skills" && (
                <section className="admin-card admin-form-card">
                    <div className="admin-form-header">
                        <div>
                            <h2>Skills Editor</h2>
                            <p>Manage the visible skill boxes and optionally suggest or upload an asset for each one.</p>
                        </div>
                        <button type="button" onClick={() => { setSelectedSkillId(""); setSkillForm(createBlankSkill()); }}>New Skill</button>
                    </div>

                    <label className="admin-field">
                        Select skill
                        <select value={selectedSkillId} onChange={(event) => setSelectedSkillId(event.target.value)}>
                            {skillDocs.map((entry) => <option key={entry.id} value={entry.id}>{entry.name || entry.id}</option>)}
                        </select>
                    </label>

                    <div className="admin-grid">
                        <label className="admin-field">Document ID<input type="text" value={skillForm.id} onChange={(event) => setSkillForm((current) => ({ ...current, id: event.target.value }))} /></label>
                        <label className="admin-field">Skill Name<input type="text" value={skillForm.name} onChange={(event) => setSkillForm((current) => ({ ...current, name: event.target.value }))} /></label>
                        <label className="admin-field">
                            Category
                            <select value={skillForm.type} onChange={(event) => setSkillForm((current) => ({ ...current, type: event.target.value }))}>
                                {COMMON_SKILL_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </label>
                    </div>

                    <label className="admin-field">Asset URL<input type="url" value={skillForm.asset} onChange={(event) => setSkillForm((current) => ({ ...current, asset: event.target.value }))} /></label>
                    <div className="admin-inline-actions">
                        <button type="button" onClick={() => setSkillForm((current) => ({ ...current, asset: suggestSkillAsset(current.name) }))}>Suggest Asset</button>
                        <button type="button" onClick={() => setSkillForm((current) => ({ ...current, asset: current.name ? suggestSkillAsset(current.name) : current.asset }))}>Use Best Guess</button>
                    </div>
                    <label className="admin-field">
                        Upload asset
                        <input type="file" accept="image/*" onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (!file) {
                                return;
                            }

                            await uploadSkillAsset(file);
                            event.target.value = "";
                        }} />
                    </label>
                    {skillForm.asset && <img src={skillForm.asset} alt="Skill asset preview" className="admin-image-preview admin-skill-preview" />}

                    <label className="admin-toggle-field">
                        <input type="checkbox" checked={skillForm.invert} onChange={(event) => setSkillForm((current) => ({ ...current, invert: event.target.checked }))} />
                        Invert asset colors
                    </label>

                    <div className="admin-skill-grid">
                        {skillDocs.map((skill) => (
                            <article key={skill.id} className="admin-skill-card">
                                <strong>{skill.name}</strong>
                                <span>{skill.type}</span>
                                {skill.asset && <img src={skill.asset} alt={skill.name} />}
                            </article>
                        ))}
                    </div>

                    <button type="button" className="admin-save-button" disabled={isSaving} onClick={saveSkill}>
                        {isSaving ? "Saving..." : "Save Skill"}
                    </button>
                </section>
            )}

            <div className="admin-notification-stack" aria-live="polite" aria-atomic="true">
                {notifications.map((notification) => (
                    <div key={notification.id} className={`admin-notification admin-notification-${notification.type}`}>
                        {notification.message}
                    </div>
                ))}
            </div>
        </main>
    );
}