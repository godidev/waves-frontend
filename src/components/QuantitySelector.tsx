export default function QuantitySelector({
  displayQuantity,
  setDisplayQuantity,
}: {
  displayQuantity: number
  setDisplayQuantity: (value: number) => void
}) {
  const checkboxes = [
    { value: 8, label: '8' },
    { value: 16, label: '16' },
    { value: 24, label: '24' },
  ]
  return (
    <div className='flex items-center justify-center'>
      <span>Show: </span>
      {checkboxes.map((checkbox) => (
        <div className='flex items-center ps-2' key={checkbox.value}>
          <input
            className='h-4 w-4 rounded-sm'
            id={checkbox.value.toString()}
            type='checkbox'
            value={checkbox.value}
            checked={displayQuantity === checkbox.value}
            onChange={({ target }) => setDisplayQuantity(Number(target.value))}
          />
          <p className='w-full py-4 ps-1 text-sm font-medium'>
            {checkbox.label}
          </p>
        </div>
      ))}
    </div>
  )
}
