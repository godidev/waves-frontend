export default function TableHeaderCell({
  children,
  border,
}: {
  children: React.ReactNode
  border?: 'r' | 'b'
}) {
  return (
    <p
      className={`w-15 px-1 text-left text-black ${border ? `border-${border}-1` : ''}`}
    >
      {children}
    </p>
  )
}
