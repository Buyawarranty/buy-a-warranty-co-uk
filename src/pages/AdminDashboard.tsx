
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { CustomersTab } from '@/components/admin/CustomersTab';
import { AnalyticsTab } from '@/components/admin/AnalyticsTab';
import { PlansTab } from '@/components/admin/PlansTab';
import { LogOut, Search, User } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('customers');
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      // Check for master admin status first
      const masterAdminStatus = localStorage.getItem('masterAdmin') === 'true';
      
      if (masterAdminStatus) {
        setIsMasterAdmin(true);
        setIsAdmin(true);
        setUser({ email: 'Master Admin' });
        setLoading(false);
        return;
      }

      // Check for regular Supabase user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      setUser(user);

      // Check if user is admin
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin');

      if (!roles || roles.length === 0) {
        toast.error('Access denied. Admin privileges required.');
        navigate('/auth');
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isMasterAdmin) {
      localStorage.removeItem('masterAdmin');
    } else {
      await supabase.auth.signOut();
    }
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="bg-white p-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="bg-gray-50">
      <SidebarProvider>
        <div className="flex w-full">
          <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <div className="flex-1 flex flex-col">
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="md:hidden" />
                <div className="flex items-center space-x-2">
                  <img 
                    src="/lovable-uploads/94e2bb14-c4e8-4f82-8bda-81c5568b3534.png" 
                    alt="BuyAWarranty Logo" 
                    className="h-8 w-auto"
                  />
                  <h1 className="text-xl font-semibold text-gray-900">
                    Admin Dashboard
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search customers..."
                    className="pl-10 w-64"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {isMasterAdmin ? 'Master Admin' : user?.email}
                  </span>
                </div>
                
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </header>

            <main className="flex-1 p-6 overflow-auto">
              {activeTab === 'customers' && <CustomersTab />}
              {activeTab === 'analytics' && <AnalyticsTab />}
              {activeTab === 'plans' && <PlansTab />}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default AdminDashboard;
