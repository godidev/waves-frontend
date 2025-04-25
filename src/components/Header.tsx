import { Link } from 'react-router-dom'
import NavBar from './NavBar'

export default function Header() {
  return (
    <header className='bg-gray-800 p-4 text-white'>
      <Link to='/'>
        <h1 className='text-center text-3xl font-bold underline'>Forecast</h1>
      </Link>
      <NavBar />
    </header>
  )
}
