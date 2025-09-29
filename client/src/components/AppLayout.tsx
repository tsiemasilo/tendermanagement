import { useState } from 'react';
import { Plus, Calendar, List, Settings, Download, HelpCircle, Info } from 'lucide-react';
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
  const [showPreferences, setShowPreferences] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  
  // Preferences state
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  const handleExportData = async () => {
    try {
      // Fetch current tenders data from API
      const response = await fetch('/api/tenders');
      const tenders = await response.json();

      const dataStr = JSON.stringify(tenders, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `tender-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      // Fallback to empty array if API fails
      const dataStr = JSON.stringify([], null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `tender-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };
  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Logo */}
      <div 
        className="fixed inset-0 bg-no-repeat bg-center opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url(${alteramLogo})`,
          backgroundSize: '300px auto',
          backgroundPosition: 'bottom right',
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
              
              {/* Action Buttons */}
              <Button 
                onClick={onNewTender}
                data-testid="button-new-tender"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Tender
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