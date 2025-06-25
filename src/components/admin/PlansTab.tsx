
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Edit, Save, Plus, Trash2 } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';

interface Plan {
  id: string;
  name: string;
  monthly_price: number;
  coverage: Json;
  add_ons: Json;
  is_active: boolean;
}

export const PlansTab = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [newCoverageItem, setNewCoverageItem] = useState('');
  const [newAddOnItem, setNewAddOnItem] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('monthly_price', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const savePlan = async (plan: Plan) => {
    try {
      const { error } = await supabase
        .from('plans')
        .update({
          name: plan.name,
          monthly_price: plan.monthly_price,
          coverage: plan.coverage,
          add_ons: plan.add_ons,
          is_active: plan.is_active
        })
        .eq('id', plan.id);

      if (error) throw error;
      
      fetchPlans();
      setEditingPlan(null);
      toast.success('Plan updated successfully');
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('Failed to update plan');
    }
  };

  const addCoverageItem = () => {
    if (!newCoverageItem.trim() || !editingPlan) return;
    
    const currentCoverage = Array.isArray(editingPlan.coverage) ? editingPlan.coverage : [];
    setEditingPlan({
      ...editingPlan,
      coverage: [...currentCoverage, newCoverageItem]
    });
    setNewCoverageItem('');
  };

  const removeCoverageItem = (index: number) => {
    if (!editingPlan) return;
    
    const currentCoverage = Array.isArray(editingPlan.coverage) ? editingPlan.coverage : [];
    setEditingPlan({
      ...editingPlan,
      coverage: currentCoverage.filter((_, i) => i !== index)
    });
  };

  const addAddOnItem = () => {
    if (!newAddOnItem.trim() || !editingPlan) return;
    
    const currentAddOns = Array.isArray(editingPlan.add_ons) ? editingPlan.add_ons : [];
    setEditingPlan({
      ...editingPlan,
      add_ons: [...currentAddOns, newAddOnItem]
    });
    setNewAddOnItem('');
  };

  const removeAddOnItem = (index: number) => {
    if (!editingPlan) return;
    
    const currentAddOns = Array.isArray(editingPlan.add_ons) ? editingPlan.add_ons : [];
    setEditingPlan({
      ...editingPlan,
      add_ons: currentAddOns.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading plans...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Plans Management</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const coverageArray = Array.isArray(plan.coverage) ? plan.coverage : [];
          const addOnsArray = Array.isArray(plan.add_ons) ? plan.add_ons : [];
          
          return (
            <Card key={plan.id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                      £{plan.monthly_price}/month
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={plan.is_active ? "default" : "secondary"}>
                      {plan.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingPlan(plan)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit {plan.name} Plan</DialogTitle>
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
                                <label className="block text-sm font-medium mb-2">Monthly Price</label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={editingPlan.monthly_price}
                                  onChange={(e) => setEditingPlan({
                                    ...editingPlan,
                                    monthly_price: parseFloat(e.target.value)
                                  })}
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">Coverage</label>
                              <div className="space-y-2">
                                {(Array.isArray(editingPlan.coverage) ? editingPlan.coverage : []).map((item: any, index: number) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    <span className="flex-1 text-sm bg-gray-50 p-2 rounded">{item}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeCoverageItem(index)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                                <div className="flex items-center space-x-2">
                                  <Input
                                    placeholder="Add coverage item..."
                                    value={newCoverageItem}
                                    onChange={(e) => setNewCoverageItem(e.target.value)}
                                  />
                                  <Button onClick={addCoverageItem} size="sm">
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">Add-ons</label>
                              <div className="space-y-2">
                                {(Array.isArray(editingPlan.add_ons) ? editingPlan.add_ons : []).map((item: any, index: number) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    <span className="flex-1 text-sm bg-gray-50 p-2 rounded">{item}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeAddOnItem(index)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                                <div className="flex items-center space-x-2">
                                  <Input
                                    placeholder="Add add-on item..."
                                    value={newAddOnItem}
                                    onChange={(e) => setNewAddOnItem(e.target.value)}
                                  />
                                  <Button onClick={addAddOnItem} size="sm">
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="is_active"
                                checked={editingPlan.is_active}
                                onChange={(e) => setEditingPlan({
                                  ...editingPlan,
                                  is_active: e.target.checked
                                })}
                              />
                              <label htmlFor="is_active" className="text-sm font-medium">
                                Plan is active
                              </label>
                            </div>

                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setEditingPlan(null)}>
                                Cancel
                              </Button>
                              <Button onClick={() => savePlan(editingPlan)}>
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
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Coverage:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {coverageArray.slice(0, 3).map((item: any, index: number) => (
                        <li key={index} className="flex items-center">
                          <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                          {item}
                        </li>
                      ))}
                      {coverageArray.length > 3 && (
                        <li className="text-xs text-gray-500">+{coverageArray.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Add-ons:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {addOnsArray.slice(0, 2).map((item: any, index: number) => (
                        <li key={index} className="flex items-center">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                          {item}
                        </li>
                      ))}
                      {addOnsArray.length > 2 && (
                        <li className="text-xs text-gray-500">+{addOnsArray.length - 2} more</li>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
