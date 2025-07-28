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
  onCollapseChange?: (isCollapsed: boolean) => void;
};

export function AdminSidebar({ 
  isOpen, 
  onClose, 
  activeTab,
  onTabChange,
  onLogout,
  onCollapseChange
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
  
  // Notify parent component about the collapse state
  useEffect(() => {
    onCollapseChange?.(isCollapsed);
  }, [isCollapsed, onCollapseChange]);

  // Navigation items definition
  const navItems = [
    {
      id: 'bookings',
      label: 'Bookings',
      icon: <Calendar className="h-5 w-5" />
    },
    {
      id: 'upcoming',
      label: 'Upcoming',
      icon: <Clock className="h-5 w-5" />
    },
    {
      id: 'athletes',
      label: 'Athletes',
      icon: <Users className="h-5 w-5" />
    },
    {
      id: 'parents',
      label: 'Parents',
      icon: <User className="h-5 w-5" />
    },
    {
      id: 'content',
      label: 'Content',
      icon: <BookOpen className="h-5 w-5" />
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: <Calendar className="h-5 w-5" />
    },
    {
      id: 'parentcomm',
      label: 'Messages',
      icon: <MessageSquare className="h-5 w-5" />
    },
    {
      id: 'waivers',
      label: 'Waivers',
      icon: <FileText className="h-5 w-5" />
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: <DollarSign className="h-5 w-5" />
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart className="h-5 w-5" />
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "fixed z-40 h-screen bg-white shadow-xl transition-all duration-300 hidden md:flex flex-col border-r border-gray-200",
          (isOpen || isDesktop) ? "left-0" : "-left-[280px]", // Always visible on desktop
          effectivelyCollapsed ? "w-[80px]" : "w-[280px]"
        )}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-200">
          {!effectivelyCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="h-9 w-9">
                <img 
                  src="/CWT_Circle_LogoSPIN.png" 
                  alt="Coach Will Tumbles Circle Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="font-bold text-[#0F0276]">ADVENTURE HQ</h2>
            </div>
          )}
          
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                const newCollapsedState = !isCollapsed;
                setIsCollapsed(newCollapsedState);
                onCollapseChange?.(newCollapsedState);
              }} 
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
                    "w-full flex items-center justify-start gap-3 py-3 px-4 rounded-xl transition-all duration-200 text-left font-medium",
                    activeTab === item.id ? (
                      "bg-[#0F0276] text-white shadow-sm"
                    ) : (
                      "text-gray-700 hover:bg-gray-100"
                    )
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
        <div className="p-4 border-t border-gray-200">
          <Button 
            variant="ghost" 
            onClick={onLogout} 
            className="w-full flex items-center justify-start gap-3 py-3 px-4 rounded-xl transition-colors duration-200 font-medium text-slate-700 hover:bg-slate-100"
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
            className="fixed left-0 top-0 h-full w-[85vw] max-w-[280px] bg-white shadow-xl animate-slideInFromLeft overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Header */}
            <div className="p-3 sm:p-4 flex items-center justify-between border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="h-9 w-9">
                  <img 
                    src="/CWT_Circle_LogoSPIN.png" 
                    alt="Coach Will Tumbles Circle Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h2 className="font-bold text-[#0F0276]">ADVENTURE HQ</h2>
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
                        activeTab === item.id
                          ? "bg-[#0F0276] text-white"
                          : "text-slate-700 hover:bg-slate-100"
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
            <div className="p-4 border-t border-gray-200">
              <Button 
                variant="ghost" 
                onClick={onLogout} 
                className="w-full flex items-center justify-start gap-3 py-3 px-4 rounded-xl transition-colors duration-200 font-medium text-slate-700 hover:bg-slate-100"
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
