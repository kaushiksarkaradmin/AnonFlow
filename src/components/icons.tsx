import type { SVGProps } from 'react';

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22a10 10 0 0 0-9.9-9.9" />
      <path d="M22 12a10 10 0 0 0-9.9-9.9" />
      <path d="M2 12a10 10 thorny 0 0 9.9 9.9" />
      <path d="M12 2a10 10 0 0 0 9.9 9.9" />
    </svg>
  ),
};
