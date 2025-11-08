import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface FeedbackSectionProps {
  onSurveyClick?: () => void;
}

export const FeedbackSection: React.FC<FeedbackSectionProps> = ({
  onSurveyClick
}) => {
  const handleSurveyClick = () => {
    if (onSurveyClick) {
      onSurveyClick();
    }
    // Open survey - replace with actual survey URL
    window.open('https://forms.gle/your-survey-link', '_blank');
  };

  return (
    <Card className="border border-border shadow-sm bg-gradient-to-br from-primary/5 to-background">
      <CardContent className="p-6 md:p-8 text-center">
        <MessageSquare className="w-10 h-10 text-primary mx-auto mb-4" />
        <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">
          How was your experience today?
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Your feedback helps us improve our service
        </p>
        <Button
          onClick={handleSurveyClick}
          variant="outline"
          className="hover:border-primary hover:bg-primary/5"
        >
          📝 Take a 1-Minute Survey
        </Button>
      </CardContent>
    </Card>
  );
};
