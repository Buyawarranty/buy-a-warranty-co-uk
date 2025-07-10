
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Save, X, Upload, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface SpecialPlan {
  id: string;
  vehicle_type: string;
  name: string;
  monthly_price: number;
  yearly_price: number | null;
  two_yearly_price: number | null;
  three_yearly_price: number | null;
  coverage: string[];
  is_active: boolean;
}

const SpecialVehiclePlansTab = () => {
  const [plans, setPlans] = useState<SpecialPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<SpecialPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [coverageText, setCoverageText] = useState('');
  const { toast } = useToast();

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('special_vehicle_plans')
        .select('*')
        .order('vehicle_type');

      if (error) throw error;

      // Convert JSON coverage to string arrays
      const plansWithCoverage = data?.map(plan => ({
        ...plan,
        coverage: Array.isArray(plan.coverage) ? plan.coverage : []
      })) || [];

      setPlans(plansWithCoverage as SpecialPlan[]);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Error",
        description: "Failed to fetch special vehicle plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleEdit = (plan: SpecialPlan) => {
    setEditingPlan(plan);
    setCoverageText(plan.coverage.join('\n'));
  };

  const handleSave = async () => {
    if (!editingPlan) return;

    try {
      const coverageArray = coverageText.split('\n').filter(item => item.trim() !== '');
      
      const { error } = await supabase
        .from('special_vehicle_plans')
        .update({
          name: editingPlan.name,
          monthly_price: editingPlan.monthly_price,
          yearly_price: editingPlan.yearly_price,
          two_yearly_price: editingPlan.two_yearly_price,
          three_yearly_price: editingPlan.three_yearly_price,
          coverage: coverageArray,
          is_active: editingPlan.is_active,
        })
        .eq('id', editingPlan.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Plan updated successfully",
      });

      setEditingPlan(null);
      setCoverageText('');
      fetchPlans();
    } catch (error) {
      console.error('Error updating plan:', error);
      toast({
        title: "Error",
        description: "Failed to update plan",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingPlan(null);
    setCoverageText('');
  };

  const DocumentUploadDialog = ({ vehicleType }: { vehicleType: string }) => {
    const [file, setFile] = useState<File | null>(null);
    const [documentName, setDocumentName] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
        setDocumentName(selectedFile.name);
      }
    };

    const handleUpload = async () => {
      if (!file || !documentName) {
        toast({
          title: "Error",
          description: "Please select a file and enter a document name",
          variant: "destructive",
        });
        return;
      }

      setUploading(true);
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `documents/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('customer-documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('customer-documents')
          .getPublicUrl(filePath);

        const { error: dbError } = await supabase
          .from('customer_documents')
          .insert({
            document_name: documentName,
            file_url: publicUrl,
            file_size: file.size,
            plan_type: 'special_vehicle',
            vehicle_type: vehicleType,
          });

        if (dbError) throw dbError;

        toast({
          title: "Success",
          description: "Document uploaded successfully",
        });

        setFile(null);
        setDocumentName('');
      } catch (error) {
        console.error('Error uploading document:', error);
        toast({
          title: "Error",
          description: "Failed to upload document",
          variant: "destructive",
        });
      } finally {
        setUploading(false);
      }
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Upload PDF
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload {vehicleType} Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="documentName">Document Name</Label>
              <Input
                id="documentName"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Enter document name"
              />
            </div>
            <div>
              <Label htmlFor="file">Select PDF File</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
              />
            </div>
            <Button 
              onClick={handleUpload} 
              disabled={uploading || !file || !documentName}
              className="w-full"
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (loading) {
    return <div className="text-center py-4">Loading special vehicle plans...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Special Vehicle Plans</h2>
      </div>

      <div className="grid gap-6">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {plan.name}
                  <span className="text-sm font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {plan.vehicle_type}
                  </span>
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <DocumentUploadDialog vehicleType={plan.vehicle_type} />
                {editingPlan?.id === plan.id ? (
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => handleEdit(plan)} variant="outline" size="sm">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editingPlan?.id === plan.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Plan Name</Label>
                      <Input
                        id="name"
                        value={editingPlan.name}
                        onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="monthly_price">Monthly Price (£)</Label>
                      <Input
                        id="monthly_price"
                        type="number"
                        step="0.01"
                        value={editingPlan.monthly_price}
                        onChange={(e) => setEditingPlan({ ...editingPlan, monthly_price: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="yearly_price">Yearly Price (£)</Label>
                      <Input
                        id="yearly_price"
                        type="number"
                        step="0.01"
                        value={editingPlan.yearly_price || ''}
                        onChange={(e) => setEditingPlan({ 
                          ...editingPlan, 
                          yearly_price: e.target.value ? parseFloat(e.target.value) : null 
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="two_yearly_price">2-Year Price (£)</Label>
                      <Input
                        id="two_yearly_price"
                        type="number"
                        step="0.01"
                        value={editingPlan.two_yearly_price || ''}
                        onChange={(e) => setEditingPlan({ 
                          ...editingPlan, 
                          two_yearly_price: e.target.value ? parseFloat(e.target.value) : null 
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="three_yearly_price">3-Year Price (£)</Label>
                      <Input
                        id="three_yearly_price"
                        type="number"
                        step="0.01"
                        value={editingPlan.three_yearly_price || ''}
                        onChange={(e) => setEditingPlan({ 
                          ...editingPlan, 
                          three_yearly_price: e.target.value ? parseFloat(e.target.value) : null 
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="coverage">Coverage (one item per line)</Label>
                    <Textarea
                      id="coverage"
                      value={coverageText}
                      onChange={(e) => setCoverageText(e.target.value)}
                      rows={10}
                      placeholder="Enter coverage items, one per line"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={editingPlan.is_active}
                      onCheckedChange={(checked) => setEditingPlan({ ...editingPlan, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <strong>Monthly:</strong> £{plan.monthly_price}
                    </div>
                    <div>
                      <strong>Yearly:</strong> {plan.yearly_price ? `£${plan.yearly_price}` : 'N/A'}
                    </div>
                    <div>
                      <strong>2-Year:</strong> {plan.two_yearly_price ? `£${plan.two_yearly_price}` : 'N/A'}
                    </div>
                    <div>
                      <strong>3-Year:</strong> {plan.three_yearly_price ? `£${plan.three_yearly_price}` : 'N/A'}
                    </div>
                  </div>
                  
                  <div>
                    <strong>Status:</strong> {plan.is_active ? 'Active' : 'Inactive'}
                  </div>
                  
                  <div>
                    <strong>Coverage:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {plan.coverage.map((item, index) => (
                        <li key={index} className="text-sm">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SpecialVehiclePlansTab;
