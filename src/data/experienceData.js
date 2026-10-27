export const experienceData = [
    {
        id: "101",
        startDate: "2025-10",
        endDate: null,
        company: "Thompson Rivers University",
        role: "Undergraduate Research Assistant",
        logo: "",
        shortDesc: "Developed updated cloud computing curriculum by analyzing 130+ job postings and industry standards, resulting in improved student confidence.",
        skills: ["Cloud Computing", "Infrastructure as Code (IaC)", "AWS", "Azure", "GCP", "Python", "Web Scraping", "Data Analysis", "NVIVO"],
        content: [
            {type: "text", value: "During my position as an undergraduate research assistant at Thompson Rivers University (TRU), I was tasked with investigating the cloud computing job market, the skills employers are looking for, and how each of these skills work to create an updated curriculum for a cloud computing course offered by TRU."},
            {type: "text", value: "This course update aims to help students feel more comfortable entering the cloud computing field by having an updated skill set that employers really want."},
            {type: "subheader", value: "Strategy and Work"},
            {type: "list", value: [{"text": "Used a working paper detailing modern knowledge areas in cloud computing from industry professionals coming from Google, Microsoft, and more, to understand existing knowledge areas for the field.", "level": 0}, {"text": "Working paper was written in 2018, therefore, began validation and update by triangulating from 3 sources", "level": 0}, {"text": "Association for Computer Machinery (ACM) Computer Science (CS) 2023 Curricula", "level": 1}, {"text": "Industry (ID) 5.0 Standards", "level": 1}, {"text": "Current skills in the job market", "level": 1}, {"text": "Investigated over 130+ job postings and utilized python web scrapers to extract the skills required in each job posting.", "level": 0}, {"text": "Compiled all skills and analyzed gaps between proposed working paper knowledge areas and modern job requirements.", "level": 0}, {"text": "Analyzed the ID 5.0 Industry Standards and identified an incline in softwarization and virtualization of cloud applications for industry operations.", "level": 0}, {"text": "Followed guidelines in the ACM CS 2023 Curricula that were directly related to cloud computing and its involvement across different areas of computer science.", "level": 0}, {"text": "Developed 15 new knowledge areas using information from all sources and research on all skills and their working principles.", "level": 0}, {"text": "Conducted a pilot run of the course with these new KAs, which resulted in increased confidence to enter the job market from 80% of students after a feedback analysis using NVIVO.", "level": 0}]},
            {type: "image", value: ""},
            {type: "image", value: ""},
            {type: "subheader", value: "Future work and conclusions"},
            {type: "text", value: "We are currently working on refining our research paper for publishing in an acclaimed research journal. However, if you would like to see how it looks like, here is a link to the working draft: https://docs.google.com/document/d/1dvQIWkURz-1oCVS7mdMAC-wdzUReHct8SJhIjxSN7Dg/edit?usp=sharing"},
            {type: "text", value: "Throughout this experience, I was able to enhance my skills with python web scrappers, understand cloud concepts such as containerization, CI/CD pipelines, Kubernetes, Jenkins, and many more, and implement these into a relevant modern course outline for students to learn and be prepared for the market."},
            {type: "text", value: "I have also worked closely with my research supervisor, improving and strengthening my teamwork and communication skills. We were able to produce this amount of work with great standards of quality because of creative thinking and commitment to the project."},
            {type: "text", value: "Here’s a picture of me presenting our project to a local research competition called “In a Nutshell” where I got the chance to introduce industry professionals to our work: https://inside.tru.ca/events/event/in-a-nutshell-competition/"},
            {type: "image", value: ""}
        ]
    },
    {
        id: "102",
        startDate: "2025-05",
        endDate: "2025-08",
        company: "Sericonfarm",
        role: "Account Executive",
        logo: "",
        shortDesc: "Managed customer portfolios and developed ASP.NET web portal for automated portfolio processing and contract management.",
        skills: ["ASP.NET", "C#", "SQL Databases", "Razor Components", "Microsoft Office 365", "Portfolio Management", "Client Relations"],
        content: [
            {type: "text", value: "I worked as an account executive for [Sericonfarm](https://sericonfarm.com), an Ecuadorian company with over 5 years of experience, specializing in the import and distribution of medical supplies, reagents, and specialized laboratory products. One of the company’s divisions is company portfolio management, with which I worked closely during the summer of 2025."},
            {type: "image", value: ""},
            {type: "text", value: "My job was to manage the portfolio and accounts of 2 customers: SIMED and Novartis. [SIMED](https://simedcorp.com/nosotros/?lang=en) is a prominent Ecuadorian company based in Quito that specializes in supplying medical, laboratory, and diagnostic equipment and technology. [Novartis](https://www.novartis.com/about) is a leading Swiss multinational pharmaceutical corporation headquartered in Basel, Switzerland, focusing on innovative medicines for cardiovascular, immunology, neuroscience, and oncology."},
            {type: "text", value: "My responsibilities involved:"},
            {type: "list", value: [{"text": "Handling contract payment fulfilment between medical institutions and our customers via strategic mailing, persuasive follow-up, and persistence.", "level": 0}, {"text": "Ensure consistency in portfolio balances and contract documentation by using Excel and paying close attention to changes between our customers and theirs.", "level": 0}, {"text": "Handle and manage product deliveries for our customers.", "level": 0}]},
            {type: "text", value: "In my position, I noticed a lot of these tasks could be done more quickly and organized using a web portal for employers involved in this division. When I asked if they had any plans to automate this process somehow, I was pleasantly surprised to find out they did in fact have a project going on for building a web portal for employers, and through rigorous convincing, I was allowed to work on this on the side."},
            {type: "text", value: "The website works as a sub-domain of the sericonfarm main domain and introduces workers a dashboard with which they can log in, access their managed portfolios, process new portfolios via excel file parsing and automatically highlight any odd outliers in each portfolio. It can also handle automated mailing to medical institutions."},
            {type: "text", value: "The web portal works using an ASP.NET Core framework and an SQL server, where I was able to create the excel file parsing logic, create razor views for portfolio displays, and fully implement client-server communication for new portfolio uploads."},
            {type: "text", value: "Here is a look at one of the razor pages I made for uploading new portfolios:"},
            {type: "image", value: ""},
            {type: "text", value: "And the logic behind it:"},
            {type: "image", value: ""},
            {type: "text", value: "The project was still active when I had to leave for educational purposes, but the team commended my help, dedication, and outstanding work for both my normal duties as an account executive and my involvement in the company's web portal."},
            {type: "text", value: "My time at Sericonfarm helped me understand business models at a deeper level, as well as refine my professional communication skills. I was also given the chance to strengthen my web development skills, work with the ASP.NET framework, and master SQL server handling."}
        ]
    },
    {
        id: "103",
        startDate: "2024-06",
        endDate: "2024-08",
        company: "Lidersis Ecuador",
        role: "Software Engineer Intern",
        logo: "",
        shortDesc: "Developed 3 React modules for pharmaceutical inventory management app with 40% improved UI performance through A/B testing.",
        skills: ["React", "JavaScript", "TypeScript", "Firebase", "SQL", "APIs", "CI/CD Pipelines", "GitHub", "A/B Testing", "Expo"],
        content: [
            {type: "text", value: "I worked as a Software Engineer Intern at [Lidersis](https://lidersis.ec/), and during my time I was given the opportunity to learn how to write scalable and clean code along with a team of talented individuals. I was also able to work with clients, settle requirements, and bring ideas to tangible apps."},
            {type: "text", value: "I was assigned to work in the development of a stock and sales management application for a pharmaceutical import company called [RRPGolden](https://goldenecuador.com/)."},
            {type: "subheader", value: "Activities and Outcomes"},
            {type: "list", value: [{"text": "Designed and developed 3 app modules using React, JavaScript, and Typescript resulting in clean and functional UI without needing additional libraries.", "level": 0}, {"text": "Maintained interface coherence and responsiveness by enclosing stack screens in gesture handlers, application providers and theme contexts.", "level": 0}, {"text": "Implemented backend client-server interaction by using asynchronous database query functions which allow for automatic data fetch and processing.", "level": 0}, {"text": "Performed AB testing to improve user-to-content time by 40% as well as feedback on UI display.", "level": 0}, {"text": "Performed version control and prevented merging errors by working on separate branches within the company’s private GitHub repository and communicating with team members.", "level": 0}]},
            {type: "text", value: "Here are pictures of my work in the UI interface:"},
            {type: "image", value: ""},
            {type: "text", value: "As well as some of the logic I used to program these interfaces (keep in mind, some of the content is blurred for confidentiality purposes):"},
            {type: "image", value: ""}
        ]
    }
];
