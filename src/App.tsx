import './App.css'
import BuoyTable from './components/BuoyTable'
import Header from './components/Header'

function App() {
  return (
    <>
      <Header />
      <main className='bg-red-100 h-screen'>
        <BuoyTable />
      </main>
    </>
  )
}

export default App
