const TableCell = ({
    data,
    identifier,
    icon
  }: {
    data: string | number
    identifier: string
    icon?: string
  }) => {
    const styles = typeof data === 'string' ? 'border-b-2' : ''
    return (
      <p className={`p-0.5 ${styles} text-left`}>
        {data}
        {identifier}
        {icon && (
          <span className='ml-1 text-gray-500' key='icon'>{icon}</span>
        )}
      </p>
    )
  }

  export default TableCell