import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBookingFlow } from "@/contexts/BookingFlowContext";
import { cn } from "@/lib/utils";
import { Clock, Users, User } from "lucide-react";
import { useLessonTypes } from "@/hooks/useLessonTypes";

export function LessonTypeStep() {
  const { state, updateState } = useBookingFlow();
  const { data: lessonTypes, isLoading, error, formatDuration } = useLessonTypes();

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
        {(lessonTypes || []).map((lt) => {
          const isSelected = state.lessonType === lt.name.toLowerCase().replace(/\s+/g, '-');
          const Icon = lt.maxAthletes > 1 ? Users : (lt.isPrivate ? User : Users);
          return (
            <Card 
              key={lt.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                isSelected ? "ring-2 ring-orange-500 border-orange-500" : "hover:border-gray-400"
              )}
              onClick={() => handleLessonSelect(lt.name.toLowerCase().replace(/\s+/g, '-'))}
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
                      <CardTitle className="text-lg">{lt.name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatDuration(lt.duration)}</span>
                        <span>•</span>
                        <span>{lt.maxAthletes} {lt.maxAthletes === 1 ? 'athlete' : 'athletes'}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-lg font-bold">
                    ${lt.price}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <CardDescription className="text-sm">
                  {lt.description}
                </CardDescription>
                
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-700">Perfect for:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {(lt.keyPoints || []).map((benefit, index) => (
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