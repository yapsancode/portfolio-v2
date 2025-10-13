import { ReactNode } from "react";
import { motion } from "framer-motion";
import TimelineItem from "../../components/TimelineItem";

export const experienceContent: ReactNode = (
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