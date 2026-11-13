import type { SVGProps } from "react";

const base = (props: SVGProps<SVGSVGElement>) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const SearchIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const UserIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
  </svg>
);

export const CartIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6" />
    <circle cx="10" cy="20" r="1.2" />
    <circle cx="18" cy="20" r="1.2" />
  </svg>
);

export const HeartIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M12 20.5s-7.5-4.7-9.2-9.1C1.4 7.8 3.9 4.5 7.4 4.5c2 0 3.6 1 4.6 2.5 1-1.5 2.6-2.5 4.6-2.5 3.5 0 6 3.3 4.6 6.9-1.7 4.4-9.2 9.1-9.2 9.1Z" />
  </svg>
);

export const PhoneIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M5 3h3l2 5-2.5 1.5a12 12 0 0 0 6 6L15 13l5 2v3a2 2 0 0 1-2.2 2A17 17 0 0 1 3 5.2 2 2 0 0 1 5 3Z" />
  </svg>
);

export const MailIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

export const PinIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M12 21s7-5.3 7-11a7 7 0 1 0-14 0c0 5.7 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const ClockIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const FacebookIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M14 9V7.5c0-.8.3-1.5 1.6-1.5H17V3.2A20 20 0 0 0 15 3c-2.2 0-3.7 1.3-3.7 3.8V9H8v3h3.3v9h3.1v-9H17l.4-3H14Z" />
  </svg>
);

export const InstagramIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17" cy="7" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export const TwitterIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M4 4l7.1 9.2L4.4 20h2.4l5.4-5.5L16.8 20H20l-7.4-9.6L19.3 4h-2.4l-5 5.1L8 4H4Z" />
  </svg>
);

export const YoutubeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <rect x="3" y="6" width="18" height="12" rx="3.5" />
    <path d="M11 9.5 15 12 11 14.5Z" fill="currentColor" stroke="none" />
  </svg>
);

export const ArrowRightIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export const CheckIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="m4 12.5 5 5L20 6.5" />
  </svg>
);
