import { useState } from 'react';
import { format } from 'date-fns';
import { X, Calendar, Clock, Building, FileText, AlertCircle, Edit3 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Tender } from '@shared/schema';

interface TenderDetailModalProps {
  tender: Tender | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (tender: Tender) => void;
}

export default function TenderDetailModal({ 
  tender, 
  isOpen, 
  onClose, 
  onEdit 
}: TenderDetailModalProps) {
  if (!tender) return null;

  const briefingDate = new Date(tender.briefingDate);
  const submissionDate = new Date(tender.submissionDate);
  const today = new Date();
  const daysUntilSubmission = Math.ceil((submissionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const getStatusBadge = () => {
    if (daysUntilSubmission < 0) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (daysUntilSubmission <= 1) {
      return <Badge className="bg-orange-500 text-white">Due Soon</Badge>;
    } else if (daysUntilSubmission <= 7) {
      return <Badge className="bg-yellow-500 text-white">Upcoming</Badge>;
    } else {
      return <Badge className="bg-green-500 text-white">On Track</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-xl font-semibold">Tender Details</span>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(tender)}
                data-testid="button-edit-tender"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tender Number</label>
                <p className="text-lg font-mono" data-testid="text-tender-number">{tender.tenderNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Client Name</label>
                <p className="text-lg" data-testid="text-client-name">{tender.clientName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-base leading-relaxed" data-testid="text-description">{tender.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Briefing Date</label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span data-testid="text-briefing-date">
                      {format(briefingDate, 'PPP')} at {format(briefingDate, 'p')}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Submission Date</label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span data-testid="text-submission-date">
                      {format(submissionDate, 'PPP')} at {format(submissionDate, 'p')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {daysUntilSubmission >= 0 
                      ? `${daysUntilSubmission} days remaining`
                      : `${Math.abs(daysUntilSubmission)} days overdue`
                    }
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Venue Location</label>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-green-500" />
                  <span data-testid="text-venue">{tender.venue}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Briefing Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Briefing Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  tender.compulsoryBriefing ? 'bg-red-500' : 'bg-green-500'
                }`} />
                <span className="font-medium">
                  {tender.compulsoryBriefing ? 'Compulsory' : 'Optional'} Briefing Session
                </span>
                <Badge 
                  variant={tender.compulsoryBriefing ? "destructive" : "secondary"}
                  data-testid="badge-briefing-status"
                >
                  {tender.compulsoryBriefing ? 'Required' : 'Optional'}
                </Badge>
              </div>
              {tender.compulsoryBriefing && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-900">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    Attendance at the briefing session is mandatory for this tender.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} data-testid="button-close">
              Close
            </Button>
            <Button onClick={() => onEdit(tender)} data-testid="button-edit-tender-main">
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Tender
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}