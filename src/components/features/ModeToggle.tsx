import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { useFeatureFlags, useAppMode } from '../../hooks/useFeatureFlags';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Stethoscope, User } from 'lucide-react';

export function ModeToggle() {
  const navigate = useNavigate();
  const appMode = useAppMode();
  const { SPORT_MODE, CABINET_MODE, GUEST_MODE } = useFeatureFlags();

  const handleModeChange = (mode: 'sport' | 'cabinet' | 'guest') => {
    if (mode === 'sport') {
      navigate('/sport/dashboard');
    } else if (mode === 'cabinet') {
      navigate('/dashboard');
    } else if (mode === 'guest') {
      navigate('/guest/dashboard');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Choisir le mode</CardTitle>
        <CardDescription>
          Sélectionnez le mode d'utilisation de l'application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mode Sport */}
        <Button
          variant={appMode === 'sport' ? 'default' : 'outline'}
          className="w-full h-20 flex flex-col items-center justify-center space-y-2"
          onClick={() => handleModeChange('sport')}
        >
          <Dumbbell className="h-8 w-8" />
          <div className="text-center">
            <div className="font-semibold">Mode Sport</div>
            <div className="text-xs opacity-75">Entraînement personnel</div>
          </div>
        </Button>

        {/* Mode Cabinet */}
        <Button
          variant={appMode === 'cabinet' ? 'default' : 'outline'}
          className="w-full h-20 flex flex-col items-center justify-center space-y-2"
          onClick={() => handleModeChange('cabinet')}
        >
          <Stethoscope className="h-8 w-8" />
          <div className="text-center">
            <div className="font-semibold">Mode Cabinet</div>
            <div className="text-xs opacity-75">Gestion de cabinet</div>
          </div>
        </Button>

        {/* Mode Guest */}
        {GUEST_MODE && (
          <Button
            variant={appMode === 'guest' ? 'default' : 'outline'}
            className="w-full h-20 flex flex-col items-center justify-center space-y-2"
            onClick={() => handleModeChange('guest')}
          >
            <User className="h-8 w-8" />
            <div className="text-center">
              <div className="font-semibold">Mode Guest</div>
              <div className="text-xs opacity-75">Accès limité</div>
            </div>
          </Button>
        )}

        {/* Informations sur les modes */}
        <div className="text-xs text-gray-500 text-center space-y-1">
          <div>
            Mode actuel:{' '}
            <strong>
              {appMode === 'sport' ? 'Sport' : 
               appMode === 'cabinet' ? 'Cabinet' : 
               appMode === 'guest' ? 'Guest' : 'Inconnu'}
            </strong>
          </div>
          <div>
            Feature flags: Sport={SPORT_MODE ? 'ON' : 'OFF'}, Cabinet=
            {CABINET_MODE ? 'ON' : 'OFF'}, Guest={GUEST_MODE ? 'ON' : 'OFF'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
