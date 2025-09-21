'use client';

import { motion } from 'framer-motion';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';

interface TimelineItemProps {
  title: string;
  company: string;
  companyUrl?: string; // 🔹 New prop for LinkedIn/company profile
  period: string;
  description: string;
  location?: string;
  isLast?: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  title,
  company,
  companyUrl,
  period,
  description,
  location,
  isLast,
}) => {
  return (
    <motion.div
      className="relative flex items-start space-x-4"
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center">
        <motion.div
          className="w-4 h-4 bg-blue-500 dark:bg-blue-400 rounded-full border-2 border-white dark:border-gray-800 shadow-md"
          whileHover={{ scale: 1.2 }}
          transition={{ type: "spring", stiffness: 300 }}
        />
        {!isLast && (
          <motion.div
            className="w-0.5 bg-gray-300 dark:bg-gray-600 mt-2"
            initial={{ height: 0 }}
            animate={{ height: 64 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          />
        )}
      </div>

      {/* Card content */}
      <motion.div
        className="flex-1 pb-8"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
          <h4 className="font-bold text-lg text-gray-900 dark:text-white">{title}</h4>

          {/* Company name with link */}
          {companyUrl ? (
            <a
              href={companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              {company}
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <p className="text-blue-600 dark:text-blue-400 font-medium">{company}</p>
          )}

          {/* Period + Location */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {period}
            </span>
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {location}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-700 dark:text-gray-300 text-sm mt-3 leading-relaxed">
            {description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TimelineItem;
