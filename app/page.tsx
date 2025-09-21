'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DarkModeToggle from './components/DarkModeToggle';
import PageCard from './components/PageCard';
import Modal from './components/Modal';
import { portfolioSections, modalContents } from "./data/portfolio";


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

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />

      <main className="max-w-7xl mx-auto px-4 pb-20 transition-colors duration-300">
        <div className="relative text-center py-16 md:py-24 px-6">
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">

          <motion.h1
            className="relative text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Holla! {'I\'m'} <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Isyraf</span> 👋
          </motion.h1>
          {portfolioSections.map((section) => {
            if (section.modalKey) {
              return (
                <PageCard
                  key={section.title}
                  title={section.title}
                  description={section.description}
                  icon={section.icon}
                  gradient={section.gradient}
                  size={section.size}
                  onClick={() => openModal(section.title, modalContents[section.modalKey!])}
                />
              );
            }

            return (
              <PageCard
                key={section.title}
                title={section.title}
                description={section.description}
                icon={section.icon}
                gradient={section.gradient}
                size={section.size}
                onClick={section.action}
              />
            );
          })}


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