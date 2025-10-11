// Composant de breadcrumb - Story 2.6
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Home, Calendar, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav
      className={`flex items-center space-x-1 text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
            )}

            {item.isActive ? (
              <span className="flex items-center text-gray-900 font-medium">
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={item.onClick}
                className="text-gray-600 hover:text-gray-900 p-0 h-auto font-normal"
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </Button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Composant de breadcrumb spécialisé pour les sessions
interface SessionBreadcrumbProps {
  sessionName: string;
  onBackToHistory?: () => void;
  onBackToHome?: () => void;
  className?: string;
}

export const SessionBreadcrumb: React.FC<SessionBreadcrumbProps> = ({
  sessionName,
  onBackToHistory,
  onBackToHome,
  className = '',
}) => {
  const items: BreadcrumbItem[] = [
    {
      label: 'Accueil',
      icon: <Home className="w-4 h-4" />,
      onClick: onBackToHome,
    },
    {
      label: 'Historique',
      icon: <Calendar className="w-4 h-4" />,
      onClick: onBackToHistory,
    },
    {
      label: sessionName,
      icon: <Eye className="w-4 h-4" />,
      isActive: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Breadcrumb items={items} />
    </motion.div>
  );
};

export default Breadcrumb;
