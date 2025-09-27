"use client"
import { motion, Variants } from 'framer-motion';
import { Mail, Github, Linkedin, Heart, Code, Coffee } from 'lucide-react';
import { FaGithub, FaLinkedin, FaEnvelope, FaHeart } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      href: "https://github.com/yapsancode",
      icon: FaGithub,
      label: "GitHub",
      color: "hover:text-white"
    },
    {
      href: "https://linkedin.com/in/muhammad-isyraf-afifi",
      icon: FaLinkedin,
      label: "LinkedIn",
      color: "hover:text-blue-500"
    },
    {
      href: "https://mail.google.com/mail/?view=cm&fs=1&to=muhammadisyrafafifi@gmail.com",
      icon: FaEnvelope,
      label: "Mail",
      color: "hover:text-red-500"
    }
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  return (
    <motion.footer
      className="relative backdrop-blur-lg border-t border-gray-700/50"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/10 via-purple-600/10 to-pink-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-r from-emerald-400/10 via-cyan-600/10 to-blue-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 0.8, 1.2],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent" />
      </div>

      <div className="relative w-full px-12 py-12">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <motion.div
            className="text-center md:text-left"
            variants={itemVariants}
          >
            <h4 className="text-lg font-semibold text-white mb-4">
              {'Let\'s'} Connect
            </h4>
            <p className="text-gray-100 mb-6 text-sm">
              Have a project in mind? {'Let\'s'} collaborate and create something amazing together.
            </p>

            {/* Social Links */}
            <div className="flex justify-center md:justify-start space-x-4 mb-6">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 bg-gray-800/80 rounded-full text-gray-100 ${social.color} transition-all duration-300 shadow-md hover:shadow-lg`}
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>

            <div className="flex items-center justify-center md:justify-start space-x-2 text-sm text-gray-100">
              <Code className="w-4 h-4" />
              <span>Built with</span>
              <FaHeart className="w-3 h-3 text-red-500 animate-pulse" />
              <span>and</span>
              <Coffee className="w-4 h-4" />
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div
          className="border-t border-gray-700 pt-8"
          variants={itemVariants}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
            {/* Copyright */}
            <motion.p
              className="text-sm text-gray-100"
              whileHover={{ scale: 1.02 }}
            >
              © {currentYear} Isyraf. All rights reserved. Made with passion in Malaysia 🇲🇾
            </motion.p>

            {/* Status Badge */}
            <motion.div
              className="flex items-center space-x-2 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <motion.div
                className="w-2 h-2 bg-red-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-gray-100">
                Not available for new projects
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/50 rounded-full"
              style={{
                left: `${20 + i * 30}%`,
                top: `${10 + i * 20}%`,
              }}
              animate={{
                y: [-10, -30, -10],
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
            />
          ))}
        </div>
      </div>
    </motion.footer>
  );
}