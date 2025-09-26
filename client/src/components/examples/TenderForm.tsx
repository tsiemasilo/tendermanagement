import { useState } from 'react';
import TenderForm from '../TenderForm';
import type { InsertTender, Tender } from '@shared/schema';

// todo: remove mock functionality
const mockTender: Tender = {
  id: '1',
  tenderNumber: 'TND-2025-001',
  clientName: 'City of Cape Town',
  description: 'Road infrastructure development project',
  briefingDate: new Date('2025-01-15T10:00:00Z'),
  submissionDate: new Date('2025-01-30T17:00:00Z'),
  venue: 'City Hall Conference Room A, 12 Hertzog Boulevard, Cape Town',
  compulsoryBriefing: true,
};

export default function TenderFormExample() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: InsertTender) => {
    setIsSubmitting(true);
    console.log('Form submitted:', data);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    alert('Tender saved successfully!');
  };

  const handleCancel = () => {
    console.log('Form cancelled');
  };

  return (
    <div className="p-4 space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Create New Tender</h2>
        <TenderForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Edit Existing Tender</h2>
        <TenderForm
          tender={mockTender}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}