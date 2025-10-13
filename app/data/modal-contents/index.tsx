import { ReactNode } from "react";
import { skillsContent } from "./skills";
import { projectsContent } from "./projects";
import { experienceContent } from "./experience";
import { educationContent } from "./educations";
import { aboutContent } from "./about";

export const modalContents: Record<string, ReactNode> = {
    skills: skillsContent,
    projects: projectsContent,
    experience: experienceContent,
    education: educationContent,
    about: aboutContent,
};