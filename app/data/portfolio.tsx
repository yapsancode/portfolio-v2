// data/portfolio.tsx
import { ReactNode } from "react";
import { Code, FolderGit2, Briefcase, GraduationCap, Info, Download, Github, Globe } from "lucide-react";
import ProgressBar from "../components/ProgressBar";
import TimelineItem from "../components/TimelineItem";
import { motion } from "framer-motion";

// Section definition type
export interface PortfolioSection {
    title: string;
    description: string;
    icon: ReactNode;
    gradient: string;
    size?: "small" | "medium" | "large";
    modalKey?: string;
    action?: () => void; // for buttons like Download CV
}

// === CONTENTS ===

// Skills modal content
const skillsContent: ReactNode = (
    <div className="space-y-4">
        <ProgressBar skill="JavaScript" percentage={90} color="bg-blue-500" />
        <ProgressBar skill="React" percentage={85} color="bg-indigo-500" />
        <ProgressBar skill="TypeScript" percentage={80} color="bg-purple-500" />
    </div>
);

// Projects modal content
const projectsContent: ReactNode = (
    <div className="space-y-4">
        <p>Project 1: Built a full-stack web app using React and Node.js.</p>
        <p>Project 2: Developed a mobile app with React Native.</p>
    </div>
);

const experienceContent = (
    <motion.div
        className="space-y-6"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.2 } },
        }}
    >
        <TimelineItem
            title="Programmer"
            company="delaware Malaysia"
            companyUrl="https://www.linkedin.com/company/delaware-malaysia/"
            period="February 2024 - September 2024"
            description="Exposed to SAP stuff and IT Business for Enterprise"
        />
        <TimelineItem
            title="Programmer"
            company="Zanko Sdn Bhd"
            companyUrl="https://www.linkedin.com/company/zankosdnbhd/"
            period="September 2024 - December 2024"
            description="Exposed to Code Igniter (PHP) and SVN (Version Control)"
        />
        <TimelineItem
            title="Software Developer | Associate Consultant"
            company="E-Outsource Asia Sdn Bhd"
            companyUrl="https://www.linkedin.com/company/e-outsource-asia/"
            period="Jan 2025 - Present"
            description="Developed and maintained web applications using Flutter and Laravel for ERP."
            isLast
        />
    </motion.div>
);


// Education modal content
const educationContent: ReactNode = (
    <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-6 rounded-2xl">
            <h3 className="text-xl font-bold mb-2">Education</h3>
            <p>Strong academic foundation in computer science.</p>
        </div>

        <div className="space-y-4">
            <TimelineItem
                title="Bachelor's in Computer Science (Hons.)"
                company="Management and Science University"
                period="2021 – 2024"
                location="Shah Alam"
                description="CGPA: 3.45 - Specialized in software development, algorithms, and system design with hands-on experience in various programming languages and frameworks."
            />
            <TimelineItem
                title="Foundation in Information Technology"
                company="Management and Science University"
                period="2020 – 2021"
                location="Shah Alam"
                description="CGPA: 3.11 - Built fundamental knowledge in computing principles, mathematics, and basic programming concepts."
            />
        </div>
    </div>
);

// About modal content
const aboutContent: ReactNode = (
    <motion.div
        className="space-y-6 text-gray-700 dark:text-gray-300"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <p className="text-lg leading-relaxed">
            Yo, welcome to my digital domain! Thanks for checking out my portfolio.
        </p>
        <p className="text-lg leading-relaxed">
            I crafted this space to flex both{" "}
            <span className="font-semibold text-blue-500 dark:text-blue-400">
                skills
            </span>{" "}
            and{" "}
            <span className="font-semibold text-purple-500 dark:text-purple-400">
                soul
            </span>
            . Think sleek, intuitive design with an Apple-inspired edge—sharp, clean,
            and straight to the point.
        </p>
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Code className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <p>
                    Built with <span className="font-medium">Next.js</span> for a fast,
                    modern dev experience.
                </p>
            </div>
            <div className="flex items-center gap-3">
                <Github className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <p>
                    Pushed to{" "}
                    <a
                        href="https://github.com"
                        target="_blank"
                        className="text-blue-500 hover:underline dark:text-blue-400"
                    >
                        GitHub
                    </a>{" "}
                    for version control and deployment.
                </p>
            </div>
            <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-green-500 dark:text-green-400" />
                <p>
                    Deployed on{" "}
                    <a
                        href="https://vercel.com"
                        target="_blank"
                        className="text-blue-500 hover:underline dark:text-blue-400"
                    >
                        Vercel
                    </a>{" "}
                    for seamless hosting.
                </p>
            </div>
        </div>
        <p className="text-lg italic">
            Keeping it lean—no backend or database needed (yet). Just pure front-end
            finesse.
        </p>
    </motion.div>
);

// Map modal keys to content
export const modalContents: Record<string, ReactNode> = {
    skills: skillsContent,
    projects: projectsContent,
    experience: experienceContent,
    education: educationContent,
    about: aboutContent,
};

// Sections for PageCard grid
export const portfolioSections: PortfolioSection[] = [
    {
        title: "Technical Skills",
        description: "Programming & Frameworks",
        icon: <Code className="w-12 h-12 text-blue-500" />,
        gradient: "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20",
        modalKey: "skills",
    },
    {
        title: "Projects",
        description: "Innovative Solutions",
        icon: <FolderGit2 className="w-12 h-12 text-green-500" />,
        gradient: "bg-gradient-to-br from-green-50 to-teal-100 dark:from-green-900/20 dark:to-teal-900/20",
        modalKey: "projects",
    },
    {
        title: "Experience",
        description: "Professional Work",
        icon: <Briefcase className="w-12 h-12 text-orange-500" />,
        gradient: "bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-900/20",
        modalKey: "experience",
    },
    {
        title: "Education",
        description: "Academic Background",
        icon: <GraduationCap className="w-12 h-12 text-purple-500" />,
        gradient: "bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20",
        modalKey: "education",
        size: "large",
    },
    {
        title: "About This Page",
        description: "How it was built",
        icon: <Info className="w-12 h-12 text-green-500" />,
        gradient: "bg-gradient-to-br from-green-50 to-teal-100 dark:from-green-900/20 dark:to-teal-900/20",
        modalKey: "about",
    },
    {
        title: "Download CV",
        description: "My skills, but make it PDF 🧩",
        icon: <Download className="w-12 h-12 text-green-500" />,
        gradient: "bg-gradient-to-br from-green-50 to-teal-100 dark:from-green-900/20 dark:to-teal-900/20",
        action: () => {
            const link = document.createElement("a");
            link.href = "/resume.pdf"; // ensure this file is in public/
            link.download = "Isyraf Afifi Resume.pdf";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
    },
];
