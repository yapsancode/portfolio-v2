'use client';

import { motion } from 'framer-motion';

interface SkillCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient?: string;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
}

const SkillCard: React.FC<SkillCardProps> = ({
  title,
  description,
  icon,
  gradient = 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900',
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
      whileHover={{ 
        scale: 1.02, 
        y: -4,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
      whileTap={{ scale: 0.98 }}
      className={`${sizeClasses[size]} ${gradient} rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden group border border-gray-100 dark:border-gray-700`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Floating icon animation */}
      <motion.div
        className="mb-4 text-4xl md:text-5xl relative z-10"
        animate={{ 
          y: [0, -8, 0],
          rotate: [0, 2, -2, 0]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        {icon}
      </motion.div>
      
      <div className="relative z-10">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
          {title}
        </h3>
        <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg font-medium">
          {description}
        </p>
      </div>
      
      {/* Subtle pulse effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
    </motion.div>
  );
};

export default SkillCard;
