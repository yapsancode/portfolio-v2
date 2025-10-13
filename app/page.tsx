'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DarkModeToggle from './components/DarkModeToggle';
import PageCard from './components/PageCard';
import Modal from './components/Modal';
import { portfolioSections, modalContents } from "./data/portfolio";
import ScrollToTopButton from './components/ScrollToTopButton';
import HeroSection from './components/HeroSection';
import AnimatedBackground from './components/AnimatedBackground';
import LoadingScreen from './components/LoadingScreen';
import Footer from './components/footer';

export default function Home() {
  const [modalContent, setModalContent] = useState<{ title: string; content: React.ReactNode } | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Initialize theme and loading
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
    }

    // Simulate loading time for smooth entrance
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle theme changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const openModal = (title: string, content: React.ReactNode) => setModalContent({ title, content });
  const closeModal = () => setModalContent(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading screen
  if (isLoading) {
    return <LoadingScreen isLoading={true} />;
  }

  return (
    <div className={`relative min-h-screen w-full ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Enhanced Animated Background with Statue */}

      <AnimatedBackground mousePosition={mousePosition} />

      {/* Dark mode toggle */}
      <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Main content */}
      <div className="relative w-full pb-20 px-10 transition-colors duration-300">
        {/* Hero Section */}
        <HeroSection />
        {/* Portfolio grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {portfolioSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.6 + index * 0.1,
                ease: "easeOut"
              }}
            >{section.modalKey ? (
              <PageCard
                title={section.title}
                description={section.description}
                icon={section.icon}
                gradient={section.gradient}
                size={section.size}
                onClick={() => openModal(section.title, modalContents[section.modalKey!])}
              />
            ) : (
              <PageCard
                title={section.title}
                description={section.description}
                icon={section.icon}
                gradient={section.gradient}
                size={section.size}
                onClick={section.action}
              />
            )}
            </motion.div>
          ))}
        </motion.div>
        
      </div>
        <Footer />

      {/* Scroll to top button */}
      <ScrollToTopButton isVisible={showScrollTop} onClick={scrollToTop} />

      {/* Modal */}
      <Modal
        isOpen={!!modalContent}
        onClose={closeModal}
        title={modalContent?.title || ''}
        content={modalContent?.content || null}
      />
    </div>
  );
}