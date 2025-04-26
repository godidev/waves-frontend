import { Link } from 'react-router-dom'

export default function NavBar() {
  return (
    <nav className='mx-auto mt-2 w-full text-2xl'>
      <ul className='flex w-full justify-center'>
        <li className='m-2 rounded-sm border p-1 text-center'>
          <Link to='/buoys'>Buoys</Link>
        </li>
        <li className='m-2 rounded-sm border p-1 text-center'>
          <Link to='/forecast'>Forecast</Link>
        </li>
      </ul>
    </nav>
  )
}
