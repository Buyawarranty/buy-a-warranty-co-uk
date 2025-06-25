import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { Edit, Download, Search, RefreshCw, AlertCircle, CalendarIcon, Save } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
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

interface Plan {
  name: string;
}

// Number plate component
const NumberPlate = ({ plateNumber }: { plateNumber: string }) => {
  if (!plateNumber) return <span className="text-gray-400">N/A</span>;
  
  return (
    <div className="inline-flex items-center bg-white border-2 border-black rounded-sm overflow-hidden font-mono text-lg font-bold shadow-md">
      <div className="bg-blue-600 text-white px-2 py-1 text-xs font-normal">
        GB
      </div>
      <div className="bg-yellow-400 text-black px-3 py-1 tracking-wider">
        {plateNumber.toUpperCase()}
      </div>
    </div>
  );
};

export const CustomersTab = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [noteDate, setNoteDate] = useState<Date>(new Date());
  const [notesLoading, setNotesLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    fetchCustomers();
    fetchPlans();
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

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('name')
        .eq('is_active', true);
      
      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

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
          created_at: noteDate.toISOString(),
          created_by: user?.id
        }]);

      if (error) throw error;
      
      setNewNote('');
      setNoteDate(new Date());
      fetchNotes(selectedCustomer.id);
      toast.success('Note added successfully');
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  const updateCustomer = async () => {
    if (!editingCustomer) return;

    try {
      const { error } = await supabase
        .from('customers')
        .update({
          name: editingCustomer.name,
          email: editingCustomer.email,
          phone: editingCustomer.phone,
          address: editingCustomer.address,
          plan_type: editingCustomer.plan_type,
          status: editingCustomer.status,
          voluntary_excess: editingCustomer.voluntary_excess
        })
        .eq('id', editingCustomer.id);

      if (error) throw error;
      
      toast.success('Customer updated successfully');
      fetchCustomers();
      setEditingCustomer(null);
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Failed to update customer');
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Address', 'Registration Plate', 'Plan Type', 'Signup Date', 'Voluntary Excess', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredCustomers.map(customer => [
        customer.name,
        customer.email,
        customer.phone || '',
        customer.address || '',
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

  const openCustomerDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditingCustomer({ ...customer });
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
                  <TableCell>
                    <NumberPlate plateNumber={customer.registration_plate} />
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
                          onClick={() => openCustomerDialog(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Manage Customer: {selectedCustomer?.name}</DialogTitle>
                        </DialogHeader>
                        
                        {editingCustomer && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Customer Details */}
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold">Customer Details</h3>
                              
                              <div className="space-y-3">
                                <div>
                                  <Label htmlFor="name">Name</Label>
                                  <Input
                                    id="name"
                                    value={editingCustomer.name}
                                    onChange={(e) => setEditingCustomer({
                                      ...editingCustomer,
                                      name: e.target.value
                                    })}
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor="email">Email</Label>
                                  <Input
                                    id="email"
                                    type="email"
                                    value={editingCustomer.email}
                                    onChange={(e) => setEditingCustomer({
                                      ...editingCustomer,
                                      email: e.target.value
                                    })}
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor="phone">Phone</Label>
                                  <Input
                                    id="phone"
                                    value={editingCustomer.phone || ''}
                                    onChange={(e) => setEditingCustomer({
                                      ...editingCustomer,
                                      phone: e.target.value
                                    })}
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor="address">Address</Label>
                                  <Textarea
                                    id="address"
                                    value={editingCustomer.address || ''}
                                    onChange={(e) => setEditingCustomer({
                                      ...editingCustomer,
                                      address: e.target.value
                                    })}
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor="plan">Plan Type</Label>
                                  <Select
                                    value={editingCustomer.plan_type}
                                    onValueChange={(value) => setEditingCustomer({
                                      ...editingCustomer,
                                      plan_type: value
                                    })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {plans.map((plan) => (
                                        <SelectItem key={plan.name} value={plan.name}>
                                          {plan.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div>
                                  <Label htmlFor="status">Status</Label>
                                  <Select
                                    value={editingCustomer.status}
                                    onValueChange={(value) => setEditingCustomer({
                                      ...editingCustomer,
                                      status: value
                                    })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Active">Active</SelectItem>
                                      <SelectItem value="Inactive">Inactive</SelectItem>
                                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                                      <SelectItem value="Suspended">Suspended</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div>
                                  <Label htmlFor="excess">Voluntary Excess (£)</Label>
                                  <Input
                                    id="excess"
                                    type="number"
                                    value={editingCustomer.voluntary_excess || 0}
                                    onChange={(e) => setEditingCustomer({
                                      ...editingCustomer,
                                      voluntary_excess: parseFloat(e.target.value) || 0
                                    })}
                                  />
                                </div>
                              </div>
                              
                              <Button onClick={updateCustomer} className="w-full">
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                              </Button>
                            </div>
                            
                            {/* Notes Section */}
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold">Customer Notes</h3>
                              
                              {/* Add New Note */}
                              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                                <div>
                                  <Label htmlFor="note-date">Note Date</Label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          "w-full justify-start text-left font-normal",
                                          !noteDate && "text-muted-foreground"
                                        )}
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {noteDate ? format(noteDate, "PPP") : <span>Pick a date</span>}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={noteDate}
                                        onSelect={(date) => date && setNoteDate(date)}
                                        initialFocus
                                        className="pointer-events-auto"
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                                
                                <div>
                                  <Label htmlFor="new-note">Add Note</Label>
                                  <Textarea
                                    id="new-note"
                                    placeholder="Enter your note here..."
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    rows={3}
                                  />
                                </div>
                                
                                <Button 
                                  onClick={addNote} 
                                  disabled={!newNote.trim()}
                                  className="w-full"
                                >
                                  Add Note
                                </Button>
                              </div>
                              
                              {/* Existing Notes */}
                              <div className="space-y-2 max-h-96 overflow-y-auto">
                                {notesLoading ? (
                                  <div className="text-center py-4">Loading notes...</div>
                                ) : notes.length === 0 ? (
                                  <div className="text-center py-4 text-gray-500">No notes yet</div>
                                ) : (
                                  notes.map((note) => (
                                    <div key={note.id} className="bg-white p-3 rounded-lg border">
                                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.note}</p>
                                      <p className="text-xs text-gray-500 mt-2">
                                        {format(new Date(note.created_at), 'MMM dd, yyyy HH:mm')}
                                      </p>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        )}
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
