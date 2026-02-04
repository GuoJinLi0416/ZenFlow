
import React from 'react';
import { Leaf } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-stone-200">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-100 p-2 rounded-xl">
            <Leaf className="w-6 h-6 text-emerald-600" />
          </div>
          <span className="text-xl font-bold text-stone-800 tracking-tight">ZenFlow</span>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-stone-500">
          <a href="#" className="hover:text-emerald-600 transition-colors">Library</a>
          <a href="#" className="hover:text-emerald-600 transition-colors">Meditation</a>
          <a href="#" className="hover:text-emerald-600 transition-colors">About</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
