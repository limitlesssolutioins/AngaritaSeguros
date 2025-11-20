
'use client';

import { motion } from 'framer-motion';

interface FadeInProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  className?: string;
}

const FadeIn = ({ children, duration = 0.5, delay = 0.2, className }: FadeInProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default FadeIn;
