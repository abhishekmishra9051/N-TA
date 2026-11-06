import React from 'react';

interface NotaMarkProps {
  className?: string;
  size?: number;
}

/**
 * Compact NŌTA Brand Emblem (SVG Monogram with Architectural Macron)
 * Renders crisply at small navigation sizes (22px-28px) and large empty-state sizes (48px+).
 */
export const NotaMark: React.FC<NotaMarkProps> = ({ className = '', size = 26 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={`shrink-0 select-none ${className}`}
    >
      <rect
        width="64"
        height="64"
        rx="14"
        className="fill-[#171614] dark:fill-[#F1EEE8] transition-colors"
      />
      <rect
        x="3.5"
        y="3.5"
        width="57"
        height="57"
        rx="11"
        stroke="#B7A895"
        strokeOpacity="0.35"
        strokeWidth="1.2"
      />
      {/* Macron bar over N/Ō */}
      <rect x="19" y="14" width="26" height="3" rx="1.5" fill="#B7A895" />
      {/* Bespoke Geometric-Editorial N Monogram */}
      <path
        d="M21 47V22.5H24.8L39.2 41V22.5H43V47H39.2L24.8 28.5V47H21Z"
        className="fill-[#F1EEE8] dark:fill-[#171614] transition-colors"
      />
    </svg>
  );
};

interface NotaWordmarkProps {
  showTagline?: boolean;
  showMark?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Primary NŌTA Typographic Wordmark with custom macron proportions and optional tagline.
 */
export const NotaWordmark: React.FC<NotaWordmarkProps> = ({
  showTagline = false,
  showMark = true,
  size = 'md',
  className = '',
}) => {
  const markSize = size === 'sm' ? 22 : size === 'lg' ? 34 : 26;
  const wordmarkHeight = size === 'sm' ? 15 : size === 'lg' ? 24 : 18;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {showMark && <NotaMark size={markSize} />}
      <div className="flex flex-col justify-center">
        {/* Custom SVG Typographic Wordmark ensuring exact macron alignment across all platforms */}
        <svg
          height={wordmarkHeight}
          viewBox="0 0 132 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="NŌTA"
          className="text-[#171614] dark:text-[#F1EEE8] transition-colors"
        >
          {/* N */}
          <path
            d="M4 28V6H7.2L20.4 23V6H23.4V28H20.2L7 11V28H4Z"
            fill="currentColor"
          />
          {/* Macron above O (Ō) */}
          <rect x="39" y="1.2" width="16" height="2.3" rx="1.15" fill="#B7A895" />
          {/* O */}
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M47 6.2C40.6 6.2 35.8 10.9 35.8 17C35.8 23.1 40.6 27.8 47 27.8C53.4 27.8 58.2 23.1 58.2 17C58.2 10.9 53.4 6.2 47 6.2ZM47 9C51.6 9 54.9 12.4 54.9 17C54.9 21.6 51.6 25 47 25C42.4 25 39.1 21.6 39.1 17C39.1 12.4 42.4 9 47 9Z"
            fill="currentColor"
          />
          {/* T */}
          <path
            d="M76.2 28V8.8H68.4V6H87.2V8.8H79.4V28H76.2Z"
            fill="currentColor"
          />
          {/* A */}
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M107.6 6H110.8L120.2 28H116.8L114.4 22.2H103.8L101.4 28H98.1L107.6 6ZM104.9 19.5H113.3L109.1 9.4L104.9 19.5Z"
            fill="currentColor"
          />
        </svg>
        {showTagline && (
          <span className="mt-0.5 text-[11px] tracking-[0.02em] text-[#70685E] dark:text-[#A7A29A] font-editorial-serif italic leading-none">
            Make room for thought.
          </span>
        )}
      </div>
    </div>
  );
};
