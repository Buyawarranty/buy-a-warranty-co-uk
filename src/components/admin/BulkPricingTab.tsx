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
  plan_type: string;
  labour_rate: string;
  voluntary_excess_amount: string;
  twelve_month_warranty_12_installments: string;
  twelve_month_warranty_original_price: string;
  twentyfour_month_warranty_12_installments: string;
  twentyfour_month_warranty_10_off: string;
  you_save: string;
  twentyfour_month_warranty_original_price: string;
  thirtysix_month_warranty_12_installments: string;
  thirtysix_month_warranty_20_off: string;
  three_year_warranty_you_save_amount: string;
  thirtysix_month_warranty_original_price: string;
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
    const csvContent = `plan_type,labour_rate,voluntary_excess_amount,twelve_month_warranty_12_installments,twelve_month_warranty_original_price,twentyfour_month_warranty_12_installments,twentyfour_month_warranty_10_off,you_save,twentyfour_month_warranty_original_price,thirtysix_month_warranty_12_installments,thirtysix_month_warranty_20_off,three_year_warranty_you_save_amount,thirtysix_month_warranty_original_price
BASIC,Up to 55 p/hr inc. VAT,No Contribution,£29,£348,£52,£626,£70,£696,£77,£919,£230,£1148
BASIC,Up to 55 p/hr inc. VAT,£50,£25,£300,£45,£540,£60,£600,£66,£792,£198,£990
BASIC,Up to 55 p/hr inc. VAT,£100,£23,£276,£41,£497,£55,£552,£61,£729,£182,£911
BASIC,Up to 55 p/hr inc. VAT,£150,£21,£252,£38,£457,£51,£510,£56,£673,£168,£841
GOLD,Up to 75 p/hr inc. VAT,No Contribution,£34,£408,£61,£734,£82,£816,£90,£1077,£269,£1346
GOLD,Up to 75 p/hr inc. VAT,£50,£31,£372,£56,£670,£74,£744,£81,£965,£241,£1206
GOLD,Up to 75 p/hr inc. VAT,£100,£27,£324,£49,£583,£65,£644,£70,£838,£210,£1050
GOLD,Up to 75 p/hr inc. VAT,£150,£25,£300,£45,£540,£60,£600,£66,£792,£198,£990
PLATINUM,Up to 100 p/hr inc. VAT,No Contribution,£36,£417,£65,£780,£87,£873,£95,£1153,£288,£1441
PLATINUM,Up to 100 p/hr inc. VAT,£50,£33,£396,£59,£713,£79,£792,£87,£1045,£261,£1307
PLATINUM,Up to 100 p/hr inc. VAT,£100,£29,£348,£52,£626,£70,£696,£77,£919,£230,£1148
PLATINUM,Up to 100 p/hr inc. VAT,£150,£27,£324,£49,£583,£65,£648,£71,£855,£214,£1069
PHEV,Up to 75 p/hr inc. VAT,No Contribution,£34,£408,£61,£734,£82,£816,£90,£1077,£269,£1346
PHEV,Up to 75 p/hr inc. VAT,£50,£31,£372,£56,£670,£74,£744,£82,£982,£246,£1228
PHEV,Up to 75 p/hr inc. VAT,£100,£27,£324,£49,£583,£65,£648,£71,£855,£214,£1069
PHEV,Up to 75 p/hr inc. VAT,£150,£27,£312,£47,£562,£62,£624,£69,£824,£206,£1030
EV,Up to 75 p/hr inc. VAT,No Contribution,£34,£408,£61,£734,£82,£816,£90,£1077,£269,£1346
EV,Up to 75 p/hr inc. VAT,£50,£31,£372,£56,£670,£74,£744,£82,£982,£246,£1228
EV,Up to 75 p/hr inc. VAT,£100,£27,£324,£49,£583,£65,£648,£71,£855,£214,£1069
EV,Up to 75 p/hr inc. VAT,£150,£27,£312,£47,£562,£62,£624,£69,£824,£206,£1030
MOTORBIKE,Up to 75 p/hr inc. VAT,No Contribution,£34,£408,£61,£734,£82,£816,£90,£1077,£269,£1346
MOTORBIKE,Up to 75 p/hr inc. VAT,£50,£31,£372,£56,£670,£74,£744,£82,£982,£246,£1228
MOTORBIKE,Up to 75 p/hr inc. VAT,£100,£27,£324,£49,£583,£65,£648,£71,£855,£214,£1069
MOTORBIKE,Up to 75 p/hr inc. VAT,£150,£27,£312,£47,£562,£62,£624,£69,£824,£206,£1030`;

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
      
      if (!row.plan_type?.trim()) {
        errors.push(`Row ${rowNum}: Plan type is required`);
      }
      
      if (!row.labour_rate?.trim()) {
        errors.push(`Row ${rowNum}: Labour rate is required`);
      }
      
      if (!row.voluntary_excess_amount?.trim()) {
        errors.push(`Row ${rowNum}: Voluntary excess amount is required`);
      }
      
      // Validate required pricing fields
      const requiredPriceFields = [
        'twelve_month_warranty_12_installments', 'twelve_month_warranty_original_price', 
        'twentyfour_month_warranty_12_installments', 'twentyfour_month_warranty_10_off', 
        'you_save', 'twentyfour_month_warranty_original_price', 
        'thirtysix_month_warranty_12_installments', 'thirtysix_month_warranty_20_off', 
        'three_year_warranty_you_save_amount', 'thirtysix_month_warranty_original_price'
      ];
      
      requiredPriceFields.forEach(field => {
        const value = (row as any)[field];
        if (!value || (typeof value === 'string' && !value.replace(/[£,]/g, '').trim())) {
          errors.push(`Row ${rowNum}: ${field.replace(/_/g, ' ')} is required`);
        }
      });
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
                <strong>CSV Format Required Columns:</strong>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• <strong>plan_type:</strong> BASIC, GOLD, PLATINUM, PHEV, EV, MOTORBIKE (required)</li>
                  <li>• <strong>labour_rate:</strong> e.g., "Up to 55 p/hr inc. VAT" (required)</li>
                  <li>• <strong>voluntary_excess_amount:</strong> e.g., "No Contribution", "£50", "£100", "£150" (required)</li>
                  <li>• <strong>twelve_month_warranty_12_installments:</strong> 12 month warranty in 12 installments (required)</li>
                  <li>• <strong>twelve_month_warranty_original_price:</strong> 12 month warranty original price (required)</li>
                  <li>• <strong>twentyfour_month_warranty_12_installments:</strong> 24 month warranty in 12 installments (required)</li>
                  <li>• <strong>twentyfour_month_warranty_10_off:</strong> 24 month warranty 10% off (required)</li>
                  <li>• <strong>you_save:</strong> You save amount (required)</li>
                  <li>• <strong>twentyfour_month_warranty_original_price:</strong> 24 month warranty original price (required)</li>
                  <li>• <strong>thirtysix_month_warranty_12_installments:</strong> 36 month warranty in 12 installments (required)</li>
                  <li>• <strong>thirtysix_month_warranty_20_off:</strong> 36 month warranty 20% off (required)</li>
                  <li>• <strong>three_year_warranty_you_save_amount:</strong> 3 year warranty you save amount (required)</li>
                  <li>• <strong>thirtysix_month_warranty_original_price:</strong> 36 month warranty original price (required)</li>
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