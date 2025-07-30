import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { addHours, format, parseISO } from 'date-fns';
import { X } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { Calendar } from 'react-big-calendar';

// Default localizer using date-fns
import * as dates from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { dateFnsLocalizer } from 'react-big-calendar';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse: parseISO,
  startOfWeek: (date: Date) => {
    return dates.startOfWeek(date);
  },
  getDay: (date: Date) => dates.getDay(date),
  locales,
});

// Type definitions
type CalendarEvent = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  bookingId: number;
  status: string;
  lessonType: string;
  athleteNames: string;
  color?: string;
};

type BookingCalendarProps = {
  bookings: any[];
  onBookingSelect: (bookingId: number) => void;
};

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  bookings,
  onBookingSelect,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateEvents, setDateEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState('month');

  // Convert bookings to calendar events
  const events = useMemo(() => {
    if (!bookings) return [];

    return bookings.map((booking) => {
      // Parse the preferred date and time
      const dateTimeStr = `${booking.preferred_date}T${booking.preferred_time}`;
      const start = parseISO(dateTimeStr);
      
      // Default to 1-hour sessions if duration is not specified
      const end = booking.duration 
        ? addHours(start, parseFloat(booking.duration)) 
        : addHours(start, 1);
      
      // Generate a title
      const title = `${booking.lesson_type} - ${booking.athlete_names || 'No athletes'}`;
      
      // Set color based on status
      let color;
      if (booking.payment_status === 'reservation-paid' && booking.attendance_status === 'completed') {
        color = 'bg-green-100 border-green-300';
      } else if (booking.payment_status === 'reservation-paid') {
        color = 'bg-blue-100 border-blue-300';
      } else {
        color = 'bg-amber-100 border-amber-300';
      }

      return {
        id: booking.id,
        title,
        start,
        end,
        bookingId: booking.id,
        status: booking.attendance_status || booking.status || 'Unknown',
        lessonType: booking.lesson_type,
        athleteNames: booking.athlete_names || '',
        color,
      };
    });
  }, [bookings]);

  // Handle event click
  const handleEventClick = useCallback(
    (event: CalendarEvent) => {
      onBookingSelect(event.bookingId);
    },
    [onBookingSelect]
  );

  // Handle date cell click
  const handleDateClick = useCallback(
    ({ start }: { start: Date }) => {
      // Filter events for the clicked date
      const startDate = new Date(start);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(start);
      endDate.setHours(23, 59, 59, 999);
      
      const filteredEvents = events.filter(
        (event) => event.start >= startDate && event.start <= endDate
      );
      
      setSelectedDate(start);
      setDateEvents(filteredEvents);
    },
    [events]
  );

  // Handle view change
  const handleViewChange = useCallback((newView: string) => {
    setView(newView);
  }, []);

  // Custom event component to show colored events
  const EventComponent = ({ event }: { event: CalendarEvent }) => (
    <div 
      className={`rounded p-1 ${event.color || 'bg-blue-100 border-blue-300'} border`}
      style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
    >
      <span className="text-xs font-medium text-blue-900">
        {format(event.start, 'h:mm a')} - {event.title}
      </span>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%', minHeight: '600px' }}
          views={{ month: true, week: true, day: true }}
          view={view as any}
          onView={handleViewChange as any}
          onSelectEvent={handleEventClick}
          onSelectSlot={handleDateClick}
          selectable
          popup
          components={{
            event: EventComponent,
          }}
        />
        
        {selectedDate && dateEvents.length > 0 && (
          <div className="absolute bottom-4 right-4 w-72 shadow-xl rounded-xl border border-gray-200 bg-white z-10">
            <Card>
              <div className="flex items-center justify-between p-3 border-b">
                <h3 className="font-medium">
                  {format(selectedDate, 'MMMM d, yyyy')} ({dateEvents.length} bookings)
                </h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={() => setSelectedDate(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-0">
                <ScrollArea className="h-64 p-3">
                  <div className="space-y-2">
                    {dateEvents.map((event) => (
                      <div 
                        key={event.id}
                        className="border rounded-lg p-2 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleEventClick(event)}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{format(event.start, 'h:mm a')}</p>
                          <Badge 
                            variant="outline" 
                            className={
                              event.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' : 
                              event.status === 'confirmed' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                              'bg-amber-100 text-amber-800 border-amber-200'
                            }
                          >
                            {event.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700">{event.title}</p>
                        <p className="text-xs text-gray-500">{event.lessonType}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export { BookingCalendar };
