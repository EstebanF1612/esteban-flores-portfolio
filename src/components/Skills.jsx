import "../styles/Skills.css";
import { useEffect, useMemo, useState } from "react";
import { fetchCollectionData } from "../data/firestoreData";

const assets = import.meta.glob("../assets/skills/*", { eager: true });
const SKILL_TYPE_ORDER = [
    "Tools & Technologies",
    "Industry Knowledge",
    "Interpersonal Skills",
];

function resolveSkillImage(assetName) {
    if (!assetName) {
        return "";
    }

    // Keep full URLs untouched so remote SVG/icon links render correctly.
    if (/^https?:\/\//i.test(assetName)) {
        return assetName;
    }

    const imagePath = `../assets/skills/${assetName}`;
    const imageModule = assets[imagePath];
    return imageModule?.default || assetName;
}

export default function Skills() {
    const [skillsData, setSkillsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function loadSkills() {
            try {
                const data = await fetchCollectionData("skills");
                if (isMounted) {
                    setSkillsData(data);
                }
            } catch (error) {
                console.error("Failed to load skills from Firestore:", error);

                if (isMounted) {
                    try {
                        const fallbackModule = await import("../data/skillsData");
                        const fallbackSkills = Array.isArray(fallbackModule.skillsData)
                            ? fallbackModule.skillsData
                            : [];

                        setSkillsData(fallbackSkills);
                        setLoadError("");
                    } catch (error) {
                        setLoadError("Unable to load skills right now. error: " + error.message);
                    }
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadSkills();

        return () => {
            isMounted = false;
        };
    }, []);

    const groupedSkills = useMemo(() => {
        return skillsData.reduce((map, skill) => {
            if (!map.has(skill.type)) {
                map.set(skill.type, []);
            }

            map.get(skill.type).push(skill);
            return map;
        }, new Map());
    }, [skillsData]);

    const orderedSkillGroups = useMemo(() => {
        const entries = Array.from(groupedSkills.entries());
        const orderIndex = new Map(SKILL_TYPE_ORDER.map((type, index) => [type, index]));

        return entries.sort(([typeA], [typeB]) => {
            const a = orderIndex.has(typeA) ? orderIndex.get(typeA) : Number.MAX_SAFE_INTEGER;
            const b = orderIndex.has(typeB) ? orderIndex.get(typeB) : Number.MAX_SAFE_INTEGER;
            return a - b;
        });
    }, [groupedSkills]);

    return (
        <section className="Skills">
            <h2>Skills</h2>
            {isLoading && <p>Loading skills...</p>}
            {loadError && <p>{loadError}</p>}

            <div className="skills-container">
                {orderedSkillGroups.map(([type, skills]) => (
                    <div key={type} className="skills-category">
                        <h3>{type}</h3>
                        <div className="skills-array">
                            {skills.map((skill) => (
                                <div key={skill.id} className="skill-item">
                                    <img
                                        src={resolveSkillImage(skill.asset)}
                                        alt={skill.name}
                                        className={skill.invert ? "filter-white" : ""}
                                    />
                                    <p>{skill.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

        </section>
    );
}