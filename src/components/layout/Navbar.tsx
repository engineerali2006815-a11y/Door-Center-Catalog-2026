"use client"

import React from 'react';
import { Hammer } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-primary text-white p-2 rounded-lg">
            <Hammer className="w-8 h-8" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-primary leading-none">Door Center</h1>
            <span className="text-[10px] tracking-widest text-accent-foreground font-semibold mt-1">مركز الأبواب / 2017</span>
          </div>
        </div>
        
        <div className="flex items-center gap-8 font-body">
          <span className="text-primary font-bold border-b-2 border-primary pb-1">المخزون</span>
        </div>
      </div>
    </nav>
  );
}
