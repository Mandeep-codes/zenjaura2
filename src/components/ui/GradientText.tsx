import React from 'react';
import { motion } from 'framer-motion';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'minimal';
  animate?: boolean;
}

const GradientText: React.FC<GradientTextProps> = ({ 
  children, 
  className = '', 
  variant = 'primary',
  animate = false
}) => {
  const variantClasses = {
    primary: 'text-black dark:text-white',
    secondary: 'text-gray-700 dark:text-gray-300',
    minimal: 'text-gray-600 dark:text-gray-400'
  };

  return (
    <motion.span 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`
        ${variantClasses[variant]}
        font-bold
        ${className}
      `}
    >
      {children}
    </motion.span>
  );
};

export default GradientText;