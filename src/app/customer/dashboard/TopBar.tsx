'use client';

import React from 'react';

type TopBarProps = {
  name?: string;
  onMenuToggle?: () => void; // ✅ Add this prop
};

const TopBar: React.FC<TopBarProps> = ({ name = '', onMenuToggle }) => {
  return (
    <header
      className="fixed top-0 w-full flex items-center justify-between px-4 py-5 bg-yellow-400 text-black shadow-sm z-50"
      style={{ fontFamily: 'var(--font-geist-mono)' }}
    >
      {/* Hamburger icon */}
      <button className="text-2xl" onClick={onMenuToggle}>
        &#9776;
      </button>

      {/* App title centered */}
      <h1 className="text-lg font-bold tracking-wide text-center pl-10">TripTask</h1>

      {/* Profile info */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-yellow-600 rounded-full text-white flex items-center justify-center font-bold uppercase">
          {name?.charAt(0) || '?'}
        </div>
        <span className="text-xs font-medium truncate max-w-[100px]">{name || 'Guest'}</span>
      </div>
    </header>
  );
};

export default TopBar;
