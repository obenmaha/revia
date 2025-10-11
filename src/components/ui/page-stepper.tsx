import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export interface PageStep {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
  completed?: boolean;
  disabled?: boolean;
}

export interface PageStepperProps {
  steps: PageStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete?: () => void;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  showNavigation?: boolean;
  showProgress?: boolean;
}

export function PageStepper({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  className,
  headerClassName,
  contentClassName,
  showNavigation = true,
  showProgress = true,
}: PageStepperProps) {
  const canGoNext = currentStep < steps.length - 1;
  const canGoPrevious = currentStep > 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (canGoNext) {
      onStepChange(currentStep + 1);
    } else if (isLastStep) {
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (canGoPrevious) {
      onStepChange(currentStep - 1);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {showProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>
              Étape {currentStep + 1} sur {steps.length}
            </span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      <Card className={cn(headerClassName)}>
        <CardHeader>
          <CardTitle>{steps[currentStep]?.title}</CardTitle>
          {steps[currentStep]?.description && (
            <CardDescription>{steps[currentStep]?.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className={cn(contentClassName)}>
          {steps[currentStep]?.content}
        </CardContent>
      </Card>

      {showNavigation && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={!canGoPrevious}
          >
            Précédent
          </Button>
          <Button onClick={handleNext} disabled={steps[currentStep]?.disabled}>
            {isLastStep ? 'Terminer' : 'Suivant'}
          </Button>
        </div>
      )}
    </div>
  );
}
