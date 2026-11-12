import { motion } from 'framer-motion';
import { usePageTitle } from '../../hooks/usePageTitle';

// Обща анимация за всички страници (както в оригиналния дизайн) + заглавие на таба
export const PageTransition = ({ title, className = 'grid gap-8', children }) => {
  usePageTitle(title);
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.25 }}
      className={className}
    >
      {children}
    </motion.section>
  );
};
