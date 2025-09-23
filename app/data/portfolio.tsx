// data/portfolio.tsx
import { ReactNode } from "react";
import { Code, FolderGit2, Briefcase, GraduationCap, Info, Download, Github, Globe } from "lucide-react";
import ProgressBar from "../components/ProgressBar";
import TimelineItem from "../components/TimelineItem";
import { motion } from "framer-motion";
import {
    FaGit, FaLaravel, FaDatabase, FaGlobe, FaMobile, FaChartLine, FaGithub, FaExternalLinkAlt, FaGooglePlay, FaCalendarAlt, FaClock,
} from "react-icons/fa";
import { SiFlutter, SiNextdotjs, SiTailwindcss, SiFirebase, SiSubversion } from "react-icons/si";

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
    <motion.div
        className="space-y-8"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.2 } },
        }}
    >
        {/* Frontend */}
        <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            className="space-y-4"
        >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1">
                Frontend
            </h3>
            <ProgressBar
                skill="Flutter"
                percentage={65}
                gradient="linear-gradient(to right, #38bdf8, #2563eb)"
                icon={<SiFlutter className="text-sky-500" />}
            />
            <ProgressBar
                skill="Next.js"
                percentage={35}
                gradient="linear-gradient(to right, #000000, #4a5568)"
                icon={<SiNextdotjs className="text-black dark:text-white" />}
            />
            <ProgressBar
                skill="Tailwind CSS"
                percentage={20}
                gradient="linear-gradient(to right, #06b6d4, #3b82f6)"
                icon={<SiTailwindcss className="text-cyan-500" />}
            />
        </motion.div>

        {/* Backend */}
        <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            className="space-y-4"
        >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1">
                Backend
            </h3>
            <ProgressBar
                skill="Laravel"
                percentage={20}
                gradient="linear-gradient(to right, #e11d48, #9333ea)"
                icon={<FaLaravel className="text-red-500" />}
            />
            <ProgressBar
                skill="Firebase"
                percentage={30}
                gradient="linear-gradient(to right, #f59e0b, #ef4444)"
                icon={<SiFirebase className="text-orange-500" />}
            />
        </motion.div>

        {/* Database */}
        <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            className="space-y-4"
        >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1">
                Database
            </h3>
            <ProgressBar
                skill="MySQL"
                percentage={50}
                gradient="linear-gradient(to right, #14b8a6, #2563eb)"
                icon={<FaDatabase className="text-emerald-500" />}
            />
        </motion.div>

        {/* Version Control */}
        <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            className="space-y-4"
        >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1">
                Version Control
            </h3>
            <ProgressBar
                skill="Git"
                percentage={60}
                gradient="linear-gradient(to right, #f97316, #dc2626)"
                icon={<FaGit className="text-orange-600" />}
            />
            <ProgressBar
                skill="SVN"
                percentage={20}
                gradient="linear-gradient(to right, #6366f1, #8b5cf6)"
                icon={<SiSubversion className="text-indigo-500" />}
            />
        </motion.div>
    </motion.div>
);

// Projects modal content
const projectsContent: ReactNode = (
    <motion.div
        className="space-y-6"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.15 } },
        }}
    >
        {/* Project 1 */}
        <motion.div
            variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
            className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 
                       rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300
                       hover:scale-[1.02] cursor-pointer"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                        <FaGlobe className="text-blue-600 dark:text-blue-400 text-xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            E-Commerce Platform
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Full-Stack Web Application</p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                        <FaGithub className="text-gray-700 dark:text-gray-300" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                        <FaExternalLinkAlt className="text-gray-700 dark:text-gray-300" />
                    </motion.button>
                </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                A comprehensive e-commerce solution built with React and Node.js, featuring user authentication,
                payment processing, inventory management, and admin dashboard. Implemented responsive design
                and optimized for performance.
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                    React
                </span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                    Node.js
                </span>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium">
                    MongoDB
                </span>
                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 rounded-full text-sm font-medium">
                    Stripe API
                </span>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                        <FaCalendarAlt className="text-xs" />
                        <span>2024</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <FaClock className="text-xs" />
                        <span>3 months</span>
                    </div>
                </div>
                <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">Completed</span>
                </div>
            </div>
        </motion.div>

        {/* Project 2 */}
        <motion.div
            variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
            className="group relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 
                       rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300
                       hover:scale-[1.02] cursor-pointer"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                        <FaMobile className="text-purple-600 dark:text-purple-400 text-xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            Fitness Tracker App
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Mobile Application</p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                        <FaGithub className="text-gray-700 dark:text-gray-300" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                        <FaGooglePlay className="text-gray-700 dark:text-gray-300" />
                    </motion.button>
                </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                A cross-platform mobile application developed with React Native for tracking workouts,
                monitoring progress, and maintaining fitness goals. Features include offline support,
                data synchronization, and social sharing capabilities.
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-200 rounded-full text-sm font-medium">
                    React Native
                </span>
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 rounded-full text-sm font-medium">
                    Firebase
                </span>
                <span className="px-3 py-1 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 rounded-full text-sm font-medium">
                    Redux
                </span>
                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium">
                    SQLite
                </span>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                        <FaCalendarAlt className="text-xs" />
                        <span>2024</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <FaClock className="text-xs" />
                        <span>4 months</span>
                    </div>
                </div>
                <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">Completed</span>
                </div>
            </div>
        </motion.div>

        {/* Project 3 - New Addition */}
        <motion.div
            variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
            className="group relative bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-900 
                       rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300
                       hover:scale-[1.02] cursor-pointer"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                        <FaChartLine className="text-emerald-600 dark:text-emerald-400 text-xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            Analytics Dashboard
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Data Visualization Platform</p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                        <FaGithub className="text-gray-700 dark:text-gray-300" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                        <FaExternalLinkAlt className="text-gray-700 dark:text-gray-300" />
                    </motion.button>
                </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                An interactive dashboard built with Next.js and D3.js for real-time data visualization
                and analytics. Features customizable charts, filters, and export capabilities for
                business intelligence and reporting.
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-black dark:bg-gray-700 text-white dark:text-gray-200 rounded-full text-sm font-medium">
                    Next.js
                </span>
                <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-200 rounded-full text-sm font-medium">
                    Tailwind CSS
                </span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                    D3.js
                </span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                    PostgreSQL
                </span>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                        <FaCalendarAlt className="text-xs" />
                        <span>2024</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <FaClock className="text-xs" />
                        <span>2 months</span>
                    </div>
                </div>
                <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">In Progress</span>
                </div>
            </div>
        </motion.div>

        {/* View All Projects Button */}
        <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            className="pt-4"
        >
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                           text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl
                           flex items-center justify-center space-x-2"
            >
                <FaGithub />
                <span>View All Projects on GitHub</span>
                <FaExternalLinkAlt className="text-sm" />
            </motion.button>
        </motion.div>
    </motion.div>
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
    // {
    //     title: "Projects",
    //     description: "Innovative Solutions",
    //     icon: <FolderGit2 className="w-12 h-12 text-green-500" />,
    //     gradient: "bg-gradient-to-br from-green-50 to-teal-100 dark:from-green-900/20 dark:to-teal-900/20",
    //     modalKey: "projects",
    // },
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
