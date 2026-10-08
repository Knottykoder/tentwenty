'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = 'w-36'
}) => {
  return (
    <div className="flex items-center gap-2 bg-[#F9FBFF] border border-slate-200 rounded-xl px-3 py-2 text-xs">
      <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`bg-transparent text-slate-800 outline-none placeholder:text-slate-400 font-medium ${className}`}
      />
    </div>
  );
};
