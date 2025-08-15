'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

// Different animation variants for different page types
const pageVariants = {
  // Slide from right (forward navigation)
  slideRight: {
    initial: { opacity: 0, x: 30, scale: 0.98 },
    animate: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for smooth feel
      }
    },
    exit: { 
      opacity: 0, 
      x: -30, 
      scale: 0.98,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  },

  // Slide from left (back navigation)
  slideLeft: {
    initial: { opacity: 0, x: -30, scale: 0.98 },
    animate: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: { 
      opacity: 0, 
      x: 30, 
      scale: 0.98,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  },

  // Fade and scale (for home/main pages)
  fadeScale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: { 
      opacity: 0, 
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  },

  // Slide up (for practice page - feels like starting something)
  slideUp: {
    initial: { opacity: 0, y: 30, scale: 0.98 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.98,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }
};

// Route hierarchy for determining animation direction
const routeHierarchy = {
  '/': 0,          // Home
  '/dashboard': 1,  // Dashboard  
  '/practice': 2,   // Practice
  '/history': 3,    // History
  '/account': 4     // Account
};

// Get the appropriate animation variant based on route
const getAnimationVariant = (pathname: string) => {
  switch (pathname) {
    case '/':
      return 'fadeScale';
    case '/practice':
      return 'slideUp';
    case '/dashboard':
    case '/history':
    case '/account':
    default:
      return 'slideRight';
  }
};

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const variant = getAnimationVariant(pathname);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={pageVariants[variant as keyof typeof pageVariants]}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-screen"
        style={{
          // Force GPU acceleration for smooth performance
          transform: 'translateZ(0)',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden'
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Individual component animations for sections within pages
export const FadeInSection = ({ children, delay = 0, className = '' }: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }}
    className={className}
    style={{ transform: 'translateZ(0)' }}
  >
    {children}
  </motion.div>
);

export const SlideInSection = ({ 
  children, 
  direction = 'left',
  delay = 0, 
  className = '' 
}: {
  children: ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  className?: string;
}) => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'left': return { x: -30, y: 0 };
      case 'right': return { x: 30, y: 0 };
      case 'up': return { x: 0, y: 30 };
      case 'down': return { x: 0, y: -30 };
      default: return { x: -30, y: 0 };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...getInitialPosition() }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        y: 0,
        transition: {
          duration: 0.5,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      }}
      className={className}
      style={{ transform: 'translateZ(0)' }}
    >
      {children}
    </motion.div>
  );
};

// Staggered animations for lists/grids
export const StaggerContainer = ({ children, className = '' }: {
  children: ReactNode;
  className?: string;
}) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.2
        }
      }
    }}
    className={className}
    style={{ transform: 'translateZ(0)' }}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({ children, className = '' }: {
  children: ReactNode;
  className?: string;
}) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      }
    }}
    className={className}
    style={{ transform: 'translateZ(0)' }}
  >
    {children}
  </motion.div>
);

// Button hover animations
export const AnimatedButton = ({ 
  children, 
  className = '',
  whileHover = { scale: 1.02, y: -1 },
  whileTap = { scale: 0.98 },
  ...props 
}: {
  children: ReactNode;
  className?: string;
  whileHover?: any;
  whileTap?: any;
  [key: string]: any;
}) => (
  <motion.button
    whileHover={whileHover}
    whileTap={whileTap}
    transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
    className={className}
    style={{ transform: 'translateZ(0)' }}
    {...props}
  >
    {children}
  </motion.button>
);

// Loading state animation
export const LoadingSpinner = ({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`${sizeClasses[size]} border-2 border-primary-500 border-t-transparent rounded-full`}
    />
  );
};