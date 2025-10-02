import { useState, useEffect } from 'react';
import { Plus, Calendar, List, Settings, Download, HelpCircle, Info, LogOut, Shield } from 'lucide-react';
import { Link } from 'wouter';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { API_BASE_URL } from '@/lib/api';
import alteramLogo from '@assets/alteram1_1_600x197_1750838676214_1758878160686.png';

interface AppLayoutProps {
  children: React.ReactNode;
  onNewTender?: () => void;
  currentView?: 'calendar' | 'list';
  onViewChange?: (view: 'calendar' | 'list') => void;
}

export default function AppLayout({ 
  children, 
  onNewTender, 
  currentView = 'calendar',
  onViewChange 
}: AppLayoutProps) {
  const { user, isAdmin, logout } = useAuth();
  const [showPreferences, setShowPreferences] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  
  // Preferences state
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  // Apply dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  // Keyboard shortcuts effect
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+N for New Tender
      if (event.ctrlKey && event.key === 'n' && !event.altKey && !event.shiftKey) {
        event.preventDefault();
        onNewTender?.();
      }
      // Ctrl+E for Export Data
      else if (event.ctrlKey && event.key === 'e' && !event.altKey && !event.shiftKey) {
        event.preventDefault();
        handleExportData();
      }
      // Tab to cycle views
      else if (event.key === 'Tab' && !event.ctrlKey && !event.altKey && !event.shiftKey && onViewChange) {
        // Only if we're not in an input field
        const activeElement = document.activeElement as HTMLElement;
        if (!activeElement || (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA' && !activeElement.isContentEditable)) {
          event.preventDefault();
          const newView = currentView === 'calendar' ? 'list' : 'calendar';
          onViewChange(newView);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNewTender, onViewChange, currentView]);

  const handleExportData = async () => {
    try {
      // Fetch current tenders data from API
      const response = await fetch(`${API_BASE_URL}/tenders`);
      const tenders = await response.json();

      // Convert data to Excel format
      const exportData = tenders.map((tender: any) => ({
        'Tender Number': tender.tenderNumber,
        'Client Name': tender.clientName,
        'Description': tender.description,
        'Briefing Date': new Date(tender.briefingDate).toLocaleDateString(),
        'Submission Date': new Date(tender.submissionDate).toLocaleDateString(),
        'Venue': tender.venue,
        'Compulsory Briefing': tender.compulsoryBriefing ? 'Yes' : 'No',
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Auto-size columns
      const columnWidths = [
        { wch: 15 }, // Tender Number
        { wch: 25 }, // Client Name  
        { wch: 40 }, // Description
        { wch: 15 }, // Briefing Date
        { wch: 15 }, // Submission Date
        { wch: 30 }, // Venue
        { wch: 18 }, // Compulsory Briefing
      ];
      worksheet['!cols'] = columnWidths;
      
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Tenders');
      
      // Export to Excel file
      const fileName = `tender-data-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Failed to export data:', error);
      // Fallback to empty Excel file if API fails
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet([]);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Tenders');
      const fileName = `tender-data-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    }
  };
  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Logo */}
      <div 
        className="fixed inset-0 bg-no-repeat opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url(${alteramLogo})`,
          backgroundSize: '300px auto',
          backgroundPosition: 'calc(100% - 2rem) calc(100% - 8rem)',
        }}
      />
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={alteramLogo} 
                alt="Alteram" 
                className="h-8 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Tender Management System
                </h1>
                <p className="text-sm text-muted-foreground">
                  Track briefings, deadlines, and submissions
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              {onViewChange && (
                <div className="flex gap-1 p-1 bg-muted rounded-md">
                  <Button
                    variant={currentView === 'calendar' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewChange?.('calendar')}
                    data-testid="button-calendar-view"
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={currentView === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewChange?.('list')}
                    data-testid="button-list-view"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              {/* Admin Link */}
              {isAdmin && (
                <Link href="/admin">
                  <Button 
                    variant="outline"
                    data-testid="button-admin-link"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              
              {/* Action Buttons */}
              {onNewTender && (
                <Button 
                  onClick={onNewTender}
                  data-testid="button-new-tender"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Tender
                </Button>
              )}
              
              {/* Logout Button */}
              <Button 
                variant="outline"
                onClick={logout}
                data-testid="button-logout-header"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" data-testid="button-settings">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => setShowPreferences(true)}
                    data-testid="menu-item-preferences"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Preferences
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleExportData}
                    data-testid="menu-item-export"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setShowHelp(true)}
                    data-testid="menu-item-help"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help & Support
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setShowAbout(true)}
                    data-testid="menu-item-about"
                  >
                    <Info className="h-4 w-4 mr-2" />
                    About
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <img 
                src={alteramLogo} 
                alt="Alteram" 
                className="h-5 w-auto opacity-60"
              />
              <span>© 2025 Alteram. Professional tender management solutions.</span>
            </div>
            <div className="flex gap-4">
              <span>Version 1.0</span>
              <span>•</span>
              <span>Support</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Preferences Dialog */}
      <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogContent className="sm:max-w-[425px]" data-testid="dialog-preferences">
          <DialogHeader>
            <DialogTitle>Preferences</DialogTitle>
            <DialogDescription>
              Customize your tender management experience.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="text-sm font-medium">
                Dark Mode
              </Label>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
                data-testid="switch-dark-mode"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="text-sm font-medium">
                Email Notifications
              </Label>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
                data-testid="switch-notifications"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-save" className="text-sm font-medium">
                Auto-save Changes
              </Label>
              <Switch
                id="auto-save"
                checked={autoSave}
                onCheckedChange={setAutoSave}
                data-testid="switch-auto-save"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowPreferences(false)}
              data-testid="button-preferences-cancel"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => setShowPreferences(false)}
              data-testid="button-preferences-save"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Help & Support Dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="sm:max-w-[500px]" data-testid="dialog-help">
          <DialogHeader>
            <DialogTitle>Help & Support</DialogTitle>
            <DialogDescription>
              Get help with using the tender management system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <h3 className="font-semibold mb-2">Quick Start Guide</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Click "New Tender" to add a new tender opportunity</li>
                <li>• Use Calendar view to see briefing and submission dates</li>
                <li>• Use List view for a detailed overview of all tenders</li>
                <li>• Click on any tender to view or edit details</li>
              </ul>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2">Keyboard Shortcuts</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <kbd>Ctrl + N</kbd> - New Tender</li>
                <li>• <kbd>Ctrl + E</kbd> - Export Data</li>
                <li>• <kbd>Tab</kbd> - Navigate between views</li>
              </ul>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2">Contact Support</h3>
              <p className="text-sm text-muted-foreground">
                Email: support@alteram.com<br />
                Phone: +27 21 XXX XXXX<br />
                Hours: Mon-Fri 8:00 AM - 5:00 PM SAST
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button 
              onClick={() => setShowHelp(false)}
              data-testid="button-help-close"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* About Dialog */}
      <Dialog open={showAbout} onOpenChange={setShowAbout}>
        <DialogContent className="sm:max-w-[425px]" data-testid="dialog-about">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <img src={alteramLogo} alt="Alteram" className="h-6 w-auto" />
              About Tender Management System
            </DialogTitle>
            <DialogDescription>
              Professional tender management solutions by Alteram.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <h3 className="font-semibold mb-2">Version Information</h3>
              <p className="text-sm text-muted-foreground">
                Version: 1.0.0<br />
                Release Date: January 2025<br />
                Build: Production
              </p>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2">About Alteram</h3>
              <p className="text-sm text-muted-foreground">
                Alteram provides professional tender management solutions to help 
                businesses track opportunities, manage deadlines, and streamline 
                their bidding processes.
              </p>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2">Legal</h3>
              <p className="text-sm text-muted-foreground">
                © 2025 Alteram. All rights reserved.<br />
                Licensed under commercial software agreement.
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button 
              onClick={() => setShowAbout(false)}
              data-testid="button-about-close"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}