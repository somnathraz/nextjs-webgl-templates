export function Sun({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M50 0 57 26 75 7 73 33 93 25 80 47 100 50 76 59 93 75 67 72 75 93 54 80 50 100 42 76 25 93 28 68 7 75 21 54 0 50 25 42 7 25 32 28 25 7 46 22Z" />
      <circle cx="50" cy="50" r="15" fill="var(--paper)" />
    </svg>
  );
}
