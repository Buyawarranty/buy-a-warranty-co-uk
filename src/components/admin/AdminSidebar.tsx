
import React, { useState } from 'react';
import { Users, FileText, Car, BarChart3, Mail, Menu, X } from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange }) => {
  const [isOpen, setIsOpen] = useState(false);

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

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    setIsOpen(false); // Close mobile menu after selection
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-md border"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:z-10
      `}>
        <div className="p-4 lg:p-6 border-b">
          <h2 className="text-lg lg:text-xl font-bold text-gray-800">Admin Panel</h2>
          <p className="text-sm text-gray-600">Manage your warranty business</p>
        </div>
        
        <nav className="mt-6 overflow-y-auto max-h-[calc(100vh-120px)]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`w-full text-left px-4 lg:px-6 py-3 lg:py-4 flex items-start space-x-3 hover:bg-gray-50 transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-orange-50 border-r-4 border-orange-600 text-orange-700' 
                    : 'text-gray-700'
                }`}
              >
                <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                  activeTab === tab.id ? 'text-orange-600' : 'text-gray-500'
                }`} />
                <div className="min-w-0">
                  <div className="font-medium text-sm lg:text-base">{tab.label}</div>
                  <div className="text-xs text-gray-500 mt-1 hidden lg:block">{tab.description}</div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};
