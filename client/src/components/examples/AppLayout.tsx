import { useState } from 'react';
import AppLayout from '../AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AppLayoutExample() {
  const [currentView, setCurrentView] = useState<'calendar' | 'list'>('calendar');

  const handleNewTender = () => {
    console.log('New tender clicked');
  };

  const handleViewChange = (view: 'calendar' | 'list') => {
    setCurrentView(view);
    console.log('View changed to:', view);
  };

  return (
    <AppLayout
      currentView={currentView}
      onViewChange={handleViewChange}
      onNewTender={handleNewTender}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Sample Content Area</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This is where the main content would appear. You can see the Alteram logo 
              as a subtle watermark in the background, and the navigation header with 
              view toggles and action buttons.
            </p>
            <div className="mt-4 p-4 bg-muted rounded-md">
              <p className="text-sm">
                Current view: <strong>{currentView}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Switch between calendar and list views using the buttons in the header.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}