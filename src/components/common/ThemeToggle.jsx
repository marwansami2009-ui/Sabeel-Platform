import React from 'react';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle = ({ isDark, onToggle }) => {
  return (
    <button
      onClick={() => onToggle(!isDark)}
      className={`relative w-16 h-8 rounded-full transition-all duration-300 flex items-center px-1 ${
        isDark 
          ? 'bg-gradient-to-r from-slate-700 to-slate-800 justify-end' 
          : 'bg-gradient-to-r from-amber-300 to-amber-400 justify-start'
      }`}
      aria-label="Toggle theme"
    >
      <div className={`w-6 h-6 rounded-full shadow-lg transform transition-transform duration-300 flex items-center justify-center ${
        isDark 
          ? 'bg-slate-900 text-yellow-300' 
          : 'bg-white text-amber-500'
      }`}>
        {isDark ? <Moon size={14} /> : <Sun size={14} />}
      </div>
      
      {/* Decorative dots */}
      {isDark ? (
        <>
          <div className="absolute left-2 w-1 h-1 bg-white/20 rounded-full"></div>
          <div className="absolute left-4 w-1.5 h-1.5 bg-white/10 rounded-full"></div>
        </>
      ) : (
        <>
          <div className="absolute right-2 w-1 h-1 bg-yellow-600/20 rounded-full"></div>
          <div className="absolute right-4 w-1.5 h-1.5 bg-yellow-600/10 rounded-full"></div>
        </>
      )}
    </button>
  );
};