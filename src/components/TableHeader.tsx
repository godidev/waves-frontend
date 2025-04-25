import TableHeaderCell from './TableHeaderCell'

export default function TableHeader({
  index,
  day,
}: {
  index: number
  day: string
}) {
  return (
    <>
      <p className='border-b-2 bg-blue-200 px-1 text-center text-black'>
        {index === 0 ? `${day} (hoy)` : day}
      </p>
      <div className='flex justify-around border-b-1 bg-gray-200'>
        <TableHeaderCell border='r'>hour</TableHeaderCell>
        <TableHeaderCell border='r'>height</TableHeaderCell>
        <TableHeaderCell border='r'>period</TableHeaderCell>
        <TableHeaderCell border='r'>tm02</TableHeaderCell>
        <TableHeaderCell border='r'>avgDir.</TableHeaderCell>
        <TableHeaderCell>peakDir.</TableHeaderCell>
      </div>
    </>
  )
}
