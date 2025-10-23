import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, Filter, UserPlus, ArrowLeft, 
  Phone, Mail, MessageSquare, ChevronRight 
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface Lead {
  id: string;
  customer_id: string;
  source: string;
  status: string;
  priority: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
}

export default function SalesLeads() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    loadLeads();
  }, [statusFilter, priorityFilter]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('sales_leads')
        .select(`
          *,
          customer:customers(name, email, phone)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (priorityFilter !== 'all') {
        query = query.eq('priority', priorityFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      New: 'bg-blue-500',
      Contacted: 'bg-yellow-500',
      Qualified: 'bg-purple-500',
      Quoted: 'bg-indigo-500',
      PaymentPending: 'bg-orange-500',
      Won: 'bg-green-500',
      Lost: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      Low: 'secondary',
      Med: 'default',
      High: 'destructive',
      Hot: 'destructive',
    };
    return colors[priority] || 'secondary';
  };

  const filteredLeads = leads.filter(lead => {
    const searchLower = searchTerm.toLowerCase();
    return (
      lead.customer?.name?.toLowerCase().includes(searchLower) ||
      lead.customer?.email?.toLowerCase().includes(searchLower) ||
      lead.source?.toLowerCase().includes(searchLower)
    );
  });

  const LeadCard = ({ lead }: { lead: Lead }) => (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => {
        setSelectedLead(lead);
        setDrawerOpen(true);
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold">{lead.customer?.name || 'Unknown'}</h3>
            <p className="text-sm text-muted-foreground">{lead.customer?.email}</p>
          </div>
          <Badge variant={getPriorityColor(lead.priority) as any}>
            {lead.priority}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 mt-3">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(lead.status)}`} />
          <span className="text-sm">{lead.status}</span>
        </div>

        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
          <span>{lead.source}</span>
          <span>•</span>
          <span>{new Date(lead.created_at).toLocaleDateString()}</span>
        </div>

        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); }}>
            <Phone className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); }}>
            <Mail className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); }}>
            <MessageSquare className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const groupedByStatus = {
    New: filteredLeads.filter(l => l.status === 'New'),
    Contacted: filteredLeads.filter(l => l.status === 'Contacted'),
    Qualified: filteredLeads.filter(l => l.status === 'Qualified'),
    Quoted: filteredLeads.filter(l => l.status === 'Quoted'),
    PaymentPending: filteredLeads.filter(l => l.status === 'PaymentPending'),
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Button variant="ghost" onClick={() => navigate('/sales')} className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">Leads & Pipeline</h1>
          </div>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Quoted">Quoted</SelectItem>
                  <SelectItem value="PaymentPending">Payment Pending</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Med">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Hot">Hot</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(groupedByStatus).map(([status, statusLeads]) => (
            <div key={status} className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <h3 className="font-semibold">{status.replace(/([A-Z])/g, ' $1').trim()}</h3>
                <Badge variant="secondary">{statusLeads.length}</Badge>
              </div>
              <div className="space-y-3">
                {statusLeads.map(lead => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Lead Drawer */}
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Lead Details</SheetTitle>
            </SheetHeader>
            {selectedLead && (
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold">{selectedLead.customer?.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedLead.customer?.email}</p>
                  <p className="text-sm text-muted-foreground">{selectedLead.customer?.phone}</p>
                </div>

                <div className="flex gap-2">
                  <Badge variant={getPriorityColor(selectedLead.priority) as any}>
                    {selectedLead.priority} Priority
                  </Badge>
                  <Badge variant="outline">{selectedLead.status}</Badge>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Lead Information</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="text-muted-foreground">Source:</span> {selectedLead.source}</p>
                    <p><span className="text-muted-foreground">Created:</span> {new Date(selectedLead.created_at).toLocaleString()}</p>
                    <p><span className="text-muted-foreground">Updated:</span> {new Date(selectedLead.updated_at).toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Quick Actions</h4>
                  <div className="flex flex-col gap-2">
                    <Button className="w-full justify-start">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Customer
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send SMS/WhatsApp
                    </Button>
                  </div>
                </div>

                <Button className="w-full" onClick={() => navigate(`/sales/customer/${selectedLead.customer_id}`)}>
                  View Full Profile
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
