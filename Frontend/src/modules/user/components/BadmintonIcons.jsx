/**
 * Custom Badminton-themed SVG Icons
 * Replaces generic icons with sport-specific ones
 */

export const CourtIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="1.5" />
    <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
    <rect x="6" y="7" width="4" height="10" rx="1" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    <rect x="14" y="7" width="4" height="10" rx="1" stroke="currentColor" strokeWidth="1" opacity="0.5" />
  </svg>
);

export const StadiumIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M4 18V10C4 10 4 6 12 6C20 6 20 10 20 10V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <ellipse cx="12" cy="18" rx="8" ry="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 10V14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    <path d="M12 9V14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    <path d="M16 10V14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    <circle cx="12" cy="4" r="1" fill="currentColor" opacity="0.7" />
  </svg>
);

export const ShuttleCalendarIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="6" width="18" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.5" />
    <line x1="8" y1="3" x2="8" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="16" y1="3" x2="16" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Mini shuttlecock */}
    <circle cx="12" cy="14.5" r="1.5" stroke="currentColor" strokeWidth="1" />
    <line x1="12" y1="16" x2="12" y2="19" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <line x1="10.5" y1="17" x2="13.5" y2="17" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
  </svg>
);

export const RacketIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="13" cy="8" rx="6" ry="7" stroke="currentColor" strokeWidth="1.5" transform="rotate(15 13 8)" />
    <line x1="8" y1="14" x2="4" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Strings */}
    <line x1="10" y1="4" x2="10" y2="12" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
    <line x1="13" y1="3" x2="13" y2="13" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
    <line x1="16" y1="4" x2="16" y2="12" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
    <line x1="8" y1="6" x2="18" y2="6" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
    <line x1="8" y1="9" x2="18" y2="9" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
  </svg>
);

export const PlayerAvatarIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Headband */}
    <path d="M8 7.5C8 7.5 9.5 6 12 6C14.5 6 16 7.5 16 7.5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
  </svg>
);

export const ShuttlecockIcon = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 512 512"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="currentColor"
      d="M256 25.577c-29.75 0-50.618 10.68-64.973 28.623c-12.914 16.144-20.364 38.79-21.74 65.377h173.426c-1.376-26.586-8.826-49.233-21.74-65.377C306.618 36.257 285.75 25.577 256 25.577m-87 112v14h174v-14zm12.443 32l-4.802 30H176v3.994l-12.357 77.167c1.428-.63 3.16-1.226 5.207-1.283q.457-.014.935.012c.85.045 1.748.188 2.694.46c3.733 1.07 5.666 3.31 7.077 5.24c.48.654.894 1.32 1.287 1.993l3.455-21.583h23.69l-.94 14.123c.77-.11 1.58-.17 2.448-.154q.615.01 1.266.066c6.942.61 10.032 4.716 13.134 8.764c.19.248.377.51.565.766l1.568-23.565h21.327v16.658c2.24-1.575 4.94-2.658 8.643-2.658c4.105 0 6.98 1.33 9.357 3.188v-17.188h22.065l1.726 21.443c2.796-3.567 5.923-6.866 12.088-7.408c2.057-.18 3.828.007 5.41.44l-1.166-14.475h23.25l3.41 20.04c.103-.15.194-.303.303-.452c1.41-1.928 3.344-4.17 7.078-5.24c.947-.27 1.845-.414 2.695-.46q.479-.024.935-.01c2.137.06 3.942.705 5.405 1.364c.392.176.757.372 1.125.566L336 200.966v-1.39h-.236l-5.104-30H312.4l5.104 30h-17.336l-2.414-30h-18.06l2.415 30h-16.753v-30h-18v30h-16.933l1.998-30h-18.04l-2 30H194.87l4.804-30h-18.23zm10.543 48h19.2l-2 30h-22.004zm37.24 0h18.13v30H227.23l1.997-30zm36.13 0h18.203l2.413 30h-20.616zm36.26 0h18.95l5.104 30h-21.64l-2.413-30zm-92.542 81.246c-.26.187-.317.13-.615.403c-2.248 2.058-5.392 5.725-8.773 10.486c-6.76 9.522-14.636 23.43-21.718 39.035c-14.166 31.21-24.75 69.83-20.933 93.586c1.633 10.164 4.142 16.383 9.713 22.98c5.046 5.977 13.334 12.386 25.902 20.348c7.703-3.16 13.956-6.07 19.063-8.903c-6.09-7.457-9.938-16.05-12.442-25.98c-7.73-30.66 1.108-71.263 13.133-105.434a314 314 0 0 1 8.914-22.56c-1.638-4.26-3.286-8.186-4.902-11.6c-2.498-5.278-4.953-9.437-6.807-11.856c-.245-.322-.31-.274-.536-.504zm93.852 0c-.226.23-.29.182-.537.504c-1.855 2.42-4.31 6.578-6.808 11.856c-1.616 3.414-3.264 7.34-4.902 11.6a314 314 0 0 1 8.914 22.56c12.025 34.17 20.863 74.775 13.133 105.435c-2.504 9.93-6.35 18.522-12.442 25.98c5.107 2.83 11.36 5.743 19.063 8.903c12.568-7.96 20.856-14.37 25.902-20.347c5.57-6.597 8.08-12.816 9.713-22.98c3.817-23.757-6.767-62.376-20.932-93.586c-7.08-15.605-14.957-29.513-21.717-39.035c-3.38-4.76-6.525-8.428-8.772-10.486c-.297-.274-.353-.216-.614-.403zm-135.95 1.635c-1.903 1.823-4.114 4.144-6.685 7.29c-7.01 8.585-15.662 21.378-23.95 35.925c-16.576 29.093-31.543 65.874-32.223 89.785c-.508 17.885 2.766 27.703 19.418 46.533c10.897-3.552 18.163-7.016 23.65-11.34c-4.07-7.05-6.53-14.81-7.92-23.462c-5.017-31.22 7.342-70.893 22.313-103.88a317 317 0 0 1 9.96-20.047c-.554-3.766-1.154-7.28-1.798-10.41c-.892-4.343-1.857-7.72-2.765-10.392zm178.05 0c-.91 2.672-1.874 6.05-2.766 10.39c-.644 3.132-1.244 6.646-1.797 10.413a318 318 0 0 1 9.96 20.048c14.97 32.987 27.33 72.66 22.313 103.88c-1.39 8.653-3.85 16.412-7.922 23.46c5.488 4.326 12.754 7.79 23.65 11.343c16.653-18.83 19.927-28.647 19.42-46.532c-.68-23.91-15.648-60.692-32.224-89.785c-8.288-14.547-16.94-27.34-23.95-35.924c-2.572-3.148-4.783-5.47-6.685-7.292zm-96.97 9.328c-.153.258-.3.483-.454.746c-5.9 10.077-12.528 24.62-18.217 40.785c-11.378 32.33-18.54 71.73-12.658 95.06c2.516 9.983 5.562 15.958 11.69 22.042c5.55 5.51 14.366 11.172 27.583 18.003c13.217-6.83 22.034-12.493 27.584-18.004c6.127-6.085 9.173-12.06 11.69-22.042c5.882-23.332-1.28-62.73-12.66-95.06c-5.688-16.166-12.315-30.71-18.216-40.786c-.154-.263-.3-.488-.455-.746L256 465.108z"
    />
  </svg>
);

export const SmashIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M17 3L14 8L18 7L15 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="9" cy="15" r="4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5 19L3 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="13" y1="12" x2="20" y2="5" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.4" />
  </svg>
);
