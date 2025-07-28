import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CustomersTab } from '@/components/admin/CustomersTab';
import { PlansTab } from '@/components/admin/PlansTab';
import SpecialVehiclePlansTab from '@/components/admin/SpecialVehiclePlansTab';
import { AnalyticsTab } from '@/components/admin/AnalyticsTab';
import EmailManagementTab from '@/components/admin/EmailManagementTab';
import AccountSettings from '@/components/admin/AccountSettings';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('customers');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (error || data?.role !== 'admin') {
        console.error('Access denied - not an admin', error);
        navigate('/');
        return;
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'customers':
        return <CustomersTab />;
      case 'plans':
        return <PlansTab />;
      case 'special-plans':
        return <SpecialVehiclePlansTab />;
      case 'emails':
        return <EmailManagementTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'account':
        return <AccountSettings />;
      default:
        return <CustomersTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 lg:ml-64">
        <header className="bg-white shadow-sm border-b px-4 lg:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, Admin
              </span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
