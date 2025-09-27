'use client';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { Courier_Prime } from "next/font/google";
import Image from 'next/image';

const courierPrime = Courier_Prime({
    weight: "400",
    subsets: ["latin"],
});

export default function HeroSection() {
      return (
        <motion.div
          className="relative text-center pt-16 md:pt-24 pb-12 px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-10 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Image
                src="/me.jpg"
                alt="Isyraf Portrait"
                width={220}
                height={220}
                className="rounded-full shadow-lg border-4 border-purple-500/30"
              />
            </motion.div>
            <div className="flex-1 text-center md:text-left">
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <motion.h1
                  className="relative text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4"
                >
                  Holla! {"I'm"}
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
              <div className="mb-6">
                <TypeAnimation
                  sequence={[
                    "Software Engineer", 2000,
                    "Programmer", 2000,
                    "Vibe-Coder", 2000,
                    "Web Developer", 2000,
                    "Mobile Apps Developer", 2000,
                    "Full-Stack Developer", 2000,
                  ]}
                  wrapper="p"
                  speed={{ type: "keyStrokeDelayInMs", value: 150 }}
                  deletionSpeed={{ type: "keyStrokeDelayInMs", value: 150 }}
                  className={`${courierPrime.className} text-lg md:text-xl text-white max-w-2xl mx-auto md:mx-0 leading-relaxed`}
                  repeat={Infinity}
                />
              </div>
              <motion.p
                className="text-base md:text-lg text-white max-w-2xl mx-auto md:mx-0 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                From tinkering with old computers in my teens to building full-stack apps today —
                my journey has been all about <span className="font-semibold text-purple-500">curiosity, creativity, and code</span>.
                Now I’m on a mission to craft impactful digital experiences.
              </motion.p>
              <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
                <motion.a
                  href="#projects"
                  className="px-6 py-3 rounded-2xl bg-purple-600 text-white font-semibold shadow-md hover:bg-purple-700 transition"
                  whileHover={{ scale: 1.05 }}
                >
                  View Projects
                </motion.a>
                <motion.a
                  href="#contact"
                  className="px-6 py-3 rounded-2xl border border-purple-600 text-purple-400 font-semibold hover:bg-purple-600 hover:text-white transition"
                  whileHover={{ scale: 1.05 }}
                >
                  Contact Me
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>
      );
}
