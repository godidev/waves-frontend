interface SelectorLabelProps {
  text: string
}

export const SelectorLabel = ({ text }: SelectorLabelProps) => (
  <p className="text-xs uppercase text-ocean-200">{text}</p>
)
