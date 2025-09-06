import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Download, MessageSquare, Calendar, User, Mail, Phone, Paperclip } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ClaimSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  status: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export const ClaimsTab = () => {
  const { toast } = useToast();
  const [claims, setClaims] = useState<ClaimSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<ClaimSubmission | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const { data, error } = await supabase
        .from('claims_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching claims:', error);
        toast({
          title: "Error",
          description: "Failed to fetch claims submissions",
          variant: "destructive",
        });
        return;
      }

      setClaims(data || []);
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateClaimStatus = async (claimId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('claims_submissions')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', claimId);

      if (error) {
        console.error('Error updating claim status:', error);
        toast({
          title: "Error",
          description: "Failed to update claim status",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Claim status updated successfully",
      });

      fetchClaims(); // Refresh the list
    } catch (error) {
      console.error('Error updating claim status:', error);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'new':
        return 'destructive';
      case 'in_progress':
        return 'default';
      case 'resolved':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new':
        return 'New';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      default:
        return status;
    }
  };

  const filteredClaims = claims.filter(claim => 
    statusFilter === 'all' || claim.status === statusFilter
  );

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    const mb = kb / 1024;
    return `${Math.round(mb * 100) / 100} MB`;
  };

  const downloadFile = (fileUrl: string, fileName: string) => {
    // Create download link for Supabase storage file  
    const { data } = supabase.storage
      .from('policy-documents')
      .getPublicUrl(fileUrl);
    
    const link = document.createElement('a');
    link.href = data.publicUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Claims Management</h1>
        <p className="text-gray-600 mt-2">Manage and track claim submissions from customers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{claims.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Claims</CardTitle>
            <MessageSquare className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {claims.filter(c => c.status === 'new').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <MessageSquare className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {claims.filter(c => c.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {claims.filter(c => c.status === 'resolved').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Claims</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle>Claims Submissions</CardTitle>
          <CardDescription>
            All claim submissions from the website contact form
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredClaims.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No claims found</h3>
              <p className="text-gray-600">
                {statusFilter === 'all' 
                  ? 'No claims have been submitted yet.' 
                  : `No claims with status "${getStatusLabel(statusFilter)}" found.`
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attachment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">
                            {new Date(claim.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(claim.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{claim.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <a 
                          href={`mailto:${claim.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {claim.email}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      {claim.phone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <a 
                            href={`tel:${claim.phone}`}
                            className="text-blue-600 hover:underline"
                          >
                            {claim.phone}
                          </a>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not provided</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={claim.status}
                        onValueChange={(newStatus) => updateClaimStatus(claim.id, newStatus)}
                      >
                        <SelectTrigger className="w-32">
                          <Badge variant={getStatusBadgeVariant(claim.status)}>
                            {getStatusLabel(claim.status)}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {claim.file_url && claim.file_name ? (
                        <div className="flex items-center gap-2">
                          <Paperclip className="h-4 w-4 text-gray-400" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadFile(claim.file_url!, claim.file_name!)}
                            className="p-0 h-auto font-normal text-blue-600 hover:underline"
                          >
                            {claim.file_name}
                          </Button>
                          <span className="text-xs text-gray-500">
                            ({formatFileSize(claim.file_size)})
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">No attachment</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedClaim(claim)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Claim Details</DialogTitle>
                            <DialogDescription>
                              Submitted on {new Date(claim.created_at).toLocaleString()}
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedClaim && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium text-gray-900">Name</h4>
                                  <p className="text-gray-600">{selectedClaim.name}</p>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">Email</h4>
                                  <p className="text-gray-600">
                                    <a 
                                      href={`mailto:${selectedClaim.email}`}
                                      className="text-blue-600 hover:underline"
                                    >
                                      {selectedClaim.email}
                                    </a>
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">Phone</h4>
                                  <p className="text-gray-600">
                                    {selectedClaim.phone ? (
                                      <a 
                                        href={`tel:${selectedClaim.phone}`}
                                        className="text-blue-600 hover:underline"
                                      >
                                        {selectedClaim.phone}
                                      </a>
                                    ) : 'Not provided'}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">Status</h4>
                                  <Badge variant={getStatusBadgeVariant(selectedClaim.status)}>
                                    {getStatusLabel(selectedClaim.status)}
                                  </Badge>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Message</h4>
                                <div className="bg-gray-50 p-3 rounded border">
                                  <p className="text-gray-700 whitespace-pre-wrap">
                                    {selectedClaim.message || 'No message provided'}
                                  </p>
                                </div>
                              </div>

                              {selectedClaim.file_url && selectedClaim.file_name && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Attachment</h4>
                                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                                    <div className="flex items-center gap-2">
                                      <Paperclip className="h-4 w-4 text-gray-400" />
                                      <span>{selectedClaim.file_name}</span>
                                      <span className="text-sm text-gray-500">
                                        ({formatFileSize(selectedClaim.file_size)})
                                      </span>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => downloadFile(selectedClaim.file_url!, selectedClaim.file_name!)}
                                    >
                                      <Download className="h-4 w-4 mr-1" />
                                      Download
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};