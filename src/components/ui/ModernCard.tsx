import React from 'react';
import { motion } from 'framer-motion';

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  variant?: 'default' | 'elevated' | 'minimal' | 'bordered';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const ModernCard: React.FC<ModernCardProps> = ({ 
  children, 
  className = '', 
  hover = true, 
  variant = 'default',
  size = 'md'
}) => {
  const baseClasses = "relative overflow-hidden transition-all duration-300 ease-out";
  
  const variantClasses = {
    default: `
      bg-white dark:bg-gray-900 
      border border-gray-200 dark:border-gray-800
      shadow-apple
    `,
    elevated: `
      bg-white dark:bg-gray-900 
      border border-gray-200 dark:border-gray-800
      shadow-apple-lg
    `,
    minimal: `
      bg-white dark:bg-gray-900 
      border border-gray-100 dark:border-gray-900
      shadow-sm
    `,
    bordered: `
      bg-white dark:bg-gray-900 
      border-2 border-gray-200 dark:border-gray-800
      shadow-none
    `
  };

  const sizeClasses = {
    sm: 'p-4 rounded-xl',
    md: 'p-6 rounded-2xl',
    lg: 'p-8 rounded-2xl',
    xl: 'p-10 rounded-3xl'
  };

  const hoverClasses = hover ? `
    hover:shadow-apple-lg hover:border-gray-300 dark:hover:border-gray-700
    hover:-translate-y-1
  ` : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { 
        y: -4,
      } : {}}
      transition={{ 
        duration: 0.3,
        ease: "easeOut"
      }}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${hoverClasses}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default ModernCard;