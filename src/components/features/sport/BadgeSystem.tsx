
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface BadgeProps {
  type: 'achievement' | 'milestone' | 'special';
  name: string;
  description: string;
  earned: boolean;
  progress?: number;
  maxProgress?: number;
  icon?: string;
  className?: string;
}

export function Badge({
  type,
  name,
  description,
  earned,
  progress = 0,
  maxProgress = 1,
  icon = '🏆',
  className,
}: BadgeProps) {
  const progressPercentage =
    maxProgress > 0 ? (progress / maxProgress) * 100 : 0;

  const getBadgeColors = () => {
    if (earned) {
      switch (type) {
        case 'achievement':
          return 'bg-yellow-500 text-white';
        case 'milestone':
          return 'bg-blue-500 text-white';
        case 'special':
          return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
        default:
          return 'bg-gray-500 text-white';
      }
    }
    return 'bg-gray-200 text-gray-500';
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        earned ? 'scale-105 shadow-lg' : 'opacity-60',
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center text-2xl',
              getBadgeColors()
            )}
          >
            {earned ? icon : '🔒'}
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                'font-semibold text-sm',
                earned ? 'text-gray-900' : 'text-gray-500'
              )}
            >
              {name}
            </h3>
            <p
              className={cn(
                'text-xs mt-1',
                earned ? 'text-gray-600' : 'text-gray-400'
              )}
            >
              {description}
            </p>
            {!earned && maxProgress > 1 && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {progress}/{maxProgress}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface BadgeGridProps {
  badges: BadgeProps[];
  className?: string;
}

export function BadgeGrid({ badges, className }: BadgeGridProps) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-3', className)}>
      {badges.map((badge, index) => (
        <Badge key={index} {...badge} />
      ))}
    </div>
  );
}

// Alias pour BadgeSystem (compatibilité)
export const BadgeSystem = BadgeGrid;
