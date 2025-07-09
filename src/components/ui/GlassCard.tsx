import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  variant?: 'default' | 'elevated' | 'minimal';
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  hover = true, 
  variant = 'default'
}) => {
  const baseClasses = "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800";
  
  const variantClasses = {
    default: "shadow-apple",
    elevated: "shadow-apple-lg",
    minimal: "shadow-sm"
  };

  const hoverClasses = hover ? "hover:shadow-apple-lg hover:border-gray-300 dark:hover:border-gray-700" : "";

  return (
    <motion.div
      whileHover={hover ? { y: -2 } : {}}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${hoverClasses}
        rounded-2xl transition-all duration-300
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;