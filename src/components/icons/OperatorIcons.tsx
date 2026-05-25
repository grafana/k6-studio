import { SVGAttributes } from 'react'

interface OperatorIconProps extends SVGAttributes<SVGElement> {
  size?: number
}

function OperatorIcon({
  size = 24,
  children,
  ...props
}: OperatorIconProps & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  )
}

export function IconEqual({ size, ...props }: OperatorIconProps) {
  return (
    <OperatorIcon size={size} {...props}>
      <path d="M5 10h14" />
      <path d="M5 14h14" />
    </OperatorIcon>
  )
}

export function IconEqualNot({ size, ...props }: OperatorIconProps) {
  return (
    <OperatorIcon size={size} {...props}>
      <path d="M5 10h14" />
      <path d="M5 14h14" />
      <path d="M5 19l14 -14" />
    </OperatorIcon>
  )
}

export function IconBracketsContain({ size, ...props }: OperatorIconProps) {
  return (
    <OperatorIcon size={size} {...props}>
      <path d="M7 4h-4v16h4" />
      <path d="M17 4h4v16h-4" />
      <path d="M8 16h.01" />
      <path d="M12 16h.01" />
      <path d="M16 16h.01" />
    </OperatorIcon>
  )
}

export function IconBracketsOff({ size, ...props }: OperatorIconProps) {
  return (
    <OperatorIcon size={size} {...props}>
      <path d="M5 5v15h3" />
      <path d="M16 4h3v11m0 4v1h-3" />
      <path d="M3 3l18 18" />
    </OperatorIcon>
  )
}

export function IconMathGreater({ size, ...props }: OperatorIconProps) {
  return (
    <OperatorIcon size={size} {...props}>
      <path d="M5 18l14 -6l-14 -6" />
    </OperatorIcon>
  )
}

export function IconMathLower({ size, ...props }: OperatorIconProps) {
  return (
    <OperatorIcon size={size} {...props}>
      <path d="M19 18l-14 -6l14 -6" />
    </OperatorIcon>
  )
}

export function IconMathEqualGreater({ size, ...props }: OperatorIconProps) {
  return (
    <OperatorIcon size={size} {...props}>
      <path d="M5 18l14 -4" />
      <path d="M5 14l14 -4l-14 -4" />
    </OperatorIcon>
  )
}

export function IconMathEqualLower({ size, ...props }: OperatorIconProps) {
  return (
    <OperatorIcon size={size} {...props}>
      <path d="M19 18l-14 -4" />
      <path d="M19 14l-14 -4l14 -4" />
    </OperatorIcon>
  )
}
