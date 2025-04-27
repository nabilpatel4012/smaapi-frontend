// import React from 'react';
// import classNames from 'classnames';
// import { motion } from 'framer-motion';
// import { Loader2 } from 'lucide-react';

// type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
// type ButtonSize = 'sm' | 'md' | 'lg';

// interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
//   variant?: ButtonVariant;
//   size?: ButtonSize;
//   isLoading?: boolean;
//   leftIcon?: React.ReactNode;
//   rightIcon?: React.ReactNode;
//   fullWidth?: boolean;
// }

// // Define style maps based on variants and sizes
// const variantStyles: Record<ButtonVariant, string> = {
//   primary: 'bg-indigo-600 hover:bg-indigo-700 text-white border border-transparent shadow-sm',
//   secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm',
//   outline: 'bg-transparent hover:bg-gray-50 text-indigo-600 border border-indigo-600',
//   danger: 'bg-red-600 hover:bg-red-700 text-white border border-transparent shadow-sm',
//   ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border border-transparent',
// };

// const sizeStyles: Record<ButtonSize, string> = {
//   sm: 'px-3 py-1.5 text-sm',
//   md: 'px-4 py-2 text-sm',
//   lg: 'px-5 py-2.5 text-base',
// };

// const Button: React.FC<ButtonProps> = ({
//   children,
//   variant = 'primary',
//   size = 'md',
//   className,
//   disabled,
//   isLoading,
//   leftIcon,
//   rightIcon,
//   fullWidth,
//   ...props
// }) => {
//   const buttonClasses = classNames(
//     'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors',
//     variantStyles[variant],
//     sizeStyles[size],
//     fullWidth ? 'w-full' : '',
//     (disabled || isLoading) ? 'opacity-60 cursor-not-allowed' : '',
//     className
//   );

//   return (
//     <motion.button
//       className={buttonClasses}
//       disabled={disabled || isLoading}
//       whileTap={{ scale: 0.98 }}
//       {...props}
//     >
//       {isLoading && (
//         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//       )}

//       {!isLoading && leftIcon && (
//         <span className="mr-2">{leftIcon}</span>
//       )}

//       {children}

//       {!isLoading && rightIcon && (
//         <span className="ml-2">{rightIcon}</span>
//       )}
//     </motion.button>
//   );
// };

// export default Button;

import React, { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  onClick,
  disabled = false,
  type = "button",
  className = "",
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary:
      "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500",
    secondary:
      "bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    outline:
      "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-indigo-500",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  return (
    <button
      type={type}
      className={`
        ${baseClasses}
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        ${disabledClasses}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;
