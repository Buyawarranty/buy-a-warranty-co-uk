import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Edit, Download, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Customer {
  id: string;
  name: string;
  email: string;
  plan_type: string;
  signup_date: string;
  voluntary_excess: number;
  status: string;
  registration_plate: string;
}

interface AdminNote {
  id: string;
  note: string;
  created_at: string;
  created_by: string;
}

export const CustomersTab = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [notesLoading, setNotesLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.registration_plate?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    try {
      console.log('🔍 Starting customer fetch process...');
      setLoading(true);
      setDebugInfo('Starting fetch...');

      // Check current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('👤 Current user:', user);
      console.log('❌ User error:', userError);
      
      const isMasterAdmin = localStorage.getItem('masterAdmin') === 'true';
      console.log('🔐 Is master admin:', isMasterAdmin);
      
      setDebugInfo(`User: ${user?.email || 'Master Admin'}, Master Admin: ${isMasterAdmin}`);

      // Try direct query first
      console.log('📊 Attempting direct query...');
      const { data: directData, error: directError, count: directCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact' });

      console.log('📊 Direct query result:', { data: directData, error: directError, count: directCount });

      if (directError) {
        console.error('❌ Direct query error:', directError);
        setDebugInfo(prev => prev + `\nDirect query error: ${directError.message}`);
        
        // If direct query fails, try with RLS bypass for master admin
        if (isMasterAdmin) {
          console.log('🔓 Attempting RLS bypass query...');
          // For master admin, we might need to use a service role query
          toast.error('RLS policies might be blocking access. Check database policies.');
        } else {
          toast.error(`Database query failed: ${directError.message}`);
        }
        return;
      }

      console.log('✅ Query successful, processing data...');
      setDebugInfo(prev => prev + `\nQuery successful. Count: ${directCount}`);
      
      if (!directData || directData.length === 0) {
        console.warn('⚠️ No customers found in database');
        setDebugInfo(prev => prev + '\nNo customers found in result');
        toast.info('No customers found in database. Check if data was inserted correctly.');
      } else {
        console.log('✅ Found customers:', directData.length);
        setDebugInfo(prev => prev + `\nFound ${directData.length} customers`);
        toast.success(`Loaded ${directData.length} customers`);
      }
      
      setCustomers(directData || []);
      setFilteredCustomers(directData || []);
    } catch (error) {
      console.error('💥 Unexpected error fetching customers:', error);
      setDebugInfo(prev => prev + `\nUnexpected error: ${error}`);
      toast.error('Unexpected error occurred while fetching customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async (customerId: string) => {
    setNotesLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_notes')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setNotesLoading(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim() || !selectedCustomer) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('admin_notes')
        .insert([{
          customer_id: selectedCustomer.id,
          note: newNote,
          created_by: user?.id
        }]);

      if (error) throw error;
      
      setNewNote('');
      fetchNotes(selectedCustomer.id);
      toast.success('Note added successfully');
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Registration Plate', 'Plan Type', 'Signup Date', 'Voluntary Excess', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredCustomers.map(customer => [
        customer.name,
        customer.email,
        customer.registration_plate || '',
        customer.plan_type,
        format(new Date(customer.signup_date), 'yyyy-MM-dd'),
        customer.voluntary_excess || 0,
        customer.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const openNotesDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    fetchNotes(customer.id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <span className="ml-2">Loading customers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
        <div className="flex space-x-2">
          <Button 
            onClick={fetchCustomers} 
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Button onClick={exportToCSV} className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Debug Information Panel */}
      {debugInfo && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <h3 className="font-medium text-yellow-800">Debug Information</h3>
          </div>
          <pre className="mt-2 text-sm text-yellow-700 whitespace-pre-wrap">{debugInfo}</pre>
        </div>
      )}

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-gray-600">
          Showing {filteredCustomers.length} customers
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Registration Plate</TableHead>
              <TableHead>Plan Type</TableHead>
              <TableHead>Signup Date</TableHead>
              <TableHead>Voluntary Excess</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="space-y-4">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-gray-500 text-lg">No customers found</p>
                      <p className="text-gray-400 text-sm mt-2">
                        This might be due to RLS policies or missing data
                      </p>
                    </div>
                    <Button onClick={fetchCustomers} variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {customer.registration_plate || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{customer.plan_type}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(customer.signup_date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>£{customer.voluntary_excess || 0}</TableCell>
                  <TableCell>
                    <Badge variant={customer.status === 'Active' ? 'default' : 'destructive'}>
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openNotesDialog(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Notes for {selectedCustomer?.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Textarea
                              placeholder="Add a new note..."
                              value={newNote}
                              onChange={(e) => setNewNote(e.target.value)}
                              rows={3}
                            />
                            <Button onClick={addNote} disabled={!newNote.trim()}>
                              Add Note
                            </Button>
                          </div>
                          
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {notesLoading ? (
                              <div className="text-center py-4">Loading notes...</div>
                            ) : notes.length === 0 ? (
                              <div className="text-center py-4 text-gray-500">No notes yet</div>
                            ) : (
                              notes.map((note) => (
                                <div key={note.id} className="bg-gray-50 p-3 rounded-lg">
                                  <p className="text-sm text-gray-800">{note.note}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {format(new Date(note.created_at), 'MMM dd, yyyy HH:mm')}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
