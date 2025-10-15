import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
  currentStreak: number;
  bestStreak: number;
  variant?: 'compact' | 'detailed';
  className?: string;
}

export function StreakCounter({
  currentStreak,
  bestStreak,
  variant = 'compact',
  className,
}: StreakCounterProps) {
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <span className="text-2xl">🔥</span>
        <span className="font-semibold text-lg">{currentStreak} jours</span>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        'bg-gradient-to-r from-orange-500 to-red-500 text-white',
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center space-x-2">
          <span className="text-2xl">🔥</span>
          <span>Streak Actuel</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-3xl font-bold">{currentStreak} jours</div>
        <div className="text-sm opacity-90">
          Meilleur streak: {bestStreak} jours
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div
            className="bg-white rounded-full h-2 transition-all duration-500"
            style={{
              width: `${Math.min((currentStreak / bestStreak) * 100, 100)}%`,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
