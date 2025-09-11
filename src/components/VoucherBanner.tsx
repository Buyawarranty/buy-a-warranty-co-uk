import React, { useState } from 'react';
import { Copy, Check, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface VoucherBannerProps {
  placement?: 'homepage' | 'pricing';
  className?: string;
}

export const VoucherBanner: React.FC<VoucherBannerProps> = ({ 
  placement = 'homepage',
  className = '' 
}) => {
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();
  
  const voucherCode = 'SAVE25NOW';
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(voucherCode);
      setHasCopied(true);
      toast({
        title: "Copied!",
        description: "Voucher code copied to clipboard",
      });
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the code manually",
        variant: "destructive"
      });
    }
  };

  // Use compact style for both placements
  return (
    <div className={`bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-lg shadow-sm max-w-fit ${className}`}>
      <div className="flex items-center gap-2">
        <Tag className="h-3 w-3" />
        <span className="text-xs font-medium">£25 OFF</span>
        <span className="text-xs opacity-90">•</span>
        <code className="text-xs font-mono font-bold">{voucherCode}</code>
        <Button
          onClick={copyToClipboard}
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 text-white hover:bg-white/20"
        >
          {hasCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
    </div>
  );
};