import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Search, 
  RefreshCw, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  RotateCcw,
  Shield,
  Database,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface WarrantyAuditRecord {
  id: string;
  session_id: string;
  customer_email: string;
  selected_plan_name: string;
  payment_type: string;
  quoted_price: number;
  vehicle_data: any;
  customer_data: any;
  add_ons: any;
  discount_applied: any;
  verification_status: string;
  verification_errors: any;
  admin_sync_status: string;
  admin_sync_at: string | null;
  w2000_sync_status: string;
  w2000_sync_at: string | null;
  w2000_response: any;
  retry_count: number;
  last_retry_at: string | null;
  checksum: string;
  created_at: string;
  updated_at: string;
}

interface AuditStats {
  total: number;
  verified: number;
  failed: number;
  pending: number;
  adminSynced: number;
  w2000Synced: number;
}

export const WarrantyAuditTab = () => {
  const [auditRecords, setAuditRecords] = useState<WarrantyAuditRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<WarrantyAuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<WarrantyAuditRecord | null>(null);
  const [retryLoading, setRetryLoading] = useState<{ [key: string]: boolean }>({});
  const [verifyLoading, setVerifyLoading] = useState<{ [key: string]: boolean }>({});
  const [stats, setStats] = useState<AuditStats>({
    total: 0,
    verified: 0,
    failed: 0,
    pending: 0,
    adminSynced: 0,
    w2000Synced: 0
  });

  useEffect(() => {
    fetchAuditRecords();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [auditRecords, searchTerm, statusFilter]);

  const fetchAuditRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('warranty_selection_audit')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) {
        console.error('Error fetching audit records:', error);
        toast.error('Failed to fetch warranty audit records');
        return;
      }

      setAuditRecords(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching audit records:', error);
      toast.error('Failed to fetch warranty audit records');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (records: WarrantyAuditRecord[]) => {
    const stats: AuditStats = {
      total: records.length,
      verified: records.filter(r => r.verification_status === 'verified').length,
      failed: records.filter(r => r.verification_status === 'failed').length,
      pending: records.filter(r => r.verification_status === 'pending').length,
      adminSynced: records.filter(r => r.admin_sync_status === 'completed').length,
      w2000Synced: records.filter(r => r.w2000_sync_status === 'completed').length
    };
    setStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...auditRecords];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.session_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.selected_plan_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.vehicle_data?.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      switch (statusFilter) {
        case 'verified':
          filtered = filtered.filter(r => r.verification_status === 'verified');
          break;
        case 'failed':
          filtered = filtered.filter(r => r.verification_status === 'failed');
          break;
        case 'pending':
          filtered = filtered.filter(r => r.verification_status === 'pending');
          break;
        case 'sync_issues':
          filtered = filtered.filter(r => 
            r.admin_sync_status === 'failed' || r.w2000_sync_status === 'failed'
          );
          break;
        case 'high_retry':
          filtered = filtered.filter(r => r.retry_count >= 3);
          break;
      }
    }

    setFilteredRecords(filtered);
  };

  const handleVerifyRecord = async (recordId: string) => {
    try {
      setVerifyLoading({ ...verifyLoading, [recordId]: true });
      
      const { data, error } = await supabase.functions.invoke('warranty-selection-logger', {
        body: {
          action: 'verify',
          auditId: recordId
        }
      });

      if (error) {
        toast.error('Failed to verify warranty selection');
        return;
      }

      toast.success(`Verification ${data.data.status === 'valid' ? 'passed' : 'failed'}`);
      await fetchAuditRecords(); // Refresh data
    } catch (error) {
      console.error('Error verifying record:', error);
      toast.error('Failed to verify warranty selection');
    } finally {
      setVerifyLoading({ ...verifyLoading, [recordId]: false });
    }
  };

  const handleRetrySync = async (recordId: string) => {
    try {
      setRetryLoading({ ...retryLoading, [recordId]: true });
      
      const { data, error } = await supabase.functions.invoke('warranty-selection-logger', {
        body: {
          action: 'retry',
          auditId: recordId
        }
      });

      if (error) {
        toast.error('Failed to retry sync');
        return;
      }

      toast.success('Retry sync initiated');
      await fetchAuditRecords(); // Refresh data
    } catch (error) {
      console.error('Error retrying sync:', error);
      toast.error('Failed to retry sync');
    } finally {
      setRetryLoading({ ...retryLoading, [recordId]: false });
    }
  };

  const getStatusBadge = (status: string, type: 'verification' | 'sync') => {
    const variants: { [key: string]: any } = {
      verified: { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      completed: { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      failed: { variant: 'destructive', icon: XCircle, color: 'text-red-600' },
      pending: { variant: 'secondary', icon: Clock, color: 'text-yellow-600' }
    };

    const config = variants[status] || { variant: 'outline', icon: AlertTriangle, color: 'text-gray-600' };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status}
      </Badge>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warranty Selection Audit</h1>
          <p className="text-gray-600">Monitor and verify warranty selections for compliance and accuracy</p>
        </div>
        <Button onClick={fetchAuditRecords} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Admin Synced</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.adminSynced}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600">W2000 Synced</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.w2000Synced}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by email, session ID, plan name, or registration..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Records</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="failed">Verification Failed</SelectItem>
            <SelectItem value="pending">Pending Verification</SelectItem>
            <SelectItem value="sync_issues">Sync Issues</SelectItem>
            <SelectItem value="high_retry">High Retry Count</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Audit Records Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Plan & Price</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead>Admin Sync</TableHead>
              <TableHead>W2000 Sync</TableHead>
              <TableHead>Retry Count</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{record.customer_email}</div>
                    <div className="text-xs text-gray-500">
                      Session: {record.session_id.substring(0, 12)}...
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div>
                    <div className="font-medium">{record.selected_plan_name}</div>
                    <div className="text-sm text-gray-600">
                      {formatPrice(record.quoted_price)} ({record.payment_type})
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {record.vehicle_data?.registrationNumber || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {record.vehicle_data?.make} {record.vehicle_data?.model}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  {getStatusBadge(record.verification_status, 'verification')}
                  {Array.isArray(record.verification_errors) && record.verification_errors?.length > 0 && (
                    <div className="text-xs text-red-600 mt-1">
                      {record.verification_errors.length} error(s)
                    </div>
                  )}
                </TableCell>
                
                <TableCell>
                  {getStatusBadge(record.admin_sync_status, 'sync')}
                  {record.admin_sync_at && (
                    <div className="text-xs text-gray-500 mt-1">
                      {format(new Date(record.admin_sync_at), 'MMM dd, HH:mm')}
                    </div>
                  )}
                </TableCell>
                
                <TableCell>
                  {getStatusBadge(record.w2000_sync_status, 'sync')}
                  {record.w2000_sync_at && (
                    <div className="text-xs text-gray-500 mt-1">
                      {format(new Date(record.w2000_sync_at), 'MMM dd, HH:mm')}
                    </div>
                  )}
                </TableCell>
                
                <TableCell>
                  <div className="text-center">
                    {record.retry_count > 0 ? (
                      <Badge variant={record.retry_count >= 5 ? 'destructive' : 'secondary'}>
                        {record.retry_count}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="text-sm">
                    {format(new Date(record.created_at), 'MMM dd, yyyy')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(record.created_at), 'HH:mm:ss')}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRecord(record)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Warranty Selection Details</DialogTitle>
                        </DialogHeader>
                        {selectedRecord && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">Customer Information</h4>
                                <pre className="text-xs bg-gray-100 p-2 rounded">
                                  {JSON.stringify(selectedRecord.customer_data, null, 2)}
                                </pre>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Vehicle Information</h4>
                                <pre className="text-xs bg-gray-100 p-2 rounded">
                                  {JSON.stringify(selectedRecord.vehicle_data, null, 2)}
                                </pre>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Add-ons</h4>
                                <pre className="text-xs bg-gray-100 p-2 rounded">
                                  {JSON.stringify(selectedRecord.add_ons, null, 2)}
                                </pre>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Discount Applied</h4>
                                <pre className="text-xs bg-gray-100 p-2 rounded">
                                  {JSON.stringify(selectedRecord.discount_applied, null, 2)}
                                </pre>
                              </div>
                            </div>
                            
                            {selectedRecord.verification_errors?.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2 text-red-600">Verification Errors</h4>
                                <pre className="text-xs bg-red-50 p-2 rounded border border-red-200">
                                  {JSON.stringify(selectedRecord.verification_errors, null, 2)}
                                </pre>
                              </div>
                            )}
                            
                            {selectedRecord.w2000_response && (
                              <div>
                                <h4 className="font-semibold mb-2">W2000 Response</h4>
                                <pre className="text-xs bg-gray-100 p-2 rounded">
                                  {JSON.stringify(selectedRecord.w2000_response, null, 2)}
                                </pre>
                              </div>
                            )}
                            
                            <div>
                              <h4 className="font-semibold mb-2">Security Checksum</h4>
                              <div className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                                {selectedRecord.checksum}
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerifyRecord(record.id)}
                      disabled={verifyLoading[record.id]}
                    >
                      <Shield className="h-3 w-3" />
                    </Button>
                    
                    {(record.admin_sync_status === 'failed' || record.w2000_sync_status === 'failed') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRetrySync(record.id)}
                        disabled={retryLoading[record.id]}
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No audit records found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Warranty selections will appear here once customers complete purchases.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};