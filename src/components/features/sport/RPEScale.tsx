
import { cn } from '@/lib/utils';

interface RPEScaleProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  showLabels?: boolean;
  className?: string;
}

const RPE_LABELS = [
  'Très facile',
  'Facile',
  'Modéré',
  'Un peu difficile',
  'Difficile',
  'Très difficile',
  'Extrêmement difficile',
  'Maximal',
  'Presque maximal',
  'Maximal absolu',
];

const RPE_COLORS = [
  'bg-green-500', // 1-2
  'bg-green-400', // 1-2
  'bg-lime-500', // 3-4
  'bg-lime-400', // 3-4
  'bg-yellow-500', // 5-6
  'bg-yellow-400', // 5-6
  'bg-orange-500', // 7-8
  'bg-orange-400', // 7-8
  'bg-red-500', // 9-10
  'bg-red-400', // 9-10
];

export function RPEScale({
  value,
  onChange,
  label = 'RPE (Rate of Perceived Exertion)',
  showLabels = true,
  className,
}: RPEScaleProps) {
  const getColor = (index: number) => {
    if (index < value) {
      return RPE_COLORS[index] || 'bg-gray-400';
    }
    return 'bg-gray-200';
  };

  const getTextColor = (index: number) => {
    if (index < value) {
      return 'text-white';
    }
    return 'text-gray-500';
  };

  return (
    <div className={cn('space-y-4', className)}>
      {label && (
        <div className="text-sm font-medium text-gray-700">{label}</div>
      )}

      <div className="flex space-x-1">
        {Array.from({ length: 10 }, (_, index) => (
          <button
            key={index}
            onClick={() => onChange(index + 1)}
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 hover:scale-110',
              getColor(index),
              getTextColor(index),
              value === index + 1 ? 'ring-2 ring-blue-500 ring-offset-2' : ''
            )}
            aria-label={`RPE ${index + 1}: ${RPE_LABELS[index]}`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {showLabels && (
        <div className="text-center">
          <div className="text-sm font-medium text-gray-700">
            {value > 0 ? RPE_LABELS[value - 1] : 'Sélectionnez un niveau'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {value > 0 ? `${value}/10` : ''}
          </div>
        </div>
      )}
    </div>
  );
}

interface PainScaleProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  className?: string;
}

const PAIN_LABELS = [
  'Aucune douleur',
  'Douleur très légère',
  'Douleur légère',
  'Douleur modérée',
  'Douleur importante',
  'Douleur forte',
  'Douleur très forte',
  'Douleur intense',
  'Douleur très intense',
  'Douleur insupportable',
];

export function PainScale({
  value,
  onChange,
  label = 'Niveau de douleur',
  className,
}: PainScaleProps) {
  const getColor = (index: number) => {
    if (index < value) {
      return 'bg-red-500';
    }
    return 'bg-gray-200';
  };

  const getTextColor = (index: number) => {
    if (index < value) {
      return 'text-white';
    }
    return 'text-gray-500';
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="text-sm font-medium text-gray-700">{label}</div>

      <div className="flex space-x-1">
        {Array.from({ length: 10 }, (_, index) => (
          <button
            key={index}
            onClick={() => onChange(index + 1)}
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 hover:scale-110',
              getColor(index),
              getTextColor(index),
              value === index + 1 ? 'ring-2 ring-red-500 ring-offset-2' : ''
            )}
            aria-label={`Douleur ${index + 1}: ${PAIN_LABELS[index]}`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <div className="text-center">
        <div className="text-sm font-medium text-gray-700">
          {value > 0 ? PAIN_LABELS[value - 1] : 'Sélectionnez un niveau'}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {value > 0 ? `${value}/10` : ''}
        </div>
      </div>
    </div>
  );
}
