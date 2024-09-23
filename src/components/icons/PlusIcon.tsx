import { forwardRef, SVGAttributes } from 'react'

export const PlusIcon = forwardRef<SVGSVGElement, SVGAttributes<SVGElement>>(
  function PlusIcon({ color = 'currentColor', ...props }, ref) {
    return (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
        ref={ref}
      >
        <rect x="16" y="7" width="2" height="18" rx="1" fill={color} />
        <rect
          x="26"
          y="14.9999"
          width="2"
          height="18"
          rx="1"
          transform="rotate(90 26 14.9999)"
          fill={color}
        />
      </svg>
    )
  }
)
