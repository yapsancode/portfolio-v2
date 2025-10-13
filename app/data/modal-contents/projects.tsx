import { ReactNode } from "react";
import { motion } from "framer-motion";
import {
    FaGlobe, FaMobile, FaChartLine, FaGithub, 
    FaExternalLinkAlt, FaGooglePlay, FaCalendarAlt, FaClock
} from "react-icons/fa";

export const projectsContent: ReactNode = (
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
            className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-900/50 rounded-lg">
                        <FaGlobe className="text-blue-400 text-xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                            E-Commerce Platform
                        </h3>
                        <p className="text-sm text-gray-400">Full-Stack Web Application</p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                        <FaGithub className="text-gray-300" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                        <FaExternalLinkAlt className="text-gray-300" />
                    </motion.button>
                </div>
            </div>

            <p className="text-gray-300 mb-4 leading-relaxed">
                A comprehensive e-commerce solution built with React and Node.js, featuring user authentication,
                payment processing, inventory management, and admin dashboard. Implemented responsive design
                and optimized for performance.
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-900/50 text-blue-200 rounded-full text-sm font-medium">
                    React
                </span>
                <span className="px-3 py-1 bg-green-900/50 text-green-200 rounded-full text-sm font-medium">
                    Node.js
                </span>
                <span className="px-3 py-1 bg-purple-900/50 text-purple-200 rounded-full text-sm font-medium">
                    MongoDB
                </span>
                <span className="px-3 py-1 bg-orange-900/50 text-orange-200 rounded-full text-sm font-medium">
                    Stripe API
                </span>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-400">
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
                    <span className="text-sm text-green-400 font-medium">Completed</span>
                </div>
            </div>
        </motion.div>

        {/* Project 2 & 3 - Similar structure */}
        {/* ... (truncated for brevity, include full content) */}

        {/* View All Projects Button */}
        <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            className="pt-4"
        >
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
                <FaGithub />
                <span>View All Projects on GitHub</span>
                <FaExternalLinkAlt className="text-sm" />
            </motion.button>
        </motion.div>
    </motion.div>
);
