import TableCell from './TableCell'

export const TableHeader = ({ index, day }: { index: number; day: string }) => {
  return (
    <>
      <p className='border-b-2 pr-1 pl-1 text-center'>
        {index === 0 ? `${day} (hoy)` : day}
      </p>
      <div className='flex text-[12px]'>
        <TableCell data='hour' identifier='' />
        <TableCell data='height' identifier='' />
        <TableCell data='period' identifier='' />
        <TableCell data='tm02' identifier='' />
        <TableCell data='avgDirection' identifier='' />
        <TableCell data='peakDirection' identifier='' />
      </div>
    </>
  )
}
