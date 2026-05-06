interface CampusLogoProps {
  className?: string;
  size?: number;
}

export function CampusLogo({ className = '', size = 100 }: CampusLogoProps) {
  return (
    <div
      className={`bg-white flex flex-col items-center justify-center relative ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        boxShadow: '0 12px 36px -8px rgba(0,0,0,0.08)',
      }}
    >
      <div className="text-center text-slate-800 select-none">
        <span
          className="block font-extrabold tracking-widest leading-[1.2]"
          style={{ fontSize: size * 0.15 }}
        >
          CAMPUS
        </span>
        <span
          className="block font-extrabold tracking-widest leading-[1.2]"
          style={{ fontSize: size * 0.15 }}
        >
          HANJANG
        </span>
      </div>

      <div className="absolute" style={{ bottom: -size * 0.08, right: -size * 0.08 }}>
        <svg
          width={size * 0.34}
          height={size * 0.34}
          viewBox="0 0 24 24"
          style={{ filter: 'drop-shadow(0 4px 6px rgba(250,204,21,0.4))' }}
        >
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill="#FACC15"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
