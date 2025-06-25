
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, Star, DollarSign } from 'lucide-react';

interface AnalyticsData {
  revenue30Days: number;
  revenue60Days: number;
  revenue90Days: number;
  revenue12Months: number;
  totalUsers: number;
  activeUsers: number;
  topPlan: string;
  averageExcess: number;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
}

export const AnalyticsTab = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    revenue30Days: 0,
    revenue60Days: 0,
    revenue90Days: 0,
    revenue12Months: 0,
    totalUsers: 0,
    activeUsers: 0,
    topPlan: '',
    averageExcess: 0,
    monthlyRevenue: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch revenue data
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      const twelveMonthsAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

      // Revenue for different periods
      const { data: revenue30 } = await supabase
        .from('payments')
        .select('amount')
        .gte('payment_date', thirtyDaysAgo.toISOString());

      const { data: revenue60 } = await supabase
        .from('payments')
        .select('amount')
        .gte('payment_date', sixtyDaysAgo.toISOString());

      const { data: revenue90 } = await supabase
        .from('payments')
        .select('amount')
        .gte('payment_date', ninetyDaysAgo.toISOString());

      const { data: revenue12 } = await supabase
        .from('payments')
        .select('amount')
        .gte('payment_date', twelveMonthsAgo.toISOString());

      // Customer data
      const { data: customers } = await supabase
        .from('customers')
        .select('status, plan_type, voluntary_excess');

      // Plan popularity
      const planCounts = customers?.reduce((acc: any, customer) => {
        acc[customer.plan_type] = (acc[customer.plan_type] || 0) + 1;
        return acc;
      }, {});

      const topPlan = planCounts ? Object.keys(planCounts).reduce((a, b) => 
        planCounts[a] > planCounts[b] ? a : b
      ) : '';

      // Average excess
      const validExcess = customers?.filter(c => c.voluntary_excess > 0) || [];
      const averageExcess = validExcess.length > 0 
        ? validExcess.reduce((sum, c) => sum + c.voluntary_excess, 0) / validExcess.length 
        : 0;

      // Monthly revenue for chart
      const monthlyData = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const { data: monthRevenue } = await supabase
          .from('payments')
          .select('amount')
          .gte('payment_date', monthStart.toISOString())
          .lte('payment_date', monthEnd.toISOString());

        const total = monthRevenue?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
        
        monthlyData.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          revenue: total
        });
      }

      setAnalytics({
        revenue30Days: revenue30?.reduce((sum, p) => sum + p.amount, 0) || 0,
        revenue60Days: revenue60?.reduce((sum, p) => sum + p.amount, 0) || 0,
        revenue90Days: revenue90?.reduce((sum, p) => sum + p.amount, 0) || 0,
        revenue12Months: revenue12?.reduce((sum, p) => sum + p.amount, 0) || 0,
        totalUsers: customers?.length || 0,
        activeUsers: customers?.filter(c => c.status === 'Active').length || 0,
        topPlan,
        averageExcess,
        monthlyRevenue: monthlyData
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 30 Days</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{analytics.revenue30Days.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 60 Days</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{analytics.revenue60Days.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 90 Days</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{analytics.revenue90Days.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 12 Months</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{analytics.revenue12Months.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`£${value}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Selling Plan</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.topPlan}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Excess</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{analytics.averageExcess.toFixed(0)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
