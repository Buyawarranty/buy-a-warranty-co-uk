import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';

interface PricingRow {
  plan_name: string;
  vehicle_type?: string;
  monthly_price: string;
  yearly_price?: string;
  two_yearly_price?: string;
  three_yearly_price?: string;
}

interface UpdateResult {
  success: number;
  errors: string[];
}

export const BulkPricingTab = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<UpdateResult | null>(null);

  const downloadTemplate = () => {
    const csvContent = `plan_name,vehicle_type,monthly_price,yearly_price,two_yearly_price,three_yearly_price
Basic,standard,29.99,299.99,599.99,899.99
Gold,standard,49.99,499.99,999.99,1499.99
Platinum,standard,79.99,799.99,1599.99,2399.99
Basic,caravan,39.99,399.99,799.99,1199.99
Gold,caravan,69.99,699.99,1399.99,2099.99`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pricing_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Template downloaded successfully');
  };

  const parseCSV = (text: string): PricingRow[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      return row as PricingRow;
    });
  };

  const validatePricingData = (data: PricingRow[]): string[] => {
    const errors: string[] = [];
    
    data.forEach((row, index) => {
      const rowNum = index + 2; // +2 because CSV starts at row 1 and we skip header
      
      if (!row.plan_name?.trim()) {
        errors.push(`Row ${rowNum}: Plan name is required`);
      }
      
      if (!row.monthly_price || isNaN(parseFloat(row.monthly_price))) {
        errors.push(`Row ${rowNum}: Valid monthly price is required`);
      }
      
      if (row.yearly_price && isNaN(parseFloat(row.yearly_price))) {
        errors.push(`Row ${rowNum}: Invalid yearly price`);
      }
      
      if (row.two_yearly_price && isNaN(parseFloat(row.two_yearly_price))) {
        errors.push(`Row ${rowNum}: Invalid two yearly price`);
      }
      
      if (row.three_yearly_price && isNaN(parseFloat(row.three_yearly_price))) {
        errors.push(`Row ${rowNum}: Invalid three yearly price`);
      }
    });
    
    return errors;
  };

  const handleFileUpload = async () => {
    if (!file) {
      toast.error('Please select a CSV file');
      return;
    }

    setUploading(true);
    setProgress(0);
    setResults(null);

    try {
      const text = await file.text();
      const pricingData = parseCSV(text);
      
      // Validate data
      const validationErrors = validatePricingData(pricingData);
      if (validationErrors.length > 0) {
        setResults({ success: 0, errors: validationErrors });
        setUploading(false);
        return;
      }

      setProgress(25);

      // Call edge function to update pricing
      const { data, error } = await supabase.functions.invoke('bulk-update-pricing', {
        body: { pricingData }
      });

      setProgress(100);

      if (error) {
        throw error;
      }

      setResults(data);
      toast.success(`Pricing updated successfully! ${data.success} plans updated.`);
      
    } catch (error) {
      console.error('Error updating pricing:', error);
      toast.error('Failed to update pricing');
      setResults({ success: 0, errors: ['Failed to process file: ' + (error as Error).message] });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Bulk Pricing Update</h2>
          <p className="text-muted-foreground">Update warranty pricing using CSV file upload</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download Template
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Download the CSV template with the correct format for updating pricing.
            </p>
            <Button onClick={downloadTemplate} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download CSV Template
            </Button>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>CSV Format:</strong>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• <strong>plan_name:</strong> Name of the plan (required)</li>
                  <li>• <strong>vehicle_type:</strong> standard, caravan, motorhome, etc.</li>
                  <li>• <strong>monthly_price:</strong> Monthly price (required)</li>
                  <li>• <strong>yearly_price:</strong> Yearly price (optional)</li>
                  <li>• <strong>two_yearly_price:</strong> Two year price (optional)</li>
                  <li>• <strong>three_yearly_price:</strong> Three year price (optional)</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Pricing File
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="csv-file">Select CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={uploading}
              />
            </div>
            
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}
            
            <Button 
              onClick={handleFileUpload} 
              disabled={!file || uploading}
              className="w-full"
            >
              {uploading ? 'Processing...' : 'Update Pricing'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {results.errors.length === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              Update Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="font-medium">Successfully Updated:</span>
                <span className="text-green-600 font-bold">{results.success}</span>
              </div>
              
              {results.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600">Errors:</h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-60 overflow-y-auto">
                    {results.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};