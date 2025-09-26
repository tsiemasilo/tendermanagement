import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, differenceInDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Tender } from '@shared/schema';

interface TenderCalendarProps {
  tenders: Tender[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onTenderClick: (tender: Tender) => void;
}

export default function TenderCalendar({ 
  tenders, 
  selectedDate, 
  onDateSelect, 
  onTenderClick 
}: TenderCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  const getTendersForDate = (date: Date) => {
    return tenders.filter(tender => 
      isSameDay(new Date(tender.briefingDate), date) ||
      isSameDay(new Date(tender.submissionDate), date)
    );
  };

  const getDateStatus = (date: Date) => {
    const today = new Date();
    const tendersForDate = getTendersForDate(date);
    
    if (tendersForDate.length === 0) return 'default';
    
    const hasSubmissionToday = tendersForDate.some(t => 
      isSameDay(new Date(t.submissionDate), date)
    );
    
    if (hasSubmissionToday) {
      const daysUntilSubmission = differenceInDays(date, today);
      if (daysUntilSubmission < 0) return 'overdue';
      if (daysUntilSubmission <= 1) return 'urgent';
      if (daysUntilSubmission <= 3) return 'warning';
      if (daysUntilSubmission <= 7) return 'upcoming';
    }
    
    return 'briefing';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'bg-red-500';
      case 'urgent': return 'bg-orange-500';
      case 'warning': return 'bg-yellow-500';
      case 'upcoming': return 'bg-green-500';
      case 'briefing': return 'bg-blue-500';
      default: return 'bg-gray-200';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-foreground">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth('prev')}
            data-testid="button-prev-month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth('next')}
            data-testid="button-next-month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {monthDays.map(day => {
          const tendersForDate = getTendersForDate(day);
          const status = getDateStatus(day);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[100px] border rounded-md p-2 cursor-pointer transition-colors hover-elevate ${
                isSelected ? 'ring-2 ring-accent' : ''
              } ${isCurrentMonth ? 'bg-card' : 'bg-muted/50'}`}
              onClick={() => onDateSelect(day)}
              data-testid={`date-${format(day, 'yyyy-MM-dd')}`}
            >
              <div className={`text-sm font-medium mb-2 ${
                isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {format(day, 'd')}
              </div>
              
              {tendersForDate.length > 0 && (
                <div className="space-y-1">
                  {tendersForDate.slice(0, 2).map(tender => (
                    <div
                      key={tender.id}
                      className="text-xs p-1 rounded cursor-pointer hover-elevate"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTenderClick(tender);
                      }}
                      data-testid={`tender-preview-${tender.id}`}
                    >
                      <div className={`w-2 h-2 rounded-full inline-block mr-1 ${getStatusColor(status)}`} />
                      <div className="font-medium truncate">{tender.clientName}</div>
                      <div className="text-muted-foreground truncate">{tender.tenderNumber}</div>
                    </div>
                  ))}
                  {tendersForDate.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{tendersForDate.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Overdue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span>Due Today/Tomorrow</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span>Due in 2-3 Days</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Due in Week</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>Briefing Date</span>
        </div>
      </div>
    </Card>
  );
}