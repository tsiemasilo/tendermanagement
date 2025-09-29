import { useState } from 'react';
import { Plus, Calendar, List, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
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
                  <DropdownMenuItem data-testid="menu-item-preferences">
                    Preferences
                  </DropdownMenuItem>
                  <DropdownMenuItem data-testid="menu-item-export">
                    Export Data
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem data-testid="menu-item-help">
                    Help & Support
                  </DropdownMenuItem>
                  <DropdownMenuItem data-testid="menu-item-about">
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
    </div>
  );
}