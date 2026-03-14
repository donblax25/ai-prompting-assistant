import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Terminal, 
  LayoutTemplate, 
  FlaskConical, 
  History, 
  Settings,
  Sparkles,
  ChevronDown,
  X
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Prompt Builder', href: '/builder', icon: Terminal },
  { name: 'Templates', href: '/templates', icon: LayoutTemplate },
  { name: 'A/B Testing', href: '/split-test', icon: FlaskConical },
  { name: 'History', href: '/history', icon: History },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 h-full bg-bg-elevated border-r border-border-subtle">
      {/* Workspace Selector */}
      <div className="h-16 flex items-center px-4 border-b border-border-subtle cursor-pointer hover:bg-bg-accent transition-colors">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-brand-600 flex items-center justify-center text-white font-bold">
              <Sparkles size={18} />
            </div>
            <span className="font-semibold text-text-base truncate">My Workspace</span>
          </div>
          <div className="flex items-center gap-2">
             <ChevronDown size={16} className="text-text-muted hidden lg:block" />
             <button className="lg:hidden p-1 text-text-muted hover:text-text-base rounded-md hover:bg-bg-accent" onClick={onClose} aria-label="Close sidebar">
                <X size={18} />
             </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors group",
                isActive 
                  ? "bg-brand-500/10 text-brand-400 font-medium" 
                  : "text-text-muted hover:bg-bg-accent hover:text-text-base"
              )}
            >
              <item.icon 
                size={18} 
                className={cn(
                  isActive ? "text-brand-400" : "text-text-muted group-hover:text-text-base"
                )} 
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Hook (Bottom) */}
      <div className="p-4 border-t border-border-subtle">
        <div className="flex items-center gap-3 px-2 py-2 hover:bg-bg-accent rounded-md cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-full bg-brand-800 flex items-center justify-center text-xs font-bold text-brand-100 border border-brand-600">
            US
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-text-base">User Name</span>
            <span className="text-xs text-text-muted">Pro Plan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
