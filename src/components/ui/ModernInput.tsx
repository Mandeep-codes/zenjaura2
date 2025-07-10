import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';

interface ModernInputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  variant?: 'glass' | 'neon' | 'gradient' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  floating?: boolean;
}

const ModernInput: React.FC<ModernInputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  icon: Icon,
  iconPosition = 'left',
  error,
  disabled = false,
  required = false,
  className = '',
  variant = 'glass',
  size = 'md',
  glow = false,
  floating = true
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [internalValue, setInternalValue] = useState(value || '');

  const actualValue = value !== undefined ? value : internalValue;
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (value === undefined) {
      setInternalValue(e.target.value);
    }
    onChange?.(e);
  };

  const variantClasses = {
    glass: `
      backdrop-blur-xl bg-white/10 dark:bg-black/20 
      border border-white/20 dark:border-white/10
      focus:border-primary-400/50 focus:bg-white/20 dark:focus:bg-black/30
    `,
    neon: `
      bg-black/40 backdrop-blur-xl
      border border-primary-400/30
      focus:border-primary-400 focus:shadow-neon
    `,
    gradient: `
      bg-gradient-to-r from-white/10 to-white/5 dark:from-black/20 dark:to-black/10
      border border-primary-400/20
      focus:border-primary-400/60 focus:shadow-lg
    `,
    minimal: `
      bg-transparent border-b-2 border-gray-300 dark:border-gray-600
      focus:border-primary-500 rounded-none
    `
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const labelFloat = floating && (isFocused || actualValue);

  return (
    <div className={`relative ${className}`}>
      {/* Floating Label */}
      {label && floating && (
        <motion.label
          animate={{
            y: labelFloat ? -24 : 12,
            scale: labelFloat ? 0.85 : 1,
            color: isFocused ? 'rgb(34, 197, 94)' : error ? 'rgb(239, 68, 68)' : 'rgb(107, 114, 128)'
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute left-4 pointer-events-none font-medium z-10 origin-left"
        >
          {label} {required && <span className="text-red-400">*</span>}
        </motion.label>
      )}

      {/* Static Label */}
      {label && !floating && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {Icon && iconPosition === 'left' && (
          <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${iconSizes[size]}`}>
            <Icon className={iconSizes[size]} />
          </div>
        )}

        {/* Input Field */}
        <motion.input
          type={inputType}
          value={actualValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={floating ? '' : placeholder}
          disabled={disabled}
          required={required}
          whileFocus={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className={`
            w-full rounded-2xl transition-all duration-300 
            text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-primary-500/20
            disabled:opacity-50 disabled:cursor-not-allowed
            ${variantClasses[variant]}
            ${sizeClasses[size]}
            ${Icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${Icon && iconPosition === 'right' || isPassword ? 'pr-10' : ''}
            ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-500/20' : ''}
            ${glow && isFocused ? 'shadow-neon' : ''}
          `}
        />

        {/* Right Icon / Password Toggle */}
        {((Icon && iconPosition === 'right') || isPassword) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isPassword ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className={iconSizes[size]} /> : <Eye className={iconSizes[size]} />}
              </button>
            ) : Icon ? (
              <Icon className={`${iconSizes[size]} text-gray-400`} />
            ) : null}
          </div>
        )}

        {/* Focus Ring */}
        {isFocused && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="absolute inset-0 rounded-2xl border-2 border-primary-400/50 pointer-events-none"
          />
        )}
      </div>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-500 flex items-center space-x-1"
        >
          <span>⚠</span>
          <span>{error}</span>
        </motion.p>
      )}

      {/* Glow Effect */}
      {glow && isFocused && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary-400/20 to-accent-400/20 blur-xl rounded-2xl -z-10" />
      )}
    </div>
  );
};

export default ModernInput;