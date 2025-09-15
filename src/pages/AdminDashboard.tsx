import { ClaimsTab } from '@/components/admin/ClaimsTab';
import ContactSubmissionsTab from '@/components/admin/ContactSubmissionsTab';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';
import { CustomersTab } from '@/components/admin/CustomersTab';
import { PlansTab } from '@/components/admin/PlansTab';
import SpecialVehiclePlansTab from '@/components/admin/SpecialVehiclePlansTab';
import { DiscountCodesTab } from '@/components/admin/DiscountCodesTab';
import { AnalyticsTab } from '@/components/admin/AnalyticsTab';
import EmailManagementTab from '@/components/admin/EmailManagementTab';
import EmailMarketingTab from '@/components/admin/EmailMarketingTab';
import AccountSettings from '@/components/admin/AccountSettings';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import CreateTestCustomer from '@/components/CreateTestCustomer';
import CreateTestAdmin from '@/components/admin/CreateTestAdmin';
import ResetAdminPassword from '@/components/admin/ResetAdminPassword';
import SetAdminPassword from '@/components/admin/SetAdminPassword';
import TestWarranties2000 from '@/components/TestWarranties2000';
import TestWarranties2000AddOns from '@/components/TestWarranties2000AddOns';
import TestBumper from '@/components/TestBumper';
import { ApiConnectivityTest } from '@/components/admin/ApiConnectivityTest';
import { UserPermissionsTab } from '@/components/admin/UserPermissionsTab';
import { DocumentMappingTab } from '@/components/admin/DocumentMappingTab';
import { BulkPricingTab } from '@/components/admin/BulkPricingTab';
import { BlogWritingTab } from '@/components/admin/BlogWritingTab';
import OrderReconciliation from '@/components/admin/OrderReconciliation';
import { ResendWelcomeEmail } from '@/components/admin/ResendWelcomeEmail';
import { TestAutomatedEmail } from '@/components/admin/TestAutomatedEmail';
import { SimpleEmailTest } from '@/components/admin/SimpleEmailTest';
import { TestEmailFunctionDirect } from '@/components/admin/TestEmailFunctionDirect';
import { EmailFunctionDiagnostics } from '@/components/admin/EmailFunctionDiagnostics';
import { ClickFraudTab } from '@/components/admin/ClickFraudTab';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('customers');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      console.log('Checking admin access...');
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('Session:', session?.user?.email);
      
      if (!session?.user) {
        console.log('No session found, redirecting to auth');
        navigate('/auth');
        return;
      }

      console.log('Checking user role for:', session.user.id);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();

      console.log('Role query result:', { data, error });

      // Allow all admin role types: admin, member, viewer, guest
      if (error || !data || !['admin', 'member', 'viewer', 'guest'].includes(data.role)) {
        console.error('Access denied - not an admin user', error, data);
        console.log('Redirecting to homepage');
        navigate('/');
        return;
      }

      console.log('Access granted for role:', data.role);
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
      case 'bulk-pricing':
        return <BulkPricingTab />;
      case 'special-plans':
        return <SpecialVehiclePlansTab />;
      case 'discount-codes':
        return <DiscountCodesTab />;
      case 'claims':
        return <ClaimsTab />;
      case 'contact':
        return <ContactSubmissionsTab />;
      case 'emails':
        return <EmailManagementTab />;
      case 'email-marketing':
        return <EmailMarketingTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'security':
        return <ClickFraudTab />;
      case 'user-permissions':
        return <UserPermissionsTab />;
      case 'document-mapping':
        return <DocumentMappingTab />;
      case 'blog-writing':
        return <BlogWritingTab />;
      case 'testing':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Testing Tools</h1>
              <p className="text-gray-600 mt-2">Tools for testing and development</p>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <OrderReconciliation />
              
              <ApiConnectivityTest />
              
              <EmailFunctionDiagnostics />
              
              <SimpleEmailTest />
              
              <TestEmailFunctionDirect />
              
              <TestAutomatedEmail />
              
              <ResendWelcomeEmail />
              
              <CreateTestCustomer />
              
              <CreateTestAdmin />
              
              <ResetAdminPassword />
              
              <SetAdminPassword />
              
              <Card>
                <CardHeader>
                  <CardTitle>Test Credentials</CardTitle>
                  <CardDescription>
                    Use these credentials to test the customer login
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Email:</span> test@customer.com
                    </div>
                    <div>
                      <span className="font-medium">Password:</span> password123
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <TestWarranties2000 />
              
              <TestWarranties2000AddOns />
              
              <TestBumper />
            </div>
          </div>
        );
      case 'account':
        return <AccountSettings />;
      default:
        return <CustomersTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <SEOHead 
        title="Admin Dashboard | BuyAWarranty Management"
        description="Administrative dashboard for managing warranties, customers, and business operations. Secure access for authorized personnel only."
        keywords="admin, dashboard, warranty management, customer management"
      />
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
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate('/auth');
                }}
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
