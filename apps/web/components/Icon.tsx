export function Icon({
  name = "home",
  size = 22,
}: {
  name?: string;
  size?: number;
}) {
  const paths: Record<string, React.ReactNode> = {
    arrowRight: <path d="M4 12h16m-6-6 6 6-6 6" />,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v2" /></>,
    tool: <path d="m14 6 4 4 4-4a7 7 0 0 1-9 9L6 22l-4-4 7-7a7 7 0 0 1 9-9Z" />,
    settings: <><path d="M4 7h16M4 17h16" /><circle cx="9" cy="7" r="3" /><circle cx="15" cy="17" r="3" /></>,
    finance: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18m-5 5h2" /></>,
    logout: <><path d="M9 4H4v16h5m0-8h12m-5-5 5 5-5 5" /></>,
    eye: <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    eyeOff: <><path d="m3 3 18 18M9 5a12 12 0 0 1 3 0c7 0 10 7 10 7a17 17 0 0 1-3 4M6 6a18 18 0 0 0-4 6s3 7 10 7a12 12 0 0 0 5-1M10 10a3 3 0 0 0 4 4" /></>,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    home: (
      <>
        <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" />
        <path d="M9 21v-8h6v8" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4m10-4v4M3 11h18" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chat: <path d="M21 11a9 9 0 0 1-13 8l-5 2 2-5A9 9 0 1 1 21 11Z" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    photo: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8" cy="8" r="1" />
        <path d="m3 17 5-5 4 4 3-3 6 5" />
      </>
    ),
    bed: (
      <>
        <path d="M3 18V7m18 11v-7H3m0 5h18M7 11V7h5v4" />
      </>
    ),
    shield: (
      <>
        <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    arrow: <path d="m14 6-6 6 6 6" />,
    plus: <path d="M12 4v16M4 12h16" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.home}
    </svg>
  );
}
