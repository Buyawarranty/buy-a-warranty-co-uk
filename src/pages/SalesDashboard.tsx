import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Phone, Mail, MessageSquare, FileText, CreditCard, 
  TrendingUp, Users, Target, Clock, AlertTriangle,
  CheckCircle2, BarChart3
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface DashboardStats {
  myTasksDue: number;
  myTasksOverdue: number;
  newAbandonments: number;
  expiringQuotes: number;
  inboundWaiting: number;
  medianResponseToday: number;
  slaBreachesToday: number;
  chaseUpConversionsWeek: number;
}

export default function SalesDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    myTasksDue: 0,
    myTasksOverdue: 0,
    newAbandonments: 0,
    expiringQuotes: 0,
    inboundWaiting: 0,
    medianResponseToday: 0,
    slaBreachesToday: 0,
    chaseUpConversionsWeek: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    checkSalesAccess();
    loadDashboardStats();
  }, [user, navigate]);

  const checkSalesAccess = async () => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user?.id)
      .in('role', ['sales_agent', 'team_lead', 'sales_ops_admin', 'admin'])
      .single();

    if (!data) {
      navigate('/admin');
    }
  };

  const loadDashboardStats = async () => {
    try {
      setLoading(true);

      // My tasks
      const { count: tasksDue } = await supabase
        .from('sales_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('assignee_id', user?.id)
        .eq('status', 'Open')
        .gte('due_at', new Date().toISOString());

      const { count: tasksOverdue } = await supabase
        .from('sales_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('assignee_id', user?.id)
        .eq('status', 'Overdue');

      // New abandonments (last 24h)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: abandonments } = await supabase
        .from('abandoned_carts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday);

      // Expiring quotes (next 48h)
      const twoDaysFromNow = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
      const { count: expiring } = await supabase
        .from('sales_quotes')
        .select('*', { count: 'exact', head: true })
        .lte('expires_at', twoDaysFromNow)
        .eq('status', 'Sent');

      // Inbound waiting
      const { count: inbound } = await supabase
        .from('sales_conversations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Open')
        .eq('direction', 'Inbound')
        .is('first_response_at', null);

      // SLA breaches today
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const { count: breaches } = await supabase
        .from('sales_conversations')
        .select('*', { count: 'exact', head: true })
        .gte('inbound_at', startOfDay.toISOString())
        .eq('sla_met', false);

      setStats({
        myTasksDue: tasksDue || 0,
        myTasksOverdue: tasksOverdue || 0,
        newAbandonments: abandonments || 0,
        expiringQuotes: expiring || 0,
        inboundWaiting: inbound || 0,
        medianResponseToday: 0, // Would need more complex query
        slaBreachesToday: breaches || 0,
        chaseUpConversionsWeek: 0, // Would need more complex query
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const QuickAction = ({ icon: Icon, label, onClick, variant = "outline" }: any) => (
    <Button variant={variant} className="flex-1 h-20 flex-col gap-2" onClick={onClick}>
      <Icon className="h-5 w-5" />
      <span className="text-xs">{label}</span>
    </Button>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Sales Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your performance overview.</p>
          </div>
          <Button onClick={() => navigate('/admin')}>Back to Admin</Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/sales/tasks')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">My Tasks</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.myTasksDue}
                {stats.myTasksOverdue > 0 && (
                  <Badge variant="destructive" className="ml-2">{stats.myTasksOverdue} overdue</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Due and overdue tasks</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/sales/abandoned-carts')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">New Abandonments</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newAbandonments}</div>
              <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/sales/quotes')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Expiring Quotes</CardTitle>
              <FileText className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.expiringQuotes}</div>
              <p className="text-xs text-muted-foreground mt-1">Next 48 hours</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/sales/conversations')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Inbound Waiting</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.inboundWaiting}
                {stats.slaBreachesToday > 0 && (
                  <Badge variant="destructive" className="ml-2">{stats.slaBreachesToday} breaches</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Needs response</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common sales activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              <QuickAction icon={Phone} label="Log Call" onClick={() => navigate('/sales/composer?channel=call')} />
              <QuickAction icon={Mail} label="Send Email" onClick={() => navigate('/sales/composer?channel=email')} />
              <QuickAction icon={MessageSquare} label="Send SMS/WhatsApp" onClick={() => navigate('/sales/composer?channel=sms')} />
              <QuickAction icon={FileText} label="Create Quote" onClick={() => navigate('/sales/quote-builder')} />
              <QuickAction icon={CreditCard} label="Take Payment" onClick={() => navigate('/sales/payments')} variant="default" />
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="funnel">Sales Funnel</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Targets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Calls Made</span>
                    <Badge>8 / 20</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Quotes Sent</span>
                    <Badge>3 / 10</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Orders Won</span>
                    <Badge variant="default">2 / 5</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Quote accepted</p>
                        <p className="text-xs text-muted-foreground">John Smith - 5 min ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Call logged</p>
                        <p className="text-xs text-muted-foreground">Sarah Johnson - 15 min ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-purple-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Follow-up sent</p>
                        <p className="text-xs text-muted-foreground">Mike Davis - 1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle>Team Leaderboard</CardTitle>
                <CardDescription>Last 7 days performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Alex Morgan', calls: 85, quotes: 42, wins: 18, revenue: '£15,200' },
                    { name: 'Jamie Lee', calls: 78, quotes: 38, wins: 15, revenue: '£12,800' },
                    { name: 'Sam Parker', calls: 72, quotes: 35, wins: 12, revenue: '£10,500' },
                  ].map((agent, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={idx === 0 ? 'default' : 'outline'}>#{idx + 1}</Badge>
                        <div>
                          <p className="font-medium">{agent.name}</p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>{agent.calls} calls</span>
                            <span>{agent.quotes} quotes</span>
                            <span>{agent.wins} wins</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{agent.revenue}</p>
                        <p className="text-xs text-muted-foreground">revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="funnel">
            <Card>
              <CardHeader>
                <CardTitle>Sales Funnel</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium">Leads</div>
                    <div className="flex-1 bg-blue-500 h-8 rounded flex items-center px-3 text-white text-sm font-medium">
                      245
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium">Contacted</div>
                    <div className="flex-1 bg-indigo-500 h-8 rounded flex items-center px-3 text-white text-sm font-medium" style={{ width: '80%' }}>
                      196 (80%)
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium">Quoted</div>
                    <div className="flex-1 bg-purple-500 h-8 rounded flex items-center px-3 text-white text-sm font-medium" style={{ width: '45%' }}>
                      110 (45%)
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium">Orders</div>
                    <div className="flex-1 bg-green-500 h-8 rounded flex items-center px-3 text-white text-sm font-medium" style={{ width: '18%' }}>
                      44 (18%)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Navigation to other sections */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/sales/leads')}>
                <Users className="h-5 w-5" />
                <span className="text-xs">Leads & Pipeline</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/sales/abandoned-carts')}>
                <AlertTriangle className="h-5 w-5" />
                <span className="text-xs">Abandoned Carts</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/sales/conversations')}>
                <MessageSquare className="h-5 w-5" />
                <span className="text-xs">Conversations</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/sales/reports')}>
                <BarChart3 className="h-5 w-5" />
                <span className="text-xs">Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
