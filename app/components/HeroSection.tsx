'use client';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { Courier_Prime } from "next/font/google";

const courierPrime = Courier_Prime({
    weight: "400",
    subsets: ["latin"],
});

export default function HeroSection() {
    return (
        <motion.div
            className="relative text-center pt-16 md:pt-24 pb-2 md:pb-2 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            {/* Main heading */}
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <motion.h1
                    className="relative text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300"
                >
                    Holla! {'I\'m'}
                    <motion.span
                        className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent ml-4"
                        animate={{
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            backgroundSize: '200% 200%',
                        }}
                    >
                        Isyraf
                    </motion.span>
                    <motion.span
                        className="inline-block ml-2"
                        animate={{
                            rotate: [0, 14, -8, 14, -4, 10, 0],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 3
                        }}
                    >
                        👋
                    </motion.span>
                </motion.h1>
            </motion.div>

            <div className="mb-8 text-center">
                <TypeAnimation
                    sequence={[
                        // wait 2s before erasing
                        "Software Engineer",
                        2000,
                        "Programmer",
                        2000,
                        "Vibe-Coder",
                        2000,
                        "Web Developer",
                        2000,
                        "Mobile Apps Developer",
                        2000,
                        "Full-Stack Developer",
                        2000,
                    ]}
                    wrapper="p"
                    speed={{ type: "keyStrokeDelayInMs", value: 150 }} // typing speed
                    deletionSpeed={{ type: "keyStrokeDelayInMs", value: 150 }} // backspacing speed
                    className={`${courierPrime.className} text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed`}
                    repeat={Infinity} // infinite loop
                />
            </div>
        </motion.div>

    );
}