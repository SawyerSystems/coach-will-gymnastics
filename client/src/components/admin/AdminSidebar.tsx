import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    BarChart,
    BookOpen,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    DollarSign,
    FileText,
    LogOut,
    MessageSquare,
    Settings,
    User,
    Users,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';

type AdminSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
};

export function AdminSidebar({ 
  isOpen, 
  onClose, 
  activeTab,
  onTabChange,
  onLogout
}: AdminSidebarProps) {
  // State to track if sidebar is collapsed (only for desktop)
  const [isCollapsed, setIsCollapsed] = useState(false);
  // State to track if we're on desktop (to always show sidebar regardless of isOpen prop)
  const [isDesktop, setIsDesktop] = useState(false);
  
  // Set isDesktop on mount and when window resizes
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    // Initial check
    checkIsDesktop();
    
    // Add resize listener
    window.addEventListener('resize', checkIsDesktop);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  // Only apply desktop collapse if sidebar is open
  const effectivelyCollapsed = isOpen && isCollapsed;

  // Navigation items definition
  const navItems = [
    {
      id: 'bookings',
      label: 'Bookings',
      icon: <Calendar className="h-5 w-5" />,
      color: 'text-[#0F0276] bg-[#0F0276]/10',
      activeColor: 'bg-[#0F0276] text-white'
    },
    {
      id: 'upcoming',
      label: 'Upcoming',
      icon: <Clock className="h-5 w-5" />,
      color: 'text-green-600 bg-green-100',
      activeColor: 'bg-green-600 text-white'
    },
    {
      id: 'athletes',
      label: 'Athletes',
      icon: <Users className="h-5 w-5" />,
      color: 'text-[#D8BD2A] bg-[#D8BD2A]/10',
      activeColor: 'bg-[#D8BD2A] text-white'
    },
    {
      id: 'parents',
      label: 'Parents',
      icon: <User className="h-5 w-5" />,
      color: 'text-pink-500 bg-pink-100',
      activeColor: 'bg-pink-500 text-white'
    },
    {
      id: 'content',
      label: 'Content',
      icon: <BookOpen className="h-5 w-5" />,
      color: 'text-purple-600 bg-purple-100',
      activeColor: 'bg-purple-600 text-white'
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: <Calendar className="h-5 w-5" />,
      color: 'text-teal-500 bg-teal-100',
      activeColor: 'bg-teal-500 text-white'
    },
    {
      id: 'parentcomm',
      label: 'Messages',
      icon: <MessageSquare className="h-5 w-5" />,
      color: 'text-indigo-600 bg-indigo-100',
      activeColor: 'bg-indigo-600 text-white'
    },
    {
      id: 'waivers',
      label: 'Waivers',
      icon: <FileText className="h-5 w-5" />,
      color: 'text-orange-600 bg-orange-100',
      activeColor: 'bg-orange-600 text-white'
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: <DollarSign className="h-5 w-5" />,
      color: 'text-emerald-500 bg-emerald-100',
      activeColor: 'bg-emerald-500 text-white'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart className="h-5 w-5" />,
      color: 'text-blue-600 bg-blue-100',
      activeColor: 'bg-blue-600 text-white'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      color: 'text-gray-600 bg-gray-100',
      activeColor: 'bg-gray-700 text-white'
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "fixed z-40 h-screen bg-gradient-to-b from-white to-slate-50 dark:from-gray-900 dark:to-gray-800 shadow-xl transition-all duration-300 hidden md:flex flex-col border-r border-slate-200 dark:border-gray-700",
          (isOpen || isDesktop) ? "left-0" : "-left-[280px]", // Always visible on desktop
          effectivelyCollapsed ? "w-[80px]" : "w-[280px]"
        )}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-gray-700">
          {!effectivelyCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-[#0F0276] flex items-center justify-center">
                <span className="text-white font-bold text-sm">CW</span>
              </div>
              <h2 className="font-bold text-[#0F0276] dark:text-white">Coach Will Admin</h2>
            </div>
          )}
          
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              className="rounded-full p-1.5"
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.id}>
                <Button
                  variant="ghost"
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center justify-start gap-3 py-3 px-4 rounded-xl transition-colors duration-200 font-medium",
                    activeTab === item.id ? item.activeColor : item.color,
                    effectivelyCollapsed ? "justify-center px-2" : ""
                  )}
                >
                  {item.icon}
                  {!effectivelyCollapsed && <span>{item.label}</span>}
                </Button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-gray-700">
          <Button 
            variant="ghost" 
            onClick={onLogout} 
            className="w-full flex items-center justify-start gap-3 py-3 px-4 rounded-xl transition-colors duration-200 font-medium text-red-500 hover:bg-red-100"
          >
            <LogOut className="h-5 w-5" />
            {!effectivelyCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose}>
          <aside 
            className="fixed left-0 top-0 h-full w-[85vw] max-w-[280px] bg-gradient-to-b from-white to-slate-50 dark:from-gray-900 dark:to-gray-800 shadow-xl animate-slideInFromLeft overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Header */}
            <div className="p-3 sm:p-4 flex items-center justify-between border-b border-slate-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-[#0F0276] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CW</span>
                </div>
                <h2 className="font-bold text-[#0F0276] dark:text-white">Coach Will Admin</h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose} 
                className="rounded-full p-1.5"
              >
                <X size={18} />
              </Button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 py-4 overflow-y-auto">
              <ul className="space-y-1 px-3">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        onTabChange(item.id);
                        onClose(); // Close drawer after selection on mobile
                      }}
                      className={cn(
                        "w-full flex items-center justify-start gap-3 py-3 px-4 rounded-xl transition-colors duration-200 font-medium",
                        activeTab === item.id ? item.activeColor : item.color
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Mobile Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-gray-700">
              <Button 
                variant="ghost" 
                onClick={onLogout} 
                className="w-full flex items-center justify-start gap-3 py-3 px-4 rounded-xl transition-colors duration-200 font-medium text-red-500 hover:bg-red-100"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
