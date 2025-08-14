import Link from 'next/link';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  icon?: string;
}

export function NavLink({ 
  href, 
  children, 
  isActive = false, 
  onClick, 
  className,
  icon 
}: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium",
        "transition-all duration-150 ease-out",
        "hover:bg-gray-50",
        isActive
          ? "bg-green-50 text-green-700 border border-green-100"
          : "text-gray-700 hover:text-gray-900",
        className
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {icon && (
        <span className="text-lg" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </Link>
  );
}