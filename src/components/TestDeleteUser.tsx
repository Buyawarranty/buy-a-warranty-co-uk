import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const TestDeleteUser = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteUser = async () => {
    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-test-user', {
        body: { email: 'prajwalchauhan26@gmail.com' }
      });
      
      if (error) {
        console.error('Error:', error);
        toast.error(`Error: ${error.message}`);
      } else {
        console.log('Success:', data);
        toast.success('User deleted successfully');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4">
      <Button 
        onClick={deleteUser} 
        disabled={isDeleting}
        variant="destructive"
      >
        {isDeleting ? 'Deleting...' : 'Delete User prajwalchauhan26@gmail.com'}
      </Button>
    </div>
  );
};