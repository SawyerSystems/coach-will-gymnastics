import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBookingFlow } from "@/contexts/BookingFlowContext";
import { cn } from "@/lib/utils";
import { Clock, Users, User, Target } from "lucide-react";

const LESSON_TYPES = [
  {
    id: "quick-journey",
    name: "Quick Journey",
    duration: "30 minutes",
    participants: 1,
    price: 40,
    description: "Perfect for skill checks, focused practice, or when time is limited",
    benefits: ["Skill assessment", "Quick corrections", "Confidence building"],
    icon: Clock
  },
  {
    id: "dual-quest",
    name: "Dual Quest", 
    duration: "30 minutes",
    participants: 2,
    price: 50,
    description: "Semi-private lesson for friends or siblings to learn together",
    benefits: ["Shared experience", "Peer motivation", "Cost effective"],
    icon: Users
  },
  {
    id: "deep-dive",
    name: "Deep Dive",
    duration: "60 minutes", 
    participants: 1,
    price: 60,
    description: "Comprehensive training session for significant skill development",
    benefits: ["Detailed instruction", "Multiple skills", "Progress tracking"],
    icon: User
  },
  {
    id: "partner-progression",
    name: "Partner Progression",
    duration: "60 minutes",
    participants: 2, 
    price: 80,
    description: "Extended semi-private lesson for serious skill development",
    benefits: ["Intensive training", "Partner support", "Advanced techniques"],
    icon: Target
  }
];

export function LessonTypeStep() {
  const { state, updateState } = useBookingFlow();

  const handleLessonSelect = (lessonType: string) => {
    updateState({ lessonType });
  };

  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Choose Your Adventure</h2>
        <p className="text-muted-foreground">
          Select the type of gymnastics lesson that best fits your goals and schedule.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LESSON_TYPES.map((lesson) => {
          const Icon = lesson.icon;
          const isSelected = state.lessonType === lesson.id;
          
          return (
            <Card 
              key={lesson.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                isSelected ? "ring-2 ring-orange-500 border-orange-500" : "hover:border-gray-400"
              )}
              onClick={() => handleLessonSelect(lesson.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      isSelected ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-600"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{lesson.name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{lesson.duration}</span>
                        <span>•</span>
                        <span>{lesson.participants} {lesson.participants === 1 ? 'athlete' : 'athletes'}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-lg font-bold">
                    ${lesson.price}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <CardDescription className="text-sm">
                  {lesson.description}
                </CardDescription>
                
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-700">Perfect for:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {lesson.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-orange-400 rounded-full"></span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">What's Included in Every Lesson:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Warm-up and conditioning appropriate for skill level</li>
          <li>• Personalized instruction based on individual goals</li>
          <li>• Progress tracking and skill development notes</li>
          <li>• Safety-first approach with proper spotting techniques</li>
          <li>• Fun, engaging activities to build confidence</li>
        </ul>
      </div>
    </div>
  );
}