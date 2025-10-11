// Composant de bouton de validation - Story 2.4
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSessionValidation } from '@/hooks/useSessionValidation';

interface ValidationButtonProps {
  sessionId: string;
  onValidationComplete?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

const ValidationButton: React.FC<ValidationButtonProps> = ({
  sessionId,
  onValidationComplete,
  className = '',
  size = 'lg',
  variant = 'default',
}) => {
  const {
    isValidating,
    canValidate,
    validationStats,
    validateSession,
    isLoading,
  } = useSessionValidation({ sessionId });

  const handleValidation = async () => {
    try {
      await validateSession();
      onValidationComplete?.();
    } catch (error) {
      // L'erreur est déjà gérée dans le hook
      console.error('Erreur lors de la validation:', error);
    }
  };

  const getButtonText = () => {
    if (isValidating) {
      return 'Validation en cours...';
    }
    if (validationStats.exerciseCount === 0) {
      return 'Ajoutez des exercices';
    }
    return 'Valider la session';
  };

  const getButtonIcon = () => {
    if (isValidating) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }
    if (validationStats.exerciseCount === 0) {
      return <AlertCircle className="w-4 h-4" />;
    }
    return <CheckCircle className="w-4 h-4" />;
  };

  const getButtonVariant = () => {
    if (variant === 'default') {
      if (validationStats.exerciseCount === 0) {
        return 'bg-gray-400 hover:bg-gray-500';
      }
      return 'bg-green-600 hover:bg-green-700';
    }
    return variant;
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'md':
        return 'px-4 py-2 text-base';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-6 py-3 text-lg';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Bouton principal */}
      <motion.div
        whileHover={{ scale: canValidate ? 1.02 : 1 }}
        whileTap={{ scale: canValidate ? 0.98 : 1 }}
        transition={{ duration: 0.1 }}
      >
        <Button
          onClick={handleValidation}
          disabled={!canValidate || isValidating || isLoading}
          className={`w-full font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${getSizeClasses()} ${getButtonVariant()}`}
          variant={variant}
        >
          <div className="flex items-center justify-center gap-2">
            {getButtonIcon()}
            <span>{getButtonText()}</span>
          </div>
        </Button>
      </motion.div>

      {/* Statistiques rapides */}
      {validationStats.exerciseCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-center gap-2 flex-wrap"
        >
          <Badge variant="outline" className="text-xs">
            {validationStats.exerciseCount} exercice
            {validationStats.exerciseCount > 1 ? 's' : ''}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {validationStats.totalDuration}min
          </Badge>
          <Badge variant="outline" className="text-xs">
            {validationStats.averageIntensity}/10
          </Badge>
          {validationStats.caloriesBurned > 0 && (
            <Badge variant="outline" className="text-xs">
              {validationStats.caloriesBurned} kcal
            </Badge>
          )}
        </motion.div>
      )}

      {/* Message d'état */}
      {validationStats.exerciseCount === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-gray-500"
        >
          <p>Commencez par ajouter des exercices à votre session</p>
        </motion.div>
      )}

      {isValidating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-blue-600"
        >
          <p>Validation en cours, veuillez patienter...</p>
        </motion.div>
      )}
    </div>
  );
};

export default ValidationButton;
