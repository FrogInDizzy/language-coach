'use client';

interface IllustrationProps {
  className?: string;
  animated?: boolean;
}

// Practice Session Empty State - Microphone with sound waves
export function PracticeEmptyIllustration({ className = "w-24 h-24", animated = true }: IllustrationProps) {
  return (
    <div className={`${className} ${animated ? 'group cursor-pointer' : ''}`}>
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r="55"
          fill="url(#practiceGradient)"
          className={animated ? "group-hover:scale-105 transition-transform duration-150" : ""}
        />
        
        {/* Sound waves */}
        <g className={animated ? "group-hover:opacity-80 transition-opacity duration-150" : ""}>
          <path
            d="M25 45C25 45 30 50 25 55"
            stroke="#22c55e"
            strokeWidth="3"
            strokeLinecap="round"
            className={animated ? "animate-pulse" : ""}
            style={{ animationDelay: '0ms' }}
          />
          <path
            d="M20 40C20 40 28 50 20 60"
            stroke="#22c55e"
            strokeWidth="2.5"
            strokeLinecap="round"
            className={animated ? "animate-pulse" : ""}
            style={{ animationDelay: '200ms' }}
          />
          <path
            d="M15 35C15 35 26 50 15 65"
            stroke="#16a34a"
            strokeWidth="2"
            strokeLinecap="round"
            className={animated ? "animate-pulse" : ""}
            style={{ animationDelay: '400ms' }}
          />
          
          {/* Right side waves */}
          <path
            d="M95 45C95 45 90 50 95 55"
            stroke="#22c55e"
            strokeWidth="3"
            strokeLinecap="round"
            className={animated ? "animate-pulse" : ""}
            style={{ animationDelay: '100ms' }}
          />
          <path
            d="M100 40C100 40 92 50 100 60"
            stroke="#22c55e"
            strokeWidth="2.5"
            strokeLinecap="round"
            className={animated ? "animate-pulse" : ""}
            style={{ animationDelay: '300ms' }}
          />
          <path
            d="M105 35C105 35 94 50 105 65"
            stroke="#16a34a"
            strokeWidth="2"
            strokeLinecap="round"
            className={animated ? "animate-pulse" : ""}
            style={{ animationDelay: '500ms' }}
          />
        </g>
        
        {/* Microphone */}
        <g className={animated ? "group-hover:scale-110 transition-transform duration-150" : ""}>
          {/* Mic body */}
          <rect
            x="50"
            y="35"
            width="20"
            height="30"
            rx="10"
            fill="#374151"
          />
          
          {/* Mic grille */}
          <rect x="52" y="40" width="16" height="2" rx="1" fill="#6b7280"/>
          <rect x="52" y="45" width="16" height="2" rx="1" fill="#6b7280"/>
          <rect x="52" y="50" width="16" height="2" rx="1" fill="#6b7280"/>
          <rect x="52" y="55" width="16" height="2" rx="1" fill="#6b7280"/>
          
          {/* Mic stand */}
          <rect x="58" y="65" width="4" height="15" fill="#374151"/>
          
          {/* Mic base */}
          <ellipse cx="60" cy="82" rx="12" ry="4" fill="#374151"/>
        </g>
        
        {/* Sparkles */}
        <g className={animated ? "group-hover:opacity-100 opacity-70 transition-opacity duration-150" : ""}>
          <circle cx="40" cy="25" r="2" fill="#fbbf24" className={animated ? "animate-pulse" : ""} style={{ animationDelay: '600ms' }}/>
          <circle cx="80" cy="30" r="1.5" fill="#f59e0b" className={animated ? "animate-pulse" : ""} style={{ animationDelay: '800ms' }}/>
          <circle cx="85" cy="20" r="1" fill="#fbbf24" className={animated ? "animate-pulse" : ""} style={{ animationDelay: '1000ms' }}/>
        </g>
        
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="practiceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dcfce7"/>
            <stop offset="100%" stopColor="#bbf7d0"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// History Empty State - Book with progress chart
export function HistoryEmptyIllustration({ className = "w-24 h-24", animated = true }: IllustrationProps) {
  return (
    <div className={`${className} ${animated ? 'group cursor-pointer' : ''}`}>
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r="55"
          fill="url(#historyGradient)"
          className={animated ? "group-hover:scale-105 transition-transform duration-150" : ""}
        />
        
        {/* Book */}
        <g className={animated ? "group-hover:scale-110 transition-transform duration-150" : ""}>
          {/* Book cover */}
          <rect x="35" y="30" width="30" height="40" rx="2" fill="#3b82f6"/>
          <rect x="65" y="30" width="20" height="40" rx="2" fill="#1d4ed8"/>
          
          {/* Book spine */}
          <rect x="65" y="30" width="4" height="40" fill="#1e40af"/>
          
          {/* Book pages */}
          <rect x="37" y="32" width="26" height="36" rx="1" fill="#ffffff"/>
          
          {/* Progress lines */}
          <rect x="40" y="38" width="15" height="1.5" rx="1" fill="#e5e7eb"/>
          <rect x="40" y="42" width="20" height="1.5" rx="1" fill="#d1d5db"/>
          <rect x="40" y="46" width="12" height="1.5" rx="1" fill="#e5e7eb"/>
          <rect x="40" y="50" width="18" height="1.5" rx="1" fill="#d1d5db"/>
        </g>
        
        {/* Chart elements */}
        <g className={animated ? "group-hover:opacity-80 transition-opacity duration-150" : ""}>
          {/* Chart bars */}
          <rect x="75" y="45" width="4" height="8" rx="1" fill="#22c55e" className={animated ? "animate-pulse" : ""} style={{ animationDelay: '0ms' }}/>
          <rect x="82" y="40" width="4" height="13" rx="1" fill="#16a34a" className={animated ? "animate-pulse" : ""} style={{ animationDelay: '200ms' }}/>
          <rect x="89" y="35" width="4" height="18" rx="1" fill="#22c55e" className={animated ? "animate-pulse" : ""} style={{ animationDelay: '400ms' }}/>
          <rect x="96" y="30" width="4" height="23" rx="1" fill="#16a34a" className={animated ? "animate-pulse" : ""} style={{ animationDelay: '600ms' }}/>
        </g>
        
        {/* Stars */}
        <g className={animated ? "group-hover:opacity-100 opacity-70 transition-opacity duration-150" : ""}>
          <path d="M25 35L27 40L32 40L28 43L29 48L25 45L21 48L22 43L18 40L23 40Z" fill="#fbbf24"/>
          <path d="M90 70L91.5 73L95 73L92.5 75L93 78L90 76L87 78L87.5 75L85 73L88.5 73Z" fill="#f59e0b" className={animated ? "animate-pulse" : ""} style={{ animationDelay: '800ms' }}/>
        </g>
        
        <defs>
          <linearGradient id="historyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dbeafe"/>
            <stop offset="100%" stopColor="#bfdbfe"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// Progress Empty State - Target with arrow
export function ProgressEmptyIllustration({ className = "w-24 h-24", animated = true }: IllustrationProps) {
  return (
    <div className={`${className} ${animated ? 'group cursor-pointer' : ''}`}>
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r="55"
          fill="url(#progressGradient)"
          className={animated ? "group-hover:scale-105 transition-transform duration-150" : ""}
        />
        
        {/* Target */}
        <g className={animated ? "group-hover:scale-110 transition-transform duration-150" : ""}>
          {/* Outer ring */}
          <circle cx="60" cy="60" r="25" fill="none" stroke="#ef4444" strokeWidth="3"/>
          {/* Middle ring */}
          <circle cx="60" cy="60" r="18" fill="none" stroke="#f97316" strokeWidth="2.5"/>
          {/* Inner ring */}
          <circle cx="60" cy="60" r="11" fill="none" stroke="#eab308" strokeWidth="2"/>
          {/* Bullseye */}
          <circle cx="60" cy="60" r="5" fill="#22c55e"/>
        </g>
        
        {/* Arrow */}
        <g className={animated ? "group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-150" : ""}>
          {/* Arrow shaft */}
          <rect x="20" y="59" width="30" height="2" fill="#374151" transform="rotate(-10 35 60)"/>
          
          {/* Arrow head */}
          <path
            d="M48 55L55 60L48 65L50 60Z"
            fill="#374151"
            transform="rotate(-10 52 60)"
          />
          
          {/* Arrow fletching */}
          <path
            d="M22 57L28 55L28 58L25 60L28 62L28 65L22 63Z"
            fill="#dc2626"
            transform="rotate(-10 25 60)"
          />
        </g>
        
        {/* Achievement badges */}
        <g className={animated ? "group-hover:opacity-100 opacity-70 transition-opacity duration-150" : ""}>
          <circle cx="25" cy="25" r="8" fill="#fbbf24"/>
          <text x="25" y="30" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">1</text>
          
          <circle cx="95" cy="35" r="6" fill="#10b981" className={animated ? "animate-pulse" : ""} style={{ animationDelay: '300ms' }}/>
          <text x="95" y="39" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">3</text>
          
          <circle cx="90" cy="85" r="7" fill="#3b82f6" className={animated ? "animate-pulse" : ""} style={{ animationDelay: '600ms' }}/>
          <text x="90" y="90" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">5</text>
        </g>
        
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7"/>
            <stop offset="100%" stopColor="#fde68a"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// Generic Empty State - Rocket launch
export function GenericEmptyIllustration({ className = "w-24 h-24", animated = true }: IllustrationProps) {
  return (
    <div className={`${className} ${animated ? 'group cursor-pointer' : ''}`}>
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r="55"
          fill="url(#genericGradient)"
          className={animated ? "group-hover:scale-105 transition-transform duration-150" : ""}
        />
        
        {/* Rocket */}
        <g className={animated ? "group-hover:-translate-y-2 transition-transform duration-150" : ""}>
          {/* Rocket body */}
          <ellipse cx="60" cy="50" rx="8" ry="20" fill="#3b82f6"/>
          
          {/* Rocket nose */}
          <path d="M52 30L60 20L68 30Z" fill="#1d4ed8"/>
          
          {/* Rocket fins */}
          <path d="M52 65L48 75L52 70Z" fill="#1e40af"/>
          <path d="M68 65L72 75L68 70Z" fill="#1e40af"/>
          
          {/* Rocket window */}
          <circle cx="60" cy="45" r="4" fill="#60a5fa"/>
          
          {/* Flames */}
          <g className={animated ? "animate-pulse" : ""}>
            <ellipse cx="60" cy="75" rx="6" ry="8" fill="#ef4444"/>
            <ellipse cx="60" cy="78" rx="4" ry="6" fill="#f97316"/>
            <ellipse cx="60" cy="80" rx="2" ry="4" fill="#fbbf24"/>
          </g>
        </g>
        
        {/* Stars */}
        <g className={animated ? "group-hover:opacity-100 opacity-60 transition-opacity duration-150" : ""}>
          <circle cx="25" cy="30" r="2" fill="#fbbf24" className={animated ? "animate-pulse" : ""} style={{ animationDelay: '0ms' }}/>
          <circle cx="85" cy="25" r="1.5" fill="#f59e0b" className={animated ? "animate-pulse" : ""} style={{ animationDelay: '400ms' }}/>
          <circle cx="90" cy="45" r="1" fill="#fbbf24" className={animated ? "animate-pulse" : ""} style={{ animationDelay: '800ms' }}/>
          <circle cx="30" cy="75" r="1.5" fill="#f59e0b" className={animated ? "animate-pulse" : ""} style={{ animationDelay: '1200ms' }}/>
          <circle cx="20" cy="55" r="1" fill="#fbbf24" className={animated ? "animate-pulse" : ""} style={{ animationDelay: '600ms' }}/>
        </g>
        
        {/* Cloud trail */}
        <g className={animated ? "group-hover:opacity-80 transition-opacity duration-150" : ""}>
          <circle cx="45" cy="85" r="3" fill="#e5e7eb" className={animated ? "animate-pulse" : ""} style={{ animationDelay: '200ms' }}/>
          <circle cx="35" cy="88" r="2" fill="#d1d5db" className={animated ? "animate-pulse" : ""} style={{ animationDelay: '600ms' }}/>
          <circle cx="25" cy="90" r="1.5" fill="#e5e7eb" className={animated ? "animate-pulse" : ""} style={{ animationDelay: '1000ms' }}/>
        </g>
        
        <defs>
          <linearGradient id="genericGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0e7ff"/>
            <stop offset="100%" stopColor="#c7d2fe"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// Focus Areas Empty State - Magnifying glass with target
export function FocusAreasEmptyIllustration({ className = "w-16 h-16", animated = true }: IllustrationProps) {
  return (
    <div className={`${className} ${animated ? 'group cursor-pointer' : ''}`}>
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Background circle */}
        <circle
          cx="40"
          cy="40"
          r="38"
          fill="url(#focusGradient)"
          className={animated ? "group-hover:scale-105 transition-transform duration-150" : ""}
        />
        
        {/* Magnifying glass */}
        <g className={animated ? "group-hover:scale-110 transition-transform duration-150" : ""}>
          {/* Glass lens */}
          <circle cx="32" cy="32" r="15" fill="none" stroke="#374151" strokeWidth="3"/>
          
          {/* Glass handle */}
          <rect x="43" y="43" width="3" height="12" fill="#374151" transform="rotate(45 45 49)"/>
          
          {/* Target inside lens */}
          <circle cx="32" cy="32" r="8" fill="none" stroke="#22c55e" strokeWidth="2"/>
          <circle cx="32" cy="32" r="4" fill="none" stroke="#16a34a" strokeWidth="1.5"/>
          <circle cx="32" cy="32" r="2" fill="#22c55e"/>
        </g>
        
        <defs>
          <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7"/>
            <stop offset="100%" stopColor="#fde68a"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}