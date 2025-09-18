'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  skill: string;
  percentage: number;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ skill, percentage, color = "bg-blue-500" }) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium text-gray-800 dark:text-gray-200">{skill}</span>
        <span className="text-sm text-gray-600 dark:text-gray-400">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <motion.div
          className={`h-2 rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.2 }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
