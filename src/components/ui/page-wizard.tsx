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
import { PageStepper, PageStep } from '@/components/ui/page-stepper';

export interface PageWizardProps {
  steps: PageStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete?: () => void;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  showNavigation?: boolean;
  showProgress?: boolean;
  showStepTitles?: boolean;
}

export function PageWizard({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  className,
  headerClassName,
  contentClassName,
  showNavigation = true,
  showProgress = true,
  showStepTitles = true,
}: PageWizardProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {showStepTitles && (
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Assistant</h2>
          <p className="text-muted-foreground">
            Suivez les étapes pour configurer votre compte
          </p>
        </div>
      )}

      <PageStepper
        steps={steps}
        currentStep={currentStep}
        onStepChange={onStepChange}
        onComplete={onComplete}
        headerClassName={headerClassName}
        contentClassName={contentClassName}
        showNavigation={showNavigation}
        showProgress={showProgress}
      />
    </div>
  );
}
