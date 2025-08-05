
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { MapPin, Phone, Mail, Clock, Instagram, Youtube, MessageCircle, Facebook } from "lucide-react";
import cwtLogo from "@assets/CWT_Circle_LogoSPIN.png";

interface HourSchedule {
  available: boolean;
  start: string;
  end: string;
}

interface SiteHours {
  [key: string]: HourSchedule;
}

export function Footer() {
  // Ordered days array for consistent display
  const orderedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Fetch dynamic site content
  const { data: siteContent } = useQuery({
    queryKey: ['/api/site-content'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/site-content");
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const contact = siteContent?.contact || {
    phone: '(585) 755-8122',
    email: 'Admin@coachwilltumbles.com',
    address: {
      name: 'Oceanside Gymnastics',
      street: '1935 Ave. del Oro #A',
      city: 'Oceanside',
      state: 'CA',
      zip: '92056'
    }
  };

  // Fix hours data structure to match admin dashboard format
  const hours: SiteHours = siteContent?.hours || {
    Monday: { available: true, start: '09:00', end: '16:00' },
    Tuesday: { available: true, start: '09:00', end: '15:30' },
    Wednesday: { available: true, start: '09:00', end: '16:00' },
    Thursday: { available: true, start: '09:00', end: '15:30' },
    Friday: { available: true, start: '09:00', end: '16:00' },
    Saturday: { available: true, start: '10:00', end: '14:00' },
    Sunday: { available: false, start: '', end: '' }
  };

  // Convert 24-hour format to 12-hour format for display
  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  return (
    <footer className="bg-slate-800 text-white relative overflow-hidden">
      {/* Background Logo */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <img 
          src={cwtLogo} 
          alt="Coach Will Tumbles Background" 
          className="w-96 h-96 object-contain"
        />
      </div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header Section with Logo and Description */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <img 
              src={cwtLogo} 
              alt="Coach Will Tumbles" 
              className="w-12 h-12"
            />
            <h3 className="text-lg font-bold">
              <span className="text-[#D8BD2A]">COACH</span>{' '}
              <span className="text-[#0F0276]">WILL</span>{' '}
              <span className="text-[#E10B0B]">TUMBLES</span>
            </h3>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed max-w-2xl mx-auto mb-6">
            Where athletics meets adventure! Building confident champions one flip at a time, turning every lesson into a quest for greatness and every athlete into their own superhero.
          </p>
          <div className="flex justify-center space-x-4">
            <a href="#" className="text-gray-400 hover:text-[#1877F2] transition-colors" aria-label="Facebook">
              <Facebook className="w-6 h-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-[#E4405F] transition-colors" aria-label="Instagram">
              <Instagram className="w-6 h-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-[#FF0000] transition-colors" aria-label="YouTube">
              <Youtube className="w-6 h-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-[#FF0050] transition-colors" aria-label="TikTok">
              <MessageCircle className="w-6 h-6" />
            </a>
          </div>
        </div>

        {/* Main Footer Content - Horizontal Layout */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          {/* Left Side - Quick Links and Lesson Types */}
          <div className="flex flex-col md:flex-row md:space-x-12 lg:space-x-16 space-y-8 md:space-y-0">
            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#0F0276]">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/booking" className="text-gray-300 hover:text-[#D8BD2A] transition-colors">Private Lessons</Link></li>
                <li><Link href="/about" className="text-gray-300 hover:text-[#D8BD2A] transition-colors">About Us</Link></li>
                <li><Link href="/blog" className="text-gray-300 hover:text-[#D8BD2A] transition-colors">Blog</Link></li>
                <li><Link href="/tips" className="text-gray-300 hover:text-[#D8BD2A] transition-colors">Tips & Drills</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-[#D8BD2A] transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Lesson Types */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#E10B0B]">Lesson Types</h3>
              <ul className="space-y-2 text-sm">
                <li><span className="text-gray-300">Quick Journey (30 min)</span></li>
                <li><span className="text-gray-300">Dual Quest | Semi-Private (30 min)</span></li>
                <li><span className="text-gray-300">Deep Dive (60 min)</span></li>
                <li><span className="text-gray-300">Partner Progression | Semi-Private (60 min)</span></li>
              </ul>
            </div>
          </div>

          {/* Right Side - Contact Us */}
          <div className="space-y-4 lg:text-right lg:flex-shrink-0">
            <h3 className="text-lg font-semibold text-[#D8BD2A]">Contact Us</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center space-x-2 lg:justify-end">
                <Phone className="w-4 h-4" />
                <span>{contact.phone}</span>
              </div>
              <div className="flex items-center space-x-2 lg:justify-end">
                <Mail className="w-4 h-4" />
                <span>{contact.email}</span>
              </div>
              <div className="flex items-center space-x-2 lg:justify-end">
                <MapPin className="w-4 h-4" />
                <div className="lg:text-right">
                  {contact.address.name}<br />
                  {contact.address.street}<br />
                  {contact.address.city}, {contact.address.state} {contact.address.zip}
                </div>
              </div>
              <div className="flex items-center space-x-2 lg:justify-end">
                <Clock className="w-4 h-4" />
                <div className="lg:text-right">
                  {orderedDays.map((day) => {
                    const schedule = hours[day.toLowerCase()];
                    const shortDay = day.slice(0, 3);
                    
                    if (!schedule?.available) {
                      return (
                        <div key={day} className="text-xs">
                          {shortDay}: Ask about availability
                        </div>
                      );
                    }
                    
                    return (
                      <div key={day} className="text-xs">
                        {shortDay}: {formatTime(schedule.start)} – {formatTime(schedule.end)}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>&copy; 2025 Coach Will Tumbles. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-[#D8BD2A] transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-[#D8BD2A] transition-colors">Terms of Service</Link>
              <Link href="/contact" className="hover:text-[#D8BD2A] transition-colors">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
