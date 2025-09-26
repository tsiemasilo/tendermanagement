import { useState } from 'react';
import TenderCalendar from '../TenderCalendar';
import type { Tender } from '@shared/schema';

// todo: remove mock functionality
const mockTenders: Tender[] = [
  {
    id: '1',
    tenderNumber: 'TND-2025-001',
    clientName: 'City of Cape Town',
    description: 'Road Infrastructure Development Project',
    briefingDate: new Date('2025-01-15T10:00:00Z'),
    submissionDate: new Date('2025-01-30T17:00:00Z'),
    compulsoryBriefing: true,
  },
  {
    id: '2',
    tenderNumber: 'TND-2025-002',
    clientName: 'Department of Health',
    description: 'Medical Equipment Supply Contract',
    briefingDate: new Date('2025-01-20T14:00:00Z'),
    submissionDate: new Date('2025-02-05T12:00:00Z'),
    compulsoryBriefing: false,
  },
  {
    id: '3',
    tenderNumber: 'TND-2025-003',
    clientName: 'Provincial Government',
    description: 'IT Services and Support',
    briefingDate: new Date('2025-01-25T09:00:00Z'),
    submissionDate: new Date('2025-02-10T16:00:00Z'),
    compulsoryBriefing: true,
  },
];

export default function TenderCalendarExample() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleTenderClick = (tender: Tender) => {
    console.log('Tender clicked:', tender);
  };

  return (
    <div className="p-4">
      <TenderCalendar
        tenders={mockTenders}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        onTenderClick={handleTenderClick}
      />
    </div>
  );
}