import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Mail } from 'lucide-react';

interface ConfirmationSectionProps {
  firstName?: string;
  email?: string;
  policyNumber?: string;
  source?: string;
}

export const ConfirmationSection: React.FC<ConfirmationSectionProps> = ({
  firstName,
  email,
  policyNumber,
  source
}) => {
  return (
    <Card className="border-2 border-success shadow-lg bg-gradient-to-br from-success/5 to-background">
      <CardContent className="p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <CheckCircle className="w-12 h-12 text-success" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              🎉 Thanks{firstName ? `, ${firstName}` : ''}, You're All Set!
            </h1>
            <p className="text-lg text-muted-foreground mb-3">
              Your payment went through smoothly – and your warranty is now active!
            </p>
            
            {policyNumber && (
              <div className="mb-4 p-3 bg-background rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">
                  Your order reference:
                </p>
                <p className="text-xl font-bold text-foreground font-mono">
                  {policyNumber}
                </p>
              </div>
            )}
            
            {email && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm md:text-base">
                  We've sent a confirmation to <span className="font-semibold text-foreground">{email}</span> – keep an eye on your inbox.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
