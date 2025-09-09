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

  if (placement === 'homepage') {
    return (
      <div className={`bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 rounded-lg shadow-sm max-w-fit ${className}`}>
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
  }

  // Pricing page version - more prominent
  return (
    <div className={`bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl shadow-lg border-2 border-green-400 ${className}`}>
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Tag className="h-6 w-6 animate-bounce" />
          <h3 className="text-xl font-bold">LIMITED TIME OFFER</h3>
          <Tag className="h-6 w-6 animate-bounce" style={{ animationDelay: '0.1s' }} />
        </div>
        
        <p className="text-3xl font-black mb-2">SAVE £25</p>
        <p className="text-sm opacity-90 mb-3">on your warranty purchase</p>
        
        <div className="flex items-center justify-center gap-3">
          <div className="bg-white/20 px-4 py-2 rounded-lg border border-white/30 backdrop-blur-sm">
            <span className="text-xs opacity-80 block">Use code:</span>
            <code className="font-mono font-bold text-lg tracking-wider">{voucherCode}</code>
          </div>
          
          <Button
            onClick={copyToClipboard}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            {hasCopied ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" />
                Copy Code
              </>
            )}
          </Button>
        </div>
        
        <p className="text-xs opacity-75 mt-2">Apply at checkout to get your discount</p>
      </div>
    </div>
  );
};