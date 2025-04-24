import './App.css'
import BuoyTable from './components/BuoyTable'
import Header from './components/Header'

function App() {
  return (
    <>
      <Header />
      <main className='flex flex-1 flex-col'>
        <BuoyTable />
      </main>
    </>
  )
}

export default App
