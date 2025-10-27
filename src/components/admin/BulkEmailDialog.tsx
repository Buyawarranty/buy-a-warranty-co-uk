import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BulkEmailDialogProps {
  selectedCustomerIds: string[];
  onComplete?: () => void;
}

export const BulkEmailDialog: React.FC<BulkEmailDialogProps> = ({ 
  selectedCustomerIds,
  onComplete 
}) => {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (!error && data) {
      setTemplates(data);
    }
  };

  const handleSend = async () => {
    if (!selectedTemplateId) {
      toast.error('Please select a template');
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-bulk-email', {
        body: {
          customerIds: selectedCustomerIds,
          templateId: selectedTemplateId
        }
      });

      if (error) throw error;

      toast.success(`Email sent to ${data.results.success} customers successfully!`);
      if (data.results.failed > 0) {
        toast.warning(`Failed to send to ${data.results.failed} customers`);
      }
      
      setOpen(false);
      onComplete?.();
    } catch (error: any) {
      console.error('Bulk email error:', error);
      toast.error(error.message || 'Failed to send emails');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" disabled={selectedCustomerIds.length === 0}>
          <Mail className="h-4 w-4 mr-2" />
          Send Bulk Email ({selectedCustomerIds.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Bulk Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-sm text-blue-800">
              Sending to <Badge variant="secondary">{selectedCustomerIds.length}</Badge> selected customers
            </p>
          </div>

          <div className="space-y-2">
            <Label>Email Template</Label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleSend} 
            disabled={sending || !selectedTemplateId}
            className="w-full"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Emails
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
