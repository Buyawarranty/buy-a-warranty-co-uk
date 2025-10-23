import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Phone, Mail, MessageSquare, Clock, 
  AlertCircle, CheckCircle2, Filter
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Conversation {
  id: string;
  customer_id: string;
  origin: string;
  direction: string;
  inbound_at: string;
  first_response_at: string | null;
  status: string;
  subject: string;
  sla_met: boolean | null;
  sla_minutes: number | null;
  touches_count: number;
  outcome: string | null;
  customer?: {
    name: string;
    email: string;
  };
}

export default function SalesConversations() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');

  useEffect(() => {
    loadConversations();
  }, [statusFilter, channelFilter]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('sales_conversations')
        .select(`
          *,
          customer:customers(name, email)
        `)
        .order('inbound_at', { ascending: false })
        .limit(50);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (channelFilter !== 'all') {
        query = query.eq('origin', channelFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'Call': return <Phone className="h-4 w-4" />;
      case 'Email': return <Mail className="h-4 w-4" />;
      case 'SMS': return <MessageSquare className="h-4 w-4" />;
      case 'WhatsApp': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'destructive';
      case 'Pending': return 'default';
      case 'Resolved': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSLAStatus = (conversation: Conversation) => {
    if (conversation.status === 'Resolved') return null;
    
    if (!conversation.first_response_at && conversation.sla_minutes) {
      const inboundTime = new Date(conversation.inbound_at).getTime();
      const now = Date.now();
      const elapsed = (now - inboundTime) / 1000 / 60; // minutes
      
      if (elapsed > conversation.sla_minutes) {
        return <Badge variant="destructive" className="ml-2">SLA Breach</Badge>;
      } else if (elapsed > conversation.sla_minutes * 0.8) {
        return <Badge variant="default" className="ml-2">SLA Warning</Badge>;
      }
    }
    
    if (conversation.sla_met === false) {
      return <Badge variant="destructive" className="ml-2">SLA Missed</Badge>;
    }
    
    return null;
  };

  const waitingConversations = conversations.filter(c => c.status === 'Open' && !c.first_response_at);
  const pendingConversations = conversations.filter(c => c.status === 'Pending');
  const resolvedConversations = conversations.filter(c => c.status === 'Resolved');

  const ConversationCard = ({ conversation }: { conversation: Conversation }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/sales/conversation/${conversation.id}`)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1">
              {getChannelIcon(conversation.origin)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{conversation.customer?.name || 'Unknown'}</h3>
                <Badge variant={getStatusColor(conversation.status) as any} className="text-xs">
                  {conversation.status}
                </Badge>
                {getSLAStatus(conversation)}
              </div>
              <p className="text-sm text-muted-foreground">{conversation.customer?.email}</p>
              {conversation.subject && (
                <p className="text-sm mt-1">{conversation.subject}</p>
              )}
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(conversation.inbound_at), { addSuffix: true })}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {conversation.touches_count} touches
            </span>
            {conversation.first_response_at && (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-3 w-3" />
                Responded
              </span>
            )}
            {!conversation.first_response_at && (
              <span className="flex items-center gap-1 text-orange-600">
                <AlertCircle className="h-3 w-3" />
                Waiting
              </span>
            )}
          </div>
          {conversation.outcome && (
            <Badge variant="outline" className="text-xs">
              {conversation.outcome}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

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
            <h1 className="text-3xl font-bold">Conversations</h1>
            <p className="text-muted-foreground">Inbound customer communications</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Waiting Now</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{waitingConversations.length}</div>
              <p className="text-xs text-muted-foreground">Needs first response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingConversations.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting customer</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resolvedConversations.length}</div>
              <p className="text-xs text-muted-foreground">Completed successfully</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="Call">Call</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Conversations List */}
        <Tabs defaultValue="waiting" className="space-y-4">
          <TabsList>
            <TabsTrigger value="waiting">
              Waiting ({waitingConversations.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingConversations.length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({resolvedConversations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="waiting" className="space-y-3">
            {waitingConversations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No conversations waiting for response
                </CardContent>
              </Card>
            ) : (
              waitingConversations.map(conv => <ConversationCard key={conv.id} conversation={conv} />)
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-3">
            {pendingConversations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No pending conversations
                </CardContent>
              </Card>
            ) : (
              pendingConversations.map(conv => <ConversationCard key={conv.id} conversation={conv} />)
            )}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-3">
            {resolvedConversations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No resolved conversations
                </CardContent>
              </Card>
            ) : (
              resolvedConversations.map(conv => <ConversationCard key={conv.id} conversation={conv} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
