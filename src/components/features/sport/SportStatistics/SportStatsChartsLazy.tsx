// Composant lazy pour les graphiques sport - Optimisation bundle
import { lazy, Suspense } from 'react';
import { Skeleton } from '../../../ui/skeleton';

// Lazy load du composant de graphiques
const SportStatsCharts = lazy(() => import('./SportStatsCharts').then(module => ({ default: module.SportStatsCharts })));

interface SportStatsChartsLazyProps {
  data: any;
  type: 'progression' | 'distribution' | 'rpe' | 'duration';
  height?: number;
  className?: string;
}

export function SportStatsChartsLazy(props: SportStatsChartsLazyProps) {
  return (
    <Suspense 
      fallback={
        <div className={`w-full ${props.className || ''}`}>
          <Skeleton className={`h-${props.height || 300} w-full`} />
        </div>
      }
    >
      <SportStatsCharts {...props} />
    </Suspense>
  );
}

// Lazy load pour les graphiques de comparaison
const SportComparisonCharts = lazy(() => 
  import('./SportStatsCharts').then(module => ({ 
    default: module.SportComparisonCharts 
  }))
);

interface SportComparisonChartsLazyProps {
  currentData: any;
  previousData: any;
  height?: number;
}

export function SportComparisonChartsLazy(props: SportComparisonChartsLazyProps) {
  return (
    <Suspense 
      fallback={
        <div className="w-full">
          <Skeleton className={`h-${props.height || 300} w-full`} />
        </div>
      }
    >
      <SportComparisonCharts {...props} />
    </Suspense>
  );
}
