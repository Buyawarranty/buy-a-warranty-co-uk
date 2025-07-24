
import React from 'react';
import { Users, FileText, Car, BarChart3, Mail } from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      description: 'Manage customer accounts and policies'
    },
    {
      id: 'plans',
      label: 'Standard Plans',
      icon: FileText,
      description: 'Manage Basic, Gold, and Platinum plans'
    },
    {
      id: 'special-plans',
      label: 'Special Vehicle Plans',
      icon: Car,
      description: 'Manage EV, PHEV, and Motorbike plans'
    },
    {
      id: 'emails',
      label: 'Email Management',
      icon: Mail,
      description: 'Manage email templates and campaigns'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'View reports and analytics'
    }
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r z-10">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
        <p className="text-sm text-gray-600">Manage your warranty business</p>
      </div>
      
      <nav className="mt-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full text-left px-6 py-4 flex items-start space-x-3 hover:bg-gray-50 transition-colors ${
                activeTab === tab.id 
                  ? 'bg-orange-50 border-r-4 border-orange-600 text-orange-700' 
                  : 'text-gray-700'
              }`}
            >
              <Icon className={`h-5 w-5 mt-0.5 ${
                activeTab === tab.id ? 'text-orange-600' : 'text-gray-500'
              }`} />
              <div>
                <div className="font-medium">{tab.label}</div>
                <div className="text-xs text-gray-500 mt-1">{tab.description}</div>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
