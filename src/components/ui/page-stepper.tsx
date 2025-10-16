import * as React from "react"
import { cn } from "@/utils/cn"

export interface PageStep {
  id: string
  title: string
  description?: string
  status: 'completed' | 'current' | 'upcoming'
}

export interface PageStepperProps {
  steps: PageStep[]
  currentStep: number
  className?: string
}

export function PageStepper({ steps, currentStep, className }: PageStepperProps) {
  return (
    <nav aria-label="Progress" className={cn("w-full", className)}>
      <ol className="flex items-center justify-between">
        {steps.map((step, stepIdx) => (
          <li key={step.id} className={cn("relative", stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : "")}>
            {step.status === 'completed' ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-primary" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <svg className="h-5 w-5 text-primary-foreground" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                </div>
              </>
            ) : step.status === 'current' ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-muted" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                </div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-muted" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted bg-background">
                  <span className="h-2.5 w-2.5 rounded-full bg-muted" />
                </div>
              </>
            )}
            <div className="mt-2 text-center">
              <p className="text-sm font-medium text-foreground">{step.title}</p>
              {step.description && (
                <p className="text-xs text-muted-foreground">{step.description}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}
