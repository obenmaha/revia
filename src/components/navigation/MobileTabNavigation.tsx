
import { cn } from '../../lib/utils';

export interface NavigationTab {
  id: string;
  label: string;
  icon: string;
  href: string;
}

interface MobileTabNavigationProps {
  tabs: NavigationTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function MobileTabNavigation({
  tabs,
  activeTab,
  onTabChange,
  className,
}: MobileTabNavigationProps) {
  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50',
        'safe-area-pb', // Support des devices avec encoche
        className
      )}
    >
      <div className="flex justify-around">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex flex-col items-center py-2 px-3 min-w-0 flex-1',
              'transition-colors duration-200',
              activeTab === tab.id
                ? 'text-primary border-t-2 border-primary'
                : 'text-gray-500 hover:text-gray-700'
            )}
            aria-label={tab.label}
          >
            <span className="text-xl mb-1">{tab.icon}</span>
            <span className="text-xs font-medium truncate">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
