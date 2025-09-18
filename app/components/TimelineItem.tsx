'use client';

import { motion } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';

interface TimelineItemProps {
  title: string;
  company: string;
  period: string;
  description: string;
  location?: string;
  isLast?: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ title, company, period, description, location, isLast }) => {
  return (
    <motion.div
      className="relative flex items-start space-x-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div className="w-4 h-4 bg-blue-500 dark:bg-blue-400 rounded-full border-2 border-white dark:border-gray-800 shadow-md" />
        {!isLast && <div className="w-0.5 h-16 bg-gray-300 dark:bg-gray-600 mt-2" />}
      </div>
      
      {/* Content */}
      <div className="flex-1 pb-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h4 className="font-bold text-lg text-gray-900 dark:text-white">{title}</h4>
          <p className="text-blue-600 dark:text-blue-400 font-medium">{company}</p>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {period}
            </span>
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {location}
              </span>
            )}
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default TimelineItem;
