import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';

type LoadingScreenProps = {
  isLoading: boolean;
};

const LoadingScreen = ({ isLoading }: LoadingScreenProps) => {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <TypeAnimation
            sequence={[
              '.',
              500,
              '..',
              500,
              '...',
              500,
              '....',
              500,
              '.....',
              500,
              () => {}
            ]}
            repeat={Infinity}
            cursor={false}
            className="text-gray-600 dark:text-gray-400 font-medium text-xl"
            style={{ fontFamily: "'Courier Prime', monospace" }}
          />
        </motion.div>
      </div>
    );
  }
  return null;
};

export default LoadingScreen;