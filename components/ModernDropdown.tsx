import React, { useState, useRef, useEffect } from 'react';
import { CheckIcon } from './icons';

interface ModernDropdownProps {
  label: string;
  options: string[];
  selected: string | string[];
  onChange: (selected: string | string[]) => void;
  multiple?: boolean;
  disabled: boolean;
}

export const ModernDropdown: React.FC<ModernDropdownProps> = ({ 
  label, 
  options, 
  selected, 
  onChange, 
  multiple = false, 
  disabled 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (option: string) => {
    if (multiple) {
      const currentSelected = selected as string[];
      const newSelected = currentSelected.includes(option)
        ? currentSelected.filter((item) => item !== option)
        : [...currentSelected, option];
      onChange(newSelected);
    } else {
      onChange(option);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getButtonText = () => {
    if (multiple) {
      const currentSelected = selected as string[];
      if (currentSelected.length === 0) return `Select ${label}`;
      if (currentSelected.length <= 2) return currentSelected.join(', ');
      return `${currentSelected.length} genres selected`;
    }
    return selected as string;
  };

  const isSelected = (option: string) => {
    return multiple ? (selected as string[]).includes(option) : selected === option;
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full appearance-none bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 p-3 text-left flex justify-between items-center"
      >
        <span className="truncate">{getButtonText()}</span>
        <svg className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      {isOpen && (
        <div className="absolute z-20 top-full mt-2 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-fade-in-down-sm">
          {options.map((option) => (
            <div
              key={option}
              onClick={() => handleSelect(option)}
              className="px-4 py-2 text-slate-200 hover:bg-indigo-600 cursor-pointer flex items-center justify-between"
            >
              <span>{option}</span>
              {isSelected(option) && <CheckIcon className="w-5 h-5 text-indigo-300" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
