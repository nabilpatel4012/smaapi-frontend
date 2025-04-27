import React from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  onClick, 
  interactive = false 
}) => {
  const cardClasses = classNames(
    'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden',
    {
      'transition-all duration-200 hover:shadow-md': interactive,
      'cursor-pointer': interactive && onClick,
    },
    className
  );
  
  if (interactive) {
    return (
      <motion.div
        className={cardClasses}
        onClick={onClick}
        whileHover={{ y: -2 }}
        whileTap={{ y: 0 }}
      >
        {children}
      </motion.div>
    );
  }
  
  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;