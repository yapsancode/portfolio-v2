import { ReactNode } from "react";
import TimelineItem from "../../components/TimelineItem";

export const educationContent: ReactNode = (
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