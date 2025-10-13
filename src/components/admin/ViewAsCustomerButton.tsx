import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useImpersonation } from '@/hooks/useImpersonation';
import { toast } from 'sonner';

interface ViewAsCustomerButtonProps {
  customerId: string;
  customerEmail: string;
  customerName: string;
}

export const ViewAsCustomerButton: React.FC<ViewAsCustomerButtonProps> = ({
  customerId,
  customerEmail,
  customerName,
}) => {
  const navigate = useNavigate();
  const { startImpersonation } = useImpersonation();

  const handleViewAsCustomer = () => {
    // Start impersonation mode
    startImpersonation(customerId, customerEmail, customerName);
    
    // Show toast notification
    toast.success(`Now viewing as ${customerName}`, {
      description: 'You can view their customer dashboard',
    });
    
    // Navigate to customer dashboard
    navigate('/customer-dashboard');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleViewAsCustomer}
      className="gap-2"
    >
      <Eye className="h-4 w-4" />
      View as Customer
    </Button>
  );
};
