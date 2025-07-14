import { useState } from "react";
import type { Customer, Athlete } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerIdentificationEnhanced } from "@/components/customer-identification-enhanced";
import { EnhancedBookingModal } from "@/components/enhanced-booking-modal";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import cwtLogo from "@assets/CWT_Circle_LogoSPIN.png";
import { 
  Play, 
  Calendar, 
  User, 
  Users, 
  Clock, 
  Star, 
  Shield, 
  Dumbbell, 
  TrendingUp, 
  CheckCircle,
  Trophy,
  Heart,
  Target,
  Zap,
  Award,
  Brain,
  Activity,
  Compass
} from "lucide-react";
import { LESSON_TYPES } from "@/lib/constants";
import { useStripePricing } from "@/hooks/use-stripe-products";
import { Footer } from "@/components/Footer";

export default function Home() {
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [selectedAthletes, setSelectedAthletes] = useState<Athlete[]>([]);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const { getLessonPrice } = useStripePricing();

  // Check if parent is already logged in
  const { data: parentAuth } = useQuery<{ loggedIn: boolean; parentId?: number; email?: string }>({
    queryKey: ['/api/parent-auth/status'],
  });

  // Get complete parent information for logged-in parents
  const { data: parentInfo, isLoading: parentInfoLoading, error: parentInfoError } = useQuery({
    queryKey: ['/api/parent/info'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/parent/info");
      return response.json();
    },
    enabled: parentAuth?.loggedIn || false,
  });

  // Get parent athletes for logged-in parents
  const { data: parentAthletes } = useQuery({
    queryKey: ['/api/parent/athletes'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/parent/athletes");
      return response.json();
    },
    enabled: parentAuth?.loggedIn || false,
  });

  const handleCustomerConfirmed = (data: {
    customer: Customer;
    selectedAthletes: Athlete[];
    isNewCustomer: boolean;
  }) => {
    setCustomerData(data.customer);
    setSelectedAthletes(data.selectedAthletes);
    setIsNewCustomer(data.isNewCustomer);
    setShowCustomerModal(false);
    setShowBookingModal(true);
  };

  const handleStartBooking = () => {
    // If parent is logged in but info is still loading, wait for it
    if (parentAuth?.loggedIn && parentInfoLoading) {
      return;
    }
    
    // Check if parent is logged in
    if (parentAuth?.loggedIn) {
      // If we have parent info from the API, use it
      if (parentInfo && !parentInfoError) {
        const customerDataToSet = {
          id: parentInfo.id,
          firstName: parentInfo.firstName,
          lastName: parentInfo.lastName,
          email: parentInfo.email,
          phone: parentInfo.phone,
          emergencyContactName: parentInfo.emergencyContactName,
          emergencyContactPhone: parentInfo.emergencyContactPhone,
          waiverSigned: parentInfo.waiverSigned,
          waiverSignedAt: parentInfo.waiverSignedAt,
          waiverSignatureName: parentInfo.waiverSignatureName,
          createdAt: parentInfo.createdAt,
          updatedAt: parentInfo.updatedAt
        };
        
        setCustomerData(customerDataToSet);
        setSelectedAthletes(parentAthletes || []);
        setIsNewCustomer(false);
        setShowBookingModal(true);
      } else {
        // Fallback: Create basic customer data from parent auth session
        const fallbackCustomerData = {
          id: parentAuth.parentId || 0,
          firstName: '',
          lastName: '',
          email: parentAuth.email || '',
          phone: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
          waiverSigned: false,
          waiverSignedAt: null,
          waiverSignatureName: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        setCustomerData(fallbackCustomerData);
        setSelectedAthletes(parentAthletes || []);
        setIsNewCustomer(false);
        setShowBookingModal(true);
      }
    } else {
      // Show customer identification modal for non-logged in users
      setShowCustomerModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#D8BD2A]/10 via-white to-[#0F0276]/5">
      {/* Hero Section with Video Banner */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
          {/* Hero Video/Image */}
          {import.meta.env.VITE_BANNER_VIDEO_URL ? (
            <video
              autoPlay
              muted={isVideoMuted}
              loop
              playsInline
              onError={() => console.log('Video failed to load, using fallback image')}
              className="w-full h-full object-cover"
            >
              <source src={import.meta.env.VITE_BANNER_VIDEO_URL} type="video/mp4" />
              {/* Fallback image if video fails to load */}
              <img 
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080" 
                alt="Children learning gymnastics with coach" 
                className="w-full h-full object-cover" 
              />
            </video>
          ) : (
            /* Fallback image when no video URL is provided */
            <img 
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080" 
              alt="Children learning gymnastics with coach" 
              className="w-full h-full object-cover" 
            />
          )}
          
          {/* Enhanced gradient overlays for better text readability and fading */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60"></div>
          
          {/* Enhanced edge fading */}
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-blue-50/95 via-blue-50/60 to-transparent"></div>
          <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-black/40 to-transparent"></div>
          <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-black/40 to-transparent"></div>
          
          {/* Corner fading for extra depth */}
          <div className="absolute top-0 left-0 w-60 h-60 bg-gradient-to-br from-black/50 to-transparent"></div>
          <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-bl from-black/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-black/50 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-gradient-to-tl from-black/50 to-transparent"></div>
        </div>

        {/* Animated floating elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400/20 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-pink-400/20 rounded-full animate-bounce-gentle"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-teal-400/20 rounded-full animate-pulse-slow"></div>
        </div>
        
        {/* Content overlay */}
        <div className="relative z-10 container mx-auto px-4 py-16 lg:py-24 text-center">
          <div className="max-w-5xl mx-auto">
            <h1 className="athletic-title text-4xl md:text-6xl lg:text-8xl font-bold text-white mb-6 drop-shadow-2xl animate-bounce-in">
              UNLEASH YOUR INNER CHAMPION!{' '}
              <span className="inline-block">
                <span className="text-[#D8BD2A] drop-shadow-2xl">COACH</span>{' '}
                <span className="text-[#0F0276] drop-shadow-2xl">WILL</span>{' '}
                <span className="text-[#E10B0B] drop-shadow-2xl">TUMBLES</span>
              </span>
            </h1>
            <p className="coach-chant text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto drop-shadow-lg animate-slide-up">
              TRANSFORM YOUR POTENTIAL INTO POWER - EXPERT GYMNASTICS, CHEER, STRENGTH, & AGILITY TRAINING FOR CHAMPIONS OF ALL AGES!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                className="btn-athletic-red text-white px-8 py-4 font-bold text-lg hover:scale-105 transform transition-all duration-300 shadow-2xl animate-glow border-2 border-[#E10B0B]"
                onClick={handleStartBooking}
                disabled={parentAuth?.loggedIn && parentInfoLoading}
              >
                <Zap className="h-5 w-5 mr-2" />
                {parentAuth?.loggedIn && parentInfoLoading ? "LOADING..." : "START YOUR JOURNEY"}
              </Button>
              <Link href="/blog">
                <Button 
                  variant="outline"
                  size="lg"
                  className="btn-athletic-gold text-black px-8 py-4 font-bold text-lg border-2 border-[#D8BD2A] bg-[#D8BD2A]/10 hover:bg-[#D8BD2A] hover:text-black backdrop-blur-sm transform transition-all duration-300 shadow-2xl"
                >
                  <Trophy className="h-5 w-5 mr-2" />
                  TRAINING VIDEOS
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Video Controls - Only show if video is available */}
        {import.meta.env.VITE_BANNER_VIDEO_URL && (
          <div className="absolute top-6 left-6 z-20">
            <button
              onClick={() => setIsVideoMuted(!isVideoMuted)}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-3 shadow-2xl transition-all duration-200 hover:scale-110"
              aria-label={isVideoMuted ? "Unmute video" : "Mute video"}
            >
              {isVideoMuted ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.846 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.846l3.537-3.816a1 1 0 011.617.816zM16 8a1 1 0 011 1v2a1 1 0 11-2 0V9a1 1 0 011-1z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M15.293 6.293a1 1 0 011.414 0 6 6 0 010 8.485 1 1 0 01-1.414-1.414A4 4 0 0015.293 6.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.846 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.846l3.537-3.816a1 1 0 011.617.816zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        )}

        
        
        <div className="absolute bottom-6 left-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full px-4 py-2 shadow-2xl animate-pulse z-20">
          <div className="flex items-center space-x-2">
            <Trophy className="h-4 w-4" />
            <span className="text-sm font-bold">Certified Coach</span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="animate-bounce">
            <div className="w-1 h-16 bg-white/60 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Skills & Apparatus Section */}
      <section className="athletic-section bg-gradient-to-br from-[#D8BD2A]/10 to-[#0F0276]/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="athletic-title text-3xl md:text-5xl font-bold text-[#0F0276] mb-4 animate-bounce-in">
              MASTER EVERY <span className="text-[#E10B0B]">SKILL & APPARATUS</span>
            </h2>
            <p className="coach-chant text-xl text-[#0F0276]/80 max-w-3xl mx-auto">
              FROM BASIC ROLLS TO ADVANCED AERIAL SKILLS - COMPREHENSIVE TRAINING ACROSS ALL GYMNASTICS DISCIPLINES
            </p>
          </div>

          {/* Apparatus Training - Full Width */}
          <Card className="athletic-card p-8 bg-gradient-to-r from-[#0F0276] to-[#E10B0B] text-white shadow-2xl hover:shadow-2xl transition-all duration-300 mb-12 animate-scale-up">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-[#D8BD2A] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-gold">
                <Dumbbell className="h-10 w-10 text-black" />
              </div>
              <h3 className="athletic-title text-3xl font-bold mb-2">APPARATUS TRAINING</h3>
              <p className="text-white/90 text-lg coach-chant">FROM FORWARD ROLLS TO FULL TWISTS - EVERY LESSON UNLOCKS A NEW LEVEL OF MASTERY</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {["Floor Exercise", "Balance Beam", "Uneven Bars", "Vault", "Trampoline", "Tumble Track"].map((apparatus) => (
                <div key={apparatus} className="flex items-center justify-center p-4 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm">
                  <span className="font-semibold text-white text-center">{apparatus}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Skills Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Foundational Skills */}
            <Card className="p-8 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Foundational Skills</h3>
                <p className="text-gray-600">Build strength and confidence with essential moves</p>
              </div>
              <div className="space-y-3">
                {["Shaping", "Forward Rolls", "Backward Rolls", "Handstands", "Bridges & Backbends", "Limbers", "Cartwheels"].map((skill) => (
                  <div key={skill} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="font-medium text-gray-800">{skill}</span>
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Intermediate Skills */}
            <Card className="p-8 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Intermediate Skills</h3>
                <p className="text-gray-600">Progress to more dynamic and challenging moves</p>
              </div>
              <div className="space-y-3">
                {["Dive Rolls", "Round-offs", "Front Walkovers", "Back Walkovers", "Front Handsprings", "Back Handsprings", "Aerials"].map((skill) => (
                  <div key={skill} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium text-gray-800">{skill}</span>
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Advanced Skills */}
            <Card className="p-8 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Advanced Skills</h3>
                <p className="text-gray-600">Master complex aerial and tumbling skills</p>
              </div>
              <div className="space-y-3">
                {["Front Tuck", "Back Tuck", "Front Layout", "Back Layout", "Fulls", "Double Fulls", "Double Backs"].map((skill) => (
                  <div key={skill} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="font-medium text-gray-800">{skill}</span>
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Skill Progression Banner */}
          <div className="mt-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">Progressive Skill Development</h3>
            <p className="text-lg mb-6 max-w-2xl mx-auto">
              Every athlete follows a structured path—gaining new skills, leveling up with confidence, and mastering what's next.
            </p>
            <div className="flex justify-center items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <span className="text-sm">Beginner</span>
              </div>
              <div className="w-8 h-0.5 bg-white/50"></div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <span className="text-sm">Intermediate</span>
              </div>
              <div className="w-8 h-0.5 bg-white/50"></div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <span className="text-sm">Advanced</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lesson Types Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">Choose Your Lesson Path</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* 30-Min Private */}
            <div className="bg-white shadow-md rounded-lg p-6 border-t-4 border-blue-400">
              <h3 className="text-xl font-semibold text-blue-600">Quick Journey – 30-Min Private</h3>
              <p className="text-gray-700 mt-2">One-on-one attention to develop 1–2 skills with focused precision. Perfect for sharpening basics or overcoming obstacles.</p>
              <ul className="text-sm mt-4 list-disc list-inside text-gray-600">
                <li>1-on-1 with Coach Will</li>
                <li>Efficient, focused growth</li>
                <li>Ideal for beginners or refreshers</li>
              </ul>
              <Button 
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow hover:scale-105 transform transition-all duration-200"
                onClick={handleStartBooking}
              >
                Start This Path
              </Button>
            </div>

            {/* 30-Min Semi-Private */}
            <div className="bg-white shadow-md rounded-lg p-6 border-t-4 border-purple-400">
              <h3 className="text-xl font-semibold text-purple-600">Dual Quest – 30-Min Semi-Private</h3>
              <p className="text-gray-700 mt-2">Train alongside a friend or sibling. Each athlete gets their own progression path while sharing the learning space.</p>
              <ul className="text-sm mt-4 list-disc list-inside text-gray-600">
                <li>Great for partners</li>
                <li>Motivating and interactive</li>
                <li>Targets 1–2 goals per athlete</li>
              </ul>
              <Button 
                className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md shadow hover:scale-105 transform transition-all duration-200"
                onClick={handleStartBooking}
              >
                Start This Path
              </Button>
            </div>

            {/* 1-Hour Private */}
            <div className="bg-white shadow-md rounded-lg p-6 border-t-4 border-green-400">
              <h3 className="text-xl font-semibold text-green-600">Deep Dive – 1-Hour Private</h3>
              <p className="text-gray-700 mt-2">Ideal for athletes leveling up with complex skills. Ample time for drills, review, corrections, and breakthroughs.</p>
              <ul className="text-sm mt-4 list-disc list-inside text-gray-600">
                <li>Personalized skill plans</li>
                <li>Time for detailed progress</li>
                <li>Perfect for competitive athletes</li>
              </ul>
              <Button 
                className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow hover:scale-105 transform transition-all duration-200"
                onClick={handleStartBooking}
              >
                Start This Path
              </Button>
            </div>

            {/* 1-Hour Semi-Private */}
            <div className="bg-white shadow-md rounded-lg p-6 border-t-4 border-orange-400">
              <h3 className="text-xl font-semibold text-orange-600">Partner Progression – 1-Hour Semi-Private</h3>
              <p className="text-gray-700 mt-2">Two athletes. One mission. Develop multiple skills with collaborative pacing and coaching support throughout.</p>
              <ul className="text-sm mt-4 list-disc list-inside text-gray-600">
                <li>Full hour of guided learning</li>
                <li>Split focus between both athletes</li>
                <li>Ideal for competitive or returning athletes</li>
              </ul>
              <Button 
                className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md shadow hover:scale-105 transform transition-all duration-200"
                onClick={handleStartBooking}
              >
                Start This Path
              </Button>
            </div>

          </div>
        </div>
      </section>

      {/* Side Quests Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-purple-100 to-blue-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
              Side <span className="text-purple-600">Quests!</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Additional training opportunities to enhance your flippin' journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-pink-200">
              <CardContent className="pt-4">
                <div className="w-14 h-14 bg-pink-500 rounded-full flex items-center justify-center mb-4">
                  <Activity className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Flexibility Training</h3>
                <p className="text-gray-600">
                  Improve your range of motion and prevent injuries with targeted stretches and mobility work.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-red-200">
              <CardContent className="pt-4">
                <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center mb-4">
                  <Dumbbell className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Strength Training</h3>
                <p className="text-gray-600">
                  Build the power and muscle control needed to master skills — from core holds to handstand presses and explosive tumbling.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-yellow-200">
              <CardContent className="pt-4">
                <div className="w-14 h-14 bg-yellow-500 rounded-full flex items-center justify-center mb-4">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Agility Training</h3>
                <p className="text-gray-600">
                  Sharpen quickness, balance, and reaction time with fun drills that boost coordination and body awareness on every event.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-green-200">
              <CardContent className="pt-4">
                <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mb-4">
                  <Brain className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Meditation and Breathing Techniques</h3>
                <p className="text-gray-600">
                  Learn calming routines to manage nerves, improve focus, and reset your mindset before big skills or performances.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-indigo-200">
              <CardContent className="pt-4">
                <div className="w-14 h-14 bg-indigo-500 rounded-full flex items-center justify-center mb-4">
                  <Target className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Mental Blocks</h3>
                <p className="text-gray-600">
                  Work through fear-based challenges with step-by-step strategies, confidence-building, and safe skill progressions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
              Why Choose <span className="text-[#D8BD2A]">COACH</span> <span className="text-[#0F0276]">WILL</span> <span className="text-[#E10B0B]">TUMBLES</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              I build more than athletes. I help build courage, consistency, and character—one skill at a time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-shadow duration-300 border-blue-200">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Safety Gear</h3>
                <p className="text-gray-600">
                  Every session starts with safety—spotting, equipment, and coaching that put your athlete first.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-shadow duration-300 border-purple-200">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
                  <Dumbbell className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Professional Equipment</h3>
                <p className="text-gray-600">
                  Age-appropriate, pro-level equipment for every size, skill level, and apparatus.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 bg-gradient-to-br from-teal-50 to-teal-100 hover:shadow-lg transition-shadow duration-300 border-teal-200">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Progress Tracking</h3>
                <p className="text-gray-600">
                  Parents get regular insights and updates as their athlete progresses through each level.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-lg transition-shadow duration-300 border-orange-200">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Flexible Scheduling</h3>
                <p className="text-gray-600">
                  Fit your schedule, not the other way around—flexible 30 or 60-minute options available.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 bg-gradient-to-br from-pink-50 to-pink-100 hover:shadow-lg transition-shadow duration-300 border-pink-200">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Personalized Instruction</h3>
                <p className="text-gray-600">
                  Whether it's tumbling, strength, or flexibility—we tailor each session to fuel total athlete growth.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-shadow duration-300 border-green-200">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Fun Environment</h3>
                <p className="text-gray-600">
                  Building mental strength and resilience through positive coaching, encouragement, and small wins.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Equipment Gallery */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-800 text-center mb-8">Our Training Equipment</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
                "https://images.unsplash.com/photo-1540479859555-17af45c78602?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
              ].map((src, index) => (
                <div key={index} className="aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                  <img 
                    src={src}
                    alt={`Gymnastics equipment ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-teal-600">
        <div className="container mx-auto px-4 py-3 md:px-6 md:py-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Your Athlete's Adventure Starts Here!
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join the many families who've seen their athlete's grow stronger, braver, and more confident through Coach Will's proven methods.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="coach-will-gradient text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transform transition-all duration-200 shadow-lg"
                onClick={handleStartBooking}
              >
                <Calendar className="h-5 w-5 mr-2" />
                Start Your Adventure
              </Button>
              <Link href="/contact">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-blue-600 bg-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transform transition-all duration-200 shadow-lg"
                >
                  Ask Questions
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <CustomerIdentificationEnhanced 
        isOpen={showCustomerModal} 
        onClose={() => setShowCustomerModal(false)}
        onParentConfirmed={handleCustomerConfirmed}
      />
      
      <EnhancedBookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        customerData={customerData || undefined}
        selectedAthletes={selectedAthletes}
        isNewCustomer={isNewCustomer}
      />
    </div>
  );
}
