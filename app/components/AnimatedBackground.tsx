'use client';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
    mousePosition: { x: number; y: number };
}

export default function AnimatedBackground({ mousePosition }: AnimatedBackgroundProps) {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
            {/* Background Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-white/20 to-gray-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900" />



            {/* Animated Color Clouds */}
            <motion.div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-t from-pink-500/30 via-purple-500/20 to-transparent rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.3, 1.1, 1],
                    x: [-50, 50, -30, 0],
                    opacity: [0.3, 0.6, 0.4, 0.3],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            <motion.div
                className="absolute bottom-0 left-1/4 w-[600px] h-[500px] bg-gradient-to-t from-green-400/25 via-yellow-400/15 to-transparent rounded-full blur-3xl"
                animate={{
                    scale: [1.2, 0.8, 1.4, 1.2],
                    x: [30, -40, 20, 30],
                    opacity: [0.2, 0.5, 0.3, 0.2],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
            />

            <motion.div
                className="absolute bottom-0 right-1/4 w-[700px] h-[550px] bg-gradient-to-t from-orange-400/20 via-red-400/15 to-transparent rounded-full blur-3xl"
                animate={{
                    scale: [0.9, 1.5, 1, 0.9],
                    x: [-20, 60, -10, -20],
                    opacity: [0.25, 0.4, 0.35, 0.25],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 4
                }}
            />

            {/* Mouse-following subtle gradient */}
            <motion.div
                className="absolute w-96 h-96 bg-gradient-to-r from-blue-400/8 to-cyan-400/8 rounded-full blur-3xl"
                style={{
                    x: mousePosition.x * 0.03,
                    y: mousePosition.y * 0.03,
                }}
                animate={{
                    x: [mousePosition.x * 0.03 - 20, mousePosition.x * 0.03 + 20, mousePosition.x * 0.03 - 20],
                    y: [mousePosition.y * 0.03 - 20, mousePosition.y * 0.03 + 20, mousePosition.y * 0.03 - 20],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />

            {/* Statue Element */}
            <motion.div
                className="absolute bottom-0 right-8 md:right-16 lg:right-24 opacity-20 dark:opacity-30"
                initial={{ opacity: 0, y: 100, scale: 0.8 }}
                animate={{ opacity: 0.2, y: 0, scale: 1 }}
                transition={{ duration: 2, delay: 1, ease: "easeOut" }}
            >
                <motion.img
                    src="/statue.png"
                    alt="Decorative Statue"
                    className="w-64 md:w-80 lg:w-96 h-auto object-contain filter drop-shadow-2xl"
                    animate={{
                        y: [-10, 10, -10],
                        rotate: [-1, 1, -1],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Statue Glow Effect */}
                <motion.div
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-to-t from-purple-400/30 to-transparent rounded-full blur-2xl"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </motion.div>

            {/* Geometric Frame Effect */}
            <motion.div
                className="absolute bottom-0 right-8 md:right-16 lg:right-24 opacity-10 dark:opacity-20"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.15, scale: 1 }}
                transition={{ duration: 2, delay: 1.5 }}
            >
                <motion.div
                    className="w-80 md:w-96 lg:w-[28rem] h-96 md:h-[28rem] lg:h-[32rem] border-4 border-gradient-to-r from-yellow-400/50 via-green-400/50 to-purple-400/50 rounded-lg"
                    style={{
                        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(34, 197, 94, 0.1), rgba(168, 85, 247, 0.1))',
                        borderImage: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(34, 197, 94, 0.3), rgba(168, 85, 247, 0.3)) 1'
                    }}
                    animate={{
                        rotateY: [0, 5, -5, 0],
                        scale: [1, 1.02, 1],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </motion.div>

            {/* Floating Particles */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-30"
                    style={{
                        left: `${20 + i * 15}%`,
                        bottom: `${10 + i * 8}%`,
                    }}
                    animate={{
                        y: [-20, -80, -20],
                        x: [-10, 10, -10],
                        opacity: [0.3, 0.7, 0.3],
                        scale: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 6 + i * 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.5,
                    }}
                />
            ))}

            {/* Grid Pattern Overlay */}
            <div
                className="absolute inset-0 opacity-5 dark:opacity-10"
                style={{
                    backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
                    backgroundSize: '50px 50px'
                }}
            />
        </div>
    );
}