import { ReactNode } from "react";
import { motion } from "framer-motion";
import { 
    Users, Calendar, Shield, Laptop, Server, 
    Database, CheckCircle, AlertCircle, Heart,
    Code, Puzzle, Rocket, Brain, Handshake
} from "lucide-react";
import { SiNextdotjs, SiSpringboot, SiTailwindcss, SiReact } from "react-icons/si";
import { FaHospital, FaUserMd, FaCalendarCheck } from "react-icons/fa";

// Project features
const projectFeatures = [
    {
        icon: <FaHospital className="w-5 h-5" />,
        title: "Clinic Showcase",
        description: "Landing page with services, team, and facility gallery",
        color: "text-blue-400",
        gradient: "from-blue-500/20 to-cyan-500/20"
    },
    {
        icon: <FaCalendarCheck className="w-5 h-5" />,
        title: "Booking System",
        description: "Real-time slot management and appointment scheduling",
        color: "text-green-400",
        gradient: "from-green-500/20 to-emerald-500/20"
    },
    {
        icon: <FaUserMd className="w-5 h-5" />,
        title: "Patient Portal",
        description: "View appointments, medical history, and prescriptions",
        color: "text-purple-400",
        gradient: "from-purple-500/20 to-pink-500/20"
    },
    {
        icon: <Shield className="w-5 h-5" />,
        title: "Admin Dashboard",
        description: "Manage bookings, patients, doctors, and clinic data",
        color: "text-orange-400",
        gradient: "from-orange-500/20 to-red-500/20"
    }
];

// Journey phases
const journeyPhases = [
    {
        phase: "The Beginning",
        title: "First Collaboration",
        icon: <Handshake className="w-6 h-6" />,
        story: "My friend approached me with an idea: build a clinic management system. He'd handle the backend with Spring Boot, and I'd tackle the frontend. One problem—I'd never used Next.js before. But hey, what's learning without a challenge?",
        color: "text-blue-400",
        gradient: "from-blue-500/20 to-cyan-500/20",
        emotion: "🤝 Excited & Nervous"
    },
    {
        phase: "The Setup",
        title: "Diving Into Next.js",
        icon: <Laptop className="w-6 h-6" />,
        story: "Installed Next.js, opened the docs, and... wow, this is different from React. File-based routing? Server components? API routes? I spent the first week just understanding the fundamentals while my friend built the REST APIs.",
        color: "text-purple-400",
        gradient: "from-purple-500/20 to-pink-500/20",
        emotion: "📚 Learning Mode Activated"
    },
    {
        phase: "The Frontend",
        title: "Building the Showcase",
        icon: <Code className="w-6 h-6" />,
        story: "Started with the landing page—clinic info, services, team profiles. Integrated Tailwind CSS for styling. The component-based structure felt familiar, but Next.js's Image optimization and Link components were game-changers for performance.",
        color: "text-cyan-400",
        gradient: "from-cyan-500/20 to-blue-500/20",
        emotion: "🎨 Creative Flow"
    },
    {
        phase: "The Challenge",
        title: "Booking System Puzzle",
        icon: <Puzzle className="w-6 h-6" />,
        story: "The booking system was the real challenge. Calendar integration, slot availability in real-time, form validation, and connecting it all to the Spring Boot backend. Spent countless hours debugging CORS issues and API integrations. Each solved bug felt like a victory.",
        color: "text-yellow-400",
        gradient: "from-yellow-500/20 to-orange-500/20",
        emotion: "🧩 Problem-Solving Grind"
    },
    {
        phase: "The Integration",
        title: "Frontend Meets Backend",
        icon: <Server className="w-6 h-6" />,
        story: "Learning to work with REST APIs was eye-opening. Fetching data, handling loading states, error handling, and authentication. My friend's Spring Boot backend was solid, but making our systems communicate smoothly required constant collaboration and testing.",
        color: "text-green-400",
        gradient: "from-green-500/20 to-emerald-500/20",
        emotion: "🔗 Teamwork Makes the Dream Work"
    },
    {
        phase: "The Dashboard",
        title: "Admin Power Panel",
        icon: <Shield className="w-6 h-6" />,
        story: "Built the admin dashboard—tables, filters, CRUD operations, and analytics. Learned about protected routes, role-based access, and state management. Seeing all the data come together in a clean, functional interface was incredibly satisfying.",
        color: "text-red-400",
        gradient: "from-red-500/20 to-pink-500/20",
        emotion: "🛡️ Power User Unlocked"
    },
    {
        phase: "The Launch",
        title: "Going Live",
        icon: <Rocket className="w-6 h-6" />,
        story: "Deployed on Vercel (frontend) while my friend handled the backend deployment. The moment we saw it working live, taking real bookings, and helping an actual clinic—that's when it hit me: we built something real. Something that matters.",
        color: "text-indigo-400",
        gradient: "from-indigo-500/20 to-purple-500/20",
        emotion: "🚀 Mission Accomplished"
    }
];

// Lessons learned
const lessonsLearned = [
    {
        title: "Next.js is Powerful",
        description: "SSR, SSG, and API routes make it perfect for full-stack apps",
        icon: <Brain className="w-5 h-5" />
    },
    {
        title: "Collaboration is Key",
        description: "Clear communication and documentation saved countless hours",
        icon: <Users className="w-5 h-5" />
    },
    {
        title: "Start with the Basics",
        description: "Master the fundamentals before jumping into complex features",
        icon: <CheckCircle className="w-5 h-5" />
    },
    {
        title: "Testing is Essential",
        description: "Test early, test often—especially API integrations",
        icon: <AlertCircle className="w-5 h-5" />
    }
];

export const nextjsJourneyContent: ReactNode = (
    <div className="relative">
        {/* Hero Section */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-8 mb-8 border border-gray-800"
        >
            <div className="relative z-10">
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="flex items-center justify-center mb-4"
                >
                    <div className="relative">
                        <SiNextdotjs className="w-20 h-20 text-white" />
                        <motion.div
                            animate={{ 
                                scale: [1, 1.2, 1],
                                rotate: [0, 180, 360]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute -top-3 -right-3"
                        >
                            <SiSpringboot className="w-10 h-10 text-green-500" />
                        </motion.div>
                    </div>
                </motion.div>
                <h2 className="text-3xl font-bold text-white text-center mb-2">
                    Next.js × Spring Boot
                </h2>
                <p className="text-gray-400 text-center text-lg mb-4">
                    My First Real-World Collaboration Project
                </p>
                <div className="flex items-center justify-center gap-2">
                    <div className="px-4 py-1.5 bg-blue-600/20 border border-blue-500/30 rounded-full">
                        <span className="text-sm text-blue-300 font-medium">Clinic Management System</span>
                    </div>
                </div>
            </div>

            {/* Animated grid background */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem]" />
            </div>
        </motion.div>

        {/* Project Overview */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
        >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-400" />
                What We Built
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectFeatures.map((feature, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.03 }}
                        className={`bg-gradient-to-br ${feature.gradient} backdrop-blur-sm rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-all`}
                    >
                        <div className={`${feature.color} mb-3`}>
                            {feature.icon}
                        </div>
                        <h4 className="text-white font-semibold mb-2">{feature.title}</h4>
                        <p className="text-gray-400 text-sm">{feature.description}</p>
                    </motion.div>
                ))}
            </div>
        </motion.div>

        {/* Tech Stack Split */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
            <div className="grid md:grid-cols-2 gap-6">
                {/* Frontend */}
                <div>
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Laptop className="w-5 h-5 text-blue-400" />
                        My Stack (Frontend)
                    </h4>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 bg-gray-900/50 rounded-lg p-3">
                            <SiNextdotjs className="text-white text-2xl" />
                            <div>
                                <p className="text-white font-medium">Next.js 14</p>
                                <p className="text-gray-400 text-xs">React Framework</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-900/50 rounded-lg p-3">
                            <SiTailwindcss className="text-cyan-400 text-2xl" />
                            <div>
                                <p className="text-white font-medium">Tailwind CSS</p>
                                <p className="text-gray-400 text-xs">Styling</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-900/50 rounded-lg p-3">
                            <SiReact className="text-blue-400 text-2xl" />
                            <div>
                                <p className="text-white font-medium">React Hooks</p>
                                <p className="text-gray-400 text-xs">State Management</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Backend */}
                <div>
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Server className="w-5 h-5 text-green-400" />
                        Friend's Stack (Backend)
                    </h4>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 bg-gray-900/50 rounded-lg p-3">
                            <SiSpringboot className="text-green-500 text-2xl" />
                            <div>
                                <p className="text-white font-medium">Spring Boot</p>
                                <p className="text-gray-400 text-xs">Java Framework</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-900/50 rounded-lg p-3">
                            <Database className="text-blue-400 text-2xl" />
                            <div>
                                <p className="text-white font-medium">PostgreSQL</p>
                                <p className="text-gray-400 text-xs">Database</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-900/50 rounded-lg p-3">
                            <Shield className="text-orange-400 text-2xl" />
                            <div>
                                <p className="text-white font-medium">JWT Auth</p>
                                <p className="text-gray-400 text-xs">Security</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>

        {/* Journey Timeline */}
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-8"
        >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-400" />
                The Journey
            </h3>
            <div className="space-y-6">
                {journeyPhases.map((phase, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="relative"
                    >
                        {/* Connecting Line */}
                        {index < journeyPhases.length - 1 && (
                            <div className="absolute left-6 top-16 w-0.5 h-full bg-gradient-to-b from-gray-600 to-transparent" />
                        )}

                        <div className="flex gap-4">
                            {/* Icon */}
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className={`relative flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${phase.gradient} border-2 border-gray-700 flex items-center justify-center ${phase.color} backdrop-blur-sm z-10`}
                            >
                                {phase.icon}
                            </motion.div>

                            {/* Content */}
                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                className="flex-1 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-all"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            {phase.phase}
                                        </span>
                                        <h4 className="text-lg font-bold text-white mt-1">
                                            {phase.title}
                                        </h4>
                                    </div>
                                    <span className="text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
                                        {phase.emotion}
                                    </span>
                                </div>
                                <p className="text-gray-300 leading-relaxed">
                                    {phase.story}
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>

        {/* Lessons Learned */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-indigo-700/50"
        >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Brain className="w-6 h-6 text-indigo-400" />
                Key Takeaways
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
                {lessonsLearned.map((lesson, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 bg-gray-900/50 rounded-lg p-4"
                    >
                        <div className="text-indigo-400 mt-1">
                            {lesson.icon}
                        </div>
                        <div>
                            <h5 className="text-white font-semibold mb-1">{lesson.title}</h5>
                            <p className="text-gray-400 text-sm">{lesson.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>

        {/* Closing Note */}
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center"
        >
            <p className="text-gray-400 italic">
                "This project taught me more than any tutorial ever could. Real problems, real deadlines, real teamwork."
            </p>
            <p className="text-indigo-400 font-semibold mt-2">
                — The best way to learn is by building.
            </p>
        </motion.div>
    </div>
);