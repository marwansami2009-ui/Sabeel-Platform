import React from 'react';
import { icons } from 'lucide-react';

export const GlassIcon = ({ name, size = 20, className = '' }) => {
  // Return a placeholder if icon doesn't exist
  if (!icons[name]) {
    return (
      <div 
        className={`glass-icon inline-flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-xs">♞</span>
      </div>
    );
  }

  const LucideIcon = icons[name];

  return (
    <div className={`glass-icon inline-flex items-center justify-center ${className}`}>
      <LucideIcon size={size} />
    </div>
  );
};