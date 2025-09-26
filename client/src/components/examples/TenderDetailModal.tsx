import { useState } from 'react';
import { Button } from '@/components/ui/button';
import TenderDetailModal from '../TenderDetailModal';
import type { Tender } from '@shared/schema';

// todo: remove mock functionality
const mockTender: Tender = {
  id: '1',
  tenderNumber: 'TND-2025-001',
  clientName: 'City of Cape Town',
  description: 'Comprehensive road infrastructure development project including the construction of new arterial roads, bridge repairs, and traffic management system upgrades across the metropolitan area.',
  briefingDate: new Date('2025-01-15T10:00:00Z'),
  submissionDate: new Date('2025-01-30T17:00:00Z'),
  compulsoryBriefing: true,
};

export default function TenderDetailModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  const handleEdit = (tender: Tender) => {
    console.log('Edit tender:', tender);
    setIsOpen(false);
  };

  return (
    <div className="p-4">
      <Button onClick={() => setIsOpen(true)}>
        View Tender Details
      </Button>
      
      <TenderDetailModal
        tender={mockTender}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onEdit={handleEdit}
      />
    </div>
  );
}