import { useState } from 'react';
import { format } from 'date-fns';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import AppLayout from '@/components/AppLayout';
import TenderCalendar from '@/components/TenderCalendar';
import TenderDetailModal from '@/components/TenderDetailModal';
import TenderForm from '@/components/TenderForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard as Edit, Eye, Calendar, CircleAlert as AlertCircle } from 'lucide-react';
import type { Tender, InsertTender } from '@shared/schema';

export default function TenderManagement() {
  const [currentView, setCurrentView] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [editingTender, setEditingTender] = useState<Tender | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Fetch tenders from API
  const { data: tenders = [], isLoading } = useQuery<Tender[]>({
    queryKey: ['/api/tenders'],
  });

  // Create tender mutation
  const createTenderMutation = useMutation({
    mutationFn: async (data: InsertTender) => {
      const response = await apiRequest('POST', '/api/tenders', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenders'] });
    },
  });

  // Update tender mutation
  const updateTenderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertTender }) => {
      const response = await apiRequest('PUT', `/api/tenders/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenders'] });
    },
  });

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
    try {
      if (editingTender) {
        // Update existing tender
        await updateTenderMutation.mutateAsync({ id: editingTender.id, data });
      } else {
        // Create new tender
        await createTenderMutation.mutateAsync(data);
      }
      
      setShowForm(false);
      setEditingTender(null);
    } catch (error) {
      console.error('Error submitting tender:', error);
      // You could show a toast notification here
    }
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

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading tenders...</p>
        </div>
      </AppLayout>
    );
  }

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