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
            <h1 className="text-2xl font-headline font-bold text-primary leading-none">كنوز الأبواب</h1>
            <span className="text-[10px] tracking-widest text-accent-foreground font-semibold mt-1">DOOR CENTER / 2017</span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-8 font-body">
          <a href="#" className="text-primary font-bold border-b-2 border-primary pb-1">المخزون</a>
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors">الطلبات</a>
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors">الإحصائيات</a>
        </div>
      </div>
    </nav>
  );
}
