const TableCell = ({
  data,
  identifier,
  icon,
}: {
  data: number | string
  identifier: string
  icon?: string
}) => {
  const correctedData = (data: number | string) => {
    if (identifier === 's' && data.toString().length === 1) {
      return `${data}.0`
    }
    if (identifier === 'm') {
      if (data.toString().length === 1) {
        return `${data}.00`
      } else if (data.toString().length === 3) {
        return `${data}0`
      }
    }
    return data
  }
  return (
    <p className={`w-15 px-1 text-left`}>
      {correctedData(data)}
      {identifier}
      {icon && (
        <span className='ml-1 text-gray-500' key='icon'>
          {icon}
        </span>
      )}
    </p>
  )
}

export default TableCell
