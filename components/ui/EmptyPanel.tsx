import { Card } from './Card';

interface EmptyPanelProps {
  icon?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyPanel({ 
  icon = "📋", 
  title, 
  description, 
  action,
  className 
}: EmptyPanelProps) {
  return (
    <Card variant="solid" className={className}>
      <div className="text-center py-8">
        <div className="text-4xl mb-4" role="img" aria-label={title}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          {title}
        </h3>
        <p className="text-neutral-600 mb-6 max-w-md mx-auto">
          {description}
        </p>
        {action && (
          <div className="flex justify-center">
            {action}
          </div>
        )}
      </div>
    </Card>
  );
}