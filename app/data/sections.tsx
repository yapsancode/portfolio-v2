import { ReactNode } from "react";
import { Code, Briefcase, GraduationCap, Info, Download } from "lucide-react";

export interface PortfolioSection {
    title: string;
    description: string;
    icon: ReactNode;
    gradient: string;
    size?: "small" | "medium" | "large";
    modalKey?: string;
    action?: () => void;
}

export const portfolioSections: PortfolioSection[] = [
    {
        title: "Flutter",
        description: "My first learn based project",
        icon: <Code className="w-12 h-12 text-blue-500" />,
        gradient: "bg-gradient-to-br from-blue-900/20 to-indigo-900/20",
        modalKey: "flutter",
    },
    {
        title: "Technical Skills",
        description: "Programming & Frameworks",
        icon: <Code className="w-12 h-12 text-blue-500" />,
        gradient: "bg-gradient-to-br from-blue-900/20 to-indigo-900/20",
        modalKey: "skills",
    },
    {
        title: "Experience",
        description: "Professional Work",
        icon: <Briefcase className="w-12 h-12 text-orange-500" />,
        gradient: "bg-gradient-to-br from-orange-900/20 to-red-900/20",
        modalKey: "experience",
    },
    {
        title: "Education",
        description: "Academic Background",
        icon: <GraduationCap className="w-12 h-12 text-purple-500" />,
        gradient: "bg-gradient-to-br from-purple-900/20 to-indigo-900/20",
        modalKey: "education",
        size: "large",
    },
    {
        title: "About This Page",
        description: "How it was built",
        icon: <Info className="w-12 h-12 text-green-500" />,
        gradient: "bg-gradient-to-br from-green-900/20 to-teal-900/20",
        modalKey: "about",
    },
    {
        title: "Download CV",
        description: "My skills, but make it PDF 🧩",
        icon: <Download className="w-12 h-12 text-green-500" />,
        gradient: "bg-gradient-to-br from-green-900/20 to-teal-900/20",
        action: () => {
            const link = document.createElement("a");
            link.href = "/resume.pdf";
            link.download = "Isyraf Afifi Resume.pdf";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
    },
];