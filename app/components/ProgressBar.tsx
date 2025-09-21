'use client';

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from 'react';

interface ProgressBarProps {
  skill: string;
  percentage: number;
  color?: string; // still allow Tailwind color
  gradient?: string; // new optional gradient
  icon?: React.ReactNode; // optional icon
}

const ProgressBar: React.FC<ProgressBarProps> = ({ skill, percentage, color = "bg-blue-500", gradient, icon }) => {
  // Motion value for the counter
  const progress = useMotionValue(0);

  // Use a spring for smooth animation
  const spring = useSpring(progress, { stiffness: 50, damping: 20 });

  // Rounded value for display
  const rounded = useTransform(spring, (val) => Math.round(val));

  // Animate when component mounts
  useEffect(() => {
    progress.set(0);
    progress.set(percentage); // Animate to target percentage
  }, [percentage, progress]);

  return (
    <div className="mb-6">
      {/* Skill + percentage */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-xl">{icon}</span>}
          <span className="font-semibold text-gray-900 dark:text-gray-100">{skill}</span>
        </div>
        
        {/* Animated percentage */}
        <motion.span
          className="text-sm font-medium text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {percentage}%
        </motion.span>
      </div>

      {/* Progress track */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <motion.div
          className={`h-3 rounded-full ${gradient ? "" : color}`}
          style={gradient ? { backgroundImage: gradient } : {}}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
