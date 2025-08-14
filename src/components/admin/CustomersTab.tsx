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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Edit, Download, Search, RefreshCw, AlertCircle, CalendarIcon, Save, Key, Send, Clock, CheckCircle, Trash2, UserX, Phone, Mail } from 'lucide-react';
import { ForwardToWarranties } from './ForwardToWarranties';
import { WarrantyActions } from './WarrantyActions';
import { ManualOrderEntry } from './ManualOrderEntry';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Helper function to map plan types to Warranties 2000 warranty types
function getWarrantyType(planType: string): string {
  // WarType must be one of: B-BASIC, B-GOLD, B-PLATINUM, B-EV, B-PHEV or B-MOTORCYCLE
  switch (planType?.toLowerCase()) {
    case 'basic': return 'B-BASIC';
    case 'gold': return 'B-GOLD';
    case 'platinum': return 'B-PLATINUM';
    case 'phev': return 'B-PHEV';
    case 'ev': return 'B-EV';
    case 'motorbike': 
    case 'motorcycle': return 'B-MOTORCYCLE';
    default: return 'B-BASIC';
  }
}

// Helper function to calculate duration in months based on payment type
function getWarrantyDuration(paymentType: string): number {
  switch (paymentType?.toLowerCase()) {
    case 'monthly':
    case '12months':
    case 'yearly':
      return 12;
    case '24months':
    case 'two_yearly':
    case 'twoyear':
      return 24;
    case '36months':
    case 'three_yearly':
    case 'threeyear':
      return 36;
    case '48months':
    case 'four_yearly':
    case 'fouryear':
      return 48;
    case '60months':
    case 'five_yearly':
    case 'fiveyear':
      return 60;
    default:
      return 12; // Default to 12 months
  }
}

// Helper function to calculate expiry date based on start date and duration
function calculateExpiryDate(startDate: string, durationMonths: number): Date {
  const start = new Date(startDate);
  const expiry = new Date(start);
  expiry.setMonth(expiry.getMonth() + durationMonths);
  return expiry;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  flat_number?: string;
  building_name?: string;
  building_number?: string;
  street?: string;
  town?: string;
  county?: string;
  postcode?: string;
  country?: string;
  address?: string;
  plan_type: string;
  signup_date: string;
  voluntary_excess: number;
  status: string;
  registration_plate: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: string;
  vehicle_fuel_type?: string;
  vehicle_transmission?: string;
  mileage?: string;
  payment_type?: string;
  stripe_session_id?: string;
  bumper_order_id?: string;
  discount_code?: string;
  discount_amount: number;
  original_amount: number;
  final_amount: number;
  warranty_reference_number: string;
  warranty_number: string;
  stripe_customer_id: string;
  warranty_expiry?: string;
  policy_number?: string;
  policy_status?: string;
  welcome_email_status?: 'sent' | 'not_sent';
  activation_email_status?: 'sent' | 'not_sent';
  customer_policies?: Array<{
    id?: string;
    policy_end_date: string;
    policy_start_date?: string;
    policy_number: string;
    status: string;
    warranty_number?: string;
    email_sent_status?: string;
    warranties_2000_status?: string;
  }>;
}

interface IncompleteCustomer {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  vehicle_reg?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: string;
  mileage?: string;
  plan_name?: string;
  payment_type?: string;
  vehicle_type?: string;
  step_abandoned: number;
  created_at: string;
  updated_at: string;
  contact_status: string;
  contact_notes?: string;
  last_contacted_at?: string;
  contacted_by?: string;
}

interface EmailStatus {
  policy_documents: boolean;
  portal_signup: boolean;
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
  const [incompleteCustomers, setIncompleteCustomers] = useState<IncompleteCustomer[]>([]);
  const [filteredIncompleteCustomers, setFilteredIncompleteCustomers] = useState<IncompleteCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [incompleteLoading, setIncompleteLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // Default to newest first
  const [filterByPlan, setFilterByPlan] = useState('all');
  const [filterByStatus, setFilterByStatus] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [noteDate, setNoteDate] = useState<Date>(new Date());
  const [notesLoading, setNotesLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [passwordResetLoading, setPasswordResetLoading] = useState<{ [key: string]: boolean }>({});
  const [emailStatuses, setEmailStatuses] = useState<{ [key: string]: EmailStatus }>({});
  const [emailSendingLoading, setEmailSendingLoading] = useState<{ [key: string]: { [key: string]: boolean } }>({});
  const [dvlaLookupLoading, setDvlaLookupLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchCustomers();
    fetchIncompleteCustomers();
    fetchPlans();
    fetchEmailStatuses();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [searchTerm, customers, sortBy, filterByPlan, filterByStatus]);

  const applyFiltersAndSort = () => {
    let filtered = [...customers];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.registration_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.warranty_reference_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply plan filter
    if (filterByPlan !== 'all') {
      filtered = filtered.filter(customer =>
        customer.plan_type?.toLowerCase() === filterByPlan.toLowerCase()
      );
    }

    // Apply status filter
    if (filterByStatus !== 'all') {
      filtered = filtered.filter(customer =>
        customer.status?.toLowerCase() === filterByStatus.toLowerCase()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.signup_date).getTime();
      const dateB = new Date(b.signup_date).getTime();
      
      switch (sortBy) {
        case 'newest':
          return dateB - dateA; // Newest first (default)
        case 'oldest':
          return dateA - dateB; // Oldest first
        case 'name':
          return a.name.localeCompare(b.name);
        case 'email':
          return a.email.localeCompare(b.email);
        case 'plan':
          return (a.plan_type || '').localeCompare(b.plan_type || '');
        default:
          return dateB - dateA; // Default to newest first
      }
    });

    setFilteredCustomers(filtered);
  };

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

      // Query both customers and orphaned policies (policies without customer records)
      console.log('📊 Attempting query with policy data and real customers only...');
      
      // First get customers with their policies
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select(`
          *,
          customer_policies!customer_id(
            id,
            policy_number,
            policy_end_date,
            policy_start_date,
            status,
            warranty_number,
            email_sent_status,
            warranties_2000_status
          )
        `)
        .not('email', 'ilike', '%test%')
        .not('email', 'ilike', '%guest%')
        .not('name', 'ilike', '%test customer%')
        .not('name', 'ilike', '%guest customer%')
        .order('updated_at', { ascending: false });

      // Then get orphaned policies (policies without customer records)
      const { data: orphanedPolicies, error: orphanedError } = await supabase
        .from('customer_policies')
        .select('*')
        .is('customer_id', null)
        .order('created_at', { ascending: false });

      let directData = customersData || [];
      let directError = customersError;
      
      // Add orphaned policies as customer records
      if (orphanedPolicies && orphanedPolicies.length > 0) {
        const orphanedAsCustomers = orphanedPolicies.map(policy => ({
          id: policy.id,
          name: 'Unknown Customer',
          email: policy.email,
          phone: null,
          first_name: null,
          last_name: null,
          flat_number: null,
          building_name: null,
          building_number: null,
          street: null,
          town: null,
          county: null,
          postcode: null,
          country: 'United Kingdom',
          plan_type: policy.plan_type,
          signup_date: policy.created_at,
          voluntary_excess: 0,
          status: 'Incomplete Record',
          registration_plate: 'Unknown',
          vehicle_make: null,
          vehicle_model: null,
          vehicle_year: null,
          vehicle_fuel_type: null,
          vehicle_transmission: null,
          mileage: null,
          payment_type: policy.payment_type,
          stripe_session_id: null,
          bumper_order_id: policy.policy_number?.startsWith('BAW-') ? policy.policy_number : null,
          discount_code: null,
          discount_amount: 0,
          original_amount: null,
          final_amount: null,
          assigned_to: null,
          warranty_reference_number: null,
          customer_policies: [policy],
          created_at: policy.created_at,
          updated_at: policy.updated_at,
          stripe_customer_id: null,
          warranty_number: null
        }));
        
        directData = [...directData, ...orphanedAsCustomers];
      }
      
      const directCount = directData.length;

      console.log('📊 Query result:', { data: directData, error: directError, count: directCount });

      if (directError) {
        console.error('❌ Query error, trying fallback without policies:', directError);
        setDebugInfo(prev => prev + `\nQuery with policies error: ${directError.message}, trying fallback...`);
        
        // Fallback: try without joining policies table
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('customers')
          .select('*');
          
        if (fallbackError) {
          console.error('❌ Fallback query error:', fallbackError);
          setDebugInfo(prev => prev + `\nFallback query error: ${fallbackError.message}`);
          
          if (isMasterAdmin) {
            toast.error('RLS policies might be blocking access. Check database policies.');
          } else {
            toast.error(`Database query failed: ${fallbackError.message}`);
          }
          return;
        }
        
        // Process fallback data (without warranty expiry)
        const processedData = fallbackData?.map((customer: any) => ({
          ...customer,
          warranty_expiry: null
        })) || [];
        
        setCustomers(processedData);
        setFilteredCustomers(processedData);
        toast.success(`Loaded ${processedData.length} customers (warranty expiry unavailable)`);
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
      
      // Process the data to flatten the customer_policies relationship
      const processedData = directData?.map((customer: any) => ({
        ...customer,
        warranty_expiry: customer.customer_policies?.[0]?.policy_end_date || null,
        warranty_reference_number: customer.warranty_reference_number || null,
        policy_number: customer.customer_policies?.[0]?.policy_number || null,
        policy_status: customer.customer_policies?.[0]?.status || null
      })) || [];
      
      setCustomers(processedData);
      setFilteredCustomers(processedData);
      
      // Fetch email statuses after customers are loaded
      fetchEmailStatuses();
    } catch (error) {
      console.error('💥 Unexpected error fetching customers:', error);
      setDebugInfo(prev => prev + `\nUnexpected error: ${error}`);
      toast.error('Unexpected error occurred while fetching customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchIncompleteCustomers = async () => {
    try {
      setIncompleteLoading(true);
      console.log('🔍 Fetching incomplete customers...');
      
      const { data, error } = await supabase
        .from('abandoned_carts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching incomplete customers:', error);
        throw error;
      }

      console.log('✅ Found incomplete customers:', data?.length || 0);
      setIncompleteCustomers(data || []);
      setFilteredIncompleteCustomers(data || []);
    } catch (error) {
      console.error('Error fetching incomplete customers:', error);
      toast.error('Failed to load incomplete customers');
    } finally {
      setIncompleteLoading(false);
    }
  };

  const updateContactStatus = async (
    customerId: string, 
    status: string, 
    notes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('abandoned_carts')
        .update({
          contact_status: status,
          contact_notes: notes,
          last_contacted_at: new Date().toISOString(),
          contacted_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', customerId);

      if (error) throw error;

      toast.success('Contact status updated successfully');
      fetchIncompleteCustomers(); // Refresh the list
    } catch (error) {
      console.error('Error updating contact status:', error);
      toast.error('Failed to update contact status');
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

      if (error) {
        console.error('Error fetching notes:', error);
        throw error;
      }
      
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setNotesLoading(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim() || !selectedCustomer) {
      toast.error('Please enter a note');
      return;
    }

    try {
      console.log('Adding note for customer:', selectedCustomer.id);
      console.log('Note content:', newNote);
      console.log('Note date:', noteDate.toISOString());

      // Check if user is authenticated or master admin
      const { data: { user } } = await supabase.auth.getUser();
      const isMasterAdmin = localStorage.getItem('masterAdmin') === 'true';
      
      const noteData = {
        customer_id: selectedCustomer.id,
        note: newNote,
        created_at: noteDate.toISOString(),
        created_by: isMasterAdmin ? null : user?.id
      };

      console.log('Inserting note data:', noteData);

      const { data, error } = await supabase
        .from('admin_notes')
        .insert([noteData])
        .select();

      if (error) {
        console.error('Database error adding note:', error);
        throw error;
      }

      console.log('Note added successfully:', data);
      
      setNewNote('');
      setNoteDate(new Date());
      fetchNotes(selectedCustomer.id);
      toast.success('Note added successfully');
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error(`Failed to add note: ${error.message || 'Unknown error'}`);
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
          first_name: editingCustomer.first_name,
          last_name: editingCustomer.last_name,
          flat_number: editingCustomer.flat_number,
          building_name: editingCustomer.building_name,
          building_number: editingCustomer.building_number,
          street: editingCustomer.street,
          town: editingCustomer.town,
          county: editingCustomer.county,
          postcode: editingCustomer.postcode,
          country: editingCustomer.country,
          registration_plate: editingCustomer.registration_plate,
          vehicle_make: editingCustomer.vehicle_make,
          vehicle_model: editingCustomer.vehicle_model,
          vehicle_year: editingCustomer.vehicle_year,
          vehicle_fuel_type: editingCustomer.vehicle_fuel_type,
          vehicle_transmission: editingCustomer.vehicle_transmission,
          mileage: editingCustomer.mileage,
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
    const headers = ['Name', 'Email', 'Phone', 'Full Address', 'Registration Plate', 'Vehicle Details', 'Plan Type', 'Payment Type', 'Signup Date', 'Warranty Expiry', 'Voluntary Excess', 'Status', 'Final Amount'];
    const csvContent = [
      headers.join(','),
      ...filteredCustomers.map(customer => [
        customer.name,
        customer.email,
        customer.phone || '',
        `${customer.street || ''} ${customer.town || ''} ${customer.county || ''} ${customer.postcode || ''}`.trim(),
        customer.registration_plate || '',
        `${customer.vehicle_make || ''} ${customer.vehicle_model || ''} ${customer.vehicle_year || ''}`.trim(),
        customer.plan_type,
        customer.payment_type || '',
        format(new Date(customer.signup_date), 'yyyy-MM-dd'),
        customer.warranty_expiry ? format(new Date(customer.warranty_expiry), 'yyyy-MM-dd') : 'N/A',
        customer.voluntary_excess || 0,
        customer.status,
        
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

  const deleteCustomer = async (customerId: string, customerName: string) => {
    if (!confirm(`Are you sure you want to delete "${customerName}"? This action cannot be undone and will also delete all associated data.`)) {
      return;
    }

    try {
      // Check if this is an orphaned policy (fake customer record)
      const isOrphanedPolicy = customerName === 'Unknown Customer';
      
      if (isOrphanedPolicy) {
        // This is an orphaned policy - delete the policy record directly
        console.log('Deleting orphaned policy with ID:', customerId);
        
        const { error: policyError } = await supabase
          .from('customer_policies')
          .delete()
          .eq('id', customerId);

        if (policyError) {
          console.error('Error deleting orphaned policy:', policyError);
          toast.error('Failed to delete policy record: ' + policyError.message);
          return;
        }

        toast.success('Orphaned policy record has been deleted successfully');
      } else {
        // This is a real customer - delete related records first, then customer
        console.log('Deleting real customer with ID:', customerId);
        
        // 1. Delete warranty audit logs first (they reference both customer and policies)
        const { error: auditLogsError } = await supabase
          .from('warranty_audit_log')
          .delete()
          .eq('customer_id', customerId);

        if (auditLogsError) {
          console.error('Error deleting warranty audit logs:', auditLogsError);
        }

        // 2. Delete email logs
        const { error: emailLogsError } = await supabase
          .from('email_logs')
          .delete()
          .eq('customer_id', customerId);

        if (emailLogsError) {
          console.error('Error deleting email logs:', emailLogsError);
        }

        // 3. Delete customer policies
        const { error: policiesError } = await supabase
          .from('customer_policies')
          .delete()
          .eq('customer_id', customerId);

        if (policiesError) {
          console.error('Error deleting customer policies:', policiesError);
        }

        // 4. Delete admin notes
        const { error: notesError } = await supabase
          .from('admin_notes')
          .delete()
          .eq('customer_id', customerId);

        if (notesError) {
          console.error('Error deleting admin notes:', notesError);
        }

        // 5. Delete payments
        const { error: paymentsError } = await supabase
          .from('payments')
          .delete()
          .eq('customer_id', customerId);

        if (paymentsError) {
          console.error('Error deleting payments:', paymentsError);
        }

        // 6. Finally, delete the customer
        const { error: customerError } = await supabase
          .from('customers')
          .delete()
          .eq('id', customerId);

        if (customerError) {
          console.error('Error deleting customer:', customerError);
          toast.error('Failed to delete customer: ' + customerError.message);
          return;
        }

        toast.success(`Customer "${customerName}" has been deleted successfully`);
      }
      
      fetchCustomers(); // Refresh the customer list
    } catch (error) {
      console.error('Unexpected error deleting record:', error);
      toast.error('An unexpected error occurred while deleting the record');
    }
  };

  const fetchEmailStatuses = async () => {
    try {
      // Fetch welcome and activation email statuses for all customers
      const { data: emailLogs, error } = await supabase
        .from('email_logs')
        .select('recipient_email, subject, status')
        .in('status', ['sent', 'delivered']);

      if (error) {
        console.error('Error fetching email statuses:', error);
        return;
      }

      // Process email logs to determine status for each customer
      const statuses: { [key: string]: EmailStatus } = {};
      
      customers.forEach(customer => {
        const customerEmails = emailLogs?.filter(log => log.recipient_email === customer.email) || [];
        statuses[customer.email] = {
          portal_signup: customerEmails.some(log => 
            log.subject?.toLowerCase().includes('welcome to buyawarranty.co.uk') &&
            log.subject?.toLowerCase().includes('get you started')
          ),
          policy_documents: customerEmails.some(log => 
            log.subject?.toLowerCase().includes('policy') || 
            log.subject?.toLowerCase().includes('warranty') ||
            log.subject?.toLowerCase().includes('document')
          )
        };
      });

      setEmailStatuses(statuses);
    } catch (error) {
      console.error('Error fetching email statuses:', error);
    }
  };

  const sendManualEmail = async (customerId: string, customerEmail: string, emailType: 'policy_documents' | 'portal_signup') => {
    const emailKey = `${customerId}_${emailType}`;
    setEmailSendingLoading(prev => ({
      ...prev,
      [customerId]: { ...prev[customerId], [emailType]: true }
    }));

    try {
      const customer = customers.find(c => c.id === customerId);
      let functionName: string;
      let payload: any;
      
      if (emailType === 'portal_signup') {
        functionName = 'send-email';
        payload = {
          templateId: 'Welcome Email - Portal Signup',
          recipientEmail: customerEmail,
          variables: {
            customer_name: customer?.name || customer?.first_name || 'Customer',
            customerName: customer?.name || customer?.first_name || 'Customer',
            loginLink: 'https://buyawarranty.co.uk/customer-dashboard',
            portalLink: 'https://buyawarranty.co.uk/customer-dashboard'
          }
        };
      } else {
        functionName = 'send-policy-documents';
        payload = {
          recipientEmail: customerEmail,
          variables: {
            planType: customer?.plan_type || 'basic',
            customerName: customer?.name || customer?.first_name || 'Customer'
          }
        };
      }

      const { error } = await supabase.functions.invoke(functionName, {
        body: payload
      });

      if (error) throw error;

      const emailTypeNames = {
        portal_signup: 'Portal Signup',
        policy_documents: 'Policy Documents'
      };

      toast.success(`${emailTypeNames[emailType]} email sent successfully`);
      
      // Update email status locally
      setEmailStatuses(prev => ({
        ...prev,
        [customerEmail]: {
          ...prev[customerEmail],
          [emailType]: true
        }
      }));
      
      // Refresh email statuses from database
      setTimeout(fetchEmailStatuses, 1000);
    } catch (error) {
      console.error(`Error sending ${emailType} email:`, error);
      toast.error(`Failed to send ${emailType} email`);
    } finally {
      setEmailSendingLoading(prev => ({
        ...prev,
        [customerId]: { ...prev[customerId], [emailType]: false }
      }));
    }
  };

  const EmailStatusIndicator = ({ customer }: { customer: Customer }) => {
    const status = emailStatuses[customer.email] || { policy_documents: false, portal_signup: false };
    
    return (
      <div className="flex flex-col space-y-1">
        <div className="flex items-center space-x-2">
          {status.portal_signup ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <Clock className="h-4 w-4 text-red-500" />
          )}
          <span className="text-xs">Portal Signup</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => sendManualEmail(customer.id, customer.email, 'portal_signup')}
            disabled={emailSendingLoading[customer.id]?.portal_signup}
          >
            {emailSendingLoading[customer.id]?.portal_signup ? (
              <div className="animate-spin rounded-full h-3 w-3 border border-orange-600 border-t-transparent"></div>
            ) : (
              <Send className="h-3 w-3" />
            )}
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          {status.policy_documents ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <Clock className="h-4 w-4 text-red-500" />
          )}
          <span className="text-xs">Policy Documents</span>
          {!status.policy_documents && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => sendManualEmail(customer.id, customer.email, 'policy_documents')}
              disabled={emailSendingLoading[customer.id]?.policy_documents}
            >
              {emailSendingLoading[customer.id]?.policy_documents ? (
                <div className="animate-spin rounded-full h-3 w-3 border border-orange-600 border-t-transparent"></div>
              ) : (
                <Send className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      </div>
    );
  };

  const handleSendWelcomeEmail = async (policyId: string, customerId: string) => {
    setEmailSendingLoading(prev => ({ 
      ...prev, 
      [customerId]: { ...prev[customerId], email: true } 
    }));
    
    try {
      const { data, error } = await supabase.functions.invoke('send-welcome-email-manual', {
        body: { 
          policyId: policyId,
          customerId: customerId 
        }
      });

      if (error) throw error;
      
      toast.success('Welcome email sent successfully!');
      fetchCustomers(); // Refresh to update status
    } catch (error: any) {
      console.error('Error sending welcome email:', error);
      toast.error(`Failed to send email: ${error.message}`);
    } finally {
      setEmailSendingLoading(prev => ({ 
        ...prev, 
        [customerId]: { ...prev[customerId], email: false } 
      }));
    }
  };

  const handleSendToWarranties2000 = async (policyId: string, customerId: string) => {
    setEmailSendingLoading(prev => ({ 
      ...prev, 
      [customerId]: { ...prev[customerId], warranties2000: true } 
    }));
    
    try {
      const { data, error } = await supabase.functions.invoke('send-to-warranties-2000', {
        body: { 
          policyId: policyId,
          customerId: customerId 
        }
      });

      if (error) throw error;
      
      toast.success('Successfully sent to Warranties 2000!');
      fetchCustomers(); // Refresh to update status
    } catch (error: any) {
      console.error('Error sending to Warranties 2000:', error);
      toast.error(`Failed to send to Warranties 2000: ${error.message}`);
    } finally {
      setEmailSendingLoading(prev => ({ 
        ...prev, 
        [customerId]: { ...prev[customerId], warranties2000: false } 
      }));
    }
  };

  const refreshVehicleDataFromDVLA = async (customerId: string, registrationPlate: string) => {
    if (!registrationPlate) {
      toast.error('Registration plate is required for DVLA lookup');
      return;
    }

    setDvlaLookupLoading(prev => ({ ...prev, [customerId]: true }));
    
    try {
      console.log(`Starting DVLA lookup for registration: ${registrationPlate}`);
      
      const { data, error } = await supabase.functions.invoke('dvla-vehicle-lookup', {
        body: { registrationNumber: registrationPlate }
      });

      if (error) {
        console.error('DVLA lookup error:', error);
        throw error;
      }

      console.log('DVLA lookup response:', data);

      if (!data.found) {
        toast.error(`Vehicle not found in DVLA database: ${data.error || 'Unknown error'}`);
        return;
      }

      // Update customer record with DVLA data
      const updateData = {
        vehicle_make: data.make || null,
        vehicle_model: data.model || null,
        vehicle_year: data.yearOfManufacture ? data.yearOfManufacture.toString() : null,
        vehicle_fuel_type: data.fuelType || null,
        vehicle_transmission: data.transmission || null,
        updated_at: new Date().toISOString()
      };

      console.log('Updating customer with DVLA data:', updateData);

      const { error: updateError } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', customerId);

      if (updateError) {
        console.error('Error updating customer with DVLA data:', updateError);
        throw updateError;
      }

      toast.success(`Vehicle data updated from DVLA: ${data.make} ${data.model || ''}`);
      
      // Refresh customers list to show updated data
      fetchCustomers();
      
    } catch (error: any) {
      console.error('Error in DVLA vehicle lookup:', error);
      toast.error(`DVLA lookup failed: ${error.message || 'Unknown error'}`);
    } finally {
      setDvlaLookupLoading(prev => ({ ...prev, [customerId]: false }));
    }
  };

  const resetCustomerPassword = async (customerId: string, customerEmail: string) => {
    setPasswordResetLoading(prev => ({ ...prev, [customerId]: true }));
    
    try {
      console.log('Resetting password for customer:', customerId, customerEmail);
      
      // Generate a secure temporary password
      const generateSecurePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
          password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
      };
      
      const tempPassword = generateSecurePassword();
      
      console.log('Generated temporary password for admin use:', tempPassword);
      
      // Log the password reset in our tracking table
      const { error: logError } = await supabase
        .from('welcome_emails')
        .insert({
          email: customerEmail,
          temporary_password: tempPassword,
          password_reset: true,
          user_id: customerId
        });
      
      if (logError) {
        console.error('Error logging password reset:', logError);
      }
      
      // Send reset email as backup
      const { error: emailError } = await supabase.auth.resetPasswordForEmail(customerEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (emailError) {
        console.error('Error sending reset email:', emailError);
        // Don't throw here, as we still want to show the temp password
      }
      
      // Show the temporary password to the admin with copy functionality
      const message = `Temporary password generated: ${tempPassword}\n\nThis password has been logged in the system. Please provide this to the customer securely. A password reset email has also been sent as backup.`;
      
      // Create a more user-friendly dialog
      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(tempPassword);
          toast.success(`Password reset successful! Temporary password copied to clipboard: ${tempPassword}`, {
            duration: 15000,
            action: {
              label: 'Copy Again',
              onClick: () => navigator.clipboard.writeText(tempPassword)
            }
          });
        } catch (clipboardError) {
          toast.success(`Password reset successful! Temporary password: ${tempPassword}`, {
            duration: 15000,
          });
        }
      } else {
        toast.success(`Password reset successful! Temporary password: ${tempPassword}`, {
          duration: 15000,
        });
      }
      
      // Also log to console for admin reference
      console.log('='.repeat(50));
      console.log('CUSTOMER PASSWORD RESET');
      console.log('Customer:', customerEmail);
      console.log('Temporary Password:', tempPassword);
      console.log('Reset Time:', new Date().toISOString());
      console.log('='.repeat(50));
      
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(`Failed to reset password: ${error.message || 'Unknown error'}`);
    } finally {
      setPasswordResetLoading(prev => ({ ...prev, [customerId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <span className="ml-2">Loading customers...</span>
      </div>
    );
  }

  const getContactStatusColor = (status: string) => {
    switch (status) {
      case 'not_contacted': return 'bg-red-500';
      case 'contacted': return 'bg-yellow-500'; 
      case 'follow_up': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getContactStatusText = (status: string) => {
    switch (status) {
      case 'not_contacted': return 'Not Contacted';
      case 'contacted': return 'Contacted';
      case 'follow_up': return 'Follow-up Done';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
        <div className="flex space-x-2">
          <ManualOrderEntry />
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

      <Tabs defaultValue="complete" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="complete">Complete Customers</TabsTrigger>
          <TabsTrigger value="incomplete">Incomplete Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="complete" className="space-y-4">
          {/* Enhanced Search and Filter Controls */}
          <div className="bg-white p-4 rounded-lg border space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-1">
                <Label htmlFor="search" className="text-sm font-medium">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name, email, or registration..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Sort By */}
              <div className="space-y-1">
                <Label htmlFor="sortBy" className="text-sm font-medium">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="email">Email (A-Z)</SelectItem>
                    <SelectItem value="plan">Plan Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter by Plan */}
              <div className="space-y-1">
                <Label htmlFor="planFilter" className="text-sm font-medium">Plan Type</Label>
                <Select value={filterByPlan} onValueChange={setFilterByPlan}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                    <SelectItem value="phev">PHEV</SelectItem>
                    <SelectItem value="motorbike">Motorbike</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter by Status */}
              <div className="space-y-1">
                <Label htmlFor="statusFilter" className="text-sm font-medium">Status</Label>
                <Select value={filterByStatus} onValueChange={setFilterByStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
              <span>
                Showing {filteredCustomers.length} of {customers.length} customers
                {searchTerm && ` for "${searchTerm}"`}
                {filterByPlan !== 'all' && ` • ${filterByPlan} plan`}
                {filterByStatus !== 'all' && ` • ${filterByStatus} status`}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSortBy('newest');
                  setFilterByPlan('all');
                  setFilterByStatus('all');
                }}
                className="text-xs"
              >
                Clear Filters
              </Button>
            </div>
          </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>RegNum</TableHead>
              <TableHead>Make</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>RegDate</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>WarType</TableHead>
              <TableHead>Dur.</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Ref</TableHead>
              <TableHead>Email Status</TableHead>
              <TableHead>Warranties2000</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={17} className="text-center py-8">
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
                  <TableCell>{customer.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <NumberPlate plateNumber={customer.registration_plate} />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <span className={customer.vehicle_make ? 'text-gray-900' : 'text-gray-400'}>
                        {customer.vehicle_make || 'N/A'}
                      </span>
                      {!customer.vehicle_make && (
                        <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                          Missing
                        </Badge>
                      )}
                      {customer.vehicle_make && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          DVLA
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <span className={customer.vehicle_model ? 'text-gray-900' : 'text-gray-400'}>
                        {customer.vehicle_model || 'N/A'}
                      </span>
                      {!customer.vehicle_model && (
                        <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                          Missing
                        </Badge>
                      )}
                      {customer.vehicle_model && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          DVLA
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={customer.vehicle_year ? 'text-gray-900' : 'text-gray-400'}>
                      {customer.vehicle_year || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {customer.street || customer.town || customer.postcode 
                      ? `${customer.street || ''} ${customer.town || ''} ${customer.postcode || ''}`.trim()
                      : 'N/A'
                    }
                  </TableCell>
                   <TableCell>
                     <Badge variant="secondary">{getWarrantyType(customer.plan_type)}</Badge>
                   </TableCell>
                   <TableCell className="text-center">
                     <Badge variant="outline" className="font-mono">
                       {getWarrantyDuration(customer.payment_type || '')} months
                     </Badge>
                   </TableCell>
                   <TableCell className="text-center">
                     {customer.customer_policies?.[0]?.policy_start_date || customer.signup_date ? (
                       <div className="text-sm">
                         {format(
                           calculateExpiryDate(
                             customer.customer_policies?.[0]?.policy_start_date || customer.signup_date,
                             getWarrantyDuration(customer.payment_type || '')
                           ), 
                           'dd/MM/yyyy'
                         )}
                       </div>
                     ) : (
                       <span className="text-gray-400">N/A</span>
                     )}
                   </TableCell>
                   <TableCell>
                     <Badge variant="outline">
                       {customer.stripe_session_id ? 'Stripe' : 
                        customer.bumper_order_id ? 'Bumper' : 'N/A'}
                     </Badge>
                   </TableCell>
                  <TableCell className="font-mono text-sm">
                    {customer.warranty_reference_number || customer.warranty_number ? (
                      <div className="bg-green-50 px-2 py-1 rounded border">
                        {customer.warranty_reference_number || customer.warranty_number}
                      </div>
                    ) : (
                      <span className="text-gray-400">No Reference</span>
                    )}
                  </TableCell>
                   <TableCell>
                     <div className="flex items-center gap-2">
                       {customer.customer_policies?.[0]?.email_sent_status === 'sent' ? (
                         <Badge variant="secondary" className="bg-green-100 text-green-800">
                           <CheckCircle className="w-3 h-3 mr-1" />
                           Sent
                         </Badge>
                       ) : customer.customer_policies?.[0]?.email_sent_status === 'failed' ? (
                         <Badge variant="destructive" className="bg-red-100 text-red-800">
                           <AlertCircle className="w-3 h-3 mr-1" />
                           Failed
                         </Badge>
                       ) : (
                         <Badge variant="outline" className="bg-gray-100 text-gray-800">
                           <Clock className="w-3 h-3 mr-1" />
                           Not Sent
                         </Badge>
                       )}
                       
                       {customer.customer_policies?.[0]?.id && (
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => handleSendWelcomeEmail(customer.customer_policies[0].id, customer.id)}
                           disabled={emailSendingLoading[customer.id]?.email}
                           title="Send Welcome Email"
                           className="hover:bg-blue-50 hover:text-blue-600"
                         >
                           {emailSendingLoading[customer.id]?.email ? (
                             <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                           ) : (
                             <Send className="h-3 w-3" />
                           )}
                         </Button>
                       )}
                     </div>
                   </TableCell>
                   <TableCell>
                     <div className="flex items-center gap-2">
                       {customer.customer_policies?.[0]?.warranties_2000_status === 'sent' ? (
                         <Badge variant="secondary" className="bg-green-100 text-green-800">
                           <CheckCircle className="w-3 h-3 mr-1" />
                           Sent
                         </Badge>
                       ) : customer.customer_policies?.[0]?.warranties_2000_status === 'failed' ? (
                         <Badge variant="destructive" className="bg-red-100 text-red-800">
                           <AlertCircle className="w-3 h-3 mr-1" />
                           Failed
                         </Badge>
                       ) : (
                         <Badge variant="outline" className="bg-gray-100 text-gray-800">
                           <Clock className="w-3 h-3 mr-1" />
                           Not Sent
                         </Badge>
                       )}
                       
                       {customer.customer_policies?.[0]?.id && (
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => handleSendToWarranties2000(customer.customer_policies[0].id, customer.id)}
                           disabled={emailSendingLoading[customer.id]?.warranties2000}
                           title="Send to Warranties 2000"
                           className="hover:bg-purple-50 hover:text-purple-600"
                         >
                           {emailSendingLoading[customer.id]?.warranties2000 ? (
                             <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600"></div>
                           ) : (
                             <Send className="h-3 w-3" />
                           )}
                         </Button>
                       )}
                     </div>
                   </TableCell>
                  <TableCell>
                    <Badge variant={customer.status === 'Active' ? 'default' : 'destructive'}>
                      {customer.status}
                    </Badge>
                  </TableCell>
                   <TableCell>
                     <div className="flex space-x-2">
                        {/* DVLA Vehicle Data Refresh */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => refreshVehicleDataFromDVLA(customer.id, customer.registration_plate)}
                          disabled={dvlaLookupLoading[customer.id] || !customer.registration_plate}
                          title="Refresh Vehicle Data from DVLA"
                          className="hover:bg-green-50 hover:text-green-600"
                        >
                          {dvlaLookupLoading[customer.id] ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openCustomerDialog(customer)}
                              title="Edit Customer"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                       
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => deleteCustomer(customer.id, customer.name)}
                         className="text-red-600 hover:text-red-800 hover:bg-red-50"
                         title="Delete Customer"
                       >
                         <Trash2 className="h-4 w-4" />
                       </Button>
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
                                  
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <Label htmlFor="first_name">First Name</Label>
                                      <Input
                                        id="first_name"
                                        value={editingCustomer.first_name || ''}
                                        onChange={(e) => setEditingCustomer({
                                          ...editingCustomer,
                                          first_name: e.target.value
                                        })}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="last_name">Last Name</Label>
                                      <Input
                                        id="last_name"
                                        value={editingCustomer.last_name || ''}
                                        onChange={(e) => setEditingCustomer({
                                          ...editingCustomer,
                                          last_name: e.target.value
                                        })}
                                      />
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor="phone">Mobile Number</Label>
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
                                    <Label htmlFor="registration_plate">Vehicle Registration</Label>
                                    <Input
                                      id="registration_plate"
                                      value={editingCustomer.registration_plate || ''}
                                      onChange={(e) => setEditingCustomer({
                                        ...editingCustomer,
                                        registration_plate: e.target.value
                                      })}
                                    />
                                  </div>

                                  <div>
                                    <Label htmlFor="warranty_reference">Warranty Reference Number</Label>
                                    <Input
                                      id="warranty_reference"
                                      value={editingCustomer.warranty_reference_number || ''}
                                      readOnly
                                      className="bg-gray-50 text-gray-700"
                                      placeholder="Generated automatically"
                                    />
                                  </div>

                                  {/* Detailed Address Fields */}
                                  <div className="space-y-3 border-t pt-4">
                                    <h4 className="font-medium text-gray-900">Address Details</h4>
                                    
                                    <div>
                                      <Label htmlFor="street">Address Line 1</Label>
                                      <Input
                                        id="street"
                                        placeholder="Street address and house/building number"
                                        value={editingCustomer.street || ''}
                                        onChange={(e) => setEditingCustomer({
                                          ...editingCustomer,
                                          street: e.target.value
                                        })}
                                      />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <Label htmlFor="flat_number">Flat Number</Label>
                                        <Input
                                          id="flat_number"
                                          value={editingCustomer.flat_number || ''}
                                          onChange={(e) => setEditingCustomer({
                                            ...editingCustomer,
                                            flat_number: e.target.value
                                          })}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="building_number">Building Number</Label>
                                        <Input
                                          id="building_number"
                                          value={editingCustomer.building_number || ''}
                                          onChange={(e) => setEditingCustomer({
                                            ...editingCustomer,
                                            building_number: e.target.value
                                          })}
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <Label htmlFor="building_name">Building Name</Label>
                                      <Input
                                        id="building_name"
                                        placeholder="Apartment, flat, building name"
                                        value={editingCustomer.building_name || ''}
                                        onChange={(e) => setEditingCustomer({
                                          ...editingCustomer,
                                          building_name: e.target.value
                                        })}
                                      />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <Label htmlFor="town">Town/City</Label>
                                        <Input
                                          id="town"
                                          value={editingCustomer.town || ''}
                                          onChange={(e) => setEditingCustomer({
                                            ...editingCustomer,
                                            town: e.target.value
                                          })}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="county">County</Label>
                                        <Input
                                          id="county"
                                          value={editingCustomer.county || ''}
                                          onChange={(e) => setEditingCustomer({
                                            ...editingCustomer,
                                            county: e.target.value
                                          })}
                                        />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <Label htmlFor="postcode">Postcode</Label>
                                        <Input
                                          id="postcode"
                                          value={editingCustomer.postcode || ''}
                                          onChange={(e) => setEditingCustomer({
                                            ...editingCustomer,
                                            postcode: e.target.value
                                          })}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="country">Country</Label>
                                        <Input
                                          id="country"
                                          value={editingCustomer.country || 'United Kingdom'}
                                          onChange={(e) => setEditingCustomer({
                                            ...editingCustomer,
                                            country: e.target.value
                                          })}
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Vehicle Details */}
                                  <div className="space-y-3 border-t pt-4">
                                    <h4 className="font-medium text-gray-900">Vehicle Details</h4>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <Label htmlFor="vehicle_make">Vehicle Make</Label>
                                        <Input
                                          id="vehicle_make"
                                          value={editingCustomer.vehicle_make || ''}
                                          onChange={(e) => setEditingCustomer({
                                            ...editingCustomer,
                                            vehicle_make: e.target.value
                                          })}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="vehicle_model">Vehicle Model</Label>
                                        <Input
                                          id="vehicle_model"
                                          value={editingCustomer.vehicle_model || ''}
                                          onChange={(e) => setEditingCustomer({
                                            ...editingCustomer,
                                            vehicle_model: e.target.value
                                          })}
                                        />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                      <div>
                                        <Label htmlFor="vehicle_year">Vehicle Year</Label>
                                        <Input
                                          id="vehicle_year"
                                          value={editingCustomer.vehicle_year || ''}
                                          onChange={(e) => setEditingCustomer({
                                            ...editingCustomer,
                                            vehicle_year: e.target.value
                                          })}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="vehicle_fuel_type">Fuel Type</Label>
                                        <Input
                                          id="vehicle_fuel_type"
                                          value={editingCustomer.vehicle_fuel_type || ''}
                                          onChange={(e) => setEditingCustomer({
                                            ...editingCustomer,
                                            vehicle_fuel_type: e.target.value
                                          })}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="vehicle_transmission">Transmission</Label>
                                        <Input
                                          id="vehicle_transmission"
                                          value={editingCustomer.vehicle_transmission || ''}
                                          onChange={(e) => setEditingCustomer({
                                            ...editingCustomer,
                                            vehicle_transmission: e.target.value
                                          })}
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <Label htmlFor="mileage">Mileage</Label>
                                      <Input
                                        id="mileage"
                                        value={editingCustomer.mileage || ''}
                                        onChange={(e) => setEditingCustomer({
                                          ...editingCustomer,
                                          mileage: e.target.value
                                        })}
                                      />
                                    </div>
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
                              
                              {/* Warranty Actions Section */}
                              <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Warranty Actions</h3>
                                <WarrantyActions
                                  customerId={selectedCustomer.id}
                                  policyId={selectedCustomer.customer_policies?.[0]?.id}
                                  customerEmail={selectedCustomer.email}
                                  warrantyNumber={selectedCustomer.customer_policies?.[0]?.warranty_number}
                                  emailStatus={selectedCustomer.customer_policies?.[0]?.email_sent_status}
                                  warranties2000Status={selectedCustomer.customer_policies?.[0]?.warranties_2000_status}
                                  onActionComplete={fetchCustomers}
                                />
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
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resetCustomerPassword(customer.id, customer.email)}
                        disabled={passwordResetLoading[customer.id]}
                        title="Generate New Password"
                        className="hover:bg-orange-50 hover:text-orange-600"
                      >
                        {passwordResetLoading[customer.id] ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                        ) : (
                          <Key className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <ForwardToWarranties customer={customer} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
        </TabsContent>

        <TabsContent value="incomplete" className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search incomplete customers..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (e.target.value) {
                    const filtered = incompleteCustomers.filter(customer =>
                      customer.email.toLowerCase().includes(e.target.value.toLowerCase()) ||
                      customer.full_name?.toLowerCase().includes(e.target.value.toLowerCase()) ||
                      customer.vehicle_reg?.toLowerCase().includes(e.target.value.toLowerCase())
                    );
                    setFilteredIncompleteCustomers(filtered);
                  } else {
                    setFilteredIncompleteCustomers(incompleteCustomers);
                  }
                }}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={fetchIncompleteCustomers} 
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>

          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact Status</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Step Abandoned</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incompleteLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                        <span className="ml-2">Loading incomplete customers...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredIncompleteCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No incomplete customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIncompleteCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div 
                            className={`w-3 h-3 rounded-full ${getContactStatusColor(customer.contact_status)}`}
                            title={getContactStatusText(customer.contact_status)}
                          />
                          <span className="text-xs">
                            {getContactStatusText(customer.contact_status)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.full_name || 'Unknown'}</div>
                        </div>
                      </TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone || 'N/A'}</TableCell>
                      <TableCell>
                        <div>
                          <div>{customer.vehicle_reg || 'N/A'}</div>
                          <div className="text-xs text-gray-500">
                            {customer.vehicle_make} {customer.vehicle_model} ({customer.vehicle_year})
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {customer.plan_name || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={customer.step_abandoned === 1 ? 'destructive' : 'secondary'}>
                          Step {customer.step_abandoned}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(customer.created_at), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(customer.created_at), 'HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" title="Contact Customer">
                                <Mail className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Update Contact Status</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Contact Status</Label>
                                  <Select 
                                    defaultValue={customer.contact_status}
                                    onValueChange={(value) => {
                                      const notes = document.getElementById(`notes-${customer.id}`) as HTMLTextAreaElement;
                                      updateContactStatus(customer.id, value, notes?.value);
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="not_contacted">Not Contacted</SelectItem>
                                      <SelectItem value="contacted">Contacted</SelectItem>
                                      <SelectItem value="follow_up">Follow-up Done</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Contact Notes</Label>
                                  <Textarea
                                    id={`notes-${customer.id}`}
                                    placeholder="Add notes about contact attempt..."
                                    defaultValue={customer.contact_notes || ''}
                                    rows={3}
                                  />
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Call Customer"
                            onClick={() => window.open(`tel:${customer.phone}`)}
                            disabled={!customer.phone}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
