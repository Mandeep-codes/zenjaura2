import React from 'react';
import { motion } from 'framer-motion';

type LucideIcon = React.ComponentType<{ className?: string }>;

interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'minimal' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

const NeonButton: React.FC<NeonButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  fullWidth = false
}) => {
  const baseClasses = `
    relative overflow-hidden font-medium transition-all duration-200 
    border cursor-pointer inline-flex items-center justify-center
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `;
  
  const variantClasses = {
    primary: `
      bg-black dark:bg-white text-white dark:text-black 
      border-black dark:border-white
      hover:bg-gray-800 dark:hover:bg-gray-100
      focus:ring-gray-500
      shadow-apple
    `,
    secondary: `
      bg-white dark:bg-gray-900 text-black dark:text-white
      border-gray-300 dark:border-gray-700
      hover:bg-gray-50 dark:hover:bg-gray-800
      hover:border-gray-400 dark:hover:border-gray-600
      focus:ring-gray-300
      shadow-apple
    `,
    minimal: `
      bg-transparent border-transparent 
      text-gray-700 dark:text-gray-300
      hover:bg-gray-100 dark:hover:bg-gray-800
      focus:ring-gray-300
    `,
    ghost: `
      bg-transparent border-gray-200 dark:border-gray-800
      text-gray-700 dark:text-gray-300
      hover:bg-gray-50 dark:hover:bg-gray-900
      hover:border-gray-300 dark:hover:border-gray-700
      focus:ring-gray-300
    `
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-xl',
    xl: 'px-10 py-5 text-xl rounded-2xl'
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.1 }}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabledClasses}
        ${widthClasses}
        ${className}
      `}
    >
      <div className="flex items-center justify-center space-x-2">
        {loading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
            <span>{children}</span>
            {Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
          </>
        )}
      </div>
    </motion.button>
  );
};

export default NeonButton;