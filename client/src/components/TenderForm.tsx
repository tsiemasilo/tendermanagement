import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { insertTenderSchema, type InsertTender, type Tender } from '@shared/schema';
import { z } from 'zod';

const formSchema = insertTenderSchema.extend({
  briefingDate: z.date(),
  submissionDate: z.date(),
}).refine(data => data.submissionDate > data.briefingDate, {
  message: 'Submission date must be after briefing date',
  path: ['submissionDate']
});

type FormData = z.infer<typeof formSchema>;

interface TenderFormProps {
  tender?: Tender;
  onSubmit: (data: InsertTender) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function TenderForm({ 
  tender, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}: TenderFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tenderNumber: tender?.tenderNumber || '',
      clientName: tender?.clientName || '',
      description: tender?.description || '',
      briefingDate: tender ? new Date(tender.briefingDate) : new Date(),
      submissionDate: tender ? new Date(tender.submissionDate) : new Date(),
      compulsoryBriefing: tender?.compulsoryBriefing || false,
    },
  });

  const handleSubmit = (data: FormData) => {
    onSubmit({
      ...data,
      briefingDate: data.briefingDate,
      submissionDate: data.submissionDate,
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">
          {tender ? 'Edit Tender' : 'Create New Tender'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="tenderNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tender Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., TND-2025-001"
                        {...field}
                        data-testid="input-tender-number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., City of Cape Town"
                        {...field}
                        data-testid="input-client-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide a detailed description of the tender requirements..."
                        className="min-h-[100px]"
                        {...field}
                        data-testid="textarea-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Timeline</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="briefingDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Briefing Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full pl-3 text-left font-normal"
                              data-testid="button-briefing-date"
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="submissionDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Submission Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full pl-3 text-left font-normal"
                              data-testid="button-submission-date"
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Briefing Requirements */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Briefing Requirements</h3>
              
              <FormField
                control={form.control}
                name="compulsoryBriefing"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-compulsory-briefing"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Compulsory Briefing Session
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Check this if attendance at the briefing session is mandatory for tender submission.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isSubmitting}
                data-testid="button-cancel"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                data-testid="button-save"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Saving...' : tender ? 'Update Tender' : 'Create Tender'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}