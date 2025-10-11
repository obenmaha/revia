import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface PageErrorProps {
  title?: string;
  description?: string;
  error?: Error;
  onRetry?: () => void;
  className?: string;
}

export function PageError({
  title = "Une erreur s'est produite",
  description,
  error,
  onRetry,
  className,
}: PageErrorProps) {
  return (
    <div
      className={cn(
        'flex min-h-[400px] items-center justify-center',
        className
      )}
    >
      <Alert className="max-w-md">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          {description ||
            error?.message ||
            "Une erreur inattendue s'est produite."}
        </AlertDescription>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-4"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
        )}
      </Alert>
    </div>
  );
}
