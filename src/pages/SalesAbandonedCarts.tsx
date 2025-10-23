import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft, Search, Mail, MessageSquare, Phone, 
  ShoppingCart, Clock, Check, X, ExternalLink 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface AbandonedCart {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  vehicle_reg: string;
  vehicle_make: string;
  vehicle_model: string;
  plan_name: string;
  cart_metadata: any;
  created_at: string;
  contact_status: string;
  had_inbound_contact: boolean;
  inbound_contact_at: string | null;
}

export default function SalesAbandonedCarts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadCarts();
  }, [timeFilter, statusFilter]);

  const loadCarts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('abandoned_carts')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('contact_status', statusFilter);
      }

      if (timeFilter !== 'all') {
        const now = new Date();
        let fromDate: Date;
        
        switch (timeFilter) {
          case '<1h':
            fromDate = new Date(now.getTime() - 60 * 60 * 1000);
            break;
          case '1-24h':
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            query = query.lte('created_at', oneHourAgo.toISOString())
                         .gte('created_at', oneDayAgo.toISOString());
            break;
          case '>24h':
            fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            query = query.lt('created_at', fromDate.toISOString());
            break;
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setCarts(data || []);
    } catch (error) {
      console.error('Error loading abandoned carts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCarts = carts.filter(cart => {
    const searchLower = searchTerm.toLowerCase();
    return (
      cart.full_name?.toLowerCase().includes(searchLower) ||
      cart.email?.toLowerCase().includes(searchLower) ||
      cart.vehicle_reg?.toLowerCase().includes(searchLower)
    );
  });

  const updateContactStatus = async (cartId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('abandoned_carts')
        .update({ 
          contact_status: status,
          last_contacted_at: new Date().toISOString()
        })
        .eq('id', cartId);

      if (error) throw error;
      
      toast({
        title: 'Status updated',
        description: `Cart marked as ${status}`,
      });
      
      loadCarts();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const getTimeSinceAbandonment = (createdAt: string) => {
    return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  };

  const getTotalValue = (metadata: any) => {
    try {
      return metadata?.finalPrice || metadata?.total_value || 'N/A';
    } catch {
      return 'N/A';
    }
  };

  const getContactStatusBadge = (status: string) => {
    switch (status) {
      case 'not_contacted':
        return <Badge variant="destructive">Not Contacted</Badge>;
      case 'contacted':
        return <Badge variant="default">Contacted</Badge>;
      case 'in_progress':
        return <Badge>In Progress</Badge>;
      case 'converted':
        return <Badge variant="secondary">Converted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
            <h1 className="text-3xl font-bold">Abandoned Carts</h1>
            <p className="text-muted-foreground">Recover lost sales opportunities</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{carts.length}</p>
                  <p className="text-xs text-muted-foreground">Total Abandoned</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {carts.filter(c => c.contact_status === 'not_contacted').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Not Contacted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {carts.filter(c => c.had_inbound_contact).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Had Inbound</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {carts.filter(c => c.contact_status === 'converted').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Converted</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or reg..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="<1h">&lt; 1 hour</SelectItem>
                  <SelectItem value="1-24h">1-24 hours</SelectItem>
                  <SelectItem value=">24h">&gt; 24 hours</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="not_contacted">Not Contacted</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Carts Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Inbound</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredCarts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No abandoned carts found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCarts.map((cart) => (
                  <TableRow key={cart.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{cart.full_name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{cart.email}</p>
                        {cart.phone && (
                          <p className="text-xs text-muted-foreground">{cart.phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{cart.vehicle_reg}</p>
                        <p className="text-sm text-muted-foreground">
                          {cart.vehicle_make} {cart.vehicle_model}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{cart.plan_name || 'N/A'}</TableCell>
                    <TableCell className="font-semibold">
                      £{getTotalValue(cart.cart_metadata)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {getTimeSinceAbandonment(cart.created_at)}
                    </TableCell>
                    <TableCell>
                      {cart.had_inbound_contact ? (
                        <Badge variant="secondary" className="text-xs">
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          No
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {getContactStatusBadge(cart.contact_status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => navigate(`/sales/composer?channel=email&email=${cart.email}`)}
                        >
                          <Mail className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => navigate(`/sales/composer?channel=sms&phone=${cart.phone}`)}
                        >
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => updateContactStatus(cart.id, 'contacted')}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
