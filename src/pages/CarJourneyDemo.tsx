import React, { useState, useEffect } from 'react';
import CarJourneyProgress from '@/components/CarJourneyProgress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Play, Pause } from 'lucide-react';

const CarJourneyDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= 4) {
            setIsAutoPlaying(false);
            return 1;
          }
          return prev + 1;
        });
      }, 2000);
    }

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
    setIsAutoPlaying(false);
  };

  const handleNext = () => {
    setCurrentStep(prev => Math.min(4, prev + 1));
    setIsAutoPlaying(false);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Interactive Car Journey Progress
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the animated car journey as users progress through the warranty quote process. 
            The car moves smoothly along the road with each step completion.
          </p>
        </div>

        {/* Main Animation */}
        <div className="mb-8">
          <CarJourneyProgress 
            currentStep={currentStep} 
            onStepChange={setCurrentStep}
          />
        </div>

        {/* Controls */}
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Journey Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-4 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>
              
              <Button
                variant={isAutoPlaying ? "secondary" : "default"}
                size="sm"
                onClick={toggleAutoPlay}
                className="flex items-center gap-2"
              >
                {isAutoPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Auto Play
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentStep === 4}
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="text-center text-sm text-gray-600">
              Step {currentStep} of 4
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Smooth Animations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                CSS transitions create fluid car movement along the journey path with easing effects.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Interactive Elements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Click on step buttons or use controls to navigate through the quote journey.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Visual Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Progress indicators, speed lines, and step highlighting provide clear user feedback.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CarJourneyDemo;