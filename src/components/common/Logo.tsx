// <== LOGO PROPS ==>
interface LogoProps {
  // <== CLASS NAME ==>
  className?: string;
  // <== SIZE ==>
  size?: number;
}

// <== OPENLAUNCH LOGO - SOFT CYBERPUNK (PINK & CYAN) ==>
export const Logo = ({ className = "", size = 48 }: LogoProps) => {
  // RETURNING LOGO COMPONENT
  return (
    // SVG LOGO
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* MAIN GRADIENT - PINK TO CYAN */}
        <linearGradient id="logoGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="50%" stopColor="#E879F9" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>

        {/* ACCENT GRADIENT FOR THRUST */}
        <linearGradient id="thrustGradient" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#67E8F9" />
          <stop offset="100%" stopColor="#F472B6" stopOpacity="0.3" />
        </linearGradient>
        {/* GLOW FILTER */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* ROCKET BODY - SLEEK ANGULAR DESIGN */}
      <path
        d="M32 4C32 4 24 14 24 28C24 36 26 42 28 46L32 52L36 46C38 42 40 36 40 28C40 14 32 4 32 4Z"
        fill="url(#logoGradient)"
        filter="url(#glow)"
      />
      {/* LEFT FIN */}
      <path
        d="M24 34L16 44L24 42V34Z"
        fill="url(#logoGradient)"
        opacity="0.9"
      />
      {/* RIGHT FIN */}
      <path
        d="M40 34L48 44L40 42V34Z"
        fill="url(#logoGradient)"
        opacity="0.9"
      />
      {/* ROCKET WINDOW/COCKPIT */}
      <circle
        cx="32"
        cy="24"
        r="5"
        fill="#0f172a"
        stroke="url(#logoGradient)"
        strokeWidth="1.5"
      />
      {/* INNER WINDOW HIGHLIGHT */}
      <circle cx="32" cy="24" r="3" fill="url(#thrustGradient)" opacity="0.6" />
      {/* THRUST FLAMES */}
      <path
        d="M28 52C28 52 30 58 32 62C34 58 36 52 36 52C34 54 30 54 28 52Z"
        fill="url(#thrustGradient)"
        opacity="0.9"
      />
      {/* SECONDARY FLAME */}
      <path
        d="M30 52C30 52 31 56 32 58C33 56 34 52 34 52C33 53 31 53 30 52Z"
        fill="#67E8F9"
        opacity="0.7"
      />

      {/* SPEED LINES - LEFT */}
      <line
        x1="18"
        y1="20"
        x2="12"
        y2="28"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <line
        x1="16"
        y1="26"
        x2="10"
        y2="34"
        stroke="url(#logoGradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
      {/* SPEED LINES - RIGHT */}
      <line
        x1="46"
        y1="20"
        x2="52"
        y2="28"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <line
        x1="48"
        y1="26"
        x2="54"
        y2="34"
        stroke="url(#logoGradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
};

// <== SIMPLIFIED VERSION FOR SMALL SIZES (FAVICON, NAVBAR, ETC.) ==>
export const LogoMark = ({ className = "", size = 32 }: LogoProps) => {
  // RETURNING LOGO MARK COMPONENT
  return (
    // SVG LOGO
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* MAIN GRADIENT - PINK TO CYAN */}
        <linearGradient
          id="logoMarkGradient"
          x1="0%"
          y1="100%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      {/* SIMPLIFIED ROCKET */}
      <path
        d="M16 2C16 2 12 7 12 14C12 18 13 21 14 23L16 26L18 23C19 21 20 18 20 14C20 7 16 2 16 2Z"
        fill="url(#logoMarkGradient)"
      />
      {/* LEFT FIN */}
      <path
        d="M12 17L8 22L12 21V17Z"
        fill="url(#logoMarkGradient)"
        opacity="0.85"
      />
      {/* RIGHT FIN */}
      <path
        d="M20 17L24 22L20 21V17Z"
        fill="url(#logoMarkGradient)"
        opacity="0.85"
      />
      {/* WINDOW */}
      <circle cx="16" cy="12" r="2.5" fill="#0f172a" />
      {/* THRUST */}
      <path
        d="M14 26C14 26 15 29 16 31C17 29 18 26 18 26C17 27 15 27 14 26Z"
        fill="#67E8F9"
      />
    </svg>
  );
};
