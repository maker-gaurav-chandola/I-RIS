import type { ReactElement } from "react";

type IconProps = { size?: number };

export function OverviewIcon({ size = 18 }: IconProps): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="2.5"
        y="2.5"
        width="6.4"
        height="6.4"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <rect
        x="11.1"
        y="2.5"
        width="6.4"
        height="6.4"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <rect
        x="2.5"
        y="11.1"
        width="6.4"
        height="6.4"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <rect
        x="11.1"
        y="11.1"
        width="6.4"
        height="6.4"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function StartIcon({ size = 18 }: IconProps): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="10"
        cy="10"
        r="7.25"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M12.6 7.4 10.9 10.9 7.4 12.6 9.1 9.1 12.6 7.4Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HistoryIcon({ size = 18 }: IconProps): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4.2 5.6A7.1 7.1 0 1 1 3 10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M3 3.1 3 5.9 5.8 5.9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 6.6V10.2L12.5 11.9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProgressIcon({ size = 18 }: IconProps): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.8 13.6 7.3 9 10.4 11.6 17.2 4.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.6 4.6h4.6v4.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
