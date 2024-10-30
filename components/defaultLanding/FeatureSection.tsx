import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import features from './data/features.json';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Stagger the animation of child elements
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
  hover: {
    scale: 1.05,
    boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
};

const FeatureSection = () => {
  const { t } = useTranslation('common');
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      className="py-12 px-4 bg-gray-50"
      initial={shouldReduceMotion ? false : 'hidden'}
      animate={shouldReduceMotion ? false : 'visible'}
      variants={containerVariants}
      aria-labelledby="features-heading"
    >
      <div className="max-w-7xl mx-auto">
        <h2 id="features-heading" className="text-center text-4xl font-bold mb-4">
          {t('features')}
        </h2>
        <p className="text-center text-xl text-gray-600 mb-8">
          Explore the powerful AI tools Conversegy offers to enhance your productivity.
        </p>
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center cursor-pointer"
              variants={cardVariants}
              whileHover={shouldReduceMotion ? {} : 'hover'}
            >
              <CheckCircleIcon className="h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold">{feature.name}</h3>
              <p className="mt-2 text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default FeatureSection;
