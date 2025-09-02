import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Users, ShoppingCart, FileText, Send, Download, Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EmailContact {
  email: string;
  name?: string;
  source: string;
  date_added: string;
  status?: string;
  metadata?: any;
}

interface EmailList {
  abandoned_carts: EmailContact[];
  quote_requests: EmailContact[];
  newsletter_signups: EmailContact[];
  paying_customers: EmailContact[];
}

const EmailMarketingTab = () => {
  const [emailLists, setEmailLists] = useState<EmailList>({
    abandoned_carts: [],
    quote_requests: [],
    newsletter_signups: [],
    paying_customers: []
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    fetchEmailLists();
  }, []);

  const fetchEmailLists = async () => {
    setLoading(true);
    try {
      // Fetch abandoned cart emails
      const { data: abandonedCarts } = await supabase
        .from('abandoned_carts')
        .select('email, full_name, created_at, vehicle_reg, plan_name')
        .order('created_at', { ascending: false });

      // Fetch quote request emails
      const { data: quoteRequests } = await supabase
        .from('quote_data')
        .select('customer_email, created_at, vehicle_data')
        .order('created_at', { ascending: false });

      // Fetch newsletter signups
      const { data: newsletterSignups } = await supabase
        .from('newsletter_signups')
        .select('email, created_at, source, status')
        .order('created_at', { ascending: false });

      // Fetch paying customers
      const { data: payingCustomers } = await supabase
        .from('customers')
        .select('email, name, first_name, last_name, created_at, plan_type, status')
        .order('created_at', { ascending: false });

      // Process and format the data
      const processedLists: EmailList = {
        abandoned_carts: (abandonedCarts || []).map(cart => ({
          email: cart.email,
          name: cart.full_name || 'Unknown',
          source: 'Abandoned Cart',
          date_added: cart.created_at,
          metadata: {
            vehicle_reg: cart.vehicle_reg,
            plan_name: cart.plan_name
          }
        })),
        quote_requests: (quoteRequests || []).map(quote => {
          const vehicleData = quote.vehicle_data as any;
          return {
            email: quote.customer_email,
            name: vehicleData?.firstName || 'Unknown',
            source: 'Quote Request',
            date_added: quote.created_at,
            metadata: {
              vehicle_reg: vehicleData?.regNumber
            }
          };
        }),
        newsletter_signups: (newsletterSignups || []).map(signup => ({
          email: signup.email,
          source: 'Newsletter Signup',
          date_added: signup.created_at,
          status: signup.status,
          metadata: {
            signup_source: signup.source
          }
        })),
        paying_customers: (payingCustomers || []).map(customer => ({
          email: customer.email,
          name: customer.name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unknown',
          source: 'Paying Customer',
          date_added: customer.created_at,
          status: customer.status,
          metadata: {
            plan_type: customer.plan_type
          }
        }))
      };

      setEmailLists(processedLists);
    } catch (error) {
      console.error('Error fetching email lists:', error);
      toast.error('Failed to fetch email lists');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmails = (emails: EmailContact[]) => {
    if (!searchTerm) return emails;
    return emails.filter(contact => 
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const toggleEmailSelection = (email: string) => {
    setSelectedEmails(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const selectAllEmails = (emails: EmailContact[]) => {
    const emailAddresses = filteredEmails(emails).map(contact => contact.email);
    setSelectedEmails(prev => [...new Set([...prev, ...emailAddresses])]);
  };

  const exportEmails = (emails: EmailContact[], listName: string) => {
    const csvContent = [
      ['Email', 'Name', 'Source', 'Date Added', 'Status', 'Metadata'].join(','),
      ...filteredEmails(emails).map(contact => [
        contact.email,
        contact.name || '',
        contact.source,
        new Date(contact.date_added).toLocaleDateString(),
        contact.status || '',
        JSON.stringify(contact.metadata || {})
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${listName.replace(/\s+/g, '_').toLowerCase()}_emails.csv`);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const sendMarketingEmail = async () => {
    if (!emailSubject.trim() || !emailContent.trim()) {
      toast.error('Please provide both subject and content for the email');
      return;
    }

    if (selectedEmails.length === 0) {
      toast.error('Please select at least one email address');
      return;
    }

    setSendingEmail(true);
    try {
      // Note: You'll need to implement an edge function for sending bulk emails
      const { data, error } = await supabase.functions.invoke('send-marketing-email', {
        body: {
          emails: selectedEmails,
          subject: emailSubject,
          content: emailContent
        }
      });

      if (error) throw error;

      toast.success(`Marketing email sent to ${selectedEmails.length} recipients`);
      setSelectedEmails([]);
      setEmailSubject('');
      setEmailContent('');
    } catch (error) {
      console.error('Error sending marketing email:', error);
      toast.error('Failed to send marketing email');
    } finally {
      setSendingEmail(false);
    }
  };

  const getTotalEmails = () => {
    return Object.values(emailLists).reduce((total, list) => total + list.length, 0);
  };

  const getUniqueEmails = () => {
    const allEmails = Object.values(emailLists).flat().map(contact => contact.email);
    return new Set(allEmails).size;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Email Marketing</h1>
        <p className="text-gray-600 mt-2">Manage your email marketing campaigns and subscriber lists</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Emails</p>
                <p className="text-2xl font-bold">{getTotalEmails()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Unique Emails</p>
                <p className="text-2xl font-bold">{getUniqueEmails()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Abandoned Carts</p>
                <p className="text-2xl font-bold">{emailLists.abandoned_carts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Paying Customers</p>
                <p className="text-2xl font-bold">{emailLists.paying_customers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Send Email Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Email Lists</CardTitle>
              <CardDescription>Browse and manage your email subscribers by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search emails or names..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Tabs defaultValue="abandoned_carts" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="abandoned_carts">
                    Abandoned Carts ({emailLists.abandoned_carts.length})
                  </TabsTrigger>
                  <TabsTrigger value="quote_requests">
                    Quote Requests ({emailLists.quote_requests.length})
                  </TabsTrigger>
                  <TabsTrigger value="newsletter_signups">
                    Newsletter ({emailLists.newsletter_signups.length})
                  </TabsTrigger>
                  <TabsTrigger value="paying_customers">
                    Customers ({emailLists.paying_customers.length})
                  </TabsTrigger>
                </TabsList>

                {Object.entries(emailLists).map(([key, emails]) => (
                  <TabsContent key={key} value={key} className="mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => selectAllEmails(emails)}
                        >
                          Select All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportEmails(emails, key.replace('_', ' '))}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Export CSV
                        </Button>
                      </div>
                      <Badge variant="secondary">
                        {filteredEmails(emails).length} emails
                      </Badge>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredEmails(emails).map((contact, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={selectedEmails.includes(contact.email)}
                            onChange={() => toggleEmailSelection(contact.email)}
                            className="rounded"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{contact.email}</span>
                              {contact.name && contact.name !== 'Unknown' && (
                                <span className="text-sm text-gray-600">({contact.name})</span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>{new Date(contact.date_added).toLocaleDateString()}</span>
                              {contact.status && (
                                <Badge variant={contact.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                                  {contact.status}
                                </Badge>
                              )}
                              {contact.metadata?.plan_type && (
                                <Badge variant="outline" className="text-xs">
                                  {contact.metadata.plan_type}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {filteredEmails(emails).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No emails found matching your search.
                        </div>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Send Email Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Send Marketing Email</CardTitle>
              <CardDescription>
                Compose and send emails to selected subscribers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email-subject">Subject</Label>
                <Input
                  id="email-subject"
                  placeholder="Enter email subject..."
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="email-content">Content</Label>
                <Textarea
                  id="email-content"
                  placeholder="Enter your email content here..."
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  rows={8}
                />
              </div>

              <div className="text-sm text-gray-600">
                Selected recipients: <strong>{selectedEmails.length}</strong>
              </div>

              <Alert>
                <AlertDescription>
                  Note: Make sure you have proper permission to email these contacts and comply with email marketing regulations.
                </AlertDescription>
              </Alert>

              <Button
                onClick={sendMarketingEmail}
                disabled={sendingEmail || selectedEmails.length === 0}
                className="w-full"
              >
                {sendingEmail ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Email ({selectedEmails.length})
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmailMarketingTab;