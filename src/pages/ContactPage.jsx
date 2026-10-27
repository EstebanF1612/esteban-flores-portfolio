import { useState } from "react";
import "../styles/ContactPage.css";

const CONTACT_EMAIL = "estebanflorescalderon@gmail.com";

function buildMailtoLink({ name, email, subject, message }) {
    const composedSubject = subject || `Portfolio Contact from ${name || "Visitor"}`;
    const bodyLines = [
        `Name: ${name || "N/A"}`,
        `Email: ${email || "N/A"}`,
        "",
        message || "",
    ];

    const encodedSubject = encodeURIComponent(composedSubject);
    const encodedBody = encodeURIComponent(bodyLines.join("\n"));
    return `mailto:${CONTACT_EMAIL}?subject=${encodedSubject}&body=${encodedBody}`;
}

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    function handleChange(event) {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    function handleSubmit(event) {
        event.preventDefault();
        window.location.href = buildMailtoLink(formData);
    }

    return (
        <main className="contact-page">
            <section className="contact-card">
                <h1>Contact Me</h1>
                <p>
                    Fill this form and your email app will open a pre-filled message to my email: {" "}
                    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
                </p>

                <form className="contact-form" onSubmit={handleSubmit}>
                    <label htmlFor="name">Name</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="subject">Subject</label>
                    <input
                        id="subject"
                        name="subject"
                        type="text"
                        value={formData.subject}
                        onChange={handleChange}
                    />

                    <label htmlFor="message">Message</label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={6}
                        required
                    />

                    <button type="submit">Send Email</button>
                </form>
            </section>
        </main>
    );
}