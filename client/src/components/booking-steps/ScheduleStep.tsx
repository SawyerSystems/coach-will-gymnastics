import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useBookingFlow } from "@/contexts/BookingFlowContext";
import { useAvailableTimes } from "@/hooks/useAvailableTimes";
import { formatBookingDate, parseDate } from "@/lib/dateUtils";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

export function ScheduleStep() {
  const { state, updateState } = useBookingFlow();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    state.selectedTimeSlot?.date ? parseDate(state.selectedTimeSlot.date) || undefined : undefined
  );

  const { data: availableTimes = [], isLoading } = useAvailableTimes(
    selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
    state.lessonType || ''
  );

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      updateState({ 
        selectedTimeSlot: { 
          date: format(date, 'yyyy-MM-dd'), 
          time: '' 
        } 
      });
    }
  };

  const handleTimeSelect = (time: string) => {
    if (selectedDate) {
      updateState({ 
        selectedTimeSlot: { 
          date: format(selectedDate, 'yyyy-MM-dd'), 
          time 
        } 
      });
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Your Adventure Time</h3>
        <p className="text-muted-foreground">
          Select the perfect date and time for your gymnastics lesson
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Select Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal min-h-[48px]",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0); // Reset time to start of day
                  return date < today || date.getDay() === 0; // Block past dates and Sundays
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {selectedDate && (
          <div>
            <Label>Available Times</Label>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading available times...
              </div>
            ) : availableTimes.length === 0 ? (
              <Card className="mt-2">
                <CardContent className="text-center py-8 text-muted-foreground">
                  No available times for this date. Please select another date.
                </CardContent>
              </Card>
            ) : (
              <RadioGroup 
                value={state.selectedTimeSlot?.time || ''} 
                onValueChange={handleTimeSelect}
                className="grid grid-cols-2 gap-3 mt-2"
              >
                {availableTimes.map((time) => (
                  <Card 
                    key={time}
                    className={cn(
                      "cursor-pointer transition-all",
                      state.selectedTimeSlot?.time === time
                        ? "ring-2 ring-orange-500 border-orange-500"
                        : "hover:border-gray-400"
                    )}
                    onClick={() => handleTimeSelect(time)}
                  >
                    <CardContent className="flex items-center p-3">
                      <RadioGroupItem value={time} id={time} className="mr-2" />
                      <Label htmlFor={time} className="cursor-pointer flex-1">
                        {time}
                      </Label>
                    </CardContent>
                  </Card>
                ))}
              </RadioGroup>
            )}
          </div>
        )}
      </div>

      {state.selectedTimeSlot?.date && state.selectedTimeSlot?.time && (
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-900">
            <strong>✅ Selected:</strong> {formatBookingDate(state.selectedTimeSlot.date)} at {state.selectedTimeSlot.time}
          </p>
        </div>
      )}
    </div>
  );
}