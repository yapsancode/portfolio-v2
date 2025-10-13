import { ReactNode } from "react";
import { motion } from "framer-motion";
import { 
    Rocket, Lightbulb, Code2, Sparkles, Trophy, 
    Heart, Zap, Target, BookOpen, Coffee 
} from "lucide-react";
import { SiFlutter, SiDart, SiAndroid, SiApple } from "react-icons/si";

// Journey milestone type
interface JourneyMilestone {
    phase: string;
    title: string;
    period: string;
    story: string;
    icon: ReactNode;
    color: string;
    gradient: string;
    achievement?: string;
}

const milestones: JourneyMilestone[] = [
    {
        phase: "The Spark",
        title: "Why Flutter?",
        period: "Day 0",
        story: "It all started with a simple question: 'How do I build apps that work everywhere?' I was tired of learning separate languages for iOS and Android. Then I discovered Flutter—one codebase, beautiful UIs, and that satisfying hot reload. I was hooked.",
        icon: <Lightbulb className="w-6 h-6" />,
        color: "text-yellow-400",
        gradient: "from-yellow-500/20 to-orange-500/20",
        achievement: "Decision made: Flutter it is! 🚀"
    },
    {
        phase: "First Steps",
        title: "Hello World & Beyond",
        period: "Week 1-2",
        story: "Started with the basics—widgets, widgets, and more widgets. Everything is a widget! Built my first 'Hello World' app, then a counter app. It felt magical watching the UI update instantly with hot reload. No more waiting for builds!",
        icon: <Code2 className="w-6 h-6" />,
        color: "text-blue-400",
        gradient: "from-blue-500/20 to-cyan-500/20",
        achievement: "First app deployed on emulator 📱"
    },
    {
        phase: "The Grind",
        title: "Layouts, State & Coffee",
        period: "Month 1-2",
        story: "Dove deep into layouts: Rows, Columns, Stacks, oh my! Battled with state management—setState was my friend, then my enemy. Learned Provider, and suddenly everything clicked. Late nights fueled by coffee and determination.",
        icon: <Coffee className="w-6 h-6" />,
        color: "text-amber-400",
        gradient: "from-amber-500/20 to-orange-500/20",
        achievement: "Mastered StatefulWidgets & Provider 🎯"
    },
    {
        phase: "Real Projects",
        title: "Building Something Real",
        period: "Month 3-4",
        story: "Time to build! Created my first real app—a task manager with Firebase backend. Struggled with async operations, null safety, and debugging. But each error taught me something new. The feeling when the app actually worked? Priceless.",
        icon: <Rocket className="w-6 h-6" />,
        color: "text-purple-400",
        gradient: "from-purple-500/20 to-pink-500/20",
        achievement: "First full-stack app with Firebase 🔥"
    },
    {
        phase: "Level Up",
        title: "Advanced Patterns",
        period: "Month 5-6",
        story: "Explored advanced topics: custom animations, complex state management with Riverpod, clean architecture, and testing. Started contributing to open-source Flutter packages. The community is amazing!",
        icon: <Zap className="w-6 h-6" />,
        color: "text-green-400",
        gradient: "from-green-500/20 to-emerald-500/20",
        achievement: "Contributed to open-source 🌟"
    },
    {
        phase: "The Journey Continues",
        title: "Always Learning",
        period: "Present",
        story: "Flutter keeps evolving, and so do I. Now working on production apps, mentoring others, and exploring new possibilities. From web to desktop, Flutter's potential is endless. This is just the beginning.",
        icon: <Heart className="w-6 h-6" />,
        color: "text-red-400",
        gradient: "from-red-500/20 to-pink-500/20",
        achievement: "Professional Flutter Developer 🏆"
    }
];

export const flutterJourneyContent: ReactNode = (
    <div className="relative">
        {/* Hero Section */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 mb-8"
        >
            <div className="relative z-10">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="flex items-center justify-center mb-4"
                >
                    <div className="relative">
                        <SiFlutter className="w-20 h-20 text-white" />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-2 -right-2"
                        >
                            <Sparkles className="w-8 h-8 text-yellow-300" />
                        </motion.div>
                    </div>
                </motion.div>
                <h2 className="text-3xl font-bold text-white text-center mb-2">
                    My Flutter Journey
                </h2>
                <p className="text-blue-100 text-center text-lg">
                    From zero to hero—one widget at a time
                </p>
            </div>

            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-20">
                <motion.div
                    animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0]
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ 
                        scale: [1, 1.3, 1],
                        rotate: [0, -90, 0]
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute bottom-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"
                />
            </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm rounded-xl p-4 border border-blue-700/50">
                <div className="flex items-center justify-between mb-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    <span className="text-2xl font-bold text-white">10+</span>
                </div>
                <p className="text-sm text-gray-300">Projects Built</p>
            </div>
            <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm rounded-xl p-4 border border-purple-700/50">
                <div className="flex items-center justify-between mb-2">
                    <Coffee className="w-5 h-5 text-purple-400" />
                    <span className="text-2xl font-bold text-white">200+</span>
                </div>
                <p className="text-sm text-gray-300">Hours Coded</p>
            </div>
            <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm rounded-xl p-4 border border-green-700/50">
                <div className="flex items-center justify-between mb-2">
                    <BookOpen className="w-5 h-5 text-green-400" />
                    <span className="text-2xl font-bold text-white">50+</span>
                </div>
                <p className="text-sm text-gray-300">Lessons Learned</p>
            </div>
            <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/40 backdrop-blur-sm rounded-xl p-4 border border-orange-700/50">
                <div className="flex items-center justify-between mb-2">
                    <Trophy className="w-5 h-5 text-orange-400" />
                    <span className="text-2xl font-bold text-white">∞</span>
                </div>
                <p className="text-sm text-gray-300">More to Learn</p>
            </div>
        </motion.div>

        {/* Timeline */}
        <div className="space-y-6">
            {milestones.map((milestone, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                >
                    {/* Connecting Line */}
                    {index < milestones.length - 1 && (
                        <div className="absolute left-6 top-16 w-0.5 h-full bg-gradient-to-b from-gray-600 to-transparent" />
                    )}

                    <div className="flex gap-4">
                        {/* Icon Circle */}
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            className={`relative flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${milestone.gradient} border-2 border-gray-700 flex items-center justify-center ${milestone.color} backdrop-blur-sm z-10`}
                        >
                            {milestone.icon}
                        </motion.div>

                        {/* Content Card */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="flex-1 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        {milestone.phase}
                                    </span>
                                    <h3 className="text-xl font-bold text-white mt-1">
                                        {milestone.title}
                                    </h3>
                                </div>
                                <span className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
                                    {milestone.period}
                                </span>
                            </div>

                            <p className="text-gray-300 leading-relaxed mb-4">
                                {milestone.story}
                            </p>

                            {milestone.achievement && (
                                <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${milestone.gradient} border border-gray-700 rounded-lg px-4 py-2`}>
                                    <Trophy className={`w-4 h-4 ${milestone.color}`} />
                                    <span className="text-sm font-medium text-white">
                                        {milestone.achievement}
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </motion.div>
            ))}
        </div>

        {/* Tech Stack Footer */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                Tech Stack I've Mastered
            </h4>
            <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-blue-900/30 border border-blue-700/50 rounded-lg px-4 py-2">
                    <SiFlutter className="text-blue-400 text-xl" />
                    <span className="text-white font-medium">Flutter</span>
                </div>
                <div className="flex items-center gap-2 bg-cyan-900/30 border border-cyan-700/50 rounded-lg px-4 py-2">
                    <SiDart className="text-cyan-400 text-xl" />
                    <span className="text-white font-medium">Dart</span>
                </div>
                <div className="flex items-center gap-2 bg-green-900/30 border border-green-700/50 rounded-lg px-4 py-2">
                    <SiAndroid className="text-green-400 text-xl" />
                    <span className="text-white font-medium">Android</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-800/30 border border-gray-700/50 rounded-lg px-4 py-2">
                    <SiApple className="text-gray-300 text-xl" />
                    <span className="text-white font-medium">iOS</span>
                </div>
            </div>
        </motion.div>

        {/* Closing Note */}
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center"
        >
            <p className="text-gray-400 italic">
                "Every line of code is a step forward. Every bug is a lesson. Every app is a milestone."
            </p>
            <p className="text-blue-400 font-semibold mt-2">
                — My Flutter Philosophy
            </p>
        </motion.div>
    </div>
);