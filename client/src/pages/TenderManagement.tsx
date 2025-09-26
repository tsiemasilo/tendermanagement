import { useState } from 'react';
import { format } from 'date-fns';
import AppLayout from '@/components/AppLayout';
import TenderCalendar from '@/components/TenderCalendar';
import TenderDetailModal from '@/components/TenderDetailModal';
import TenderForm from '@/components/TenderForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Calendar, AlertCircle } from 'lucide-react';
import type { Tender, InsertTender } from '@shared/schema';

// todo: remove mock functionality
const mockTenders: Tender[] = [
  {
    id: '1',
    tenderNumber: 'TND-2025-001',
    clientName: 'City of Cape Town',
    description: 'Road Infrastructure Development Project including bridge repairs and traffic management system upgrades',
    briefingDate: new Date('2025-01-15T10:00:00Z'),
    submissionDate: new Date('2025-01-30T17:00:00Z'),
    venue: 'City Hall Conference Room A, 12 Hertzog Boulevard, Cape Town',
    compulsoryBriefing: true,
  },
  {
    id: '2',
    tenderNumber: 'TND-2025-002',
    clientName: 'Department of Health',
    description: 'Medical Equipment Supply Contract for provincial hospitals',
    briefingDate: new Date('2025-01-20T14:00:00Z'),
    submissionDate: new Date('2025-02-05T12:00:00Z'),
    venue: 'Provincial Health Building, Boardroom 3, Wale Street, Cape Town',
    compulsoryBriefing: false,
  },
  {
    id: '3',
    tenderNumber: 'TND-2025-003',
    clientName: 'Provincial Government',
    description: 'IT Services and Support for government departments',
    briefingDate: new Date('2025-01-25T09:00:00Z'),
    submissionDate: new Date('2025-02-10T16:00:00Z'),
    venue: 'Provincial Government Building, Meeting Room 201, 4 Dorp Street, Cape Town',
    compulsoryBriefing: true,
  },
  {
    id: '4',
    tenderNumber: 'TND-2025-004',
    clientName: 'University of Cape Town',
    description: 'Campus Security Services Contract',
    briefingDate: new Date('2025-01-18T11:00:00Z'),
    submissionDate: new Date('2025-02-01T15:00:00Z'),
    venue: 'UCT Administration Building, Senate Room, Upper Campus, Rondebosch',
    compulsoryBriefing: false,
  },
];

export default function TenderManagement() {
  const [currentView, setCurrentView] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [editingTender, setEditingTender] = useState<Tender | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [tenders, setTenders] = useState<Tender[]>(mockTenders);

  const handleNewTender = () => {
    setEditingTender(null);
    setShowForm(true);
  };

  const handleEditTender = (tender: Tender) => {
    setEditingTender(tender);
    setShowDetailModal(false);
    setShowForm(true);
  };

  const handleTenderClick = (tender: Tender) => {
    setSelectedTender(tender);
    setShowDetailModal(true);
  };

  const handleFormSubmit = async (data: InsertTender) => {
    // todo: remove mock functionality
    console.log('Submitting tender:', data);
    
    if (editingTender) {
      // Update existing tender
      setTenders(prev => prev.map(t => 
        t.id === editingTender.id 
          ? { ...editingTender, ...data }
          : t
      ));
    } else {
      // Create new tender
      const newTender: Tender = {
        id: Date.now().toString(),
        ...data,
        compulsoryBriefing: data.compulsoryBriefing ?? false,
      };
      setTenders(prev => [...prev, newTender]);
    }
    
    setShowForm(false);
    setEditingTender(null);
  };

  const getTendersForSelectedDate = () => {
    return tenders.filter(tender => {
      const briefingDate = new Date(tender.briefingDate);
      const submissionDate = new Date(tender.submissionDate);
      return (
        format(briefingDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') ||
        format(submissionDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
      );
    });
  };

  const getUpcomingTenders = () => {
    const today = new Date();
    return tenders
      .filter(tender => new Date(tender.submissionDate) >= today)
      .sort((a, b) => new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime())
      .slice(0, 5);
  };

  const getUrgentTenders = () => {
    const today = new Date();
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    return tenders.filter(tender => {
      const submissionDate = new Date(tender.submissionDate);
      return submissionDate >= today && submissionDate <= threeDaysFromNow;
    });
  };

  if (showForm) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto">
          <TenderForm
            tender={editingTender || undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingTender(null);
            }}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      currentView={currentView}
      onViewChange={setCurrentView}
      onNewTender={handleNewTender}
    >
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Tenders</p>
                  <p className="text-2xl font-bold" data-testid="stat-total-tenders">{tenders.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Urgent (3 days)</p>
                  <p className="text-2xl font-bold text-orange-500" data-testid="stat-urgent-tenders">
                    {getUrgentTenders().length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Compulsory Briefings</p>
                  <p className="text-2xl font-bold text-red-500" data-testid="stat-compulsory-briefings">
                    {tenders.filter(t => t.compulsoryBriefing).length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar or List View */}
          <div className="lg:col-span-2">
            {currentView === 'calendar' ? (
              <TenderCalendar
                tenders={tenders}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                onTenderClick={handleTenderClick}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>All Tenders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tenders.map(tender => (
                      <div
                        key={tender.id}
                        className="flex items-center justify-between p-4 border rounded-md hover-elevate"
                        data-testid={`tender-row-${tender.id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium">{tender.clientName}</h3>
                            <Badge variant="outline">{tender.tenderNumber}</Badge>
                            {tender.compulsoryBriefing && (
                              <Badge variant="destructive">Compulsory Briefing</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {tender.description}
                          </p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>Briefing: {format(new Date(tender.briefingDate), 'PPp')}</span>
                            <span>Due: {format(new Date(tender.submissionDate), 'PPp')}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTenderClick(tender)}
                            data-testid={`button-view-${tender.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTender(tender)}
                            data-testid={`button-edit-${tender.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Date Info */}
            {currentView === 'calendar' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {format(selectedDate, 'EEEE, MMMM d')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getTendersForSelectedDate().length > 0 ? (
                    <div className="space-y-3">
                      {getTendersForSelectedDate().map(tender => (
                        <div
                          key={tender.id}
                          className="p-3 border rounded-md cursor-pointer hover-elevate"
                          onClick={() => handleTenderClick(tender)}
                          data-testid={`sidebar-tender-${tender.id}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{tender.clientName}</span>
                            {tender.compulsoryBriefing && (
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{tender.tenderNumber}</p>
                          <p className="text-xs text-muted-foreground truncate">{tender.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No tenders scheduled for this date.</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Upcoming Tenders */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getUpcomingTenders().map(tender => {
                    const daysLeft = Math.ceil(
                      (new Date(tender.submissionDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    );
                    return (
                      <div
                        key={tender.id}
                        className="p-3 border rounded-md cursor-pointer hover-elevate"
                        onClick={() => handleTenderClick(tender)}
                        data-testid={`upcoming-tender-${tender.id}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{tender.clientName}</span>
                          <Badge variant={daysLeft <= 3 ? "destructive" : "secondary"}>
                            {daysLeft}d left
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{tender.tenderNumber}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TenderDetailModal
        tender={selectedTender}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onEdit={handleEditTender}
      />
    </AppLayout>
  );
}