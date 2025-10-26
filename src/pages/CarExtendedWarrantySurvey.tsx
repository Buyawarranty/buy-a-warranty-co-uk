import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/SEOHead';
import pandaImage from '@/assets/panda-survey.png';

const surveySchema = z.object({
  lookingFor: z.string().min(1, 'Please select an option'),
  lookingForOther: z.string().optional(),
  hasConfusion: z.enum(['yes', 'no']),
  confusionDetails: z.string().optional(),
  confidenceLevel: z.string().min(1, 'Please select your confidence level'),
  confidenceImprovement: z.string().min(3, 'Please share what would help'),
  finalThoughts: z.string().optional(),
});

type SurveyFormData = z.infer<typeof surveySchema>;

const CarExtendedWarrantySurvey = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [showOtherInput, setShowOtherInput] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
  });

  const lookingFor = watch('lookingFor');
  const hasConfusion = watch('hasConfusion');

  React.useEffect(() => {
    setShowOtherInput(lookingFor === 'other');
  }, [lookingFor]);

  const onSubmit = async (data: SurveyFormData) => {
    console.log('Survey Response:', data);
    
    // Here you would send to your backend/admin dashboard
    // For now, we'll show a success message
    
    setSubmitted(true);
    toast({
      title: "Thanks! 🎉",
      description: "Your feedback has been sent to our team.",
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
        <SEOHead 
          title="Survey Submitted | BuyAWarranty.co.uk"
          description="Thank you for your feedback"
        />
        <div className="max-w-md w-full bg-card rounded-2xl shadow-lg p-8 text-center">
          <img 
            src={pandaImage} 
            alt="Happy Panda" 
            className="w-32 h-32 mx-auto mb-6 object-contain"
          />
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Thanks a ton! 🙌
          </h2>
          <p className="text-muted-foreground mb-6">
            Your feedback helps us build a better experience for everyone.
          </p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
      <SEOHead 
        title="Help Us Improve | BuyAWarranty.co.uk Car Extended Warranty Survey"
        description="Share your thoughts on our car warranty service. Quick 60-second survey to help us improve before launch."
        keywords="car warranty feedback, extended warranty survey, UK warranty service"
      />
      
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-card rounded-2xl shadow-lg p-6 md:p-8 mb-6 text-center">
          <img 
            src={pandaImage} 
            alt="Friendly Panda Mascot" 
            className="w-32 h-32 md:w-40 md:h-40 mx-auto mb-4 object-contain"
          />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Hey there! 👋
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            We're nearly ready to launch – mind sharing a few quick thoughts to help us improve? 
            It'll only take a minute.
          </p>
        </div>

        {/* Survey Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Question 1 */}
          <div className="bg-card rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              1. What were you hoping to find today?
            </h2>
            <RadioGroup>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem 
                    value="quote" 
                    id="quote"
                    {...register('lookingFor')}
                  />
                  <Label htmlFor="quote" className="cursor-pointer">
                    A quote for my car warranty
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem 
                    value="coverage" 
                    id="coverage"
                    {...register('lookingFor')}
                  />
                  <Label htmlFor="coverage" className="cursor-pointer">
                    Info about what's covered
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem 
                    value="help-choosing" 
                    id="help-choosing"
                    {...register('lookingFor')}
                  />
                  <Label htmlFor="help-choosing" className="cursor-pointer">
                    Help choosing the right plan
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem 
                    value="other" 
                    id="other"
                    {...register('lookingFor')}
                  />
                  <Label htmlFor="other" className="cursor-pointer">
                    Something else
                  </Label>
                </div>
              </div>
            </RadioGroup>
            
            {showOtherInput && (
              <Input
                {...register('lookingForOther')}
                placeholder="Please tell us what you were looking for"
                className="mt-4"
              />
            )}
            
            {errors.lookingFor && (
              <p className="text-destructive text-sm mt-2">{errors.lookingFor.message}</p>
            )}
          </div>

          {/* Question 2 */}
          <div className="bg-card rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              2. Did anything feel confusing or missing?
            </h2>
            <RadioGroup>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem 
                    value="yes" 
                    id="confusion-yes"
                    {...register('hasConfusion')}
                  />
                  <Label htmlFor="confusion-yes" className="cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem 
                    value="no" 
                    id="confusion-no"
                    {...register('hasConfusion')}
                  />
                  <Label htmlFor="confusion-no" className="cursor-pointer">
                    No
                  </Label>
                </div>
              </div>
            </RadioGroup>
            
            {hasConfusion === 'yes' && (
              <Textarea
                {...register('confusionDetails')}
                placeholder="If yes, what could we improve?"
                className="mt-4"
                rows={3}
              />
            )}
            
            {errors.hasConfusion && (
              <p className="text-destructive text-sm mt-2">{errors.hasConfusion.message}</p>
            )}
          </div>

          {/* Question 3 */}
          <div className="bg-card rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              3. How confident do you feel about buying a warranty from us?
            </h2>
            <RadioGroup>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem 
                    value="very" 
                    id="very-confident"
                    {...register('confidenceLevel')}
                  />
                  <Label htmlFor="very-confident" className="cursor-pointer">
                    Very confident
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem 
                    value="somewhat" 
                    id="somewhat-confident"
                    {...register('confidenceLevel')}
                  />
                  <Label htmlFor="somewhat-confident" className="cursor-pointer">
                    Somewhat confident
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem 
                    value="not-yet" 
                    id="not-confident"
                    {...register('confidenceLevel')}
                  />
                  <Label htmlFor="not-confident" className="cursor-pointer">
                    Not confident yet
                  </Label>
                </div>
              </div>
            </RadioGroup>
            
            {errors.confidenceLevel && (
              <p className="text-destructive text-sm mt-2">{errors.confidenceLevel.message}</p>
            )}
          </div>

          {/* Question 4 */}
          <div className="bg-card rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              4. What would make you feel more confident?
            </h2>
            <Textarea
              {...register('confidenceImprovement')}
              placeholder="Share your thoughts..."
              rows={4}
            />
            {errors.confidenceImprovement && (
              <p className="text-destructive text-sm mt-2">{errors.confidenceImprovement.message}</p>
            )}
          </div>

          {/* Question 5 */}
          <div className="bg-card rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              5. Final thoughts?
            </h2>
            <p className="text-muted-foreground text-sm mb-3">
              Anything else you'd like to share?
            </p>
            <Textarea
              {...register('finalThoughts')}
              placeholder="Optional feedback..."
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <div className="bg-card rounded-xl shadow-md p-6 text-center">
            <Button 
              type="submit" 
              size="lg"
              className="w-full md:w-auto px-12"
            >
              ✅ Send Feedback
            </Button>
            <p className="text-muted-foreground text-sm mt-4">
              Thanks a ton – your feedback helps us build a better experience!
            </p>
            <p className="text-muted-foreground text-xs mt-2">
              No login required • Your responses are confidential
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CarExtendedWarrantySurvey;
