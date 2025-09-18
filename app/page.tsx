'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code, Briefcase, GraduationCap, FolderGit2 } from 'lucide-react';
import DarkModeToggle from './components/DarkModeToggle';
import SkillCard from './components/SkillCard';
import ProgressBar from './components/ProgressBar';
import TimelineItem from './components/TimelineItem';
import Modal from './components/Modal';

export default function Home() {
  const [modalContent, setModalContent] = useState<{ title: string; content: React.ReactNode } | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const openModal = (title: string, content: React.ReactNode) => setModalContent({ title, content });
  const closeModal = () => setModalContent(null);

  const skillsContent: React.ReactNode = (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Technical Skills</h3>
      <ProgressBar skill="JavaScript" percentage={90} color="bg-blue-500" />
      <ProgressBar skill="React" percentage={85} color="bg-indigo-500" />
      <ProgressBar skill="TypeScript" percentage={80} color="bg-purple-500" />
    </div>
  );

  const projectsContent: React.ReactNode = (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Projects</h3>
      <p>Project 1: Built a full-stack web app using React and Node.js.</p>
      <p>Project 2: Developed a mobile app with React Native.</p>
    </div>
  );

  const experienceContent: React.ReactNode = (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Work Experience</h3>
      <TimelineItem
        title="Software Developer"
        company="Tech Corp"
        period="2023 – Present"
        description="Developed and maintained web applications using modern frameworks."
      />
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />



      <main className="max-w-7xl mx-auto px-4 pb-20 transition-colors duration-300">
        <div className="relative text-center py-16 md:py-24 px-6">
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <SkillCard
            title="Technical Skills"
            description="Programming & Frameworks"
            icon={<Code className="w-12 h-12 text-blue-500" />}
            gradient="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20"
            onClick={() => openModal("Technical Skills", skillsContent)}
          />
          <SkillCard
            title="Projects"
            description="Innovative Solutions"
            icon={<FolderGit2 className="w-12 h-12 text-green-500" />}
            gradient="bg-gradient-to-br from-green-50 to-teal-100 dark:from-green-900/20 dark:to-teal-900/20"
            onClick={() => openModal("Projects", projectsContent)}
          />
          <SkillCard
            title="Experience"
            description="Professional Work"
            icon={<Briefcase className="w-12 h-12 text-orange-500" />}
            gradient="bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-900/20"
            onClick={() => openModal("Work Experience", experienceContent)}
          />
          <motion.h1
            className="relative text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Holla! {'I\'m'} <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Isyraf</span> 👋
          </motion.h1>
          <SkillCard
            title="Education"
            description="Academic Background"
            icon={<GraduationCap className="w-12 h-12 text-purple-500" />}
            gradient="bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20"
            size="large"
            onClick={() => openModal("Education", (
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
            ))}
          />

          
          <motion.p
            className="relative text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Sculptor of digital dimensions, forging web experiences that blend divine creativity with relentless functionality.
            Dare to explore the masterpieces {'I\'ve'} crafted? 🌀 Behold my portfolio!
          </motion.p>
        </div>
      </main>

      <Modal
        isOpen={!!modalContent}
        onClose={closeModal}
        title={modalContent?.title || ''}
        content={modalContent?.content || null}
      />
    </div>
  );
}