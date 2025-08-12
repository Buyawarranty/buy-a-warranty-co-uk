import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TrendingUp, Target, Users, DollarSign, Calendar, Award } from 'lucide-react';
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  plan_type: string;
  final_amount: number;
  signup_date: string;
  assigned_to?: string;
  status: string;
}

interface SalesTarget {
  id: string;
  admin_user_id: string;
  target_amount: number;
  target_period: string;
  start_date: string;
  end_date: string;
  achieved_amount: number;
}

interface SalesStats {
  totalSales: number;
  totalCustomers: number;
  averageOrderValue: number;
  monthlyGrowth: number;
}

export const SalesTrackingTab: React.FC = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salesTargets, setSalesTargets] = useState<SalesTarget[]>([]);
  const [salesStats, setSalesStats] = useState<SalesStats>({
    totalSales: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    monthlyGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [targetDialogOpen, setTargetDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAdminUsers(),
        fetchCustomers(),
        fetchSalesTargets(),
        fetchSalesStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminUsers = async () => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('is_active', true);
    
    if (error) throw error;
    setAdminUsers(data || []);
  };

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('signup_date', { ascending: false });
    
    if (error) throw error;
    setCustomers(data || []);
  };

  const fetchSalesTargets = async () => {
    const { data, error } = await supabase
      .from('sales_targets')
      .select('*')
      .order('start_date', { ascending: false });
    
    if (error) throw error;
    setSalesTargets(data || []);
  };

  const fetchSalesStats = async () => {
    // Calculate basic stats from customers data
    const { data: customersData, error } = await supabase
      .from('customers')
      .select('final_amount, signup_date');
    
    if (error) throw error;
    
    const totalSales = customersData?.reduce((sum, customer) => sum + (customer.final_amount || 0), 0) || 0;
    const totalCustomers = customersData?.length || 0;
    const averageOrderValue = totalCustomers > 0 ? totalSales / totalCustomers : 0;
    
    // Calculate monthly growth (simplified)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthCustomers = customersData?.filter(c => {
      const date = new Date(c.signup_date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length || 0;
    
    const lastMonthCustomers = customersData?.filter(c => {
      const date = new Date(c.signup_date);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const year = currentMonth === 0 ? currentYear - 1 : currentYear;
      return date.getMonth() === lastMonth && date.getFullYear() === year;
    }).length || 0;
    
    const monthlyGrowth = lastMonthCustomers > 0 ? 
      ((currentMonthCustomers - lastMonthCustomers) / lastMonthCustomers) * 100 : 0;
    
    setSalesStats({
      totalSales,
      totalCustomers,
      averageOrderValue,
      monthlyGrowth
    });
  };

  const assignCustomerToUser = async (customerId: string, adminUserId: string) => {
    const { error } = await supabase
      .from('customers')
      .update({ assigned_to: adminUserId })
      .eq('id', customerId);
    
    if (error) {
      toast.error('Failed to assign customer');
      return;
    }
    
    toast.success('Customer assigned successfully');
    fetchCustomers();
    setAssignDialogOpen(false);
  };

  const createSalesTarget = async (data: {
    adminUserId: string;
    targetAmount: number;
    targetPeriod: string;
    startDate: string;
    endDate: string;
  }) => {
    const { error } = await supabase
      .from('sales_targets')
      .insert({
        admin_user_id: data.adminUserId,
        target_amount: data.targetAmount,
        target_period: data.targetPeriod,
        start_date: data.startDate,
        end_date: data.endDate,
        achieved_amount: 0
      });
    
    if (error) {
      toast.error('Failed to create sales target');
      return;
    }
    
    toast.success('Sales target created successfully');
    fetchSalesTargets();
    setTargetDialogOpen(false);
  };

  const getUserName = (userId: string) => {
    const user = adminUsers.find(u => u.id === userId);
    return user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales Tracking</h1>
          <p className="text-muted-foreground">Monitor sales performance and manage team targets</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={targetDialogOpen} onOpenChange={setTargetDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Target className="h-4 w-4 mr-2" />
                Set Target
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Sales Target</DialogTitle>
                <DialogDescription>Set a new sales target for a team member</DialogDescription>
              </DialogHeader>
              <SalesTargetForm onSubmit={createSalesTarget} adminUsers={adminUsers} />
            </DialogContent>
          </Dialog>
          
          <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Users className="h-4 w-4 mr-2" />
                Assign Customer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Customer</DialogTitle>
                <DialogDescription>Assign a customer to a sales team member</DialogDescription>
              </DialogHeader>
              <CustomerAssignForm 
                customers={customers.filter(c => !c.assigned_to)}
                adminUsers={adminUsers}
                onAssign={assignCustomerToUser}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Sales Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{salesStats.totalSales.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesStats.totalCustomers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{salesStats.averageOrderValue.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesStats.monthlyGrowth > 0 ? '+' : ''}{salesStats.monthlyGrowth.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="targets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="targets">Sales Targets</TabsTrigger>
          <TabsTrigger value="assignments">Customer Assignments</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="targets">
          <Card>
            <CardHeader>
              <CardTitle>Sales Targets</CardTitle>
              <CardDescription>Monitor progress towards sales targets</CardDescription>
            </CardHeader>
            <CardContent>
              <SalesTargetsTable targets={salesTargets} adminUsers={adminUsers} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Customer Assignments</CardTitle>
              <CardDescription>View and manage customer assignments to sales team</CardDescription>
            </CardHeader>
            <CardContent>
              <CustomerAssignmentsTable 
                customers={customers} 
                adminUsers={adminUsers}
                onReassign={(customerId, newUserId) => assignCustomerToUser(customerId, newUserId)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Sales Performance</CardTitle>
              <CardDescription>Individual sales team member performance</CardDescription>
            </CardHeader>
            <CardContent>
              <SalesPerformanceTable 
                adminUsers={adminUsers} 
                customers={customers}
                targets={salesTargets}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper Components
const SalesTargetForm: React.FC<{
  onSubmit: (data: any) => void;
  adminUsers: AdminUser[];
}> = ({ onSubmit, adminUsers }) => {
  const [formData, setFormData] = useState({
    adminUserId: '',
    targetAmount: '',
    targetPeriod: 'monthly',
    startDate: '',
    endDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      targetAmount: parseFloat(formData.targetAmount)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="adminUser">Sales Team Member</Label>
        <Select value={formData.adminUserId} onValueChange={(value) => setFormData({...formData, adminUserId: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Select team member" />
          </SelectTrigger>
          <SelectContent>
            {adminUsers.map(user => (
              <SelectItem key={user.id} value={user.id}>
                {user.first_name} {user.last_name} ({user.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="targetAmount">Target Amount (£)</Label>
        <Input
          type="number"
          value={formData.targetAmount}
          onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
          placeholder="10000"
        />
      </div>
      <div>
        <Label htmlFor="targetPeriod">Period</Label>
        <Select value={formData.targetPeriod} onValueChange={(value) => setFormData({...formData, targetPeriod: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({...formData, endDate: e.target.value})}
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit">Create Target</Button>
      </DialogFooter>
    </form>
  );
};

const CustomerAssignForm: React.FC<{
  customers: Customer[];
  adminUsers: AdminUser[];
  onAssign: (customerId: string, adminUserId: string) => void;
}> = ({ customers, adminUsers, onAssign }) => {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCustomer && selectedUser) {
      onAssign(selectedCustomer, selectedUser);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Customer</Label>
        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
          <SelectTrigger>
            <SelectValue placeholder="Select customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map(customer => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name} ({customer.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Sales Team Member</Label>
        <Select value={selectedUser} onValueChange={setSelectedUser}>
          <SelectTrigger>
            <SelectValue placeholder="Select team member" />
          </SelectTrigger>
          <SelectContent>
            {adminUsers.map(user => (
              <SelectItem key={user.id} value={user.id}>
                {user.first_name} {user.last_name} ({user.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button type="submit">Assign Customer</Button>
      </DialogFooter>
    </form>
  );
};

const SalesTargetsTable: React.FC<{
  targets: SalesTarget[];
  adminUsers: AdminUser[];
}> = ({ targets, adminUsers }) => {
  const getUserName = (userId: string) => {
    const user = adminUsers.find(u => u.id === userId);
    return user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : 'Unknown';
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sales Person</TableHead>
          <TableHead>Target Amount</TableHead>
          <TableHead>Achieved</TableHead>
          <TableHead>Progress</TableHead>
          <TableHead>Period</TableHead>
          <TableHead>End Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {targets.map(target => {
          const progress = target.target_amount > 0 ? (target.achieved_amount / target.target_amount) * 100 : 0;
          return (
            <TableRow key={target.id}>
              <TableCell>{getUserName(target.admin_user_id)}</TableCell>
              <TableCell>£{target.target_amount.toLocaleString()}</TableCell>
              <TableCell>£{target.achieved_amount.toLocaleString()}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm">{progress.toFixed(1)}%</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{target.target_period}</Badge>
              </TableCell>
              <TableCell>{new Date(target.end_date).toLocaleDateString()}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

const CustomerAssignmentsTable: React.FC<{
  customers: Customer[];
  adminUsers: AdminUser[];
  onReassign: (customerId: string, newUserId: string) => void;
}> = ({ customers, adminUsers, onReassign }) => {
  const getUserName = (userId: string) => {
    const user = adminUsers.find(u => u.id === userId);
    return user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : 'Unassigned';
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Assigned To</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map(customer => (
          <TableRow key={customer.id}>
            <TableCell>{customer.name}</TableCell>
            <TableCell>{customer.email}</TableCell>
            <TableCell>
              <Badge variant="secondary">{customer.plan_type}</Badge>
            </TableCell>
            <TableCell>£{customer.final_amount?.toLocaleString() || '0'}</TableCell>
            <TableCell>{getUserName(customer.assigned_to || '')}</TableCell>
            <TableCell>
              <Select 
                value={customer.assigned_to || ''} 
                onValueChange={(value) => onReassign(customer.id, value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Assign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {adminUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const SalesPerformanceTable: React.FC<{
  adminUsers: AdminUser[];
  customers: Customer[];
  targets: SalesTarget[];
}> = ({ adminUsers, customers, targets }) => {
  const getPerformanceData = (userId: string) => {
    const userCustomers = customers.filter(c => c.assigned_to === userId);
    const totalSales = userCustomers.reduce((sum, c) => sum + (c.final_amount || 0), 0);
    const customerCount = userCustomers.length;
    const avgOrderValue = customerCount > 0 ? totalSales / customerCount : 0;
    
    const currentTarget = targets.find(t => t.admin_user_id === userId);
    const targetProgress = currentTarget ? (totalSales / currentTarget.target_amount) * 100 : 0;
    
    return {
      totalSales,
      customerCount,
      avgOrderValue,
      targetProgress,
      currentTarget: currentTarget?.target_amount || 0
    };
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sales Person</TableHead>
          <TableHead>Customers</TableHead>
          <TableHead>Total Sales</TableHead>
          <TableHead>Avg Order Value</TableHead>
          <TableHead>Target Progress</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {adminUsers.map(user => {
          const performance = getPerformanceData(user.id);
          return (
            <TableRow key={user.id}>
              <TableCell>
                {user.first_name} {user.last_name}
                <div className="text-sm text-muted-foreground">{user.email}</div>
              </TableCell>
              <TableCell>{performance.customerCount}</TableCell>
              <TableCell>£{performance.totalSales.toLocaleString()}</TableCell>
              <TableCell>£{performance.avgOrderValue.toFixed(2)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min(performance.targetProgress, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm">{performance.targetProgress.toFixed(1)}%</span>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};