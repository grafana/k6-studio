// Button styled to look like a text link.
export function TextButton({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      data-accent-color=""
      className="rt-Text rt-reset rt-Link rt-underline-auto"
    >
      {children}
    </button>
  )
}
