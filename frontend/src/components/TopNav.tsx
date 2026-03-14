import { Search, Zap, Loader, Play, Menu } from 'lucide-react';
import React from 'react';

export default function TopNav({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 bg-bg-base border-b border-border-subtle sticky top-0 z-10 w-full overflow-x-hidden">
      
      <div className="flex items-center gap-2 lg:gap-4 flex-1 max-w-xl">
        <button 
          className="lg:hidden p-2 -ml-2 text-text-muted hover:text-text-base rounded-md hover:bg-bg-accent"
          onClick={onMenuClick}
        >
          <Menu size={20} />
        </button>

        {/* Global Search */}
        <div className="flex-1 relative group w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search prompts or templates (Cmd+K)" 
            className="w-full bg-bg-elevated border border-border-subtle rounded-md pl-10 pr-4 py-2 text-sm text-text-base placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all font-sans"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1">
             <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-text-muted bg-bg-accent border border-border-subtle rounded">⌘K</kbd>
          </div>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 lg:gap-4 ml-2 lg:ml-6 shrink-0">
        
        {/* Model Selector Dropdown Mock */}
        <div className="flex items-center bg-bg-elevated border border-border-subtle rounded-md p-1">
          <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-brand-500/10 text-brand-400 rounded transition-colors">
            <Zap size={14} />
            Creative
          </button>
          <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-text-muted hover:text-text-base hover:bg-bg-accent rounded transition-colors">
            <Loader size={14} />
            Faster
          </button>
          <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-text-muted hover:text-text-base hover:bg-bg-accent rounded transition-colors">
            <Play size={14} />
            Bulk
          </button>
        </div>

      </div>
    </header>
  );
}
