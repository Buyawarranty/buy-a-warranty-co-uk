
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Edit, Save, Plus, Trash2, Upload } from 'lucide-react';
import DocumentUpload from './DocumentUpload';

interface SpecialPlan {
  id: string;
  vehicle_type: string;
  name: string;
  monthly_price: number;
  yearly_price: number;
  two_yearly_price: number;
  three_yearly_price: number;
  coverage: string[];
  is_active: boolean;
}

export const SpecialVehiclePlansTab = () => {
  const [plans, setPlans] = useState<SpecialPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<SpecialPlan | null>(null);
  const [newCoverageItem, setNewCoverageItem] = useState('');
  const [showDocumentUpload, setShowDocumentUpload] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('special_vehicle_plans')
        .select('*')
        .order('vehicle_type', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching special plans:', error);
      toast.error('Failed to load special vehicle plans');
    } finally {
      setLoading(false);
    }
  };

  const savePlan = async (plan: SpecialPlan) => {
    try {
      const { error } = await supabase
        .from('special_vehicle_plans')
        .update({
          name: plan.name,
          monthly_price: plan.monthly_price,
          yearly_price: plan.yearly_price,
          two_yearly_price: plan.two_yearly_price,
          three_yearly_price: plan.three_yearly_price,
          coverage: plan.coverage,
          is_active: plan.is_active
        })
        .eq('id', plan.id);

      if (error) throw error;
      
      fetchPlans();
      setEditingPlan(null);
      toast.success('Special vehicle plan updated successfully');
    } catch (error) {
      console.error('Error updating special plan:', error);
      toast.error('Failed to update special vehicle plan');
    }
  };

  const addCoverageItem = () => {
    if (!newCoverageItem.trim() || !editingPlan) return;
    
    setEditingPlan({
      ...editingPlan,
      coverage: [...editingPlan.coverage, newCoverageItem.trim()]
    });
    setNewCoverageItem('');
  };

  const removeCoverageItem = (index: number) => {
    if (!editingPlan) return;
    
    setEditingPlan({
      ...editingPlan,
      coverage: editingPlan.coverage.filter((_, i) => i !== index)
    });
  };

  const updateCoverageItem = (index: number, newValue: string) => {
    if (!editingPlan) return;
    
    const updatedCoverage = [...editingPlan.coverage];
    updatedCoverage[index] = newValue;
    setEditingPlan({
      ...editingPlan,
      coverage: updatedCoverage
    });
  };

  const getVehicleTypeDisplay = (type: string) => {
    switch (type) {
      case 'EV': return 'Electric Vehicle';
      case 'PHEV': return 'Plug-in Hybrid';
      case 'MOTORBIKE': return 'Motorbike';
      default: return type;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading special vehicle plans...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Special Vehicle Plans</h2>
        <p className="text-sm text-gray-600">Manage EV, PHEV, and Motorbike warranty plans</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    {getVehicleTypeDisplay(plan.vehicle_type)}
                    <Badge variant={plan.vehicle_type === 'EV' ? 'default' : plan.vehicle_type === 'PHEV' ? 'secondary' : 'outline'}>
                      {plan.vehicle_type}
                    </Badge>
                  </CardTitle>
                  <div className="mt-2 space-y-1">
                    <p className="text-lg font-bold text-orange-600">
                      £{plan.monthly_price}/month
                    </p>
                    <p className="text-sm text-gray-600">
                      £{plan.yearly_price}/year
                    </p>
                    <p className="text-sm text-gray-600">
                      £{plan.two_yearly_price}/2 years
                    </p>
                    <p className="text-sm text-gray-600">
                      £{plan.three_yearly_price}/3 years
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={plan.is_active ? "default" : "secondary"}>
                    {plan.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDocumentUpload(plan.vehicle_type)}
                    className="hover:bg-blue-50"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingPlan(plan)}
                        className="hover:bg-orange-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit {getVehicleTypeDisplay(plan.vehicle_type)} Plan</DialogTitle>
                      </DialogHeader>
                      
                      {editingPlan && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Plan Name</label>
                              <Input
                                value={editingPlan.name}
                                onChange={(e) => setEditingPlan({
                                  ...editingPlan,
                                  name: e.target.value
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Monthly Price (£)</label>
                              <Input
                                type="number"
                                step="0.01"
                                value={editingPlan.monthly_price}
                                onChange={(e) => setEditingPlan({
                                  ...editingPlan,
                                  monthly_price: parseFloat(e.target.value) || 0
                                })}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Yearly Price (£)</label>
                              <Input
                                type="number"
                                step="0.01"
                                value={editingPlan.yearly_price || ''}
                                onChange={(e) => setEditingPlan({
                                  ...editingPlan,
                                  yearly_price: parseFloat(e.target.value) || 0
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">2 Year Price (£)</label>
                              <Input
                                type="number"
                                step="0.01"
                                value={editingPlan.two_yearly_price || ''}
                                onChange={(e) => setEditingPlan({
                                  ...editingPlan,
                                  two_yearly_price: parseFloat(e.target.value) || 0
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">3 Year Price (£)</label>
                              <Input
                                type="number"
                                step="0.01"
                                value={editingPlan.three_yearly_price || ''}
                                onChange={(e) => setEditingPlan({
                                  ...editingPlan,
                                  three_yearly_price: parseFloat(e.target.value) || 0
                                })}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-3">Coverage Features ({editingPlan.coverage.length} items)</label>
                            <div className="max-h-64 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                              <div className="space-y-2">
                                {editingPlan.coverage.map((item, index) => (
                                  <div key={index} className="flex items-center space-x-2 bg-white p-2 rounded border">
                                    <Input
                                      value={item}
                                      onChange={(e) => updateCoverageItem(index, e.target.value)}
                                      className="flex-1 text-sm"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeCoverageItem(index)}
                                      className="text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 mt-3">
                              <Input
                                placeholder="Add new coverage feature..."
                                value={newCoverageItem}
                                onChange={(e) => setNewCoverageItem(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addCoverageItem()}
                              />
                              <Button 
                                onClick={addCoverageItem} 
                                size="sm"
                                className="bg-orange-600 hover:bg-orange-700"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded">
                            <input
                              type="checkbox"
                              id="is_active"
                              checked={editingPlan.is_active}
                              onChange={(e) => setEditingPlan({
                                ...editingPlan,
                                is_active: e.target.checked
                              })}
                              className="rounded"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium">
                              Plan is active and visible to customers
                            </label>
                          </div>

                          <div className="flex justify-end space-x-3 pt-4 border-t">
                            <Button variant="outline" onClick={() => setEditingPlan(null)}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={() => savePlan(editingPlan)}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Coverage Features ({plan.coverage.length} items):</h4>
                  <div className="max-h-32 overflow-y-auto">
                    <ul className="text-sm text-gray-600 space-y-1">
                      {plan.coverage.slice(0, 5).map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                          <span className="line-clamp-1">{item}</span>
                        </li>
                      ))}
                      {plan.coverage.length > 5 && (
                        <li className="text-xs text-gray-500 font-medium">+{plan.coverage.length - 5} more features</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Document Upload Dialog */}
      {showDocumentUpload && (
        <Dialog open={!!showDocumentUpload} onOpenChange={() => setShowDocumentUpload(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload {getVehicleTypeDisplay(showDocumentUpload)} Documents</DialogTitle>
            </DialogHeader>
            <DocumentUpload 
              planType={showDocumentUpload.toLowerCase()}
              vehicleType={showDocumentUpload}
              onUploadComplete={() => {
                setShowDocumentUpload(null);
                toast.success('Document uploaded successfully');
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
