
import React from 'react';
import CreateTestCustomer from '@/components/CreateTestCustomer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminTest = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Testing Tools</h1>
          <p className="text-gray-600 mt-2">Tools for testing and development</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CreateTestCustomer />
          
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
        </div>
      </div>
    </div>
  );
};

export default AdminTest;
