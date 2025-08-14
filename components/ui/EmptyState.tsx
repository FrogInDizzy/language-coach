'use client';

import Link from 'next/link';
import {
  PracticeEmptyIllustration,
  HistoryEmptyIllustration,
  ProgressEmptyIllustration,
  GenericEmptyIllustration,
  FocusAreasEmptyIllustration
} from '@/components/illustrations/EmptyStateIllustrations';

type EmptyStateType = 'practice' | 'history' | 'progress' | 'focus-areas' | 'trends' | 'accuracy' | 'generic';

interface ActionButton {
  label: string;
  href?: string;
  onClick?: () => void;
  variant: 'primary' | 'secondary';
}

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  actions?: ActionButton[];
  className?: string;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

// Motivational copy for each empty state type
const getDefaultContent = (type: EmptyStateType) => {
  switch (type) {
    case 'practice':
      return {
        title: "Your journey starts here—one tap, one minute.",
        description: "Every fluent speaker started with their first word. Take that step and discover how quickly you can improve."
      };
    
    case 'history':
      return {
        title: "Your story begins with your first session.",
        description: "Start practicing to build a history of progress that will motivate and inspire your learning journey."
      };
      
    case 'progress':
      return {
        title: "Progress awaits your first practice.",
        description: "Watch your skills grow with each session. Your improvement graph starts with one conversation."
      };
      
    case 'focus-areas':
      return {
        title: "Ready to discover your strengths?",
        description: "Complete practice sessions to identify your focus areas and accelerate your improvement."
      };
      
    case 'trends':
      return {
        title: "Your improvement trends start here.",
        description: "Practice more to see how you're growing stronger in different areas over time."
      };
      
    case 'accuracy':
      return {
        title: "Track your accuracy journey.",
        description: "Start practicing to measure and celebrate your speaking precision improvements."
      };
      
    default:
      return {
        title: "Ready to begin your adventure?",
        description: "Great things start with small steps. Take yours today and see where it leads."
      };
  }
};

// Default actions for each type
const getDefaultActions = (type: EmptyStateType): ActionButton[] => {
  switch (type) {
    case 'practice':
      return [
        { label: "Start First Session", href: "/practice", variant: "primary" },
        { label: "Learn More", href: "/dashboard", variant: "secondary" }
      ];
      
    case 'history':
      return [
        { label: "Start Practicing", href: "/practice", variant: "primary" },
        { label: "Go to Dashboard", href: "/dashboard", variant: "secondary" }
      ];
      
    case 'progress':
    case 'focus-areas':
    case 'trends':
    case 'accuracy':
      return [
        { label: "Start First Session", href: "/practice", variant: "primary" }
      ];
      
    default:
      return [
        { label: "Get Started", href: "/practice", variant: "primary" }
      ];
  }
};

// Illustration component mapping
const getIllustration = (type: EmptyStateType, size: string, animated: boolean) => {
  const sizeMap = {
    small: "w-16 h-16",
    medium: "w-20 h-20",
    large: "w-24 h-24"
  };
  
  const className = sizeMap[size as keyof typeof sizeMap] || sizeMap.medium;
  
  switch (type) {
    case 'practice':
      return <PracticeEmptyIllustration className={className} animated={animated} />;
    case 'history':
      return <HistoryEmptyIllustration className={className} animated={animated} />;
    case 'progress':
      return <ProgressEmptyIllustration className={className} animated={animated} />;
    case 'focus-areas':
      return <FocusAreasEmptyIllustration className={className} animated={animated} />;
    case 'trends':
    case 'accuracy':
      return <ProgressEmptyIllustration className={className} animated={animated} />;
    default:
      return <GenericEmptyIllustration className={className} animated={animated} />;
  }
};

export function EmptyState({
  type,
  title,
  description,
  actions,
  className = "",
  size = "medium",
  animated = true
}: EmptyStateProps) {
  const defaultContent = getDefaultContent(type);
  const defaultActions = getDefaultActions(type);
  
  const finalTitle = title || defaultContent.title;
  const finalDescription = description || defaultContent.description;
  const finalActions = actions || defaultActions;
  
  const containerPadding = size === 'small' ? 'py-6 px-4' : size === 'large' ? 'py-12 px-6' : 'py-8 px-4';
  const titleSize = size === 'small' ? 'text-lg' : size === 'large' ? 'text-2xl' : 'text-xl';
  const descriptionSize = size === 'small' ? 'text-sm' : 'text-base';
  
  return (
    <div className={`text-center ${containerPadding} ${className}`}>
      {/* Illustration */}
      <div className="flex justify-center mb-6">
        {getIllustration(type, size, animated)}
      </div>
      
      {/* Content */}
      <div className="space-y-4">
        <h3 className={`font-bold text-gray-900 leading-tight ${titleSize}`}>
          {finalTitle}
        </h3>
        
        <p className={`text-gray-600 leading-relaxed max-w-md mx-auto ${descriptionSize}`}>
          {finalDescription}
        </p>
        
        {/* Actions */}
        {finalActions.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            {finalActions.map((action, index) => {
              const buttonClass = action.variant === 'primary' 
                ? 'btn-accent' 
                : 'btn-secondary';
              
              const buttonContent = (
                <button className={`${buttonClass} ${size === 'small' ? 'text-sm px-4 py-2' : 'px-6 py-3'}`}>
                  {action.label}
                </button>
              );
              
              if (action.href) {
                return (
                  <Link key={index} href={action.href}>
                    {buttonContent}
                  </Link>
                );
              }
              
              return (
                <div key={index} onClick={action.onClick}>
                  {buttonContent}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Specialized empty state components for common use cases
export function PracticeEmptyState(props: Omit<EmptyStateProps, 'type'>) {
  return <EmptyState {...props} type="practice" />;
}

export function HistoryEmptyState(props: Omit<EmptyStateProps, 'type'>) {
  return <EmptyState {...props} type="history" />;
}

export function ProgressEmptyState(props: Omit<EmptyStateProps, 'type'>) {
  return <EmptyState {...props} type="progress" />;
}

export function FocusAreasEmptyState(props: Omit<EmptyStateProps, 'type'>) {
  return <EmptyState {...props} type="focus-areas" />;
}

export function TrendsEmptyState(props: Omit<EmptyStateProps, 'type'>) {
  return <EmptyState {...props} type="trends" />;
}

export function AccuracyEmptyState(props: Omit<EmptyStateProps, 'type'>) {
  return <EmptyState {...props} type="accuracy" />;
}

// Card wrapper for dashboard empty states
export function EmptyStateCard({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 ${className}`}>
      {children}
    </div>
  );
}