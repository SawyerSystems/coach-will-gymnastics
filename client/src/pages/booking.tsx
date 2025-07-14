import { useState, useEffect } from "react";
import type { Parent, Athlete } from "@shared/schema";
import { ParentIdentificationEnhanced } from "@/components/parent-identification-enhanced";
import { EnhancedBookingModal } from "@/components/enhanced-booking-modal";
import { BookingModal } from "@/components/booking-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Users, Clock, CheckCircle, Calendar, MapPin, Phone, Mail } from "lucide-react";
import { LESSON_TYPES } from "@/lib/constants";
import { useStripePricing } from "@/hooks/use-stripe-products";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Footer } from "@/components/Footer";

export default function Booking() {
  const [showParentModal, setShowParentModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [parentData, setParentData] = useState<Parent | null>(null);
  const [selectedAthletes, setSelectedAthletes] = useState<Athlete[]>([]);
  const [isNewParent, setIsNewParent] = useState(false);
  
  // Check parent authentication status
  const { data: parentAuth } = useQuery({
    queryKey: ['/api/parent-auth/status'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/parent-auth/status");
      return response.json();
    },
  });
  
  // Get parent bookings and athletes if logged in
  const { data: parentBookings } = useQuery({
    queryKey: ['/api/parent/bookings'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/parent/bookings");
      return response.json();
    },
    enabled: parentAuth?.loggedIn || false,
  });

  const { data: parentAthletes } = useQuery({
    queryKey: ['/api/parent/athletes'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/parent/athletes");
      return response.json();
    },
    enabled: parentAuth?.loggedIn || false,
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
  
  // Debug log state changes
  useEffect(() => {
    console.log("Booking state updated:", { showBookingModal, parentData, selectedAthletes, isNewParent });
  }, [showBookingModal, parentData, selectedAthletes, isNewParent]);
  const { getLessonPrice } = useStripePricing();

  const handleParentConfirmed = (data: {
    parent: Parent;
    selectedAthletes: Athlete[];
    isNewParent: boolean;
  }) => {
    console.log("handleParentConfirmed called with:", data);
    setParentData(data.parent);
    setSelectedAthletes(data.selectedAthletes);
    setIsNewParent(data.isNewParent);
    setShowParentModal(false);
    setShowBookingModal(true);
    console.log("Should now show booking modal");
  };

  const handleBookNow = (lessonType?: string) => {
    console.log("handleBookNow called with:", {
      parentAuth,
      parentInfo,
      parentAthletes,
      parentInfoLoading,
      parentInfoError
    });
    
    // If parent is logged in but info is still loading, wait for it
    if (parentAuth?.loggedIn && parentInfoLoading) {
      console.log("Parent is logged in but info is loading, waiting...");
      return;
    }
    
    // Check if parent is logged in
    if (parentAuth?.loggedIn) {
      console.log("Parent is authenticated, checking for parent info...");
      
      // If we have parent info from the API, use it
      if (parentInfo && !parentInfoError) {
        const parentDataToSet = {
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
        
        console.log("Using parent info from API:", parentDataToSet);
        setParentData(parentDataToSet);
        setSelectedAthletes(parentAthletes || []);
        setIsNewParent(false);
        setShowBookingModal(true);
      } else {
        // Fallback: Create basic parent data from parent auth session
        console.log("Parent info API failed, using fallback from session data");
        const fallbackParentData = {
          id: parentAuth.parentId,
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
        
        setParentData(fallbackParentData);
        setSelectedAthletes(parentAthletes || []);
        setIsNewParent(false);
        setShowBookingModal(true);
      }
    } else {
      // Show parent identification modal for non-logged in users
      console.log("Showing parent identification modal - not logged in");
      setShowParentModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-teal-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6">
            Start Your Athlete's Journey
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Every athlete begins somewhere. Whether it's their first handstand or they're chasing a new tumbling pass, we'll build a personalized plan that helps them grow with confidence.
          </p>
          <Button 
            size="lg"
            className="gym-gradient-blue text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transform transition-all duration-200 shadow-lg"
            onClick={() => {
              console.log("Begin Journey button clicked");
              handleBookNow();
            }}
            disabled={parentAuth?.loggedIn && parentInfoLoading}
          >
            <Calendar className="h-5 w-5 mr-2" />
            {parentAuth?.loggedIn && parentInfoLoading ? "Loading..." : "Begin Journey"}
          </Button>
        </div>
      </section>

      {/* Lesson Types */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
              Choose a <span className="text-purple-600">Lesson Path</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select the journey that fits your schedule and goals. Whether it's 1-on-1 focus or shared learning with a teammate, each session is personalized to match your athlete's level, style, and progress pace.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Object.entries(LESSON_TYPES).map(([key, lesson]) => {
              const colorClasses = {
                blue: "from-blue-50 to-blue-100 border-blue-200 text-blue-600",
                purple: "from-purple-50 to-purple-100 border-purple-200 text-purple-600",
                teal: "from-teal-50 to-teal-100 border-teal-200 text-teal-600",
                orange: "from-orange-50 to-orange-100 border-orange-200 text-orange-600"
              };

              const iconClasses = {
                blue: "bg-blue-600",
                purple: "bg-purple-600", 
                teal: "bg-teal-600",
                orange: "bg-orange-600"
              };

              const buttonClasses = {
                blue: "bg-blue-600 hover:bg-blue-700",
                purple: "bg-purple-600 hover:bg-purple-700",
                teal: "bg-teal-600 hover:bg-teal-700", 
                orange: "bg-orange-600 hover:bg-orange-700"
              };

              return (
                <Card 
                  key={key}
                  className={`bg-gradient-to-br ${colorClasses[lesson.color as keyof typeof colorClasses]} border shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300`}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${iconClasses[lesson.color as keyof typeof iconClasses]} rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle`}>
                      {lesson.athletes === 1 ? (
                        <User className="h-8 w-8 text-white" />
                      ) : (
                        <Users className="h-8 w-8 text-white" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{lesson.name}</h3>
                    <div className={`text-3xl font-bold mb-4 ${lesson.color === 'blue' ? 'text-blue-600' : lesson.color === 'purple' ? 'text-purple-600' : lesson.color === 'teal' ? 'text-teal-600' : 'text-orange-600'}`}>
                      ${lesson.price}
                    </div>
                    <p className="text-gray-600 mb-6">{lesson.description}</p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-center text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-teal-600 mr-2" />
                        <span>{lesson.athletes} Athlete{lesson.athletes > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center justify-center text-sm text-gray-700">
                        <Clock className="h-4 w-4 text-teal-600 mr-2" />
                        <span>{key.includes('1-hour') ? '60' : '30'} Minutes</span>
                      </div>
                      <div className="flex items-center justify-center text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-teal-600 mr-2" />
                        <span>Up to {lesson.maxFocusAreas} Focus Areas</span>
                      </div>
                      <div className="flex items-center justify-center text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-teal-600 mr-2" />
                        <span>Progress Report Included</span>
                      </div>
                    </div>
                    
                    <Button 
                      className={`w-full ${buttonClasses[lesson.color as keyof typeof buttonClasses]} text-white py-3 rounded-full font-medium transform transition-all duration-200`}
                      onClick={() => setShowParentModal(true)}
                    >
                      Start This Path
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Side Quests Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
              <span className="text-orange-600">Side Quests</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Each journey can include optional Side Quests that help athletes grow in areas beyond the mat. These can be selected as add-ons or embedded into any session depending on your athlete's goals:
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            {[
              { name: "Flexibility Training", icon: "🧘‍♂️", color: "from-purple-100 to-purple-200 border-purple-300" },
              { name: "Strength Conditioning", icon: "💪", color: "from-red-100 to-red-200 border-red-300" },
              { name: "Agility & Quickness Drills", icon: "⚡", color: "from-blue-100 to-blue-200 border-blue-300" },
              { name: "Meditation & Breathing Techniques", icon: "🌬️", color: "from-teal-100 to-teal-200 border-teal-300" },
              { name: "Overcoming Mental Blocks", icon: "🧠", color: "from-indigo-100 to-indigo-200 border-indigo-300" }
            ].map((quest, index) => (
              <Card key={index} className={`bg-gradient-to-br ${quest.color} border-2 text-center hover:shadow-lg transform hover:scale-105 transition-all duration-300`}>
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{quest.icon}</div>
                  <h3 className="font-bold text-gray-800 text-sm">{quest.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These quests unlock confidence, focus, and body control—essential ingredients for any successful athlete.
            </p>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
              What Comes With Every <span className="text-teal-600">Journey</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every step is supported by the tools, environment, and coaching style your child needs to thrive.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Professional Equipment",
                description: "Full-sized & kid-friendly gear for all levels",
                icon: "🤸‍♀️"
              },
              {
                title: "Safety Gear",
                description: "Spotting techniques and padding included",
                icon: "🛡️"
              },
              {
                title: "Progress-Based Planning",
                description: "Skill development tracked each week",
                icon: "📈"
              },
              {
                title: "Flexible Scheduling",
                description: "We work around your needs",
                icon: "📅"
              },
              {
                title: "Positive Environment",
                description: "Respect, trust, and encouragement always",
                icon: "🎉"
              }
            ].map((item, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Location & Contact Info */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
              Where & When We <span className="text-orange-600">Train</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <Card className="p-8">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Training Location</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-800">🏛️ Oceanside Gymnastics</p>
                      <p className="text-gray-600">1935 Ave. del Oro #A<br/>Oceanside, CA 92056</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <p className="text-gray-600">📞 (585) 755-8122</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <p className="text-gray-600">📧 admin@coachwilltumbles.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Hours of Operation</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">Monday, Wednesday, Friday</span>
                    <span className="text-gray-600">9:00 AM – 4:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">Tuesday, Thursday</span>
                    <span className="text-gray-600">9:00 AM – 3:30 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">Saturday</span>
                    <span className="text-gray-600">10:00 AM – 2:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">Sunday</span>
                    <span className="text-gray-600">Ask us about availability</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Lesson times are flexible within operating hours. 
                    We'll work with you to find the perfect time slot for your family.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-teal-600 to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Let's Begin the Journey
          </h2>
          <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            We believe in building confident, strong athletes—and it all starts here.  
            No pressure. No hard sales. Just a conversation and a first step forward.
          </p>
          <Button 
            size="lg"
            className="bg-white text-teal-600 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transform transition-all duration-200 shadow-lg hover:bg-gray-100"
            onClick={() => handleBookNow()}
          >
            <Calendar className="h-5 w-5 mr-2" />
            Start Your Athlete's Journey
          </Button>
        </div>
      </section>

      <ParentIdentificationEnhanced 
        isOpen={showParentModal} 
        onClose={() => {
          console.log("Parent modal closing");
          setShowParentModal(false);
        }}
        onParentConfirmed={handleParentConfirmed}
      />
      
      <EnhancedBookingModal
        isOpen={showBookingModal}
        onClose={() => {
          console.log("Booking modal closing");
          setShowBookingModal(false);
        }}
        parentData={parentData || undefined}
        selectedAthletes={selectedAthletes}
        isNewParent={isNewParent}
      />

      <Footer />
    </div>
  );
}
