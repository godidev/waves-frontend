const TableCell = ({
  data,
  identifier,
  icon,
}: {
  data: string | number
  identifier: string
  icon?: string
}) => {
  return (
    <p className={`w-12 pr-1 pl-1 text-left`}>
      {data}
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
