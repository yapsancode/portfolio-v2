'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Code, Database, Layout, Briefcase, GraduationCap, FolderGit2 } from 'lucide-react';

interface SkillCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient?: string;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
}

const SkillCard: React.FC<SkillCardProps> = ({
  title,
  description,
  icon,
  gradient = 'bg-gradient-to-br from-gray-50 to-gray-100',
  onClick,
  size = 'medium'
}) => {
  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-1 md:col-span-1',
    large: 'col-span-1 md:col-span-2'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`${sizeClasses[size]} ${gradient} rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden group`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative z-10">
        <div className="mb-4 text-4xl md:text-5xl">
          {icon}
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
          {title}
        </h3>
        <p className="text-gray-700 text-base md:text-lg font-medium">
          {description}
        </p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, content }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
            <h2 id="modal-title" className="text-3xl font-bold text-gray-900 mb-6 pr-12">
              {title}
            </h2>
            <div className="text-gray-700">
              {content}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function Home() {
  const [modalContent, setModalContent] = useState<{ title: string; content: React.ReactNode } | null>(null);

  const openModal = (title: string, content: React.ReactNode) => {
    setModalContent({ title, content });
  };

  const closeModal = () => {
    setModalContent(null);
  };

  const skillsContent = (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-400 text-white p-6 rounded-2xl">
        <h3 className="text-xl font-bold mb-2">Technical Skills</h3>
        <p>Versatile skill set in programming, frameworks, and tools.</p>
      </div>
      <ul className="space-y-3">
        <li className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="font-medium">Programming</span>
          <span className="text-gray-600">HTML, CSS, JS, Dart, PHP</span>
        </li>
        <li className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="font-medium">Frameworks</span>
          <span className="text-gray-600">Flutter, Laravel, SAP Build, CodeIgniter</span>
        </li>
        <li className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="font-medium">Databases</span>
          <span className="text-gray-600">Firebase, MySQL, phpMyAdmin</span>
        </li>
        <li className="flex justify-between items-center py-2">
          <span className="font-medium">Version Control</span>
          <span className="text-gray-600">Git, SVN</span>
        </li>
      </ul>
    </div>
  );

  const projectsContent = (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-green-500 to-teal-500 text-white p-6 rounded-2xl">
        <h3 className="text-2xl font-bold mb-3">Projects</h3>
        <p>Hands-on experience in innovative and practical solutions.</p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-bold text-lg mb-2">Speed Trap Monitoring</h4>
          <ul className="text-sm space-y-1">
            <li>• IoT system using ESP32 and IR sensor</li>
            <li>• Built with Flutter, Firebase, and Arduino</li>
            <li>• Displayed data via Google Sheets</li>
          </ul>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-bold text-lg mb-2">Smart Parking App Mock-Up</h4>
          <ul className="text-sm space-y-1">
            <li>• Designed intuitive UI/UX with Figma</li>
            <li>• Focused on user engagement</li>
          </ul>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-bold text-lg mb-2">Tokyo Marine Invoice</h4>
          <ul className="text-sm space-y-1">
            <li>• Converted XML data to invoices using OpenText Exstream</li>
            <li>• Managed full project lifecycle</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const experienceContent = (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-orange-500 to-red-400 text-white p-6 rounded-2xl">
        <h3 className="text-xl font-bold mb-2">Work Experience</h3>
        <p>Professional experience in real-world projects.</p>
      </div>
      <ul className="space-y-3">
        <li className="py-2 border-b border-gray-100">
          <span className="font-medium">Associate Consultant – Flutter Developer</span>
          <p className="text-gray-600">E-Outsource Asia Sdn Bhd, Jan 2025–Present</p>
          <p className="text-sm">Built Enterprise eWorkSpace using Flutter and BLoC, managed code with GitHub.</p>
        </li>
        <li className="py-2 border-b border-gray-100">
          <span className="font-medium">Programmer (Protege)</span>
          <p className="text-gray-600">Zanko Sdn Bhd, Oct–Dec 2024</p>
          <p className="text-sm">Contributed to Blockchain as a Service using PHP CodeIgniter, managed with SmartSVN.</p>
        </li>
        <li className="py-2">
          <span className="font-medium">Emerging Tech Team (Intern)</span>
          <p className="text-gray-600">Delaware Consulting Malaysia, Feb–Aug 2024</p>
          <p className="text-sm">Worked on OpenText Exstream and SAP BTP Cloud Foundry for app development.</p>
        </li>
      </ul>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="relative text-center py-16 md:py-24 px-6 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        {/* Decorative background blob */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />

        <motion.h1
          className="relative text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Holla! I’m <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Isyraf</span> 👋
        </motion.h1>

        <motion.p
          className="relative text-lg md:text-xl text-gray-700 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Sculptor of digital dimensions, forging web experiences that blend divine creativity with relentless functionality. 
          Dare to explore the masterpieces I’ve crafted? 🌀 Behold my portfolio!
        </motion.p>

        {/* Action buttons */}
        <motion.div
          className="relative flex flex-wrap justify-center gap-4 mt-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4, type: "spring" }}
        >
          <a
            href="mailto:muhammadisyrafafifi@gmail.com"
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-blue-500 text-white font-medium hover:bg-blue-600 transition"
          >
            📧 Email
          </a>
          <a
            href="tel:+601133506561"
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-gray-800 text-white font-medium hover:bg-gray-900 transition"
          >
            📱 Call
          </a>
          <a
            href="https://www.linkedin.com/in/muhammad-isyraf-afifi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-blue-700 text-white font-medium hover:bg-blue-800 transition"
          >
            🔗 LinkedIn
          </a>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          className="relative mt-12 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <span className="animate-bounce text-gray-500">↓ Scroll down</span>
        </motion.div>
      </header>


      <main className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <SkillCard
            title="Technical Skills"
            description="Programming & Frameworks"
            icon={<Code className="w-12 h-12 text-blue-500" />}
            gradient="bg-gradient-to-br from-blue-50 to-indigo-100"
            onClick={() => openModal("Technical Skills", skillsContent)}
          />
          <SkillCard
            title="Projects"
            description="Innovative Solutions"
            icon={<FolderGit2 className="w-12 h-12 text-green-500" />}
            gradient="bg-gradient-to-br from-green-50 to-teal-100"
            onClick={() => openModal("Projects", projectsContent)}
          />
          <SkillCard
            title="Experience"
            description="Professional Work"
            icon={<Briefcase className="w-12 h-12 text-orange-500" />}
            gradient="bg-gradient-to-br from-orange-50 to-red-100"
            onClick={() => openModal("Work Experience", experienceContent)}
          />
          <SkillCard
            title="Education"
            description="Academic Background"
            icon={<GraduationCap className="w-12 h-12 text-purple-500" />}
            gradient="bg-gradient-to-br from-purple-50 to-indigo-100"
            size="large"
            onClick={() => openModal("Education", (
              <div className="space-y-4">
                <p>Strong academic foundation in computer science.</p>
                <ul className="space-y-2">
                  <li>
                    <strong>Bachelor’s in Computer Science (Hons.)</strong>
                    <p className="text-gray-600">Management and Science University, 2021–2024, CGPA: 3.45</p>
                  </li>
                  <li>
                    <strong>Foundation in Information Technology</strong>
                    <p className="text-gray-600">Management and Science University, 2020–2021, CGPA: 3.11</p>
                  </li>
                  <li>
                    <strong>Community Service</strong>
                    <p className="text-gray-600">Assistant Treasurer/Technical Support, Shah Alam</p>
                    <p className="text-sm">Created Minutes of Meetings and collaborated on event planning.</p>
                  </li>
                </ul>
              </div>
            ))}
          />
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