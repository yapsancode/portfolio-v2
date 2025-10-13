import { ReactNode } from "react";
import { motion } from "framer-motion";
import ProgressBar from "../../components/ProgressBar";
import { FaGit, FaLaravel, FaDatabase } from "react-icons/fa";
import { SiFlutter, SiNextdotjs, SiTailwindcss, SiFirebase, SiSubversion } from "react-icons/si";

export const skillsContent: ReactNode = (
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
            <h3 className="text-lg font-bold text-white border-b border-gray-700 pb-1">
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
                icon={<SiNextdotjs className="text-white" />}
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
            <h3 className="text-lg font-bold text-white border-b border-gray-700 pb-1">
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
            <h3 className="text-lg font-bold text-white border-b border-gray-700 pb-1">
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
            <h3 className="text-lg font-bold text-white border-b border-gray-700 pb-1">
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