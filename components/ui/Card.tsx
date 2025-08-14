import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'solid' | 'glass';
  hover?: boolean;
  padding?: boolean;
}

export function Card({ 
  children, 
  className, 
  variant = 'default',
  hover = true,
  padding = true
}: CardProps) {
  const baseClasses = "rounded-2xl transition-all duration-150 ease-out";
  
  const variantClasses = {
    default: "bg-white border border-gray-100",
    solid: "bg-white border border-gray-100", 
    glass: "glass"
  };

  const hoverClasses = hover ? "hover:border-gray-200 hover:transform hover:translate-y-[-2px]" : "";
  const paddingClasses = padding ? "p-6" : "";

  return (
    <div 
      className={cn(
        baseClasses,
        variantClasses[variant],
        hoverClasses,
        paddingClasses,
        className
      )}
    >
      {children}
    </div>
  );
}